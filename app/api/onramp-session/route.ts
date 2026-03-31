import { NextResponse } from 'next/server';
import { SignJWT, importPKCS8 } from 'jose';

export async function POST(request: Request) {
  const { address, amount } = await request.json();
  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });

  const keyName = process.env.CDP_API_KEY_NAME!;
  const privateKey = process.env.CDP_API_KEY_PRIVATE_KEY!.replace(/\\n/g, '\n');
  const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID!;

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
  console.log('[onramp-session] status:', res.status, JSON.stringify(data).slice(0, 200));
  if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
  return NextResponse.json({ sessionToken: data.token });
}
