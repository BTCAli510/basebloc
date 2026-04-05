// app/api/confirm-payment/route.ts
//
// Verifies a USDC payment on Base mainnet, issues an EAS attestation, and
// records the ticket in Supabase.
//
// POST body: { txHash, walletAddress, ticketTier, displayName }
// Returns:   { success: true, attestationUID }
//
// SQL — run once in Supabase before deploying:
//   ALTER TABLE tickets ADD COLUMN tx_hash text UNIQUE;

import { NextRequest, NextResponse } from 'next/server';
import {
  createPublicClient,
  http,
  decodeEventLog,
  getAddress,
} from 'viem';
import { base } from 'viem/chains';
import { ethers } from 'ethers';
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// ─── Constants ────────────────────────────────────────────────────────────────
const USDC_CONTRACT   = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const EAS_CONTRACT    = '0x4200000000000000000000000000000000000021';
const SCHEMA_UID      = '0x2b35516fd072b1da5045ec23a4279f4c25eb864384b222f3553f15e2d5a64553';
const TREASURY_WALLET = '0x2E057B00Cbeccf3FF6b410daa2CC1F99DFF94E2d';
const EVENT_DATE      = BigInt(1779494400); // May 23, 2026 UTC

const SCHEMA_STRING =
  'string eventId,string eventName,uint64 eventDate,string venueName,string venueAddress,string coalition,bool attending,string ticketTier,string displayName,bool verified_attendance,uint64 checkInTime';

// ─── Tier table (server-authoritative) ───────────────────────────────────────
const TIERS = {
  general: { label: 'General Admission', units: 25_000_000n },
  vip:     { label: 'VIP Access',        units: 50_000_000n },
} as const;

type TierId = keyof typeof TIERS;

// ─── ABIs ─────────────────────────────────────────────────────────────────────
const ERC20_TRANSFER_ABI = [
  {
    name: 'Transfer',
    type: 'event' as const,
    inputs: [
      { name: 'from',  type: 'address' as const, indexed: true  },
      { name: 'to',    type: 'address' as const, indexed: true  },
      { name: 'value', type: 'uint256' as const, indexed: false },
    ],
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

function isValidWallet(addr: string) {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

function isValidTxHash(hash: string) {
  return /^0x[0-9a-fA-F]{64}$/.test(hash);
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── Parse + validate body ─────────────────────────────────────────────────
  let body: { txHash?: string; walletAddress?: string; ticketTier?: string; displayName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { txHash, walletAddress, ticketTier, displayName } = body;

  if (!txHash || !isValidTxHash(txHash)) {
    return NextResponse.json({ error: 'Invalid or missing txHash' }, { status: 400 });
  }
  if (!walletAddress || !isValidWallet(walletAddress)) {
    return NextResponse.json({ error: 'Invalid or missing walletAddress' }, { status: 400 });
  }
  if (!ticketTier || !(ticketTier in TIERS)) {
    return NextResponse.json({ error: `Invalid ticketTier. Must be: ${Object.keys(TIERS).join(', ')}` }, { status: 400 });
  }

  const tier = TIERS[ticketTier as TierId];
  const resolvedName =
    displayName?.trim() || walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);

  const supabase = getSupabase();
  const rpc = process.env.BASE_RPC_URL ?? 'https://mainnet.base.org';

  // ── Idempotency — return existing ticket if txHash already processed ──────
  const { data: existing } = await supabase
    .from('tickets')
    .select('attestation_uid')
    .eq('tx_hash', txHash)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true, attestationUID: existing.attestation_uid });
  }

  // ── Verify USDC payment on Base mainnet ───────────────────────────────────
  const publicClient = createPublicClient({ chain: base, transport: http(rpc) });

  let receipt: Awaited<ReturnType<typeof publicClient.getTransactionReceipt>>;
  try {
    receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
  } catch (err) {
    console.error('[confirm-payment] getTransactionReceipt failed:', err);
    return NextResponse.json(
      { error: 'Could not fetch transaction. It may not be confirmed yet — try again in a moment.' },
      { status: 502 },
    );
  }

  const treasuryNorm = getAddress(TREASURY_WALLET).toLowerCase();
  const paymentVerified = receipt.logs.some((log) => {
    if (log.address.toLowerCase() !== USDC_CONTRACT.toLowerCase()) return false;
    try {
      const decoded = decodeEventLog({
        abi:    ERC20_TRANSFER_ABI,
        data:   log.data,
        topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
      });
      return (
        decoded.eventName === 'Transfer' &&
        decoded.args.to.toLowerCase() === treasuryNorm &&
        decoded.args.value >= tier.units
      );
    } catch {
      return false;
    }
  });

  if (!paymentVerified) {
    return NextResponse.json(
      { error: `Payment not verified. Expected ${Number(tier.units) / 1_000_000} USDC to treasury.` },
      { status: 400 },
    );
  }

  // ── Issue EAS attestation ─────────────────────────────────────────────────
  const privateKey = process.env.ATTESTATION_SIGNER_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: 'Attestation signer not configured.' }, { status: 500 });
  }

  let attestationUID: string;
  try {
    const provider = new ethers.JsonRpcProvider(rpc);
    const signer   = new ethers.Wallet(privateKey, provider);

    const eas = new EAS(EAS_CONTRACT);
    eas.connect(signer as unknown as Parameters<typeof eas.connect>[0]);

    const encoder     = new SchemaEncoder(SCHEMA_STRING);
    const encodedData = encoder.encodeData([
      { name: 'eventId',             value: 'MCOM-2026-05-23',                    type: 'string' },
      { name: 'eventName',           value: 'MY CITY OUR MUSIC',                  type: 'string' },
      { name: 'eventDate',           value: EVENT_DATE,                            type: 'uint64' },
      { name: 'venueName',           value: 'Henry J. Kaiser Center for the Arts', type: 'string' },
      { name: 'venueAddress',        value: '10 10th St, Oakland, CA 94607',       type: 'string' },
      { name: 'coalition',           value: 'Oakland Bloc',                        type: 'string' },
      { name: 'attending',           value: true,                                  type: 'bool'   },
      { name: 'ticketTier',          value: tier.label,                            type: 'string' },
      { name: 'displayName',         value: resolvedName,                          type: 'string' },
      { name: 'verified_attendance', value: false,                                 type: 'bool'   },
      { name: 'checkInTime',         value: BigInt(0),                             type: 'uint64' },
    ]);

    const tx = await eas.attest({
      schema: SCHEMA_UID,
      data: {
        recipient:      walletAddress,
        expirationTime: BigInt(0),
        revocable:      true,
        data:           encodedData,
      },
    });

    const uid = await tx.wait();
    if (!uid) throw new Error('EAS tx.wait() returned null');
    attestationUID = uid;
  } catch (err: any) {
    console.error('[confirm-payment] EAS attestation failed:', err?.message ?? err);
    return NextResponse.json(
      { error: 'Attestation failed.', debug: String(err?.message ?? err) },
      { status: 500 },
    );
  }

  // ── Store ticket in Supabase ──────────────────────────────────────────────
  const { error: insertError } = await supabase.from('tickets').insert({
    wallet_address:  walletAddress,
    event_name:      'MY CITY OUR MUSIC',
    event_date:      Number(EVENT_DATE),
    ticket_tier:     tier.label,
    display_name:    resolvedName,
    tx_hash:         txHash,
    attestation_uid: attestationUID,
    checked_in:      false,
    checked_in_at:   null,
  });

  if (insertError) {
    // Unique violation on tx_hash = race condition, another request got there first
    if (insertError.code === '23505') {
      const { data: raced } = await supabase
        .from('tickets')
        .select('attestation_uid')
        .eq('tx_hash', txHash)
        .maybeSingle();
      return NextResponse.json({ success: true, attestationUID: raced?.attestation_uid ?? attestationUID });
    }
    console.error('[confirm-payment] Supabase insert failed:', insertError.message);
    // Attestation is already on-chain — return success with a warning rather than failing
    return NextResponse.json({ success: true, attestationUID, warning: 'Ticket record not saved.' });
  }

  return NextResponse.json({ success: true, attestationUID });
}
