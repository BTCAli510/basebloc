import { NextResponse } from 'next/server';
import { CdpClient } from '@coinbase/cdp-sdk';

export async function POST(request: Request) {
  const { address, amount } = await request.json();
  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });

  const cdp = new CdpClient({
    apiKeyId: process.env.CDP_API_KEY_NAME!,
    apiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY!,
  });

  const token = await cdp.onramp.createSessionToken({
    projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID!,
    destinationWallets: [{ address, blockchains: ['base'], assets: ['USDC'] }],
  });

  return NextResponse.json({ sessionToken: token });
}
