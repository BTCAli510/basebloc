// app/api/vip-check/route.ts
//
// Server-side VIP allowlist check.
// The frontend NEVER reads the allowlist directly — it only asks this endpoint.
// Returns { isVip: boolean } for a given wallet address.
//
// To add wallets: add to VIP_ALLOWLIST below.
// When list grows past ~50 addresses, migrate to Supabase or env var JSON.

import { NextRequest, NextResponse } from 'next/server';

// ─── VIP Allowlist ────────────────────────────────────────────────────────────
// All addresses stored lowercase for case-insensitive comparison.
// Add wallet addresses here before the event.
const VIP_ALLOWLIST: string[] = [
  // BASE Bloc team & core collaborators
  '0x2e057b00cbeccf3ff6b410daa2cc1f99dff94e2d', // Andre (creator wallet)
  '0x734f000000000000000000000000000000006ff1', // Andre (smart wallet — update with full address)

  // Event collaborators — add as confirmed
  // '0xYourCollaboratorWalletHere',
  // '0xBeastModeWalletHere',
  // '0xHipHopTVWalletHere',

  // VIP guests — add as RSVPs come in
  // '0xGuestWalletHere',
];

// ─── POST /api/vip-check ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json();

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'walletAddress required' }, { status: 400 });
    }

    const normalized = walletAddress.toLowerCase().trim();
    const isVip = VIP_ALLOWLIST.includes(normalized);

    return NextResponse.json({ isVip });

  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// ─── GET /api/vip-check?address=0x... ────────────────────────────────────────
// Optional: support GET for easy manual testing in browser
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'address param required' }, { status: 400 });
  }

  const normalized = address.toLowerCase().trim();
  const isVip = VIP_ALLOWLIST.includes(normalized);

  return NextResponse.json({ isVip, address: normalized });
}
