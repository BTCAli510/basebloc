// app/api/onramp-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateJwt } from '@coinbase/cdp-sdk/auth';

const CDP_API_KEY_ID = process.env.CDP_API_KEY_ID ?? '';

function normalizePem(raw: string): string {
  return raw
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim() + '\n';
}

const CDP_API_KEY_PRIVATE = normalizePem(process.env.CDP_API_KEY_PRIVATE_KEY ?? '');

export async function POST(req: NextRequest) {
  try {
    if (!CDP_API_KEY_ID || !CDP_API_KEY_PRIVATE.includes('BEGIN EC PRIVATE KEY')) {
      console.error('[onramp-session] Missing or malformed CDP env vars');
      return NextResponse.json({ error: 'Onramp not configured' }, { status: 500 });
    }

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

    const clientIp =
      req.headers.get('x-real-ip') ??
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      '192.0.2.1';

    let jwt: string;
    try {
      jwt = await generateJwt({
        apiKeyId: CDP_API_KEY_ID,
        apiKeySecret: CDP_API_KEY_PRIVATE,
        requestMethod: 'POST',
        requestHost: 'api.developer.coinbase.com',
        requestPath: '/onramp/v1/token',
        expiresIn: 120,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[onramp-session] JWT generation failed:', msg);
      return NextResponse.json({ error: 'JWT signing failed', detail: msg }, { status: 500 });
    }

    const cdpRes = await fetch('https://api.developer.coinbase.com/onramp/v1/token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addresses: [{ address: walletAddress, blockchains: ['base'] }],
        clientIp,
      }),
    });

    if (!cdpRes.ok) {
      const errText = await cdpRes.text();
      console.error('[onramp-session] CDP API error:', cdpRes.status, errText);
      return NextResponse.json({ error: 'CDP session token request failed', detail: errText }, { status: 502 });
    }

    const { token } = await cdpRes.json() as { token: string };
    if (!token) {
      console.error('[onramp-session] CDP returned empty token');
      return NextResponse.json({ error: 'CDP returned empty session token' }, { status: 502 });
    }

    console.log('[onramp-session] Session token generated successfully for', walletAddress);
    return NextResponse.json({ token });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[onramp-session] Unhandled error:', msg);
    return NextResponse.json({ error: 'Internal server error', detail: msg }, { status: 500 });
  }
}
