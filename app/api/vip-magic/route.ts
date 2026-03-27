// app/api/vip-magic/route.ts
//
// Single-use magic link VIP unlock.
// Usage: basebloc.app/tickets?vipCode=XXXX
//
// How it works:
// 1. Frontend reads ?vipCode= from URL on page load
// 2. Calls POST /api/vip-magic with { code, walletAddress }
// 3. This route validates the code and marks it used
// 4. Returns { valid: boolean }
//
// Codes are stored in MAGIC_CODES below.
// Set used: true after someone redeems — or delete the entry.
// For scale: migrate to Supabase/KV store when list grows.

import { NextRequest, NextResponse } from 'next/server';

// ─── Magic Codes ──────────────────────────────────────────────────────────────
// Generate codes however you like — random strings work fine.
// Set maxUses: 1 for single-use, higher for group links (e.g. a table of 4).
// usedCount is tracked in memory per deployment — for persistence use a DB.
//
// TO ADD A CODE: add a new entry to this object.
// TO REVOKE A CODE: set active: false or delete the entry.

const MAGIC_CODES: Record<string, {
  label:    string;
  maxUses:  number;
  usedCount: number;
  active:   boolean;
}> = {
  // Single-use personal invites
  'BBLOC-VIP-001': { label: 'Personal VIP invite 001', maxUses: 1, usedCount: 0, active: true },
  'BBLOC-VIP-002': { label: 'Personal VIP invite 002', maxUses: 1, usedCount: 0, active: true },
  'BBLOC-VIP-003': { label: 'Personal VIP invite 003', maxUses: 1, usedCount: 0, active: true },
  'BBLOC-VIP-004': { label: 'Personal VIP invite 004', maxUses: 1, usedCount: 0, active: true },
  'BBLOC-VIP-005': { label: 'Personal VIP invite 005', maxUses: 1, usedCount: 0, active: true },

  // Partner codes — multiple uses
  'BEASTMODE-VIP': { label: 'Beast Mode partner block', maxUses: 10, usedCount: 0, active: true },
  'HIPHOPTV-VIP':  { label: 'Hip Hop TV partner block', maxUses: 10, usedCount: 0, active: true },
  'OAKLAND-VIP':   { label: 'Oakland XChange block',    maxUses: 10, usedCount: 0, active: true },

  // Press / media comps
  'PRESS-VIP':     { label: 'Press comp',               maxUses: 5,  usedCount: 0, active: true },
};

// ─── POST /api/vip-magic ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { code, walletAddress } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, reason: 'No code provided' });
    }

    const normalized = code.toUpperCase().trim();
    const entry = MAGIC_CODES[normalized];

    // Code doesn't exist
    if (!entry) {
      return NextResponse.json({ valid: false, reason: 'Invalid code' });
    }

    // Code is inactive / revoked
    if (!entry.active) {
      return NextResponse.json({ valid: false, reason: 'Code is no longer active' });
    }

    // Code is exhausted
    if (entry.usedCount >= entry.maxUses) {
      return NextResponse.json({ valid: false, reason: 'Code has already been used' });
    }

    // ✅ Valid — increment use count and grant VIP
    entry.usedCount += 1;

    // Log for your records (visible in Vercel function logs)
    console.log('[MAGIC LINK REDEEMED]', {
      code:          normalized,
      label:         entry.label,
      walletAddress: walletAddress ?? 'unknown',
      usedCount:     entry.usedCount,
      maxUses:       entry.maxUses,
      timestamp:     new Date().toISOString(),
    });

    // TODO: for persistence across deployments, write to DB here:
    // await db.insert(vipRedemptions).values({ code: normalized, walletAddress, redeemedAt: new Date() })

    return NextResponse.json({
      valid: true,
      label: entry.label,
      remaining: entry.maxUses - entry.usedCount,
    });

  } catch {
    return NextResponse.json({ valid: false, reason: 'Server error' });
  }
}
