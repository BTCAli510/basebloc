'use client';

import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { base } from "viem/chains";

const EAS_CONTRACT = "0x4200000000000000000000000000000000000021";
const SCHEMA_UID =
  "0x2b35516fd072b1da5045ec23a4279f4c25eb864384b222f3553f15e2d5a64553";
const BUILDER_CODE_DATA_SUFFIX =
  "0x62635f37736474747335310b0080218021802180218021802180218021";
const EVENT_TIMESTAMP_UTC = BigInt(1779494400);

// ── Staff password — change this before event day ──
const STAFF_PASSWORD = "oakland2026";

export default function OGGatePage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [recipientAddress, setRecipientAddress] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isAttesting, setIsAttesting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [log, setLog] = useState<{ address: string; uid: string; time: string }[]>([]);

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  function handleUnlock() {
    if (password === STAFF_PASSWORD) {
      setUnlocked(true);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password.");
    }
  }

  function isValidAddress(addr: string) {
    return /^0x[0-9a-fA-F]{40}$/.test(addr.trim());
  }

  async function handleAttest() {
    const addr = recipientAddress.trim();
    if (!isValidAddress(addr)) {
      setError("Invalid wallet address. Must be 0x followed by 40 hex characters.");
      return;
    }
    if (!walletClient) {
      setError("Wallet not connected.");
      return;
    }

    setIsAttesting(true);
    setError("");
    setSuccess("");

    try {
      const finalDisplayName = displayName.trim() || addr.slice(0, 6) + "..." + addr.slice(-4);

      const schemaEncoder = new SchemaEncoder(
        "string eventId,string eventName,uint64 eventDate,string venueName,string venueAddress,string coalition,bool attending,string ticketTier,string displayName,bool verified_attendance,uint64 checkInTime"
      );

      const encodedData = schemaEncoder.encodeData([
        { name: "eventId", value: "MCOM-2026-05-23", type: "string" },
        { name: "eventName", value: "MY CITY OUR MUSIC", type: "string" },
        { name: "eventDate", value: EVENT_TIMESTAMP_UTC, type: "uint64" },
        { name: "venueName", value: "Henry J. Kaiser Center for the Arts", type: "string" },
        { name: "venueAddress", value: "Oakland, CA", type: "string" },
        { name: "coalition", value: "Oakland Bloc", type: "string" },
        { name: "attending", value: true, type: "bool" },
        { name: "ticketTier", value: "General", type: "string" },
        { name: "displayName", value: finalDisplayName, type: "string" },
        { name: "verified_attendance", value: true, type: "bool" },
        { name: "checkInTime", value: BigInt(Math.floor(Date.now() / 1000)), type: "uint64" },
      ]);

      const { encodeFunctionData } = await import("viem");

      const callData = encodeFunctionData({
        abi: [
          {
            name: "attest",
            type: "function",
            inputs: [
              {
                name: "request",
                type: "tuple",
                components: [
                  { name: "schema", type: "bytes32" },
                  {
                    name: "data",
                    type: "tuple",
                    components: [
                      { name: "recipient", type: "address" },
                      { name: "expirationTime", type: "uint64" },
                      { name: "revocable", type: "bool" },
                      { name: "refUID", type: "bytes32" },
                      { name: "data", type: "bytes" },
                      { name: "value", type: "uint256" },
                    ],
                  },
                ],
              },
            ],
            outputs: [{ name: "", type: "bytes32" }],
          },
        ],
        functionName: "attest",
        args: [
          {
            schema: SCHEMA_UID as `0x${string}`,
            data: {
              recipient: addr as `0x${string}`,
              expirationTime: BigInt(0),
              revocable: true,
              refUID: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
              data: encodedData as `0x${string}`,
              value: BigInt(0),
            },
          },
        ],
      });

      const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;

      const txHash = await walletClient.request({
        method: "wallet_sendCalls",
        params: [
          {
            version: "1.0",
            chainId: `0x${base.id.toString(16)}`,
            calls: [
              {
                to: EAS_CONTRACT as `0x${string}`,
                data: callData,
                value: "0x0",
              },
            ],
            capabilities: paymasterUrl
              ? { paymasterService: { url: paymasterUrl } }
              : {},
            dataSuffix: BUILDER_CODE_DATA_SUFFIX,
          },
        ],
      } as never);

      // Poll for attestation UID
      let uid = "";
      for (let i = 0; i < 20; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        try {
          const res = await fetch("https://base.easscan.org/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query:
                "{ attestations( where: { schemaId: { equals: \"" +
                SCHEMA_UID +
                "\" } recipient: { equals: \"" +
                addr +
                "\" } } orderBy: { timeCreated: desc } take: 1 ) { id } }",
            }),
          });
          const json = await res.json();
          const found = json?.data?.attestations?.[0]?.id;
          if (found) { uid = found; break; }
        } catch { /* keep polling */ }
      }

      if (!uid) uid = txHash as string;

      const time = new Date().toLocaleTimeString();
      setLog((prev) => [{ address: addr, uid, time }, ...prev]);
      setSuccess("OG Gate attestation issued! UID: " + uid);
      setRecipientAddress("");
      setDisplayName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Attestation failed.");
    } finally {
      setIsAttesting(false);
    }
  }

  // ── PASSWORD GATE ──
  if (!unlocked) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        <div style={{
          background: "#111",
          border: "1px solid rgba(0,82,255,0.3)",
          borderRadius: "16px",
          padding: "40px 32px",
          width: "100%",
          maxWidth: "360px",
          textAlign: "center",
        }}>
          <img src="/base-stamp.png" alt="BASE Bloc" style={{ width: "56px", height: "56px", margin: "0 auto 16px", display: "block" }} />
          <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", marginBottom: "4px" }}>OG Gate</h1>
          <p style={{ fontSize: "12px", color: "#888", marginBottom: "24px" }}>Staff access only · MY CITY OUR MUSIC</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder="Enter staff password"
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "99px",
              border: "1px solid rgba(0,82,255,0.4)",
              background: "#1a1a1a",
              color: "#ffffff",
              fontSize: "14px",
              marginBottom: "12px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {passwordError && (
            <p style={{ fontSize: "12px", color: "#ef4444", marginBottom: "12px" }}>{passwordError}</p>
          )}
          <button
            onClick={handleUnlock}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "99px",
              border: "none",
              background: "#0052FF",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  // ── STAFF INTERFACE ──
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#ffffff",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: "24px 20px 48px",
    }}>
      <div style={{ maxWidth: "540px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <img src="/base-stamp.png" alt="BASE Bloc" style={{ width: "40px", height: "40px", objectFit: "contain" }} />
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#0052FF", margin: 0 }}>
              BASE Bloc · Staff
            </p>
            <h1 style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "#ffffff" }}>
              OG Gate
            </h1>
          </div>
          <div style={{ marginLeft: "auto" }}>
            {!isConnected ? (
              <Wallet>
                <ConnectWallet disconnectedLabel="Connect Wallet" className="cursor-pointer" />
              </Wallet>
            ) : (
              <span style={{ fontSize: "11px", color: "#0052FF", fontWeight: 600 }}>
                {address ? address.slice(0, 6) + "..." + address.slice(-4) : ""}
              </span>
            )}
          </div>
        </div>

        {/* Info box */}
        <div style={{
          background: "rgba(0,82,255,0.08)",
          border: "1px solid rgba(0,82,255,0.25)",
          borderRadius: "12px",
          padding: "14px 18px",
          marginBottom: "24px",
          fontSize: "12px",
          color: "#aaa",
          lineHeight: 1.6,
        }}>
          Issue a <strong style={{ color: "#0052FF" }}>verified_attendance = true</strong> attestation for each attendee who passes through the OG Gate on May 23. Enter their wallet address and tap Issue.
        </div>

        {/* Connect prompt */}
        {!isConnected && (
          <div style={{ textAlign: "center", padding: "32px 0", marginBottom: "24px" }}>
            <p style={{ fontSize: "14px", color: "#888", marginBottom: "16px" }}>Connect your staff wallet to issue attestations.</p>
            <Wallet>
              <ConnectWallet disconnectedLabel="Connect Wallet" className="cursor-pointer" />
            </Wallet>
          </div>
        )}

        {/* Attestation form */}
        {isConnected && (
          <div style={{
            background: "#111",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0052FF", marginBottom: "16px" }}>
              Issue OG Gate Attestation
            </p>

            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>
              Attendee Wallet Address *
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "#1a1a1a",
                color: "#ffffff",
                fontSize: "13px",
                marginBottom: "14px",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "monospace",
              }}
            />

            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>
              Display Name (optional)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Leave blank to use wallet address"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "#1a1a1a",
                color: "#ffffff",
                fontSize: "13px",
                marginBottom: "20px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            {error && (
              <p style={{ fontSize: "12px", color: "#ef4444", marginBottom: "12px" }}>{error}</p>
            )}
            {success && (
              <p style={{ fontSize: "12px", color: "#15803d", marginBottom: "12px", wordBreak: "break-all" }}>{success}</p>
            )}

            <button
              onClick={handleAttest}
              disabled={isAttesting || !recipientAddress}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "99px",
                border: "none",
                background: isAttesting ? "#333" : "#0052FF",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 700,
                cursor: isAttesting || !recipientAddress ? "not-allowed" : "pointer",
                opacity: !recipientAddress ? 0.5 : 1,
                transition: "background 0.2s",
              }}
            >
              {isAttesting ? "Issuing..." : "Issue OG Gate Attestation"}
            </button>
          </div>
        )}

        {/* Log */}
        {log.length > 0 && (
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: "12px" }}>
              Session Log ({log.length})
            </p>
            {log.map((entry, i) => (
              <div key={i} style={{
                background: "#111",
                border: "1px solid rgba(21,128,61,0.25)",
                borderLeft: "3px solid #15803d",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "8px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#aaa" }}>
                    {entry.address.slice(0, 10)}...{entry.address.slice(-6)}
                  </span>
                  <span style={{ fontSize: "10px", color: "#555" }}>{entry.time}</span>
                </div>
                <a
                  href={"https://base.easscan.org/attestation/view/" + entry.uid}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "10px", color: "#0052FF", textDecoration: "none" }}
                >
                  {entry.uid.slice(0, 18)}... →
                </a>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
