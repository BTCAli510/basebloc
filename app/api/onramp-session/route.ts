import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { address, amount } = await request.json();
  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });

  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;
  const res = await fetch('https://api.developer.coinbase.com/onramp/v1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      destination_wallets: [{ address, blockchains: ['base'], assets: ['USDC'] }],
    }),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
  return NextResponse.json({ sessionToken: data.token });
}
