'use client';

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";
import { Identity, Avatar, Name, Badge } from "@coinbase/onchainkit/identity";
import { base } from "viem/chains";

const SCHEMA_UID =
  "0xe75ec39ab8bfdd680f02b11817ed9e10556850278264c0917d645c73866784d9";

const COINBASE_VERIFIED_SCHEMA_ID =
  "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9";

interface Attestation {
  id: string;
  timeCreated: number;
  decodedDataJson: string;
}

interface DecodedField {
  name: string;
  value: { value: string | boolean | number };
}

function parseAttestation(attestation: Attestation) {
  try {
    const fields: DecodedField[] = JSON.parse(attestation.decodedDataJson);
    const get = (name: string) => fields.find((f) => f.name === name)?.value?.value ?? "";
    return {
      id: attestation.id,
      timeCreated: attestation.timeCreated,
      eventName: get("eventName") as string,
      eventDate: get("eventDate"),
      coalition: get("coalition") as string,
      attending: get("attending") as boolean,
      ticketTier: get("ticketTier") as string,
      displayName: get("displayName") as string,
    };
  } catch {
    return null;
  }
}

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatEventDate(unixTimestamp: number | string | boolean) {
  const ts = typeof unixTimestamp === "string"
    ? parseInt(unixTimestamp)
    : typeof unixTimestamp === "number"
    ? unixTimestamp
    : 0;
  if (!ts) return "";
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function RecordCard({ attestation }: { attestation: ReturnType<typeof parseAttestation> }) {
  if (!attestation) return null;
  const { id, timeCreated, eventName, eventDate, coalition, ticketTier, displayName } = attestation;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,82,255,0.15)",
        borderRadius: "16px",
        padding: "20px 24px",
        marginBottom: "12px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Blue accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "4px",
          background: "#0052FF",
          borderRadius: "16px 0 0 16px",
        }}
      />

      {/* Top row: event name + tier badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0052FF", marginBottom: "3px" }}>
            Verified Participation
          </p>
          <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0a0a0a", lineHeight: 1.2, margin: 0 }}>
            {eventName || "Event"}
          </h3>
        </div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "4px 10px",
            borderRadius: "99px",
            background: ticketTier === "VIP" ? "rgba(0,82,255,0.1)" : "#f0f4ff",
            color: "#0052FF",
            whiteSpace: "nowrap",
            marginLeft: "12px",
            flexShrink: 0,
          }}
        >
          {ticketTier || "General"}
        </span>
      </div>

      {/* Details */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginBottom: "14px" }}>
        {eventDate && (
          <span style={{ fontSize: "12px", color: "#555" }}>
            📅 {formatEventDate(eventDate as number)}
          </span>
        )}
        {coalition && (
          <span style={{ fontSize: "12px", color: "#555" }}>
            🤝 {coalition}
          </span>
        )}
        {displayName && (
          <span style={{ fontSize: "12px", color: "#555" }}>
            👤 {displayName}
          </span>
        )}
      </div>

      {/* Footer: attested date + link */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: "11px", color: "#999", margin: 0 }}>
          Attested {formatDate(timeCreated)}
        </p>
        <a
          href={`https://base.easscan.org/attestation/view/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#0052FF",
            textDecoration: "none",
            letterSpacing: "0.05em",
          }}
        >
          View onchain record →
        </a>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 24px",
        background: "#f8faff",
        borderRadius: "16px",
        border: "1px dashed rgba(0,82,255,0.2)",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          background: "rgba(0,82,255,0.08)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          fontSize: "24px",
        }}
      >
        🔵
      </div>
      <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0a0a0a", marginBottom: "8px" }}>
        No records yet
      </h3>
      <p style={{ fontSize: "13px", color: "#888", lineHeight: 1.6, maxWidth: "260px", margin: "0 auto 20px" }}>
        Your verified onchain participation records will appear here after you RSVP to an event.
      </p>
      <a
        href="/"
        style={{
          display: "inline-block",
          background: "#0052FF",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 600,
          padding: "10px 22px",
          borderRadius: "99px",
          textDecoration: "none",
        }}
      >
        RSVP to MY CITY OUR MUSIC →
      </a>
    </div>
  );
}

export default function RecordsPage() {
  const { address, isConnected } = useAccount();
  const [attestations, setAttestations] = useState<ReturnType<typeof parseAttestation>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!address) return;

    async function fetchAttestations() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("https://base.easscan.org/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `{
              attestations(
                where: {
                  schemaId: { equals: "${SCHEMA_UID}" }
                  recipient: { equals: "${address}" }
                }
                orderBy: { timeCreated: desc }
                take: 20
              ) {
                id
                timeCreated
                decodedDataJson
              }
            }`,
          }),
        });
        const json = await res.json();
        const raw = json?.data?.attestations ?? [];
        const parsed = raw.map(parseAttestation).filter(Boolean);
        setAttestations(parsed);
      } catch {
        setError("Couldn't load your records. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchAttestations();
  }, [address]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#0a0a0a",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid rgba(0,82,255,0.1)",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "#ffffff",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <img src="/base-stamp.png" alt="BASE Bloc" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
          </a>
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#0052FF", margin: 0 }}>
              BASE Bloc
            </p>
            <h1 style={{ fontSize: "15px", fontWeight: 800, margin: 0, color: "#0a0a0a" }}>
              My Records
            </h1>
          </div>
        </div>

        {/* Wallet */}
        {isConnected && address ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Identity
              address={address}
              schemaId={COINBASE_VERIFIED_SCHEMA_ID}
            >
              <Avatar address={address} chain={base} style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
              <Name address={address} chain={base} style={{ fontSize: "13px", fontWeight: 600, color: "#0a0a0a" }}>
                <Badge />
              </n>
            </Identity>
          </div>
          <Wallet>
            <ConnectWallet disconnectedLabel="Connect" className="cursor-pointer" />
          </Wallet>
        )}
      </div>

      {/* Body */}
      <div style={{ maxWidth: "540px", margin: "0 auto", padding: "24px 20px 80px" }}>

        {!isConnected ? (
          /* Not connected */
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔵</div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>
              Connect your wallet
            </h2>
            <p style={{ fontSize: "14px", color: "#888", marginBottom: "24px", lineHeight: 1.6 }}>
              Connect to see your verified onchain participation records.
            </p>
            <Wallet>
              <ConnectWallet disconnectedLabel="Connect Wallet" className="cursor-pointer" />
            </Wallet>
          </div>
        ) : loading ? (
          /* Loading */
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                border: "3px solid rgba(0,82,255,0.15)",
                borderTop: "3px solid #0052FF",
                borderRadius: "50%",
                margin: "0 auto 16px",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ fontSize: "14px", color: "#888" }}>Loading your records...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          /* Error */
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <p style={{ fontSize: "14px", color: "#b91c1c" }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: "12px", padding: "8px 20px", borderRadius: "99px", border: "1px solid #0052FF", background: "transparent", color: "#0052FF", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        ) : (
          /* Records */
          <>
            {attestations.length > 0 && (
              <p style={{ fontSize: "12px", color: "#999", marginBottom: "16px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {attestations.length} verified {attestations.length === 1 ? "record" : "records"}
              </p>
            )}

            {attestations.length === 0 ? (
              <EmptyState />
            ) : (
              attestations.map((a) => a && <RecordCard key={a.id} attestation={a} />)
            )}
          </>
        )}
      </div>

      {/* Bottom nav hint */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#ffffff",
          borderTop: "1px solid rgba(0,82,255,0.1)",
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <a href="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", textDecoration: "none", color: "#999", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          <span style={{ fontSize: "18px" }}>🏠</span>
          Home
        </a>
        <a href="/records" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", textDecoration: "none", color: "#0052FF", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          <span style={{ fontSize: "18px" }}>📋</span>
          Records
        </a>
      </div>
    </div>
  );
}
