'use client';

// app/tickets/page.tsx
//
// Updated with VIP allowlist gating (#25 + #26) and magic link unlock (#27).
// On page load → reads ?vipCode= from URL → validates via /api/vip-magic.
// On wallet connect → also checks /api/vip-check (allowlist).
// Either path grants VIP tier access.

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useSearchParams } from 'next/navigation';
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from '@coinbase/onchainkit/transaction';
import type { LifecycleStatus } from '@coinbase/onchainkit/transaction';
import { encodeAbiParameters, parseAbiParameters } from 'viem';
import type { ContractFunctionParameters } from 'viem';
import { base } from 'wagmi/chains';

// ─── Constants ────────────────────────────────────────────────────────────────
const USDC_CONTRACT   = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
const EAS_CONTRACT    = '0x4200000000000000000000000000000000000021' as const;
const SCHEMA_UID      = '0xb81941b702c7aacc8164f6fed9a3ff97bbf179131c9e4bedb040bd7d787da4f7' as const;
const TREASURY_WALLET = '0x2E057B00Cbeccf3FF6b410daa2CC1F99DFF94E2d' as const;
const ZERO_BYTES32    = '0x0000000000000000000000000000000000000000000000000000000000000000' as const;

// Minimal USDC ERC-20 ABI
const USDC_ABI = [
  {
    name: 'transfer',
    type: 'function' as const,
    stateMutability: 'nonpayable' as const,
    inputs: [
      { name: 'to',    type: 'address' as const },
      { name: 'value', type: 'uint256' as const },
    ],
    outputs: [{ type: 'bool' as const }],
  },
] as const;

// Minimal EAS attest ABI
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
              { name: 'recipient',       type: 'address' as const },
              { name: 'expirationTime',  type: 'uint64'  as const },
              { name: 'revocable',       type: 'bool'    as const },
              { name: 'refUID',          type: 'bytes32' as const },
              { name: 'data',            type: 'bytes'   as const },
              { name: 'value',           type: 'uint256' as const },
            ],
          },
        ],
      },
    ],
    outputs: [{ name: 'uid', type: 'bytes32' as const }],
  },
] as const;

// ─── All possible ticket tiers ────────────────────────────────────────────────
const ALL_TIERS = [
  {
    id:        'general'  as const,
    label:     'General Admission',
    basePrice: '25',
    perks:     ['Full event access', 'Verified onchain record', 'Community credential'],
    accent:    '#0052FF',
    vipOnly:   false,
  },
  {
    id:        'industry' as const,
    label:     'Industry Pass',
    basePrice: '50',
    perks:     ['Full event access', 'Industry networking', 'Verified onchain record', 'Community credential'],
    accent:    '#111111',
    vipOnly:   false,
  },
  {
    id:        'vip'      as const,
    label:     'VIP Access',
    basePrice: '75',
    perks:     ['Full event access', 'VIP lounge', 'Meet & greet', 'Verified VIP credential'],
    accent:    '#B8860B',
    vipOnly:   true,   // ← only shown to allowlisted wallets
  },
];

type TierId = 'general' | 'industry' | 'vip';
type Step   = 'select' | 'confirm' | 'done' | 'error';

// ─── Encode attestation data ──────────────────────────────────────────────────
function buildAttestData(tier: string, name: string, wallet: `0x${string}`): `0x${string}` {
  return encodeAbiParameters(
    parseAbiParameters('string, string, string, string, string, address, string'),
    [
      'MY CITY OUR MUSIC',
      '2026-05-23',
      'Henry J. Kaiser Center for the Arts, Oakland',
      tier,
      name,
      wallet,
      'basebloc.app',
    ]
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
import { Suspense } from 'react';

function TicketsPageInner() {
  const { address } = useAccount();
  const searchParams = useSearchParams();

  // VIP status — granted by allowlist check OR magic link
  const [isVip,         setIsVip]         = useState(false);
  const [vipChecked,    setVipChecked]    = useState(false);
  const [magicCode,     setMagicCode]     = useState<string | null>(null);
  const [magicGranted,  setMagicGranted]  = useState(false);

  // Flow state
  const [step,          setStep]          = useState<Step>('select');
  const [selectedTier,  setSelectedTier]  = useState<TierId>('general');
  const [discountCode,  setDiscountCode]  = useState('');
  const [attendeeName,  setAttendeeName]  = useState('');
  const [codeError,     setCodeError]     = useState('');
  const [isValidating,  setIsValidating]  = useState(false);

  const [tierLabel,     setTierLabel]     = useState('');
  const [displayPrice,  setDisplayPrice]  = useState('');
  const [usdcUnits,     setUsdcUnits]     = useState('');
  const [discountLabel, setDiscountLabel] = useState<string | null>(null);
  const [isFree,        setIsFree]        = useState(false);

  const [txHash,        setTxHash]        = useState<string | null>(null);
  const [errorMsg,      setErrorMsg]      = useState('');

  // ── VIP check on wallet connect ──────────────────────────────────────────
  useEffect(() => {
    if (!address) {
      setIsVip(false);
      setVipChecked(false);
      return;
    }
    setVipChecked(false);
    fetch('/api/vip-check', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ walletAddress: address }),
    })
      .then((r) => r.json())
      .then((data) => {
        setIsVip(data.isVip ?? false);
        setVipChecked(true);
        // If wallet was on VIP tier but is no longer eligible after re-check, reset
        if (!data.isVip && selectedTier === 'vip') setSelectedTier('general');
      })
      .catch(() => {
        setIsVip(false);
        setVipChecked(true);
      });
  }, [address]);

  // ── Magic link check on page load ────────────────────────────────────────
  useEffect(() => {
    const code = searchParams.get('vipCode');
    if (!code) return;
    setMagicCode(code);
    fetch('/api/vip-magic', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code, walletAddress: address ?? 'unknown' }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setIsVip(true);
          setVipChecked(true);
          setMagicGranted(true);
        }
      })
      .catch(() => {});
  }, [searchParams]);

  // Tiers visible to this wallet
  const visibleTiers = useMemo(
    () => ALL_TIERS.filter((t) => !t.vipOnly || isVip),
    [isVip]
  );

  // ── Build batched calls ───────────────────────────────────────────────────
  const calls = useMemo((): ContractFunctionParameters[] => {
    if (!address || !usdcUnits || step !== 'confirm') return [];

    const attestData = buildAttestData(tierLabel, attendeeName.trim(), address);
    const attestCall: ContractFunctionParameters = {
      address:      EAS_CONTRACT,
      abi:          EAS_ABI,
      functionName: 'attest',
      args: [{
        schema: SCHEMA_UID as `0x${string}`,
        data: {
          recipient:      address,
          expirationTime: BigInt(0),
          revocable:      false,
          refUID:         ZERO_BYTES32 as `0x${string}`,
          data:           attestData,
          value:          BigInt(0),
        },
      }],
    };

    if (isFree) return [attestCall];

    return [
      {
        address:      USDC_CONTRACT,
        abi:          USDC_ABI,
        functionName: 'transfer',
        args:         [TREASURY_WALLET, BigInt(usdcUnits)],
      },
      attestCall,
    ];
  }, [address, usdcUnits, tierLabel, attendeeName, isFree, step]);

  // ── Validate discount + get price ────────────────────────────────────────
  const handleContinue = useCallback(async () => {
    if (!address) return;
    setIsValidating(true);
    setCodeError('');
    try {
      const res  = await fetch('/api/validate-ticket', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          action:        'price',
          tier:          selectedTier,
          discountCode:  discountCode.trim() || null,
          walletAddress: address,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.toLowerCase().includes('discount')) { setCodeError(data.error); return; }
        setErrorMsg(data.error ?? 'Server error'); setStep('error'); return;
      }
      setTierLabel(data.tierLabel);
      setDisplayPrice(data.displayPrice);
      setUsdcUnits(data.usdcUnits);
      setDiscountLabel(data.discountLabel);
      setIsFree(data.isFree);
      setStep('confirm');
    } catch {
      setErrorMsg('Network error. Please try again.'); setStep('error');
    } finally {
      setIsValidating(false);
    }
  }, [address, selectedTier, discountCode]);

  // ── Transaction status handler ────────────────────────────────────────────
  const handleStatus = useCallback(async (status: LifecycleStatus) => {
    if (status.statusName === 'success') {
      const hash = (status.statusData as any).transactionReceipts?.[0]?.transactionHash ?? null;
      setTxHash(hash);
      setStep('done');
      fetch('/api/validate-ticket', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'record', tier: selectedTier, walletAddress: address, attendeeName: attendeeName.trim(), txHash: hash }),
      }).catch(console.error);
    }
    if (status.statusName === 'error') {
      setErrorMsg('Transaction failed. Your USDC was not charged.'); setStep('error');
    }
  }, [selectedTier, address, attendeeName]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <header style={s.header}>
        <span style={s.logo}>BASE Bloc</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isVip && vipChecked && (
            <span style={s.vipBadge}>⭐ VIP</span>
          )}
          <span style={s.badge}>MAY 23 · OAKLAND</span>
        </div>
      </header>

      <main style={s.main}>
        <h1 style={s.headline}>MY CITY<br />OUR MUSIC</h1>
        <p style={s.sub}>Henry J. Kaiser Center for the Arts · Oakland, CA<br />Music, Creative Industries &amp; AI Summit</p>

        {/* SELECT */}
        {step === 'select' && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>Choose Your Ticket</h2>

            {/* VIP unlock notice */}
            {isVip && vipChecked && (
              <div style={s.vipNotice}>
                {magicGranted ? '⭐ VIP access unlocked via your invite link.' : '⭐ Your wallet has VIP access unlocked for this event.'}
              </div>
            )}

            <div style={s.grid}>
              {visibleTiers.map((t) => (
                <button key={t.id} onClick={() => setSelectedTier(t.id)} style={{
                  ...s.tierBtn,
                  borderColor: selectedTier === t.id ? t.accent : '#E5E7EB',
                  boxShadow:   selectedTier === t.id ? `0 0 0 3px ${t.accent}20` : 'none',
                }}>
                  <div style={s.tierRow}>
                    <span style={s.tierName}>
                      {t.label}
                      {t.vipOnly && <span style={{ ...s.vipPill, color: t.accent, borderColor: t.accent }}>VIP</span>}
                    </span>
                    <span style={{ ...s.tierPrice, color: t.accent }}>{t.basePrice} USDC</span>
                  </div>
                  <ul style={s.perks}>
                    {t.perks.map((p) => (
                      <li key={p} style={s.perk}><span style={{ color: t.accent }}>✓</span> {p}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <Field label="Your Name" note="optional">
              <input style={s.input} placeholder="Goes on your participation record" value={attendeeName} onChange={(e) => setAttendeeName(e.target.value)} />
            </Field>

            <Field label="Discount Code" note="optional">
              <input style={{ ...s.input, borderColor: codeError ? '#EF4444' : '#E5E7EB' }} placeholder="e.g. BASEBLOC10" value={discountCode} onChange={(e) => { setDiscountCode(e.target.value); setCodeError(''); }} />
              {codeError && <p style={s.errTxt}>{codeError}</p>}
            </Field>

            {!address && <p style={s.walletNote}>Connect your wallet above to purchase.</p>}

            <button
              style={{ ...s.cta, opacity: (!address || isValidating) ? 0.5 : 1, cursor: (!address || isValidating) ? 'not-allowed' : 'pointer' }}
              onClick={handleContinue}
              disabled={!address || isValidating}
            >
              {isValidating ? 'Checking…' : 'Continue →'}
            </button>
          </div>
        )}

        {/* CONFIRM */}
        {step === 'confirm' && calls.length > 0 && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>Confirm Purchase</h2>
            <div style={s.summary}>
              <SummaryRow label="Event"   value="MY CITY OUR MUSIC" />
              <SummaryRow label="Date"    value="May 23, 2026" />
              <SummaryRow label="Ticket"  value={tierLabel} />
              {discountLabel && <SummaryRow label="Discount" value={discountLabel} green />}
              <div style={{ height: 1, background: '#E5E7EB', margin: '8px 0' }} />
              <SummaryRow label="Total" value={isFree ? 'FREE' : `${displayPrice} USDC`} bold blue={!isFree} />
            </div>

            <p style={s.hint}>
              {isFree
                ? 'One signature claims your free ticket and creates a verified onchain record. Gas is sponsored.'
                : `One signature sends ${displayPrice} USDC to BASE Bloc and writes your verified ticket to Base. Gas is sponsored — no ETH needed.`}
            </p>

            <Transaction chainId={base.id} calls={calls} onStatus={handleStatus} isSponsored>
              <div style={s.txBtnWrap}>
                <TransactionButton text={isFree ? 'Claim Free Ticket →' : `Pay ${displayPrice} USDC →`} />
              </div>
              <TransactionSponsor />
              <TransactionStatus>
                <TransactionStatusLabel />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>

            <button style={s.ghost} onClick={() => { setStep('select'); setUsdcUnits(''); }}>← Back</button>
          </div>
        )}

        {/* DONE */}
        {step === 'done' && (
          <div style={{ ...s.card, textAlign: 'center' }}>
            <div style={s.check}>✓</div>
            <h2 style={s.cardTitle}>You're In!</h2>
            <p style={s.hint}>Your <strong>{tierLabel}</strong> is confirmed. Your participation is now a permanent onchain record on Base.</p>
            {txHash && (
              <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={s.link}>View on Basescan →</a>
            )}
            <a href="/records" style={{ ...s.cta, display: 'inline-block', marginTop: 16, textDecoration: 'none' }}>View My Records</a>
          </div>
        )}

        {/* ERROR */}
        {step === 'error' && (
          <div style={{ ...s.card, textAlign: 'center' }}>
            <div style={s.xmark}>✕</div>
            <h2 style={s.cardTitle}>Something went wrong</h2>
            <p style={s.hint}>{errorMsg}</p>
            <button style={s.cta} onClick={() => { setStep('select'); setErrorMsg(''); setUsdcUnits(''); }}>Try Again</button>
          </div>
        )}

        <p style={s.footer}>
          Payments go directly to the BASE Bloc treasury on Base. Every ticket is a verified onchain credential — no middlemen.
        </p>
      </main>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>
        {label}{note && <span style={{ fontWeight: 400, color: '#999' }}> ({note})</span>}
      </label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, bold, blue, green }: { label: string; value: string; bold?: boolean; blue?: boolean; green?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 0' }}>
      <span style={{ color: '#666' }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 500, color: blue ? '#0052FF' : green ? '#16A34A' : '#111' }}>{value}</span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page:      { background: '#FFF', minHeight: '100vh', fontFamily: "'Inter','Helvetica Neue',sans-serif", color: '#111' },
  header:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #F0F0F0' },
  logo:      { fontWeight: 800, fontSize: 18, color: '#0052FF', letterSpacing: '-0.5px' },
  badge:     { fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#666', background: '#F5F5F5', padding: '4px 10px', borderRadius: 99 },
  vipBadge:  { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#B8860B', background: 'rgba(184,134,11,0.1)', border: '1px solid rgba(184,134,11,0.3)', padding: '4px 10px', borderRadius: 99 },
  main:      { maxWidth: 520, margin: '0 auto', padding: '32px 20px 100px' },
  headline:  { fontSize: 48, fontWeight: 900, lineHeight: 1.0, letterSpacing: '-2px', marginBottom: 12 },
  sub:       { fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 32 },
  card:      { background: '#FAFAFA', border: '1px solid #EFEFEF', borderRadius: 16, padding: 24, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: 700, marginBottom: 20 },
  vipNotice: { background: 'rgba(184,134,11,0.08)', border: '1px solid rgba(184,134,11,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#92620A', marginBottom: 16, fontWeight: 500 },
  grid:      { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
  tierBtn:   { background: '#FFF', border: '2px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease' },
  tierRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tierName:  { fontWeight: 700, fontSize: 15, color: '#111', display: 'flex', alignItems: 'center', gap: 8 },
  tierPrice: { fontWeight: 800, fontSize: 15 },
  vipPill:   { fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', border: '1px solid', borderRadius: 4, padding: '1px 6px' },
  perks:     { listStyle: 'none', margin: 0, padding: 0 },
  perk:      { fontSize: 12, color: '#555', marginBottom: 3 },
  input:     { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 14, color: '#111', background: '#FFF', outline: 'none', boxSizing: 'border-box' },
  errTxt:    { color: '#EF4444', fontSize: 12, marginTop: 4 },
  walletNote:{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#92400E', marginBottom: 16 },
  cta:       { display: 'block', width: '100%', background: '#0052FF', color: '#FFF', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 12, padding: '14px 0', cursor: 'pointer', textAlign: 'center', marginTop: 8 },
  txBtnWrap: { width: '100%', marginTop: 8 },
  summary:   { background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', marginBottom: 16 },
  hint:      { fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 20 },
  ghost:     { display: 'block', width: '100%', background: 'transparent', color: '#666', fontWeight: 600, fontSize: 14, border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '12px 0', cursor: 'pointer', marginTop: 10 },
  check:     { width: 56, height: 56, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  xmark:     { width: 56, height: 56, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  link:      { display: 'inline-block', color: '#0052FF', fontSize: 14, fontWeight: 600, textDecoration: 'none', marginTop: 8 },
  footer:    { fontSize: 12, color: '#AAA', textAlign: 'center', marginTop: 32, lineHeight: 1.6 },
};

export default function TicketsPage() {
  return (
    <Suspense fallback={null}>
      <TicketsPageInner />
    </Suspense>
  );
}
