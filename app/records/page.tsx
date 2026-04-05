'use client';

// app/records/page.tsx
//
// Records screen — shows all verified participation records for the
// connected wallet. Queries EAS GraphQL directly, decodes attestation
// data, and displays each record as a participation card.
//
// Queries both schemas:
//   Schema #1275 (live): RSVP + ticket attestations
//   Schema #1179 (retired, read-only): early test attestations

import { useState, useEffect, Suspense } from 'react';
import { useAccount } from 'wagmi';
import { Identity, Avatar, Name, Badge } from '@coinbase/onchainkit/identity';
import { base } from 'wagmi/chains';

// ─── Constants ────────────────────────────────────────────────────────────────
const EAS_GRAPHQL = 'https://base.easscan.org/graphql';
const SCHEMA_UID_LIVE    = '0x2b35516fd072b1da5045ec23a4279f4c25eb864384b222f3553f15e2d5a64553';
const SCHEMA_UID_RETIRED = '0xe75ec39ab8bfdd680f02b11817ed9e10556850278264c0917d645c73866784d9';
const CB_VERIFIED_SCHEMA = '0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9';

// ─── Types ────────────────────────────────────────────────────────────────────
type RawAttestation = {
  id:              string;
  time:            number;
  txid:            string;
  schemaId:        string;
  revoked:         boolean;
  decodedDataJson: string;
};

type ParsedRecord = {
  uid:          string;
  time:         number;
  txid:         string;
  eventName:    string;
  eventDate:    string;
  venueName:    string;
  venueAddress: string;
  tier:         string;
  attendeeName: string;
  platform:     string;
  isVip:        boolean;
  schemaId:     string;
  revoked:      boolean;
};

// ─── GraphQL query ────────────────────────────────────────────────────────────
const QUERY = `
  query GetAttestations($recipient: String!, $schemaIds: [String!]!) {
    attestations(
      where: {
        recipient: { equals: $recipient }
        schemaId:  { in: $schemaIds }
        revoked:   { equals: false }
      }
      orderBy: { time: desc }
    ) {
      id
      time
      txid
      schemaId
      revoked
      decodedDataJson
    }
  }
`;

// ─── Helper: extract a plain string from any EAS field value shape ───────────
// EAS decodedDataJson can nest values 1–3 levels deep depending on the type
// encoder used. This unwraps until it finds a primitive, then stringifies.
function easStr(v: unknown): string {
  let cur = v;
  for (let i = 0; i < 5; i++) {
    if (cur === null || cur === undefined) return '';
    if (typeof cur !== 'object') return String(cur);
    const obj = cur as Record<string, unknown>;
    if ('value' in obj) { cur = obj['value']; continue; }
    return '';
  }
  return '';
}

// ─── Parse decoded attestation data ──────────────────────────────────────────
function parseAttestation(raw: RawAttestation): ParsedRecord {
  let fields: Record<string, string> = {};
  try {
    const decoded: Array<{ name: string; value: unknown }> =
      JSON.parse(raw.decodedDataJson);
    for (const f of decoded) {
      fields[f.name] = easStr(f.value);
    }
  } catch {}

  const tier = easStr(fields.tier) || easStr(fields.ticketTier) || '';
  const rawDate = easStr(fields.eventDate);
  const dateNum = Number(rawDate);
  const eventDate = !isNaN(dateNum) && dateNum > 1000000000
    ? formatDate(dateNum)
    : rawDate;
  return {
    uid:          raw.id,
    time:         raw.time,
    txid:         raw.txid,
    eventName:    easStr(fields.eventName)    || 'BASE Bloc Event',
    eventDate,
    venueName:    easStr(fields.venueName)    || easStr(fields.venue)    || '',
    venueAddress: easStr(fields.venueAddress) || '',
    tier,
    attendeeName: easStr(fields.attendeeName) || easStr(fields.displayName) || '',
    platform:     easStr(fields.platform)     || 'basebloc.app',
    isVip:        tier.toLowerCase().includes('vip'),
    schemaId:     raw.schemaId,
    revoked:      raw.revoked,
  };
}

// ─── Format timestamp ─────────────────────────────────────────────────────────
function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
function RecordsPageInner() {
  const { address } = useAccount();

  const [records,   setRecords]   = useState<ParsedRecord[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [hasCBBadge, setHasCBBadge] = useState(false);

  // ── Fetch attestations when wallet connects ──────────────────────────────
  useEffect(() => {
    if (!address) { setRecords([]); return; }

    setLoading(true);
    setError(null);

    // Query BASE Bloc attestations
    const blocFetch = fetch(EAS_GRAPHQL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: QUERY,
        variables: {
          recipient: address,
          schemaIds: [SCHEMA_UID_LIVE, SCHEMA_UID_RETIRED],
        },
      }),
    })
      .then((r) => r.json())
      .then((d) => (d.data?.attestations ?? []) as RawAttestation[]);

    // Query Coinbase Verified Account badge (separate schema)
    const cbFetch = fetch(EAS_GRAPHQL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: QUERY,
        variables: {
          recipient: address,
          schemaIds: [CB_VERIFIED_SCHEMA],
        },
      }),
    })
      .then((r) => r.json())
      .then((d) => (d.data?.attestations ?? []) as RawAttestation[]);

    Promise.all([blocFetch, cbFetch])
      .then(([blocAttestations, cbAttestations]) => {
        const parsed = blocAttestations.map(parseAttestation);
        setRecords(parsed);
        setHasCBBadge(cbAttestations.length > 0);
      })
      .catch(() => setError('Failed to load records. Please try again.'))
      .finally(() => setLoading(false));

  }, [address]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <header style={s.header}>
        <img src="/BASEbloc-logo-lockup.svg" alt="BASEbloc.app" style={{ height: 28, maxWidth: 120, width: 'auto', display: 'block', flexShrink: 1 }} />
        <span style={s.badge}>PARTICIPATION RECORDS</span>
      </header>

      <main style={s.main}>
        <h1 style={s.headline}>My Records</h1>
        <p style={s.sub}>
          Every event you've participated in is verified onchain and lives in your wallet permanently.
        </p>

        {/* ── Not connected ── */}
        {!address && (
          <div style={s.emptyCard}>
            <div style={s.emptyIcon}>⬡</div>
            <p style={s.emptyTitle}>Connect your wallet</p>
            <p style={s.emptyDesc}>Connect your wallet above to view your verified participation records.</p>
          </div>
        )}

        {/* ── Loading ── */}
        {address && loading && (
          <div style={s.emptyCard}>
            <div style={s.spinner} />
            <p style={s.emptyDesc}>Loading your records from Base…</p>
          </div>
        )}

        {/* ── Error ── */}
        {address && !loading && error && (
          <div style={s.emptyCard}>
            <p style={{ ...s.emptyTitle, color: '#DC2626' }}>Could not load records</p>
            <p style={s.emptyDesc}>{error}</p>
          </div>
        )}

        {/* ── Identity card (when connected + loaded) ── */}
        {address && !loading && !error && (
          <div style={s.identityCard}>
            <Identity address={address} chain={base} schemaId={CB_VERIFIED_SCHEMA as `0x${string}`}>
              <Avatar />
              <div style={s.identityInfo}>
                <span style={{ fontWeight: 700, fontSize: 16, color: "#111", display: "flex", alignItems: "center", gap: 6 }}><Name /><Badge /></span>
                <p style={s.identityMeta}>
                  {records.length} verified record{records.length !== 1 ? 's' : ''} on Base
                  {hasCBBadge && ' · Coinbase Verified'}
                </p>
              </div>
            </Identity>
          </div>
        )}

        {/* ── No records yet ── */}
        {address && !loading && !error && records.length === 0 && (
          <div style={s.emptyCard}>
            <div style={s.emptyIcon}>○</div>
            <p style={s.emptyTitle}>No records yet</p>
            <p style={s.emptyDesc}>
              RSVP to an event or purchase a ticket to create your first verified participation record.
            </p>
            <a href="/" style={s.ctaLink}>Browse Events →</a>
          </div>
        )}

        {/* ── Records list ── */}
        {records.length > 0 && (
          <div style={s.recordsList}>
            {records.map((r) => (
              <div key={r.uid} style={s.recordCard}>
                {/* Top row */}
                <div style={s.recordTop}>
                  <div style={s.recordLeft}>
                    <div style={s.eventDot(r.isVip)} />
                    <div>
                      <p style={s.eventName}>{r.eventName}</p>
                      {r.eventDate && (
                        <p style={s.eventDate}>{r.eventDate} · {r.venueName || r.venueAddress || 'Oakland, CA'}{r.venueName && r.venueAddress && `, ${r.venueAddress}`}</p>
                      )}
                    </div>
                  </div>
                  <div style={s.tierPill(r.isVip)}>
                    {r.tier || 'Attendee'}
                  </div>
                </div>

                {/* Meta row */}
                <div style={s.recordMeta}>
                  <span style={s.metaItem}>
                    🗓 {formatDate(r.time)}
                  </span>
                  {r.attendeeName && (
                    <span style={s.metaItem}>👤 {r.attendeeName}</span>
                  )}
                  <span style={{ ...s.metaItem, color: '#16A34A' }}>
                    ✓ Verified onchain
                  </span>
                </div>

                {/* Links */}
                <div style={s.recordLinks}>
                  <a
                    href={`https://base.easscan.org/attestation/view/${r.uid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={s.recordLink}
                  >
                    View attestation →
                  </a>
                  <a
                    href={`https://basescan.org/tx/${r.txid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...s.recordLink, color: '#666' }}
                  >
                    Basescan ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary footer */}
        {records.length > 0 && (
          <p style={s.footer}>
            {records.length} record{records.length !== 1 ? 's' : ''} · verified on Base ·{' '}
            <a
              href={`https://base.easscan.org/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0052FF', textDecoration: 'none' }}
            >
              view all on EAS Explorer
            </a>
          </p>
        )}
      </main>
    </div>
  );
}

// ─── Suspense wrapper ─────────────────────────────────────────────────────────
export default function RecordsPage() {
  return (
    <Suspense fallback={null}>
      <RecordsPageInner />
    </Suspense>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s: Record<string, any> = {
  page:         { background: '#FFF', minHeight: '100vh', fontFamily: "'Inter','Helvetica Neue',sans-serif", color: '#111' },
  header:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #F0F0F0', overflow: 'hidden', minWidth: 0 },
  logo:         { fontWeight: 800, fontSize: 18, color: '#0052FF', letterSpacing: '-0.5px' },
  badge:        { fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#666', background: '#F5F5F5', padding: '4px 10px', borderRadius: 99, flexShrink: 0, minWidth: 0 },
  main:         { maxWidth: 520, margin: '0 auto', padding: '32px 20px 100px' },
  headline:     { fontSize: 36, fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 10 },
  sub:          { fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 28 },

  // Identity card
  identityCard: { background: '#FAFAFA', border: '1px solid #EFEFEF', borderRadius: 14, padding: '16px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 },
  identityInfo: { display: 'flex', flexDirection: 'column', gap: 3 },
  identityMeta: { fontSize: 12, color: '#888', margin: 0 },

  // Empty states
  emptyCard:    { background: '#FAFAFA', border: '1px solid #EFEFEF', borderRadius: 16, padding: '40px 24px', textAlign: 'center', marginBottom: 16 },
  emptyIcon:    { fontSize: 32, marginBottom: 12, color: '#CCC' },
  emptyTitle:   { fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#111' },
  emptyDesc:    { fontSize: 13, color: '#888', lineHeight: 1.6, margin: '0 auto', maxWidth: 300 },
  ctaLink:      { display: 'inline-block', marginTop: 16, color: '#0052FF', fontWeight: 600, fontSize: 14, textDecoration: 'none' },

  // Spinner
  spinner:      { width: 32, height: 32, borderRadius: '50%', border: '3px solid #E5E7EB', borderTopColor: '#0052FF', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' },

  // Records
  recordsList:  { display: 'flex', flexDirection: 'column', gap: 10 },
  recordCard:   { background: '#FAFAFA', border: '1px solid #EFEFEF', borderRadius: 14, padding: '16px 18px' },
  recordTop:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  recordLeft:   { display: 'flex', alignItems: 'flex-start', gap: 10 },
  eventDot:     (isVip: boolean) => ({
    width: 10, height: 10, borderRadius: '50%', marginTop: 4, flexShrink: 0,
    background: isVip ? '#B8860B' : '#0052FF',
  }),
  eventName:    { fontWeight: 700, fontSize: 15, color: '#111', margin: 0, marginBottom: 2 },
  eventDate:    { fontSize: 12, color: '#888', margin: 0 },
  tierPill:     (isVip: boolean) => ({
    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
    padding: '3px 8px', borderRadius: 5,
    background: isVip ? 'rgba(184,134,11,0.1)' : 'rgba(0,82,255,0.08)',
    color: isVip ? '#B8860B' : '#0052FF',
    border: `1px solid ${isVip ? 'rgba(184,134,11,0.3)' : 'rgba(0,82,255,0.2)'}`,
    whiteSpace: 'nowrap' as const,
  }),
  recordMeta:   { display: 'flex', flexWrap: 'wrap' as const, gap: 12, marginBottom: 10 },
  metaItem:     { fontSize: 12, color: '#666' },
  recordLinks:  { display: 'flex', gap: 16 },
  recordLink:   { fontSize: 12, fontWeight: 600, color: '#0052FF', textDecoration: 'none' },

  // Footer
  footer:       { fontSize: 12, color: '#AAA', textAlign: 'center' as const, marginTop: 24, lineHeight: 1.6 },
};
