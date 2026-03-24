'use client';

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";
import { Identity, Avatar, Name, Badge } from "@coinbase/onchainkit/identity";
import { base } from "viem/chains";

const SCHEMA_UID = "0xb81941b702c7aacc8164f6fed9a3ff97bbf179131c9e4bedb040bd7d787da4f7";
const COINBASE_VERIFIED_SCHEMA_ID = "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9";

type Tab = "discover" | "saved" | "records" | "wallet";

// ── ICONS ──
function IconDiscover({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#0052FF" : "#999"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
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
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
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

// ── DISCOVER TAB ──
function DiscoverTab() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [rsvpCount, setRsvpCount] = useState<number | null>(null);

  useEffect(() => {
    function calc() {
      const diff = new Date("2026-05-23T00:00:00").getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch("/api/rsvp-count", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setRsvpCount(j?.count ?? null))
      .catch(() => {});
  }, []);

  return (
    <div style={{ padding: "20px 16px 24px" }}>
      {/* Section header */}
      <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#999", marginBottom: "14px" }}>
        Upcoming Events
      </p>

      {/* Event card */}
      <div style={{
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,82,255,0.06)",
        marginBottom: "16px",
      }}>
        {/* Flyer image */}
        <div style={{ position: "relative" }}>
          <img
            src="/event-flyer.png"
            alt="MY CITY OUR MUSIC"
            style={{ width: "100%", display: "block", maxHeight: "200px", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            background: "#0052FF",
            color: "#fff",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "4px 10px",
            borderRadius: "99px",
          }}>
            Featured
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: "18px 20px 20px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#0052FF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
            BASE Oakland Bloc Presents
          </p>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0a0a0a", margin: "0 0 6px", lineHeight: 1.2 }}>
            MY CITY OUR MUSIC
          </h2>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "14px" }}>
            Music · Creative Industries · AI Summit
          </p>

          {/* Meta row */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span style={{ fontSize: "12px", color: "#555", fontWeight: 600 }}>May 23, 2026</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span style={{ fontSize: "12px", color: "#555", fontWeight: 600 }}>Henry J. Kaiser Center · Oakland</span>
            </div>
          </div>

          {/* Countdown */}
          <div style={{
            background: "#f5f8ff",
            borderRadius: "12px",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "16px",
          }}>
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hrs", value: timeLeft.hours },
              { label: "Min", value: timeLeft.minutes },
              { label: "Sec", value: timeLeft.seconds },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#0052FF", lineHeight: 1 }}>
                  {String(value).padStart(2, "0")}
                </div>
                <div style={{ fontSize: "10px", color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2px" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* RSVP count */}
          {rsvpCount !== null && rsvpCount >= 1 && (
            <p style={{ fontSize: "12px", color: "#0052FF", fontWeight: 600, marginBottom: "14px" }}>
              🔵 {rsvpCount} verified {rsvpCount === 1 ? "RSVP" : "RSVPs"} onchain
            </p>
          )}

          {/* CTA */}
          <a
            href="/"
            style={{
              display: "block",
              width: "100%",
              background: "#0052FF",
              color: "#fff",
              textAlign: "center",
              padding: "14px",
              borderRadius: "99px",
              fontSize: "15px",
              fontWeight: 700,
              textDecoration: "none",
              boxSizing: "border-box",
            }}
          >
            RSVP on Base
          </a>
        </div>
      </div>

      {/* Bottom info */}
      <p style={{ fontSize: "11px", color: "#bbb", textAlign: "center" }}>
        Produced by Hip Hop TV &amp; Citiesabc · Powered onchain by BASE Bloc
      </p>
    </div>
  );
}

// ── SAVED TAB ──
function SavedTab({ isConnected }: { isConnected: boolean }) {
  if (!isConnected) {
    return (
      <div style={{ textAlign: "center", padding: "64px 24px" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔖</div>
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0a0a0a", marginBottom: "8px" }}>Save events</h2>
        <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.6, marginBottom: "24px" }}>
          Connect your wallet to save events and access them anytime.
        </p>
        <Wallet>
          <ConnectWallet disconnectedLabel="Connect Wallet" className="cursor-pointer" />
        </Wallet>
      </div>
    );
  }
  return (
    <div style={{ padding: "20px 16px 24px" }}>
      <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#999", marginBottom: "14px" }}>
        Saved Events
      </p>
      <div style={{
        textAlign: "center",
        padding: "48px 24px",
        background: "#f8faff",
        borderRadius: "16px",
        border: "1px dashed rgba(0,82,255,0.2)",
      }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔖</div>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0a0a0a", marginBottom: "8px" }}>No saved events yet</h3>
        <p style={{ fontSize: "13px", color: "#888", lineHeight: 1.5 }}>
          Events you save will appear here.
        </p>
      </div>
    </div>
  );
}

// ── RECORDS TAB ──
function RecordsTab({ address, isConnected }: { address?: string; isConnected: boolean }) {
  const [attestations, setAttestations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch("https://base.easscan.org/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: '{ attestations( where: { schemaId: { equals: "' + SCHEMA_UID + '" } recipient: { equals: "' + address + '" } } orderBy: { timeCreated: desc } take: 20 ) { id timeCreated decodedDataJson } }',
      }),
    })
      .then((r) => r.json())
      .then((j) => {
        const raw = j?.data?.attestations ?? [];
        const parsed = raw.map((a: any) => {
          try {
            const fields = JSON.parse(a.decodedDataJson);
            const get = (n: string) => fields.find((f: any) => f.name === n)?.value?.value ?? "";
            return {
              id: a.id,
              timeCreated: a.timeCreated,
              eventName: get("eventName"),
              coalition: get("coalition"),
              ticketTier: get("ticketTier"),
              displayName: get("displayName"),
              verified_attendance: get("verified_attendance"),
            };
          } catch { return null; }
        }).filter(Boolean);
        setAttestations(parsed);
      })
      .catch(() => setError("Could not load records."))
      .finally(() => setLoading(false));
  }, [address]);

  if (!isConnected) {
    return (
      <div style={{ textAlign: "center", padding: "64px 24px" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>📋</div>
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0a0a0a", marginBottom: "8px" }}>Your Records</h2>
        <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.6, marginBottom: "24px" }}>
          Connect your wallet to see your verified onchain participation records.
        </p>
        <Wallet>
          <ConnectWallet disconnectedLabel="Connect Wallet" className="cursor-pointer" />
        </Wallet>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "64px 24px" }}>
        <div style={{ width: "28px", height: "28px", border: "3px solid rgba(0,82,255,0.15)", borderTop: "3px solid #0052FF", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontSize: "14px", color: "#888" }}>Loading your records...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 16px 24px" }}>
      <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#999", marginBottom: "14px" }}>
        {attestations.length > 0 ? attestations.length + " Verified Record" + (attestations.length > 1 ? "s" : "") : "My Records"}
      </p>

      {error && <p style={{ fontSize: "13px", color: "#b91c1c", marginBottom: "12px" }}>{error}</p>}

      {attestations.length === 0 && !error ? (
        <div style={{ textAlign: "center", padding: "48px 24px", background: "#f8faff", borderRadius: "16px", border: "1px dashed rgba(0,82,255,0.2)" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔵</div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0a0a0a", marginBottom: "8px" }}>No records yet</h3>
          <p style={{ fontSize: "13px", color: "#888", lineHeight: 1.5, marginBottom: "16px" }}>RSVP to an event to create your first verified onchain record.</p>
          <a href="/" style={{ display: "inline-block", background: "#0052FF", color: "#fff", fontSize: "13px", fontWeight: 600, padding: "10px 22px", borderRadius: "99px", textDecoration: "none" }}>
            RSVP to MY CITY OUR MUSIC
          </a>
        </div>
      ) : (
        attestations.map((a) => (
          <div key={a.id} style={{ background: "#fff", border: "1px solid rgba(0,82,255,0.12)", borderRadius: "16px", padding: "16px 18px", marginBottom: "10px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: a.verified_attendance ? "#15803d" : "#0052FF", borderRadius: "16px 0 0 16px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <div>
                <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: a.verified_attendance ? "#15803d" : "#0052FF", marginBottom: "2px" }}>
                  {a.verified_attendance ? "Verified IRL Attendance" : "Verified Participation"}
                </p>
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0a0a0a", margin: 0 }}>{a.eventName || "Event"}</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
                <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", borderRadius: "99px", background: "#f0f4ff", color: "#0052FF" }}>
                  {a.ticketTier || "General"}
                </span>
                {a.verified_attendance && (
                  <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", borderRadius: "99px", background: "rgba(21,128,61,0.1)", color: "#15803d" }}>
                    OG Gate ✓
                  </span>
                )}
              </div>
            </div>
            <p style={{ fontSize: "11px", color: "#999", margin: 0 }}>
              {a.coalition && a.coalition + " · "}{a.displayName && a.displayName + " · "}
              Attested {new Date(a.timeCreated * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <a href={"https://base.easscan.org/attestation/view/" + a.id} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", fontWeight: 600, color: "#0052FF", textDecoration: "none", display: "block", marginTop: "8px" }}>
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
    fetch("/api/rsvp-count", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setRsvpCount(j?.count ?? null))
      .catch(() => {});
  }, []);

  if (!isConnected) {
    return (
      <div style={{ textAlign: "center", padding: "64px 24px" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>👛</div>
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0a0a0a", marginBottom: "8px" }}>Your Wallet</h2>
        <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.6, marginBottom: "24px" }}>
          Connect your wallet to see your onchain identity.
        </p>
        <Wallet>
          <ConnectWallet disconnectedLabel="Connect Wallet" className="cursor-pointer" />
        </Wallet>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 16px 24px" }}>
      <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#999", marginBottom: "16px" }}>
        Your Identity
      </p>

      {/* Identity card */}
      <div style={{
        background: "linear-gradient(135deg, #0052FF 0%, #0041CC 100%)",
        borderRadius: "20px",
        padding: "24px",
        marginBottom: "16px",
        color: "#fff",
      }}>
        {address && (
          <Identity address={address as `0x${string}`} schemaId={COINBASE_VERIFIED_SCHEMA_ID}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <Avatar address={address as `0x${string}`} chain={base} style={{ width: "56px", height: "56px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)" }} />
              <div>
                <Name address={address as `0x${string}`} chain={base} style={{ fontSize: "18px", fontWeight: 800, color: "#fff", display: "block" }} />
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontFamily: "monospace", margin: "2px 0 0" }}>
                  {address.slice(0, 8)}...{address.slice(-6)}
                </p>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Badge />
              </div>
            </div>
          </Identity>
        )}

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "16px", display: "flex", gap: "24px" }}>
          <div>
            <p style={{ fontSize: "22px", fontWeight: 800, color: "#fff", margin: 0 }}>{rsvpCount ?? "—"}</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", margin: "2px 0 0" }}>Community RSVPs</p>
          </div>
          <div style={{ width: "1px", background: "rgba(255,255,255,0.15)" }} />
          <div>
            <p style={{ fontSize: "22px", fontWeight: 800, color: "#fff", margin: 0 }}>Base</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", margin: "2px 0 0" }}>Network</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <a
          href="/records"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fff",
            border: "1px solid rgba(0,82,255,0.15)",
            borderRadius: "14px",
            padding: "16px 18px",
            textDecoration: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", background: "#f0f4ff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📋</div>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#0a0a0a", margin: 0 }}>My Records</p>
              <p style={{ fontSize: "12px", color: "#888", margin: "2px 0 0" }}>View your verified participation history</p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
        </a>

        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fff",
            border: "1px solid rgba(0,82,255,0.15)",
            borderRadius: "14px",
            padding: "16px 18px",
            textDecoration: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", background: "#f0f4ff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🔵</div>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#0a0a0a", margin: 0 }}>RSVP to MY CITY OUR MUSIC</p>
              <p style={{ fontSize: "12px", color: "#888", margin: "2px 0 0" }}>May 23, 2026 · Oakland</p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
        </a>
      </div>

      <p style={{ fontSize: "11px", color: "#bbb", textAlign: "center", marginTop: "24px" }}>
        Power to the People. Onchain.
      </p>
    </div>
  );
}

// ── MAIN APP ──
export default function AppPage() {
  const [activeTab, setActiveTab] = useState<Tab>("discover");
  const { address, isConnected } = useAccount();

  const tabs: { id: Tab; label: string; icon: (active: boolean) => JSX.Element }[] = [
    { id: "discover", label: "Discover", icon: (a) => <IconDiscover active={a} /> },
    { id: "saved", label: "Saved", icon: (a) => <IconSaved active={a} /> },
    { id: "records", label: "Records", icon: (a) => <IconRecords active={a} /> },
    { id: "wallet", label: "Wallet", icon: (a) => <IconWallet active={a} /> },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#ffffff",
      color: "#0a0a0a",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      maxWidth: "480px",
      margin: "0 auto",
      position: "relative",
    }}>

      {/* Top header */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "#ffffff",
        borderBottom: "1px solid rgba(0,82,255,0.08)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/base-stamp.png" alt="BASE Bloc" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
          <div>
            <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#0052FF", margin: 0 }}>BASE Bloc</p>
            <p style={{ fontSize: "14px", fontWeight: 800, color: "#0a0a0a", margin: 0 }}>
              {activeTab === "discover" ? "Discover" : activeTab === "saved" ? "Saved" : activeTab === "records" ? "My Records" : "Wallet"}
            </p>
          </div>
        </div>

        {isConnected && address ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Identity address={address as `0x${string}`} schemaId={COINBASE_VERIFIED_SCHEMA_ID}>
              <Avatar address={address as `0x${string}`} chain={base} style={{ width: "30px", height: "30px", borderRadius: "50%" }} />
            </Identity>
          </div>
        ) : (
          <Wallet>
            <ConnectWallet disconnectedLabel="Connect" className="cursor-pointer" />
          </Wallet>
        )}
      </div>

      {/* Tab content */}
      <div style={{ paddingBottom: "72px" }}>
        {activeTab === "discover" && <DiscoverTab />}
        {activeTab === "saved" && <SavedTab isConnected={isConnected} />}
        {activeTab === "records" && <RecordsTab address={address} isConnected={isConnected} />}
        {activeTab === "wallet" && <WalletTab address={address} isConnected={isConnected} />}
      </div>

      {/* Bottom tab bar */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "480px",
        background: "#ffffff",
        borderTop: "1px solid rgba(0,82,255,0.08)",
        display: "flex",
        justifyContent: "space-around",
        padding: "8px 0 12px",
        zIndex: 20,
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 16px",
              borderRadius: "8px",
            }}
          >
            {tab.icon(activeTab === tab.id)}
            <span style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: activeTab === tab.id ? "#0052FF" : "#999",
            }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
