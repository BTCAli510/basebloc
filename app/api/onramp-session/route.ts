// app/api/onramp-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateJwt } from "@coinbase/cdp-sdk/auth";
import crypto from "crypto";

function prepareSecret(raw: string): string {
  const trimmed = raw.trim();

  if (!trimmed.includes("BEGIN")) {
    return trimmed;
  }

  const normalized = trimmed
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim() + "\n";

  if (normalized.includes("BEGIN PRIVATE KEY")) {
    return normalized;
  }

  if (normalized.includes("BEGIN EC PRIVATE KEY")) {
    const keyObj = crypto.createPrivateKey({ key: normalized, format: "pem" });
    return keyObj.export({ type: "pkcs8", format: "pem" }) as string;
  }

  return normalized;
}

export async function POST(req: NextRequest) {
  try {
    const apiKeyId = process.env.CDP_API_KEY_ID ?? "";
    const rawSecret =
      process.env.CDP_API_KEY_SECRET ??
      process.env.CDP_API_KEY_PRIVATE_KEY ??
      "";

    if (!apiKeyId || !rawSecret) {
      console.error("[onramp-session] Missing CDP credentials");
      return NextResponse.json({ error: "Onramp not configured" }, { status: 500 });
    }

    let walletAddress: string | undefined;
    try {
      const body = await req.json();
      walletAddress = body.walletAddress ?? body.address;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!walletAddress || !walletAddress.startsWith("0x")) {
      return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
    }

    const clientIp =
      req.headers.get("x-real-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "192.0.2.1";

    const apiKeySecret = prepareSecret(rawSecret);

    console.log("[onramp-session] Secret shape:", {
      looksSEC1: rawSecret.includes("BEGIN EC PRIVATE KEY"),
      looksPKCS8: apiKeySecret.includes("BEGIN PRIVATE KEY"),
      looksEd25519: !rawSecret.includes("BEGIN"),
      finalLength: apiKeySecret.length,
    });

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
      return NextResponse.json({ error: "JWT signing failed", detail: msg }, { status: 500 });
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
        { error: "CDP session token request failed", detail: errText },
        { status: 502 }
      );
    }

    const { token } = (await cdpRes.json()) as { token: string };

    if (!token) {
      console.error("[onramp-session] CDP returned empty token");
      return NextResponse.json({ error: "CDP returned empty session token" }, { status: 502 });
    }

    console.log("[onramp-session] Session token generated successfully for", walletAddress);
    return NextResponse.json({ token });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[onramp-session] Unhandled error:", msg);
    return NextResponse.json({ error: "Internal server error", detail: msg }, { status: 500 });
  }
}
