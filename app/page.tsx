'use client';

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";
import { Identity, Avatar, Name, Badge } from "@coinbase/onchainkit/identity";
import { useName } from "@coinbase/onchainkit/identity";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { base } from "viem/chains";

const EAS_CONTRACT = "0x4200000000000000000000000000000000000021";
const SCHEMA_UID =
  "0xe75ec39ab8bfdd680f02b11817ed9e10556850278264c0917d645c73866784d9";

const COINBASE_VERIFIED_SCHEMA_ID =
  "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9";

const BUILDER_CODE_DATA_SUFFIX =
  "0x62635f37736474747335310b0080218021802180218021802180218021";

const EVENT_DATE = new Date("2026-05-23T00:00:00");
const EVENT_TIMESTAMP_UTC = BigInt(1779494400);

function getShortWalletLabel(address?: string) {
  if (!address) return "Guest";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ─── Network Hierarchy Banner ────────────────────────────────────────────────
function NetworkBanner() {
  return (
    <div style={{
      width: '100%',
      background: '#F7F7F7',
      borderBottom: '1px solid #EFEFEF',
      padding: '8px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      fontSize: 11,
      fontWeight: 500,
      color: '#888888',
      letterSpacing: '0.3px',
      flexWrap: 'wrap',
      textAlign: 'center',
    }}>
      <a href="https://basebloc.org" target="_blank" rel="noopener noreferrer"
        style={{ color: '#0052FF', textDecoration: 'none', fontWeight: 600 }}>
        BASEbloc.org
      </a>
      <span>network ·</span>
      <a href="https://baseoak.org" target="_blank" rel="noopener noreferrer"
        style={{ color: '#0052FF', textDecoration: 'none', fontWeight: 600 }}>
        BASE Oakland bloc
      </a>
      <span>Coalition 001 · First live product:</span>
      <span style={{ color: '#0A0A0A', fontWeight: 600 }}>BASEbloc.app</span>
    </div>
  );
}

// ─── Top Nav ─────────────────────────────────────────────────────────────────
function TopNav({ onMyRecords }: { onMyRecords: () => void }) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 24px',
      borderBottom: '1px solid #EFEFEF',
      background: '#fff',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      overflow: 'hidden',
      minWidth: 0,
    }}>
      <img src="/BASEbloc-logo-lockup.svg" alt="BASEbloc.app" style={{ height: 28, maxWidth: 120, width: 'auto', display: 'block', flexShrink: 1 }} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0, minWidth: 0 }}>
        <button
          onClick={onMyRecords}
          style={{
            background: '#fff',
            border: '1.5px solid #0052FF',
            color: '#0052FF',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 13,
            fontWeight: 500,
            padding: '8px 18px',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          My Records
        </button>
        <button
          style={{
            background: '#F7931A',
            border: 'none',
            color: '#fff',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 13,
            fontWeight: 500,
            padding: '8px 18px',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onClick={() => document.getElementById('host')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Host an Event
        </button>
      </div>
    </nav>
  );
}

// ─── Countdown ───────────────────────────────────────────────────────────────
function useCountdown(target: Date) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const tick = () => setDiff(Math.max(0, target.getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

// ─── RSVP Count ──────────────────────────────────────────────────────────────
function useRSVPCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    fetch('/api/rsvp-count')
      .then(r => r.json())
      .then(d => setCount(d.count ?? 0))
      .catch(() => setCount(0));
  }, []);
  return count;
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function Home() {
  const { address, isConnected, connector } = useAccount();
  const { data: basename } = useName({ address, chain: base });

  const [activePage, setActivePage] = useState<'home' | 'event' | 'records'>('home');
  const [rsvpState, setRsvpState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [attestationUID, setAttestationUID] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [nameEdited, setNameEdited] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const countdown = useCountdown(EVENT_DATE);
  const rsvpCount = useRSVPCount();

  // Auto-fill basename
  useEffect(() => {
    if (basename && !nameEdited) setDisplayName(basename);
  }, [basename, nameEdited]);

  const finalDisplayName = displayName.trim() || getShortWalletLabel(address);

  async function handleRSVP() {
    if (!connector || !address) return;
    setRsvpState('loading');
    setErrorMsg('');
    try {
      const schemaEncoder = new SchemaEncoder(
        'string eventName,string eventDate,string coalition,bool attending,string ticketTier,string displayName'
      );
      const encoded = schemaEncoder.encodeData([
        { name: 'eventName', value: 'MY CITY OUR MUSIC', type: 'string' },
        { name: 'eventDate', value: '2026-05-23', type: 'string' },
        { name: 'coalition', value: 'BASE Oakland bloc', type: 'string' },
        { name: 'attending', value: true, type: 'bool' },
        { name: 'ticketTier', value: 'General', type: 'string' },
        { name: 'displayName', value: finalDisplayName, type: 'string' },
      ]);

      const { encodeFunctionData } = await import('viem');
      const EAS_ABI = [{
        name: 'attest',
        type: 'function',
        inputs: [{
          name: 'request', type: 'tuple',
          components: [
            { name: 'schema', type: 'bytes32' },
            {
              name: 'data', type: 'tuple',
              components: [
                { name: 'recipient', type: 'address' },
                { name: 'expirationTime', type: 'uint64' },
                { name: 'revocable', type: 'bool' },
                { name: 'refUID', type: 'bytes32' },
                { name: 'data', type: 'bytes' },
                { name: 'value', type: 'uint256' },
              ]
            }
          ]
        }],
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'payable',
      }] as const;

      const calldata = encodeFunctionData({
        abi: EAS_ABI,
        functionName: 'attest',
        args: [{
          schema: SCHEMA_UID as `0x${string}`,
          data: {
            recipient: address,
            expirationTime: BigInt(0),
            revocable: true,
            refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
            data: encoded as `0x${string}`,
            value: BigInt(0),
          }
        }]
      });

      const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;
      // Get the raw EIP-1193 provider from the connector to call wallet_sendCalls
      // directly. Using walletClient.request() routes through viem's HTTP transport
      // which throws "this request method is not supported" in viem@2.47+.
      const provider = await connector.getProvider();
      const txHash = await (provider as any).request({
        method: 'wallet_sendCalls',
        params: [{
          version: '1.0',
          chainId: '0x2105',
          from: address,
          calls: [{
            to: EAS_CONTRACT,
            data: calldata,
            value: '0x0',
          }],
          capabilities: paymasterUrl ? {
            paymasterService: { url: paymasterUrl }
          } : {},
          ...(BUILDER_CODE_DATA_SUFFIX ? { dataSuffix: BUILDER_CODE_DATA_SUFFIX } : {}),
        }]
      });

      // Poll for attestation UID
      let uid: string | null = null;
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const res = await fetch('https://base.easscan.org/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `query {
              attestations(
                where: { attester: { equals: "${address}" }, schemaId: { equals: "${SCHEMA_UID}" } }
                orderBy: { timeCreated: desc }
                take: 1
              ) { id }
            }`
          })
        });
        const json = await res.json();
        uid = json?.data?.attestations?.[0]?.id ?? null;
        if (uid) break;
      }

      setAttestationUID(uid);
      setRsvpState('success');
    } catch (e: any) {
      console.error('[handleRSVP] error:', e);
      console.error('[handleRSVP] message:', e?.message);
      console.error('[handleRSVP] code:', e?.code);
      console.error('[handleRSVP] stack:', e?.stack);
      setErrorMsg(e?.message || 'Something went wrong. Please try again.');
      setRsvpState('error');
    }
  }

  // ── Records Page ────────────────────────────────────────────────────────────
  if (activePage === 'records') {
    return (
      <>
        <NetworkBanner />
        <TopNav onMyRecords={() => setActivePage('home')} />
        <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
          <div className="syne" style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
            My Records
          </div>
          <p style={{ color: '#888', fontSize: 15, marginBottom: 32 }}>
            Connect your wallet to see your verified onchain participation records.
          </p>
          {!isConnected ? (
            <ConnectWallet />
          ) : (
            <div style={{ background: '#F7F7F7', borderRadius: 12, padding: 24, textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#0052FF', marginBottom: 16 }}>
                Your Participation Records
              </div>
              <p style={{ color: '#888', fontSize: 14 }}>
                Records screen coming soon — pulling your attestations from EAS via GraphQL.
              </p>
            </div>
          )}
          <button
            onClick={() => setActivePage('home')}
            style={{ marginTop: 24, background: 'none', border: 'none', color: '#0052FF', cursor: 'pointer', fontSize: 14 }}
          >
            ← Back
          </button>
        </div>
      </>
    );
  }

  // ── RSVP / Mini Page ────────────────────────────────────────────────────────
  if (activePage === 'event') {
    return (
      <>
        <NetworkBanner />
        <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 24px' }}>

            {/* Back */}
            <button
              onClick={() => setActivePage('home')}
              style={{ background: 'none', border: 'none', color: '#0052FF', cursor: 'pointer', fontSize: 14, marginBottom: 24, padding: 0 }}
            >
              ← Back to BASE bloc
            </button>

            {/* Success State */}
            {rsvpState === 'success' ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
                <div className="syne" style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
                  Participation Attested
                </div>
                <p style={{ color: '#888', fontSize: 15, marginBottom: 24 }}>
                  MY CITY OUR MUSIC · Base (L2)
                </p>

                {isConnected && address && (
                  <div style={{ background: '#F7F7F7', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                    <Identity address={address} chain={base}>
                      <Avatar />
                      <Name />
                      <Badge />
                    </Identity>
                  </div>
                )}

                <div style={{ background: '#F7F7F7', borderRadius: 12, padding: 20, fontSize: 14, textAlign: 'left', marginBottom: 24 }}>
                  {[
                    ['Event', 'MY CITY OUR MUSIC'],
                    ['Date', 'May 23, 2026'],
                    ['Network', 'Base (L2)'],
                    ['Gas cost', '$0.00 (sponsored)'],
                    ['Coalition', 'BASE Oakland bloc'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #EFEFEF' }}>
                      <span style={{ color: '#888' }}>{k}</span>
                      <span style={{ color: '#0052FF', fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                  {attestationUID && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <span style={{ color: '#888' }}>Attestation</span>
                      <a
                        href={`https://base.easscan.org/attestation/view/${attestationUID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#0052FF', fontWeight: 500, textDecoration: 'none' }}
                      >
                        View on EAS ↗
                      </a>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>
                  Your participation record lives in your wallet — permanent and portable across the BASEbloc.org network.
                </p>
              </div>
            ) : (
              <>
                {/* Event Header */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#0052FF', marginBottom: 8 }}>
                    BASEbloc.org · Coalition 001 Activation
                  </div>
                  <div className="syne" style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>
                    MY CITY OUR MUSIC
                  </div>
                  <img
                    src="/event-flyer.png"
                    alt="MY CITY OUR MUSIC — May 23, 2026"
                    style={{ width: '100%', borderRadius: 12, marginBottom: 16, display: 'block' }}
                  />
                  <p style={{ color: '#888', fontSize: 15, lineHeight: 1.6 }}>
                    Music, Creative Industries & AI Summit<br />
                    May 23, 2026 · Henry J. Kaiser Center for the Arts, Oakland<br />
                    A HipHopTV + Oakland XChange + CitiesABC production.
                  </p>
                </div>

                {/* Countdown */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
                  {[
                    [countdown.d, 'Days'],
                    [countdown.h, 'Hours'],
                    [countdown.m, 'Min'],
                    [countdown.s, 'Sec'],
                  ].map(([v, l]) => (
                    <div key={String(l)} style={{ flex: 1, background: '#F7F7F7', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
                      <div className="syne" style={{ fontSize: 24, fontWeight: 800, color: '#0052FF' }}>{v}</div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>

                {/* Connect + RSVP */}
                {!isConnected ? (
                  <div>
                    <p style={{ fontSize: 14, color: '#888', marginBottom: 16 }}>
                      Connect your Coinbase Smart Wallet to RSVP onchain. No gas required — fully sponsored.
                    </p>
                    <ConnectWallet />
                    <p style={{ fontSize: 11, color: '#aaa', marginTop: 12 }}>
                      Base App · Mini App · No gas required for attendees
                    </p>
                  </div>
                ) : (
                  <div>
                    {isConnected && address && (
                      <div style={{ background: '#F7F7F7', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                        <Identity address={address} chain={base}>
                          <Avatar />
                          <Name />
                          <Badge />
                        </Identity>
                      </div>
                    )}

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#444' }}>
                        Display Name (optional)
                      </label>
                      <input
                        value={displayName}
                        onChange={e => { setDisplayName(e.target.value); setNameEdited(true); }}
                        placeholder="Your name or handle"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1.5px solid #EFEFEF',
                          borderRadius: 8,
                          fontSize: 14,
                          fontFamily: 'DM Sans, sans-serif',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                      <p style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
                        {basename ? 'Pre-filled from your Basename — edit freely' : 'Optional — leave blank to use your wallet address'}
                      </p>
                    </div>

                    <button
                      onClick={handleRSVP}
                      disabled={rsvpState === 'loading'}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: rsvpState === 'loading' ? '#aaa' : '#0052FF',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        fontSize: 16,
                        fontWeight: 600,
                        fontFamily: 'DM Sans, sans-serif',
                        cursor: rsvpState === 'loading' ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {rsvpState === 'loading' ? 'Attesting to Base...' : 'RSVP on Base'}
                    </button>

                    {rsvpState === 'error' && (
                      <p style={{ color: 'red', fontSize: 13, marginTop: 12 }}>{errorMsg}</p>
                    )}

                    <p style={{ fontSize: 11, color: '#aaa', marginTop: 12, textAlign: 'center' }}>
                      Your RSVP is a permanent onchain record via EAS · Gas fully sponsored by Coinbase Paymaster
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── Home Page ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: #fff; color: #0A0A0A; }
        .base-head { font-family: 'Inter Tight', 'Inter', sans-serif; }
        .syne { font-family: 'Inter Tight', 'Inter', sans-serif; }
        .dot-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .event-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .event-card { transition: all 0.2s; }
      `}</style>

      <NetworkBanner />
      <TopNav onMyRecords={() => setActivePage('records')} />

      {/* HERO */}
      <section style={{ padding: '72px 24px 48px', textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#F7F7F7', border: '1px solid #EFEFEF', borderRadius: 100,
          padding: '6px 14px', fontSize: 12, fontWeight: 500, color: '#444444', marginBottom: 24
        }}>
          <span className="dot-pulse" style={{ width: 6, height: 6, background: '#0052FF', borderRadius: '50%', display: 'inline-block' }}></span>
          Built on Base · Powered by EAS
        </div>

        <h1 className="base-head" style={{ fontSize: 'clamp(36px,6vw,62px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-2px', marginBottom: 20 }}>
          Where showing up goes{' '}
          <span style={{ color: '#F7931A', display: 'inline-block', position: 'relative', padding: '0 10px' }}>
            <span style={{ position: 'relative', zIndex: 2 }}>onchain.</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 220 80"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -52%)',
                width: '130%',
                height: '220%',
                pointerEvents: 'none',
                zIndex: 1,
                overflow: 'visible',
              }}
            >
              <defs>
                <filter id="circleGlow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="4" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <g filter="url(#circleGlow)" opacity="0.95">
                <ellipse cx="110" cy="40" rx="100" ry="28" fill="none" stroke="#0052FF" strokeWidth="1.8" strokeLinecap="round" transform="rotate(-4 110 40)"/>
                <ellipse cx="110" cy="40" rx="98" ry="26" fill="none" stroke="#0052FF" strokeWidth="1.4" strokeLinecap="round" transform="rotate(2 110 40)"/>
                <ellipse cx="110" cy="40" rx="102" ry="30" fill="none" stroke="#0052FF" strokeWidth="1.0" strokeLinecap="round" transform="rotate(-1 110 40)"/>
                <ellipse cx="110" cy="40" rx="96" ry="24" fill="none" stroke="#1a6fff" strokeWidth="0.8" strokeLinecap="round" transform="rotate(3 110 40)"/>
              </g>
            </svg>
          </span>
        </h1>

        <p style={{ fontSize: 17, lineHeight: 1.65, color: '#888888', maxWidth: 520, margin: '0 auto 16px' }}>
          BASEbloc.app converts real-world participation into verified onchain records — turning every check-in, RSVP, and action into community, opportunity, impact and compounding value.
        </p>

        {/* Hierarchy clarity line */}
        <p style={{ fontSize: 13, color: '#aaa', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.6 }}>
          The first live product from the{' '}
          <a href="https://basebloc.org" target="_blank" rel="noopener noreferrer" style={{ color: '#0052FF', textDecoration: 'none', fontWeight: 600 }}>BASEbloc.org</a>
          {' '}network — first deployed under{' '}
          <a href="https://baseoak.org" target="_blank" rel="noopener noreferrer" style={{ color: '#0052FF', textDecoration: 'none', fontWeight: 600 }}>BASE Oakland bloc</a>
          , Coalition 001.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => document.getElementById('host')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', background: '#0052FF', color: '#fff', border: 'none', transition: 'all 0.2s' }}
          >
            Host an Event
          </button>
          <button
            onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', background: '#fff', color: '#0052FF', border: '1.5px solid #0052FF', transition: 'all 0.2s' }}
          >
            Explore Events
          </button>
        </div>

        <div style={{ marginTop: 32, fontSize: 12, color: '#888888', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <strong style={{ color: '#0A0A0A' }}>{rsvpCount ?? '—'}</strong> verified RSVPs onchain ·&nbsp;
          <strong style={{ color: '#0A0A0A' }}>May 23</strong>&nbsp;· Oakland · Coalition 001 active · More city coalitions coming
        </div>
      </section>

      {/* EVENTS */}
      <section style={{ padding: '64px 24px' }} id="events">
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#0052FF', marginBottom: 8 }}>Featured Events</div>
            <div className="syne" style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 700, letterSpacing: '-1px', marginBottom: 8 }}>Live Network Activations</div>
            <div style={{ fontSize: 15, color: '#888888' }}>Coalition-led activations powered by BASEbloc.app across the BASEbloc.org network.</div>
          </div>
          <button
            onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', background: '#fff', color: '#0A0A0A', border: '1.5px solid #EFEFEF', transition: 'all 0.2s' }}
          >
            See all events →
          </button>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>

          {/* Featured Event Card */}
          <div
            className="event-card"
            style={{ background: '#fff', border: '2px solid #0052FF', borderRadius: 16, overflow: 'hidden', cursor: 'pointer' }}
            onClick={() => window.location.href = '/events/my-city-our-music'}
          >
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 10, left: 10, background: '#0052FF', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, letterSpacing: 1, zIndex: 2 }}>FEATURED</div>
              <img
                src="/event-flyer.png"
                alt="MY CITY OUR MUSIC — May 23, 2026"
                style={{ width: '100%', display: 'block', objectFit: 'cover', height: 200 }}
              />
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#0052FF', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                HipHopTV + Oakland XChange + CitiesABC · Coalition 001
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {['Music', 'Creative Industries', 'AI Summit'].map(t => (
                  <span key={t} style={{ background: '#F7F7F7', border: '1px solid #EFEFEF', borderRadius: 6, fontSize: 11, padding: '3px 8px', color: '#444' }}>{t}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#888' }}>
                  <strong style={{ color: '#0A0A0A' }}>{rsvpCount ?? '—'}</strong> verified RSVPs
                </span>
                <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => window.location.href = '/tickets'}
                    style={{ background: '#0052FF', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                  >
                    Get Tickets
                  </button>
                  <button
                    onClick={() => window.location.href = '/events/my-city-our-music'}
                    style={{ background: '#fff', color: '#0052FF', border: '1.5px solid #0052FF', borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                  >
                    RSVP on Base
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Cards */}
          {[
            { loc: 'Bay Area', time: 'Summer 2026' },
            { loc: 'Los Angeles', time: 'Fall 2026' },
          ].map(c => (
            <div key={c.loc} className="event-card" style={{ background: '#F7F7F7', border: '1px solid #EFEFEF', borderRadius: 16, overflow: 'hidden', opacity: 0.7, display: 'flex', flexDirection: 'column' }}>
              {/* Same height as flyer image */}
              <div style={{ background: '#E0E0E0', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#bbb', fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Coming Soon</span>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
                {/* Matches "HipHopTV + Oakland XChange + CitiesABC · Coalition 001" row */}
                <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  BASEbloc.org network
                </div>
                {/* Matches event title row */}
                <div className="syne" style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#999' }}>TBA</div>
                {/* Spacer to push bottom row down */}
                <div style={{ flex: 1 }} />
                {/* Matches verified RSVPs + RSVP button row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#bbb' }}>&nbsp;</span>
                  <button style={{ background: 'none', border: '1px solid #ccc', borderRadius: 7, padding: '8px 16px', fontSize: 12, color: '#aaa', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    Notify Me
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOST SECTION */}
      <section id="host" style={{ padding: '80px 24px', background: '#F7F7F7' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#F7931A', marginBottom: 16 }}>For Event Hosts</div>
            <div className="syne" style={{ fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20, color: '#0A0A0A' }}>
              Stop running events<br />that disappear.
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: '#444', marginBottom: 20 }}>
              BASEbloc.app turns any gathering into belonging that compounds. Every time someone shows up, they build something — and that's what keeps them coming back.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: '#666', marginBottom: 32 }}>
              Concerts, pop-ups, block parties, community nights, conferences — if people are showing up, that participation should lead to something. Every attendee leaves with future access, status, and opportunity tied to being there. That is what brings them back. That is what grows community.
            </p>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '🎟', text: 'Attendance that unlocks future access, status, and opportunity' },
                { icon: '🔁', text: 'Hosts get stronger retention — happier guests, more word of mouth, more return visits' },
                { icon: '⛓', text: 'Permanent onchain attendance credential — free for every attendee' },
                { icon: '⛽', text: '100% gasless via Coinbase Paymaster — $0 for attendees' },
                { icon: '🚪', text: 'Fast door check-in — no bottleneck, no friction' },
                { icon: '📱', text: 'Native inside the Base App' },
              ].map(f => (
                <div key={f.text} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 18, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ fontSize: 14, lineHeight: 1.6, color: '#444' }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: 32, border: '1px solid #EFEFEF', position: 'sticky', top: 24 }}>
            <div className="syne" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Bring BASEbloc.app to your event</div>
            <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>Tell us about your event and we'll be in touch.</p>
            {[
              { placeholder: 'Your name', type: 'text' },
              { placeholder: 'Email address', type: 'email' },
              { placeholder: 'Event name & city', type: 'text' },
              { placeholder: 'Expected attendance size', type: 'text' },
            ].map(f => (
              <input
                key={f.placeholder}
                type={f.type}
                placeholder={f.placeholder}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #EFEFEF', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif', marginBottom: 12, outline: 'none', boxSizing: 'border-box' }}
              />
            ))}
            <button style={{ width: '100%', padding: 14, background: '#0052FF', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Submit Inquiry
            </button>
            <p style={{ fontSize: 11, color: '#aaa', marginTop: 12, textAlign: 'center' }}>
              Part of the BASEbloc.org network
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#0052FF', marginBottom: 12 }}>How It Works</div>
          <div className="syne" style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, marginBottom: 12 }}>Participation you can prove.</div>
          <p style={{ fontSize: 16, color: '#888', marginBottom: 60, maxWidth: 500, margin: '0 auto 60px' }}>
            BASEbloc.app combines existing infrastructure to create something new: a permanent, portable record of your real-world life.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32, textAlign: 'left' }}>
            {[
              {
                step: '01',
                title: 'Connect your wallet in the Base App',
                body: 'BASEbloc.app lives natively inside the Base App — no download, no account. Open the Mini App, connect your Coinbase Smart Wallet, and you\'re in. About 10 seconds.',
                tag: 'Wallet Connected · No gas required'
              },
              {
                step: '02',
                title: 'RSVP, check in, or take part',
                body: 'Every verified participation through BASEbloc.app — starting with MY CITY OUR MUSIC — is recorded onchain via EAS, with gas fully covered.',
                tag: 'Participation Attested · $0.00 (sponsored)'
              },
              {
                step: '03',
                title: 'Your Records tab builds over time',
                body: 'Every BASEbloc.app-supported activation becomes a portable onchain record that compounds across the network over time. It\'s yours, permanently.',
                tag: 'Records grow with every action'
              },
              {
                step: '04',
                title: 'Participation becomes identity. Identity enables governance.',
                body: 'These onchain records become the foundation for community, opportunity, impact and compounding value across BASEbloc.org. BASEbloc.app is the product layer that makes that portable and real.',
                tag: 'Community Rewards · Token Airdrops · Governance Rights'
              },
            ].map(s => (
              <div key={s.step} style={{ padding: 28, background: s.step === '04' ? '#F7F7F7' : '#fff', border: '1px solid #EFEFEF', borderRadius: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#0052FF', marginBottom: 12 }}>STEP {s.step}</div>
                <div className="syne" style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>{s.title}</div>
                <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, marginBottom: 16 }}>{s.body}</p>
                <div style={{ fontSize: 11, color: '#aaa', borderTop: '1px solid #EFEFEF', paddingTop: 12 }}>{s.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INFRASTRUCTURE */}
      <section style={{ padding: '60px 24px', background: '#F7F7F7', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#0052FF', marginBottom: 12 }}>Built On</div>
          <div className="syne" style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, marginBottom: 12 }}>Powered by infrastructure you trust</div>
          <p style={{ fontSize: 15, color: '#888', marginBottom: 40 }}>
            BASEbloc.app is assembled from the most credible primitives in the Base ecosystem — combined with intent.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { name: 'Base (L2)', desc: "Coinbase's L2. Fast, cheap, and trusted by millions." },
              { name: 'EAS', desc: 'Ethereum Attestation Service — the standard for verifiable onchain claims.' },
              { name: 'Coinbase Paymaster', desc: 'Gas is fully sponsored for attendees. Zero cost to participate.' },
              { name: 'Base Mini App', desc: 'Native to the Base App. No downloads. Your community is already there.' },
            ].map(i => (
              <div key={i.name} style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #EFEFEF' }}>
                <div className="syne" style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{i.name}</div>
                <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{i.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 32, fontSize: 14, color: '#aaa', fontStyle: 'italic' }}>
            Culture without tech doesn't scale. Tech without culture doesn't onboard everyone.
          </p>
        </div>
      </section>

      {/* MISSION */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#0052FF', marginBottom: 12 }}>Our Mission</div>
          <div className="syne" style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-1px', marginBottom: 24 }}>
            &ldquo;Showing up <span style={{ color: '#0052FF' }}>is the most human thing you can do.</span> It should mean something permanent.&rdquo;
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: '#888888', marginBottom: 24 }}>
            Concerts, summits, teaching, building, local events — millions of moments and actions happen every day that define who we are. BASEbloc.app gives those moments community, opportunity, impact and compounding value.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: '#555', marginBottom: 36, fontWeight: 500 }}>
            Not a single app. Not a single event. A repeatable model — coalition by coalition, city by city — where every activation builds on the last. The long-term value is the network itself. And it&apos;s already live.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', background: '#0052FF', color: '#fff', border: 'none', transition: 'all 0.2s' }}
            >
              Find an Event
            </button>
            <button
              onClick={() => document.getElementById('host')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', background: '#F7931A', color: '#fff', border: 'none', transition: 'all 0.2s' }}
            >
              Host with BASE bloc
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0A0A0A', color: 'rgba(255,255,255,0.5)', padding: '48px 24px', textAlign: 'center' }}>
        <div className="syne" style={{ fontWeight: 800, fontSize: 18, color: '#fff', marginBottom: 8 }}>
          BASE <span style={{ color: '#0052FF' }}>bloc</span>
        </div>
        <p style={{ fontSize: 13, marginBottom: 4 }}>Building community, opportunity, impact and compounding value — onchain.</p>
        <p style={{ fontSize: 13, fontWeight: 600, marginTop: 6, fontFamily: "'Inter Tight', sans-serif", letterSpacing: '0.3px' }}>
          Power to the People. <span style={{ color: '#F7931A' }}>Onchain.</span>
        </p>

        {/* Hierarchy block */}
        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 12, lineHeight: 2, color: 'rgba(255,255,255,0.35)' }}>
          <a href="https://basebloc.org" target="_blank" rel="noopener noreferrer" style={{ color: '#0052FF', textDecoration: 'none', fontWeight: 600 }}>BASEbloc.org</a>
          {' '}· The city-by-city umbrella network{' · '}
          <a href="https://baseoak.org" target="_blank" rel="noopener noreferrer" style={{ color: '#0052FF', textDecoration: 'none', fontWeight: 600 }}>BASEoak.org</a>
          {' '}· Coalition 001 — Oakland{' · '}
          <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>BASEbloc.app</span>
          {' '}· The infrastructure layer
        </div>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 16 }}>
          Native to Base App · Powered by EAS · Built by{' '}
          <a href="https://baseoak.org" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Orangessance</a>
          {' '}· © {new Date().getFullYear()} BASEbloc
        </p>

        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 16, fontSize: 12 }}>
          {[
            { label: 'Discover', href: '#events' },
            { label: 'My Records', href: '#' },
            { label: 'Host an Event', href: '#host' },
            { label: 'baseoak.org', href: 'https://baseoak.org', external: true },
            { label: 'basebloc.org', href: 'https://basebloc.org', external: true },
          ].map(l => (
            <a
              key={l.label}
              href={l.href}
              target={l.external ? '_blank' : undefined}
              rel={l.external ? 'noopener noreferrer' : undefined}
              style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
            >
              {l.label}
            </a>
          ))}
        </div>
      </footer>
    </>
  );
}
