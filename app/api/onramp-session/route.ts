import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { address, amount } = await request.json();
    if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });

    const keyId = process.env.CDP_API_KEY_NAME!;
    const privateKeyPem = process.env.CDP_API_KEY_PRIVATE_KEY!;
    const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID!;

    // Build JWT header and payload
    const header = { alg: 'ES256', kid: keyId, typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: 'cdp',
      nbf: now,
      exp: now + 120,
      sub: keyId,
    };

    const encode = (obj: object) =>
      Buffer.from(JSON.stringify(obj)).toString('base64url');

    const signingInput = `${encode(header)}.${encode(payload)}`;

    // Import ECDSA P-256 key and sign
    const pemBody = privateKeyPem
      .replace(/-----BEGIN EC PRIVATE KEY-----|-----END EC PRIVATE KEY-----|-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');

    const keyBytes = Buffer.from(pemBody, 'base64');

    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      keyBytes,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      cryptoKey,
      Buffer.from(signingInput)
    );

    const jwt = `${signingInput}.${Buffer.from(signature).toString('base64url')}`;

    // Call CDP session token endpoint
    const res = await fetch('https://api.developer.coinbase.com/onramp/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        project_id: projectId,
        destination_wallets: [{ address, blockchains: ['base'], assets: ['USDC'] }],
      }),
    });

    const data = await res.json();
    console.log('[onramp] CDP response:', res.status, JSON.stringify(data).slice(0, 300));
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
    return NextResponse.json({ sessionToken: data.token });

  } catch (err: any) {
    console.error('[onramp] error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
