import { NextResponse } from 'next/server';
import { SignJWT, importPKCS8 } from 'jose';

export async function POST(request: Request) {
  try {
    const { address, amount } = await request.json();
    if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });

    const keyName = process.env.CDP_API_KEY_NAME;
    const rawKey = process.env.CDP_API_KEY_PRIVATE_KEY;
    const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID;

    console.log('[onramp] keyName:', keyName ? 'set' : 'MISSING');
    console.log('[onramp] rawKey:', rawKey ? `set (${rawKey.slice(0, 30)}...)` : 'MISSING');
    console.log('[onramp] projectId:', projectId ? 'set' : 'MISSING');

    if (!keyName || !rawKey || !projectId) {
      return NextResponse.json({ error: 'missing env vars', keyName: !!keyName, rawKey: !!rawKey, projectId: !!projectId }, { status: 500 });
    }

    const privateKey = rawKey.replace(/\\n/g, '\n');
    const pk = await importPKCS8(privateKey, 'Ed25519');
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'EdDSA', kid: keyName })
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
