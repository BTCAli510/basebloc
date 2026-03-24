'use client';

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";
import { Identity, Avatar, Name, Badge } from "@coinbase/onchainkit/identity";
import { base } from "viem/chains";

const SCHEMA_UID = "0xb81941b702c7aacc8164f6fed9a3ff97bbf179131c9e4bedb040bd7d787da4f7";
const COINBASE_VERIFIED_SCHEMA_ID = "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9";

type Tab = "discover" | "saved" | "records" | "wallet";
type EventView = "list" | "detail";

// ── ICONS ──
function IconDiscover({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#0052FF" : "#999"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
function IconSaved({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#0052FF" : "none"} stroke={active ? "#0052FF" : "#999"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconRecords({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#0052FF" : "#999"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
function IconWallet({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#0052FF" : "#999"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" />
      <circle cx="17" cy="13" r="1" fill={active ? "#0052FF" : "#999"} stroke="none" />
    </svg>
  );
}

// ── COUNTDOWN HOOK ──
function useCountdown(target: string) {
  const [t, setT] = useState({ days: '00', hrs: '00', min: '00', sec: '00' });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) return;
      setT({
        days: String(Math.floor(diff / 86400000)).padStart(2, '0'),
        hrs: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
        min: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        sec: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

// ── DISCOVER TAB ──
function DiscoverTab({ onViewEvent }: { onViewEvent: () => void }) {
  const countdown = useCountdown('2026-05-23T10:00:00-07:00');
  const [rsvpCount, setRsvpCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/rsvp-count', { cache: 'no-store' })
      .then(r => r.json())
      .then(j => setRsvpCount(j?.count ?? null))
      .catch(() => {});
  }, []);

  const futureEvents = [
    { city: 'Bay Area · Summer 2026', name: 'Cultural Event TBA', tags: ['Culture', 'Community'] },
    { city: 'Los Angeles · Fall 2026', name: 'Arts & Tech Summit TBA', tags: ['Arts', 'Technology'] },
    { city: 'New York · Winter 2026', name: 'Creator Economy Forum TBA', tags: ['Creators', 'Web3'] },
  ];

  return (
    <div style={{ padding: '20px 16px 24px' }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#999', marginBottom: 16 }}>
        Upcoming Events
      </p>

      {/* FEATURED EVENT CARD */}
      <div
        onClick={onViewEvent}
        style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 20, overflow: 'hidden', marginBottom: 16, cursor: 'pointer', transition: 'all 0.2s' }}
      >
        <div style={{ position: 'relative' }}>
          <img src="/event-flyer.png" alt="My City Our Music" style={{ width: '100%', display: 'block', maxHeight: 200, objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: 12, left: 12, background: '#0052FF', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 99 }}>
            Featured
          </div>
        </div>
        <div style={{ padding: '18px 20px 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#0052FF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            Hip Hop TV &amp; Citiesabc Present
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a0a0a', margin: '0 0 6px', lineHeight: 1.2, fontFamily: "'Syne', sans-serif" }}>
            My City Our Music
          </h2>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 14 }}>Music · Creative Industries · AI Summit</p>

          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              <span style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>May 23, 2026</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <span style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>Henry J. Kaiser Center · Oakland</span>
            </div>
          </div>

          <div style={{ background: '#f5f8ff', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-around', marginBottom: 16 }}>
            {[['Days', countdown.days], ['Hrs', countdown.hrs], ['Min', countdown.min], ['Sec', countdown.sec]].map(([label, value]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0052FF', lineHeight: 1, fontFamily: "'Syne', sans-serif" }}>{value}</div>
                <div style={{ fontSize: 10, color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {rsvpCount !== null && rsvpCount >= 1 && (
            <p style={{ fontSize: 12, color: '#0052FF', fontWeight: 600, marginBottom: 14 }}>
              ● {rsvpCount} verified {rsvpCount === 1 ? 'RSVP' : 'RSVPs'} onchain
            </p>
          )}

          <button
            onClick={e => { e.stopPropagation(); onViewEvent(); }}
            style={{ display: 'block', width: '100%', background: '#0052FF', color: '#fff', textAlign: 'center', padding: 14, borderRadius: 99, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', boxSizing: 'border-box', fontFamily: "'Syne', sans-serif" }}
          >
            RSVP on Base
          </button>
        </div>
      </div>

      {/* FUTURE EVENT CARDS */}
      {futureEvents.map((ev, i) => (
        <div key={i} style={{ background: '#fff', border: '1px solid #EFEFEF', borderRadius: 16, overflow: 'hidden', marginBottom: 12, opacity: 0.65 }}>
          <div style={{ height: 100, background: ['#111', '#001a33', '#0d1a0d'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 99 }}>Coming Soon</div>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 700 }}>Coming Soon</span>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>{ev.city}</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#aaa', margin: '0 0 10px', fontFamily: "'Syne', sans-serif" }}>{ev.name}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ev.tags.map(t => <span key={t} style={{ fontSize: 10, background: '#F7F7F7', color: '#888', border: '1px solid #EFEFEF', padding: '2px 8px', borderRadius: 99 }}>{t}</span>)}
            </div>
          </div>
        </div>
      ))}

      {/* HOST CTA */}
      <div style={{ border: '2px dashed rgba(0,82,255,0.2)', borderRadius: 16, background: 'rgba(0,82,255,0.02)', padding: '24px 20px', textAlign: 'center', marginTop: 8 }}>
        <div style={{ width: 40, height: 40, background: 'rgba(0,82,255,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 20, color: '#0052FF', fontWeight: 700 }}>+</div>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#0052FF', margin: '0 0 6px', fontFamily: "'Syne', sans-serif" }}>Host Your Event</p>
        <p style={{ fontSize: 12, color: '#888', lineHeight: 1.5, margin: '0 0 14px' }}>Bring verifiable participation to your community with BASE bloc.</p>
        <a href="https://basebloc.app#host" style={{ display: 'inline-block', background: '#0052FF', color: '#fff', fontSize: 12, fontWeight: 600, padding: '9px 20px', borderRadius: 8, textDecoration: 'none' }}>Get Started</a>
      </div>

      <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 20 }}>
        Culture without tech doesn&apos;t scale. Tech without culture doesn&apos;t onboard everyone.
      </p>
    </div>
  );
}

// ── EVENT DETAIL VIEW ──
function EventDetailView({ onBack, address, isConnected }: { onBack: () => void; address?: string; isConnected: boolean }) {
  const countdown = useCountdown('2026-05-23T10:00:00-07:00');

  return (
    <div style={{ padding: '20px 16px 32px' }}>
      <button
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#888', cursor: 'pointer', marginBottom: 20, border: 'none', background: 'none', fontFamily: 'inherit' }}
      >
        ← Back
      </button>

      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0052FF', marginBottom: 8 }}>
        Hip Hop TV &amp; Citiesabc Present
      </p>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 8 }}>
        My City Our Music
      </h1>
      <p style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>Music · Creative Industries · AI Summit</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a', marginBottom: 4 }}>May 23, 2026</p>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Henry J. Kaiser Center for the Arts · Oakland, CA</p>

      <div style={{ width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 20, border: '1px solid #EFEFEF' }}>
        <img src="/event-flyer.png" alt="My City Our Music" style={{ width: '100%', display: 'block' }} />
      </div>

      <div style={{ background: '#f5f8ff', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-around', marginBottom: 20 }}>
        {[['Days', countdown.days], ['Hrs', countdown.hrs], ['Min', countdown.min], ['Sec', countdown.sec]].map(([label, value]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0052FF', lineHeight: 1, fontFamily: "'Syne', sans-serif" }}>{value}</div>
            <div style={{ fontSize: 10, color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {isConnected ? (
        <a
          href="/mini"
          style={{ display: 'block', width: '100%', background: '#0052FF', color: '#fff', textAlign: 'center', padding: 16, borderRadius: 99, fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', boxSizing: 'border-box', textDecoration: 'none', fontFamily: "'Syne', sans-serif", marginBottom: 10 }}
        >
          RSVP on Base
        </a>
      ) : (
        <div style={{ marginBottom: 10 }}>
          <Wallet>
            <ConnectWallet disconnectedLabel="Connect Wallet to RSVP" className="cursor-pointer" />
          </Wallet>
        </div>
      )}
      <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', marginBottom: 24 }}>
        Powered onchain by BASE bloc · Gas sponsored
      </p>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 10 }}>About the summit</h3>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: '#666' }}>
          My City Our Music is a one-day summit at the intersection of music, creative industries, and artificial intelligence — produced by Hip Hop TV and Citiesabc at the Henry J. Kaiser Center for the Arts in Oakland.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: '#666', marginTop: 10 }}>
          This summit brings together artists, technologists, and community leaders to explore how culture shapes technology — and how technology can serve culture.
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 12 }}>Collaborators</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Hip Hop TV', 'Citiesabc', 'Beast Mode', 'Oakland XChange', 'BASE bloc'].map(c => (
            <span key={c} style={{ background: '#F7F7F7', border: '1px solid #EFEFEF', borderRadius: 99, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#444' }}>{c}</span>
          ))}
        </div>
      </div>

      <div style={{ background: '#F7F7F7', border: '1px solid #EFEFEF', borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 8 }}>More than a ticket.</h3>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: '#666', marginBottom: 16 }}>
          Your RSVP creates a verified onchain record that shows you were part of this moment. As BASE bloc grows, that record can help power community recognition, future access, and opportunities for those who show up.
        </p>
        {[
          { icon: '●', title: 'Permanent.', desc: 'Attested to Base via EAS — no database, no middleman. Yours forever.' },
          { icon: '▼', title: 'Gasless.', desc: 'Coinbase Paymaster covers all fees. Participating costs you nothing.' },
          { icon: '■', title: 'Portable.', desc: 'Lives in your wallet. Travels with you to every future BASE bloc event and collaborator.' },
        ].map(r => (
          <div key={r.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 26, height: 26, background: 'rgba(0,82,255,0.1)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0, marginTop: 2, color: '#0052FF' }}>{r.icon}</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: '#555' }}><strong style={{ color: '#0a0a0a' }}>{r.title}</strong> {r.desc}</div>
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#0052FF', fontWeight: 600, marginTop: 32, fontFamily: "'Syne', sans-serif" }}>
        Power to the People. Onchain.
      </p>
    </div>
  );
}

// ── SAVED TAB ──
function SavedTab({ isConnected }: { isConnected: boolean }) {
  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔖</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Save events</h2>
        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 24 }}>Connect your wallet to save events and access them anytime.</p>
        <Wallet><ConnectWallet disconnectedLabel="Connect Wallet" className="cursor-pointer" /></Wallet>
      </div>
    );
  }
  return (
    <div style={{ padding: '20px 16px 24px' }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#999', marginBottom: 14 }}>Saved Events</p>
      <div style={{ textAlign: 'center', padding: '48px 24px', background: '#f8faff', borderRadius: 16, border: '1px dashed rgba(0,82,255,0.2)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔖</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0a0a0a', marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>No saved events yet</h3>
        <p style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>Events you save will appear here.</p>
      </div>
    </div>
  );
}

// ── RECORDS TAB ──
function RecordsTab({ address, isConnected }: { address?: string; isConnected: boolean }) {
  const [attestations, setAttestations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch('https://base.easscan.org/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `{ attestations( where: { schemaId: { equals: "${SCHEMA_UID}" } recipient: { equals: "${address}" } } orderBy: { timeCreated: desc } take: 20 ) { id timeCreated decodedDataJson } }`,
      }),
    })
      .then(r => r.json())
      .then(j => {
        const raw = j?.data?.attestations ?? [];
        const parsed = raw.map((a: any) => {
          try {
            const fields = JSON.parse(a.decodedDataJson);
            const get = (n: string) => fields.find((f: any) => f.name === n)?.value?.value ?? '';
            return { id: a.id, timeCreated: a.timeCreated, eventName: get('eventName'), coalition: get('coalition'), ticketTier: get('ticketTier'), displayName: get('displayName'), verified_attendance: get('verified_attendance') };
          } catch { return null; }
        }).filter(Boolean);
        setAttestations(parsed);
      })
      .catch(() => setError('Could not load records.'))
      .finally(() => setLoading(false));
  }, [address]);

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Your Records</h2>
        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 24 }}>Connect your wallet to see your verified onchain participation records.</p>
        <Wallet><ConnectWallet disconnectedLabel="Connect Wallet" className="cursor-pointer" /></Wallet>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px' }}>
        <div style={{ width: 28, height: 28, border: '3px solid rgba(0,82,255,0.15)', borderTop: '3px solid #0052FF', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 14, color: '#888' }}>Loading your records...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 16px 24px' }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#999', marginBottom: 14 }}>
        {attestations.length > 0 ? `${attestations.length} Verified Record${attestations.length > 1 ? 's' : ''}` : 'My Records'}
      </p>
      {error && <p style={{ fontSize: 13, color: '#b91c1c', marginBottom: 12 }}>{error}</p>}
      {attestations.length === 0 && !error ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: '#f8faff', borderRadius: 16, border: '1px dashed rgba(0,82,255,0.2)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>●</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0a0a0a', marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>No records yet</h3>
          <p style={{ fontSize: 13, color: '#888', lineHeight: 1.5, marginBottom: 16 }}>RSVP to an event to create your first verified onchain record.</p>
          <a href="/mini" style={{ display: 'inline-block', background: '#0052FF', color: '#fff', fontSize: 13, fontWeight: 600, padding: '10px 22px', borderRadius: 99, textDecoration: 'none' }}>
            RSVP to My City Our Music
          </a>
        </div>
      ) : (
        attestations.map(a => (
          <div key={a.id} style={{ background: '#fff', border: '1px solid rgba(0,82,255,0.12)', borderRadius: 16, padding: '16px 18px', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: a.verified_attendance ? '#15803d' : '#0052FF', borderRadius: '16px 0 0 16px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: a.verified_attendance ? '#15803d' : '#0052FF', marginBottom: 2 }}>
                  {a.verified_attendance ? 'Verified IRL Attendance' : 'Verified Participation'}
                </p>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0a0a0a', margin: 0, fontFamily: "'Syne', sans-serif" }}>{a.eventName || 'Event'}</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 99, background: '#f0f4ff', color: '#0052FF' }}>
                  {a.ticketTier || 'General'}
                </span>
                {a.verified_attendance && (
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 99, background: 'rgba(21,128,61,0.1)', color: '#15803d' }}>
                    OG Gate ✓
                  </span>
                )}
              </div>
            </div>
            <p style={{ fontSize: 11, color: '#999', margin: 0 }}>
              {a.coalition && a.coalition + ' · '}{a.displayName && a.displayName + ' · '}
              Attested {new Date(a.timeCreated * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <a href={`https://base.easscan.org/attestation/view/${a.id}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontWeight: 600, color: '#0052FF', textDecoration: 'none', display: 'block', marginTop: 8 }}>
              View onchain record →
            </a>
          </div>
        ))
      )}
    </div>
  );
}

// ── WALLET TAB ──
function WalletTab({ address, isConnected }: { address?: string; isConnected: boolean }) {
  const [rsvpCount, setRsvpCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/rsvp-count', { cache: 'no-store' })
      .then(r => r.json())
      .then(j => setRsvpCount(j?.count ?? null))
      .catch(() => {});
  }, []);

  if (!isConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>👛</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Your Wallet</h2>
        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 24 }}>Connect your wallet to see your onchain identity.</p>
        <Wallet><ConnectWallet disconnectedLabel="Connect Wallet" className="cursor-pointer" /></Wallet>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 16px 24px' }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#999', marginBottom: 16 }}>Your Identity</p>

      <div style={{ background: 'linear-gradient(135deg, #0052FF 0%, #0041CC 100%)', borderRadius: 20, padding: 24, marginBottom: 16, color: '#fff' }}>
        {address && (
          <Identity address={address as `0x${string}`} schemaId={COINBASE_VERIFIED_SCHEMA_ID}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <Avatar address={address as `0x${string}`} chain={base} style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)' }} />
              <div>
                <Name address={address as `0x${string}`} chain={base} style={{ fontSize: 18, fontWeight: 800, color: '#fff', display: 'block', fontFamily: "'Syne', sans-serif" }} />
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', margin: '2px 0 0' }}>
                  {address.slice(0, 8)}...{address.slice(-6)}
                </p>
              </div>
              <div style={{ marginLeft: 'auto' }}><Badge /></div>
            </div>
          </Identity>
        )}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 16, display: 'flex', gap: 24 }}>
          <div>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, fontFamily: "'Syne', sans-serif" }}>{rsvpCount ?? '—'}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', margin: '2px 0 0' }}>Community RSVPs</p>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />
          <div>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, fontFamily: "'Syne', sans-serif" }}>Base</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', margin: '2px 0 0' }}>Network</p>
          </div>
        </div>
      </div>

      {[
        { icon: '📋', title: 'My Records', sub: 'View your verified participation history', href: '/mini' },
        { icon: '●', title: 'RSVP to My City Our Music', sub: 'May 23, 2026 · Oakland', href: '/mini' },
      ].map(item => (
        <a key={item.title} href={item.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid rgba(0,82,255,0.15)', borderRadius: 14, padding: '16px 18px', textDecoration: 'none', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: '#f0f4ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{item.icon}</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0a', margin: 0 }}>{item.title}</p>
              <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>{item.sub}</p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
        </a>
      ))}

      <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 24, fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>
        Power to the People. Onchain.
      </p>
    </div>
  );
}

// ── MAIN APP ──
export default function MiniPage() {
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [eventView, setEventView] = useState<EventView>('list');
  const { address, isConnected } = useAccount();

  const tabs: { id: Tab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    { id: 'discover', label: 'Discover', icon: a => <IconDiscover active={a} /> },
    { id: 'saved', label: 'Saved', icon: a => <IconSaved active={a} /> },
    { id: 'records', label: 'Records', icon: a => <IconRecords active={a} /> },
    { id: 'wallet', label: 'Wallet', icon: a => <IconWallet active={a} /> },
  ];

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');`}</style>
      <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0a0a0a', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: 480, margin: '0 auto', position: 'relative' }}>

        {/* HEADER */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#ffffff', borderBottom: '1px solid rgba(0,82,255,0.08)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/base-stamp.png" alt="BASE bloc" style={{ width: 32, height: 32, objectFit: 'contain' }} onError={e => (e.currentTarget.style.display = 'none')} />
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#0052FF', margin: 0 }}>BASE bloc</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#0a0a0a', margin: 0, fontFamily: "'Syne', sans-serif" }}>
                {activeTab === 'discover' ? (eventView === 'detail' ? 'Event Details' : 'Discover') : activeTab === 'saved' ? 'Saved' : activeTab === 'records' ? 'My Records' : 'Wallet'}
              </p>
            </div>
          </div>
          {isConnected && address ? (
            <Identity address={address as `0x${string}`} schemaId={COINBASE_VERIFIED_SCHEMA_ID}>
              <Avatar address={address as `0x${string}`} chain={base} style={{ width: 30, height: 30, borderRadius: '50%' }} />
            </Identity>
          ) : (
            <Wallet><ConnectWallet disconnectedLabel="Connect" className="cursor-pointer" /></Wallet>
          )}
        </div>

        {/* CONTENT */}
        <div style={{ paddingBottom: 72 }}>
          {activeTab === 'discover' && eventView === 'list' && (
            <DiscoverTab onViewEvent={() => setEventView('detail')} />
          )}
          {activeTab === 'discover' && eventView === 'detail' && (
            <EventDetailView onBack={() => setEventView('list')} address={address} isConnected={isConnected} />
          )}
          {activeTab === 'saved' && <SavedTab isConnected={isConnected} />}
          {activeTab === 'records' && <RecordsTab address={address} isConnected={isConnected} />}
          {activeTab === 'wallet' && <WalletTab address={address} isConnected={isConnected} />}
        </div>

        {/* TAB BAR */}
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: '#ffffff', borderTop: '1px solid rgba(0,82,255,0.08)', display: 'flex', justifyContent: 'space-around', padding: '8px 0 12px', zIndex: 20 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (tab.id === 'discover') setEventView('list'); }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 16px', borderRadius: 8 }}
            >
              {tab.icon(activeTab === tab.id)}
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', color: activeTab === tab.id ? '#0052FF' : '#999' }}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
