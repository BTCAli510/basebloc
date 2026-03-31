import { NextResponse } from 'next/server';
import { SignJWT, importJWK } from 'jose';

export async function POST(request: Request) {
  try {
    const { address, amount } = await request.json();
    if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });

    const keyId = process.env.CDP_API_KEY_NAME!;
    const rawPrivateKey = process.env.CDP_API_KEY_PRIVATE_KEY!;
    const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID!;

    // Import as JWK for Ed25519
    const base64Key = rawPrivateKey
      .replace(/-----BEGIN PRIVATE KEY-----/g, '')
      .replace(/-----END PRIVATE KEY-----/g, '')
      .replace(/\\n/g, '')
      .replace(/\s/g, '')
      // Convert standard base64 to base64url
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const pk = await importJWK({
      kty: 'OKP',
      crv: 'Ed25519',
      d: base64Key,
    }, 'EdDSA');

    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'EdDSA', kid: keyId, nonce: crypto.randomUUID() })
      .setIssuedAt()
      .setExpirationTime('2m')
      .sign(pk);

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
    console.log('[onramp] CDP response:', res.status, JSON.stringify(data).slice(0, 200));
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
    return NextResponse.json({ sessionToken: data.token });

  } catch (err: any) {
    console.error('[onramp] error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
