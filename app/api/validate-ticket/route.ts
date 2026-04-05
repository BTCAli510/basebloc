// app/api/validate-ticket/route.ts
//
// action:'price'  → validate tier + optional discount code, return pricing
// action:'attest' → verify USDC Transfer event on Base, then issue EAS
//                   attestation from server wallet, return { uid, txHash }

import { NextRequest, NextResponse } from 'next/server';
import {
  createPublicClient,
  createWalletClient,
  http,
  decodeEventLog,
  getAddress,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

// ─── Constants ────────────────────────────────────────────────────────────────
const USDC_CONTRACT   = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
const EAS_CONTRACT    = '0x4200000000000000000000000000000000000021' as const;
const SCHEMA_UID      = '0x2b35516fd072b1da5045ec23a4279f4c25eb864384b222f3553f15e2d5a64553' as const;
const TREASURY_WALLET = '0x2E057B00Cbeccf3FF6b410daa2CC1F99DFF94E2d' as const;
const ZERO_BYTES32    = '0x0000000000000000000000000000000000000000000000000000000000000000' as const;
const EVENT_TIMESTAMP = 1779494400n; // May 23, 2026 UTC

// ─── Tier pricing (server-authoritative) ──────────────────────────────────────
const TIER_PRICES = {
  general:  { label: 'General Admission', units: 25_000_000n, display: '25'  },
  industry: { label: 'Industry Pass',     units: 50_000_000n, display: '50'  },
  vip:      { label: 'VIP Access',        units: 75_000_000n, display: '75'  },
  rsvp:     { label: 'RSVP',             units: 0n,          display: '0'   },
  // dev-only: free tier for testing the EAS pipeline without spending USDC
  dev_free: { label: 'Dev Test (Free)',   units: 0n,          display: '0'   },
} as const;

type TierId = keyof typeof TIER_PRICES;

// ─── Discount codes (server-authoritative) ────────────────────────────────────
const DISCOUNT_CODES: Record<string, { label: string; pct: number }> = {
  'BASEBLOC10': { label: '10% off',  pct: 10  },
  'COMMUNITY':  { label: '50% off',  pct: 50  },
  'PRESS':      { label: 'Free',     pct: 100 },
};

// ─── ABIs ─────────────────────────────────────────────────────────────────────
const EAS_ABI = [
  {
    name: 'attest',
    type: 'function' as const,
    stateMutability: 'payable' as const,
    inputs: [
      {
        name: 'request',
        type: 'tuple' as const,
        components: [
          { name: 'schema', type: 'bytes32' as const },
          {
            name: 'data',
            type: 'tuple' as const,
            components: [
              { name: 'recipient',      type: 'address' as const },
              { name: 'expirationTime', type: 'uint64'  as const },
              { name: 'revocable',      type: 'bool'    as const },
              { name: 'refUID',         type: 'bytes32' as const },
              { name: 'data',           type: 'bytes'   as const },
              { name: 'value',          type: 'uint256' as const },
            ],
          },
        ],
      },
    ],
    outputs: [{ name: 'uid', type: 'bytes32' as const }],
  },
] as const;

const EAS_ATTESTED_ABI = [
  {
    name: 'Attested',
    type: 'event' as const,
    inputs: [
      { name: 'recipient', type: 'address' as const, indexed: true  },
      { name: 'attester',  type: 'address' as const, indexed: true  },
      { name: 'uid',       type: 'bytes32' as const, indexed: false },
      { name: 'schema',    type: 'bytes32' as const, indexed: true  },
    ],
  },
] as const;

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

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === 'price')  return handlePrice(body);
    if (body.action === 'attest') return await handleAttest(body);

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('[validate-ticket POST] unhandled error name:', err?.name);
    console.error('[validate-ticket POST] unhandled error message:', err?.message);
    console.error('[validate-ticket POST] unhandled error stack:', err?.stack);
    return NextResponse.json(
      { error: 'Internal server error', debug: `${err?.name}: ${err?.message}` },
      { status: 500 }
    );
  }
}

// ─── Price ────────────────────────────────────────────────────────────────────
function handlePrice(body: {
  tier?: string;
  discountCode?: string;
  walletAddress?: string;
}) {
  const { tier, discountCode } = body;

  if (!tier || !(tier in TIER_PRICES)) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
  }

  const tierData = TIER_PRICES[tier as TierId];
  let units = tierData.units;
  let discountLabel: string | null = null;
  let isFree = false;

  if (discountCode) {
    const code = discountCode.toUpperCase().trim();
    const discount = DISCOUNT_CODES[code];
    if (!discount) {
      return NextResponse.json({ error: 'Invalid discount code' }, { status: 400 });
    }
    if (discount.pct === 100) {
      units = 0n;
      isFree = true;
    } else {
      units = units - (units * BigInt(discount.pct)) / 100n;
    }
    discountLabel = discount.label;
  }

  return NextResponse.json({
    tierLabel:    tierData.label,
    displayPrice: (Number(units) / 1_000_000).toString(),
    usdcUnits:    units.toString(),
    discountLabel,
    isFree,
  });
}

// ─── Attest ───────────────────────────────────────────────────────────────────
async function handleAttest(body: {
  txHash?:       string;
  tier?:         string;
  attendeeName?: string;
  walletAddress: string;
  isFree?:       boolean;
}) {
  const { txHash, tier, attendeeName, walletAddress, isFree } = body;

  if (!tier || !(tier in TIER_PRICES)) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
  }
  if (!walletAddress) {
    return NextResponse.json({ error: 'Missing walletAddress' }, { status: 400 });
  }

  const tierData = TIER_PRICES[tier as TierId];
  const rpc = process.env.BASE_RPC_URL ?? 'https://mainnet.base.org';

  const publicClient = createPublicClient({ chain: base, transport: http(rpc) });

  // ── Verify USDC payment ──────────────────────────────────────────────────
  if (!isFree) {
    if (!txHash) {
      return NextResponse.json({ error: 'Missing txHash' }, { status: 400 });
    }
    try {
      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      const treasuryNorm = getAddress(TREASURY_WALLET).toLowerCase();

      const verified = receipt.logs.some((log) => {
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
            decoded.args.value >= tierData.units
          );
        } catch {
          return false;
        }
      });

      if (!verified) {
        return NextResponse.json(
          { error: 'Payment not verified. USDC transfer to treasury not found.' },
          { status: 400 }
        );
      }
    } catch (err) {
      console.error('[validate-ticket attest] payment verification error:', err);
      return NextResponse.json(
        { error: 'Could not verify transaction. Please try again.', debug: String(err) },
        { status: 502 }
      );
    }
  }

  // ── Issue attestation ────────────────────────────────────────────────────
  const privateKey = process.env.ATTESTATION_SIGNER_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json(
      { error: 'Attestation signer not configured.' },
      { status: 500 }
    );
  }

  let account: ReturnType<typeof privateKeyToAccount>;
  try {
    account = privateKeyToAccount(privateKey as `0x${string}`);
  } catch (err: any) {
    console.error('[validate-ticket attest] privateKeyToAccount error:', err?.name, err?.message, err?.stack);
    return NextResponse.json(
      { error: 'Invalid attestation signer key.', debug: String(err) },
      { status: 500 }
    );
  }

  const walletClient = createWalletClient({ account, chain: base, transport: http(rpc) });
  console.log('[validate-ticket attest] signer address:', account.address);
  console.log('[validate-ticket attest] rpc:', rpc);

  // ── Signer gas check ──────────────────────────────────────────────────────
  try {
    const signerBalance = await publicClient.getBalance({ address: account.address });
    console.log('[validate-ticket attest] signer ETH balance (wei):', signerBalance.toString());
    if (signerBalance === 0n) {
      return NextResponse.json(
        {
          error: 'Attestation signer has no ETH for gas.',
          debug: `signer ${account.address} has 0 ETH on Base mainnet`,
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    // Non-fatal: log and continue — writeContract will surface the real error
    console.warn('[validate-ticket attest] balance check failed:', err?.message);
  }

  const displayName =
    attendeeName?.trim() ||
    walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);

  let encodedData: string;
  try {
    const { SchemaEncoder } = await import('@ethereum-attestation-service/eas-sdk');
    const schemaString = 'string eventId,string eventName,uint64 eventDate,string venueName,string venueAddress,string coalition,bool attending,string ticketTier,string displayName,bool verified_attendance,uint64 checkInTime';
    console.log('[validate-ticket attest] schema uid:', SCHEMA_UID);
    console.log('[validate-ticket attest] schema string:', schemaString);
    const encoder = new SchemaEncoder(schemaString);
    encodedData = encoder.encodeData([
      { name: 'eventId',             value: 'MCOM-2026-05-23',                        type: 'string' },
      { name: 'eventName',           value: 'MY CITY OUR MUSIC',                      type: 'string' },
      { name: 'eventDate',           value: EVENT_TIMESTAMP,                           type: 'uint64' },
      { name: 'venueName',           value: 'Henry J. Kaiser Center for the Arts',     type: 'string' },
      { name: 'venueAddress',        value: 'Oakland, CA',                             type: 'string' },
      { name: 'coalition',           value: 'Oakland Bloc',                            type: 'string' },
      { name: 'attending',           value: true,                                      type: 'bool'   },
      { name: 'ticketTier',          value: tierData.label,                            type: 'string' },
      { name: 'displayName',         value: displayName,                               type: 'string' },
      { name: 'verified_attendance', value: false,                                     type: 'bool'   },
      { name: 'checkInTime',         value: 0n,                                        type: 'uint64' },
    ]);
  } catch (err: any) {
    console.error('[validate-ticket attest] EAS encode error:', err?.name, err?.message, err?.stack);
    return NextResponse.json(
      { error: 'Failed to encode attestation data.', debug: String(err) },
      { status: 500 }
    );
  }

  // ── Simulate first to catch revert reasons before spending gas ───────────
  const attestArgs = [{
    schema: SCHEMA_UID,
    data: {
      recipient:      walletAddress as `0x${string}`,
      expirationTime: 0n,
      revocable:      true,
      refUID:         ZERO_BYTES32,
      data:           encodedData as `0x${string}`,
      value:          0n,
    },
  }] as const;

  try {
    await publicClient.simulateContract({
      address:      EAS_CONTRACT,
      abi:          EAS_ABI,
      functionName: 'attest',
      account:      account.address,
      args:         attestArgs,
    });
    console.log('[validate-ticket attest] simulateContract passed');
  } catch (simErr: any) {
    console.error('[validate-ticket attest] simulateContract failed name:', simErr?.name);
    console.error('[validate-ticket attest] simulateContract failed message:', simErr?.message);
    console.error('[validate-ticket attest] simulateContract failed cause:', simErr?.cause?.message ?? simErr?.cause);
    return NextResponse.json(
      {
        error: 'Attestation transaction failed.',
        debug: `simulate: ${simErr?.name}: ${simErr?.message}${simErr?.cause?.message ? ` | cause: ${simErr.cause.message}` : ''}`,
      },
      { status: 500 }
    );
  }

  let attestTxHash: `0x${string}`;
  try {
    attestTxHash = await walletClient.writeContract({
      address:      EAS_CONTRACT,
      abi:          EAS_ABI,
      functionName: 'attest',
      args:         attestArgs,
    });
  } catch (err: any) {
    console.error('[validate-ticket attest] writeContract error name:', err?.name);
    console.error('[validate-ticket attest] writeContract error message:', err?.message);
    console.error('[validate-ticket attest] writeContract error cause:', err?.cause?.message ?? err?.cause);
    console.error('[validate-ticket attest] writeContract error stack:', err?.stack);
    return NextResponse.json(
      {
        error: 'Attestation transaction failed.',
        debug: `write: ${err?.name}: ${err?.message}${err?.cause?.message ? ` | cause: ${err.cause.message}` : ''}`,
      },
      { status: 500 }
    );
  }

  // Wait for receipt and extract UID from Attested event
  let attestReceipt: Awaited<ReturnType<typeof publicClient.waitForTransactionReceipt>>;
  try {
    attestReceipt = await publicClient.waitForTransactionReceipt({ hash: attestTxHash });
  } catch (err: any) {
    console.error('[validate-ticket attest] waitForTransactionReceipt error:', err?.name, err?.message, err?.stack);
    // Tx was submitted — return the hash so the client isn't left empty-handed
    return NextResponse.json({ uid: attestTxHash, txHash: attestTxHash });
  }

  let uid: string = attestTxHash; // fallback
  for (const log of attestReceipt.logs) {
    if (log.address.toLowerCase() !== EAS_CONTRACT.toLowerCase()) continue;
    try {
      const decoded = decodeEventLog({
        abi:    EAS_ATTESTED_ABI,
        data:   log.data,
        topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
      });
      if (decoded.eventName === 'Attested') {
        uid = decoded.args.uid;
        break;
      }
    } catch {
      continue;
    }
  }

  return NextResponse.json({ uid, txHash: attestTxHash });
}
