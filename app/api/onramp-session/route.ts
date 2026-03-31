// app/api/onramp-session/route.ts
//
// Generates a Coinbase Onramp session token using the CDP SDK.
// The SDK handles ES256 JWT signing automatically — no manual
// PEM parsing or Web Crypto API required.
//
// Required Vercel env vars:
//   CDP_API_KEY_ID          — your CDP key UUID (e.g. "2dddd7bd-...")
//   CDP_API_KEY_PRIVATE_KEY — PEM-format EC private key (with real newlines)

import { NextRequest, NextResponse } from 'next/server';
import { generateJwt } from '@coinbase/cdp-sdk/auth';

const CDP_API_KEY_ID      = process.env.CDP_API_KEY_ID ?? '';
const CDP_API_KEY_PRIVATE = process.env.CDP_API_KEY_PRIVATE_KEY ?? '';

export async function POST(req: NextRequest) {
  try {
    // ── Validate env vars ────────────────────────────────────────────
    if (!CDP_API_KEY_ID || !CDP_API_KEY_PRIVATE) {
      console.error('[onramp-session] Missing CDP env vars');
      return NextResponse.json(
        { error: 'Onramp not configured — missing CDP credentials' },
        { status: 500 }
      );
    }

    // ── Parse request body ───────────────────────────────────────────
    let walletAddress: string | undefined;
    try {
      const body = await req.json();
      walletAddress = body.walletAddress ?? body.address;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!walletAddress || !walletAddress.startsWith('0x')) {
      return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
    }

    // ── Get real client IP (do NOT trust X-Forwarded-For in prod) ───
    // Using placeholder per CDP docs for cases where the real IP
    // can't be extracted reliably from the network layer.
    const forwardedFor = req.headers.get('x-real-ip')
      ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? '192.0.2.1';
    const clientIp = forwardedFor;

    // ── Generate signed JWT via CDP SDK ──────────────────────────────
    // The SDK builds the full "organizations/.../apiKeys/..." sub/kid
    // format and handles all PEM parsing and ECDSA signing internally.
    let jwt: string;
    try {
      jwt = await generateJwt({
        apiKeyId:      CDP_API_KEY_ID,
        apiKeySecret:  CDP_API_KEY_PRIVATE,
        requestMethod: 'POST',
        requestHost:   'api.developer.coinbase.com',
        requestPath:   '/onramp/v1/token',
        expiresIn:     120,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[onramp-session] JWT generation failed:', msg);
      return NextResponse.json(
        { error: 'JWT signing failed', detail: msg },
        { status: 500 }
      );
    }

    // ── Exchange JWT for a one-time session token ────────────────────
    const cdpRes = await fetch('https://api.developer.coinbase.com/onramp/v1/token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        addresses: [
          {
            address:    walletAddress,
            blockchains: ['base'],
          },
        ],
        clientIp,
      }),
    });

    if (!cdpRes.ok) {
      const errText = await cdpRes.text();
      console.error('[onramp-session] CDP API error:', cdpRes.status, errText);
      return NextResponse.json(
        { error: 'CDP session token request failed', detail: errText },
        { status: 502 }
      );
    }

    const { token } = await cdpRes.json() as { token: string };

    if (!token) {
      console.error('[onramp-session] CDP returned empty token');
      return NextResponse.json(
        { error: 'CDP returned empty session token' },
        { status: 502 }
      );
    }

    console.log('[onramp-session] Session token generated successfully for', walletAddress);
    return NextResponse.json({ token });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[onramp-session] Unhandled error:', msg);
    return NextResponse.json({ error: 'Internal server error', detail: msg }, { status: 500 });
  }
}
