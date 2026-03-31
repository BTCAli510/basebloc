import { NextRequest, NextResponse } from "next/server";
import { generateJwt } from "@coinbase/cdp-sdk/auth";
import crypto from "crypto";

type SecretShape = {
  source: "CDP_API_KEY_SECRET" | "CDP_API_KEY_PRIVATE_KEY" | "missing";
  hasBegin: boolean;
  looksSEC1: boolean;
  looksPKCS8: boolean;
  looksEd25519: boolean;
  normalizedLength: number;
};

function normalizeLineEndings(value: string): string {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

function inspectSecret(raw: string, source: SecretShape["source"]): SecretShape {
  const normalized = normalizeLineEndings(raw);

  return {
    source,
    hasBegin: normalized.includes("BEGIN"),
    looksSEC1: normalized.includes("BEGIN EC PRIVATE KEY"),
    looksPKCS8:
      normalized.includes("BEGIN PRIVATE KEY") &&
      !normalized.includes("BEGIN EC PRIVATE KEY"),
    looksEd25519: !normalized.includes("BEGIN"),
    normalizedLength: normalized.length,
  };
}

function prepareSecret(raw: string, shape: SecretShape): string {
  const normalized = normalizeLineEndings(raw);

  if (!normalized) return "";

  // Raw base64 secret (Ed25519) — pass through untouched
  if (shape.looksEd25519) {
    return normalized;
  }

  // PKCS8 PEM — SDK should accept directly
  if (shape.looksPKCS8) {
    return normalized + "\n";
  }

  // SEC1 PEM — convert to PKCS8 before handing to SDK
  if (shape.looksSEC1) {
    const keyObj = crypto.createPrivateKey({
      key: normalized + "\n",
      format: "pem",
    });

    return keyObj.export({
      type: "pkcs8",
      format: "pem",
    }) as string;
  }

  throw new Error("Unsupported CDP key format");
}

export async function POST(req: NextRequest) {
  try {
    const apiKeyId = process.env.CDP_API_KEY_ID ?? "";

    const secretFromPreferred = process.env.CDP_API_KEY_SECRET ?? "";
    const secretFromLegacy = process.env.CDP_API_KEY_PRIVATE_KEY ?? "";

    const rawSecret = secretFromPreferred || secretFromLegacy;
    const secretSource: SecretShape["source"] = secretFromPreferred
      ? "CDP_API_KEY_SECRET"
      : secretFromLegacy
        ? "CDP_API_KEY_PRIVATE_KEY"
        : "missing";

    if (!apiKeyId || !rawSecret) {
      console.error("[onramp-session] Missing CDP credentials", {
        hasApiKeyId: !!apiKeyId,
        hasSecret: !!rawSecret,
        secretSource,
      });

      return NextResponse.json(
        {
          error: "Onramp not configured",
          hasApiKeyId: !!apiKeyId,
          hasSecret: !!rawSecret,
          secretSource,
        },
        { status: 500 }
      );
    }

    let walletAddress: string | undefined;
    try {
      const body = await req.json();
      walletAddress = body.walletAddress ?? body.address;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!walletAddress || !walletAddress.startsWith("0x")) {
      return NextResponse.json(
        { error: "walletAddress is required" },
        { status: 400 }
      );
    }

    const clientIp =
      req.headers.get("x-real-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "192.0.2.1";

    const shape = inspectSecret(rawSecret, secretSource);

    console.log("[onramp-session] Secret shape:", shape);

    let apiKeySecret: string;
    try {
      apiKeySecret = prepareSecret(rawSecret, shape);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[onramp-session] Secret conversion failed:", msg);

      return NextResponse.json(
        {
          error: "Secret conversion failed",
          detail: msg,
          shape,
        },
        { status: 500 }
      );
    }

    let jwt: string;
    try {
      jwt = await generateJwt({
        apiKeyId,
        apiKeySecret,
        requestMethod: "POST",
        requestHost: "api.developer.coinbase.com",
        requestPath: "/onramp/v1/token",
        expiresIn: 120,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[onramp-session] JWT generation failed:", msg);

      return NextResponse.json(
        {
          error: "JWT signing failed",
          detail: msg,
          shape,
        },
        { status: 500 }
      );
    }

    const cdpRes = await fetch("https://api.developer.coinbase.com/onramp/v1/token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        addresses: [{ address: walletAddress, blockchains: ["base"] }],
        clientIp,
      }),
    });

    if (!cdpRes.ok) {
      const errText = await cdpRes.text();
      console.error("[onramp-session] CDP API error:", cdpRes.status, errText);

      return NextResponse.json(
        {
          error: "CDP session token request failed",
          detail: errText,
          shape,
        },
        { status: 502 }
      );
    }

    const { token } = (await cdpRes.json()) as { token?: string };

    if (!token) {
      console.error("[onramp-session] CDP returned empty token");

      return NextResponse.json(
        {
          error: "CDP returned empty session token",
          shape,
        },
        { status: 502 }
      );
    }

    console.log("[onramp-session] Session token generated successfully for", walletAddress);

    // Return both keys for client compatibility
    return NextResponse.json({
      token,
      sessionToken: token,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[onramp-session] Unhandled error:", msg);

    return NextResponse.json(
      { error: "Internal server error", detail: msg },
      { status: 500 }
    );
  }
}
