import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { address, amount } = await request.json();
  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });

  const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID;
  const apiKeyName = process.env.CDP_API_KEY_NAME;
  const apiKeySecret = process.env.CDP_API_KEY_PRIVATE_KEY;

  if (!projectId || !apiKeyName || !apiKeySecret) {
    return NextResponse.json({ error: 'CDP credentials not configured' }, { status: 500 });
  }

  const res = await fetch('https://api.developer.coinbase.com/onramp/v1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKeySecret}`,
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
