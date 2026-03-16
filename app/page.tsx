'use client';

import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
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

function TopCornerBrand() {
  return (
    <a
      href="https://baseoak.org/"
      target="_blank"
      rel="noopener noreferrer"
      className="absolute top-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:top-6 md:right-6 hover:opacity-90 transition-opacity z-20"
      aria-label="BASE - Oakland bloc"
    >
      <img
        src="/base-stamp.png"
        alt="BASE - Oakland bloc presents BASEbloc.app stamp"
        className="block w-[92px] h-[92px] md:w-[130px] md:h-[130px] object-contain"
      />
    </a>
  );
}

function EveryoneWord() {
  return (
    <span className="relative inline-block whitespace-nowrap px-2">
      <span className="relative z-10">everyone</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 320 120"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible"
        style={{ width: "128%", height: "155%" }}
      >
        <ellipse cx="160" cy="60" rx="145" ry="38" fill="none" stroke="#0052FF" strokeWidth="4.5" strokeLinecap="round" opacity="0.95" transform="rotate(-3 160 60)" />
        <ellipse cx="160" cy="60" rx="150" ry="42" fill="none" stroke="#0052FF" strokeWidth="3.2" strokeLinecap="round" opacity="0.82" transform="rotate(2 160 60)" />
        <ellipse cx="160" cy="60" rx="141" ry="35" fill="none" stroke="#0052FF" strokeWidth="2.6" strokeLinecap="round" opacity="0.72" transform="rotate(-1 160 60)" />
        <ellipse cx="160" cy="60" rx="154" ry="45" fill="none" stroke="#0052FF" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" transform="rotate(4 160 60)" />
        <path d="M300 56c10 5 12 15 3 23" fill="none" stroke="#0052FF" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
      </svg>
    </span>
  );
}

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calc() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
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
  }, [target]);

  return timeLeft;
}

function useRSVPCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/rsvp-count", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch RSVP count");
        const json = await res.json();
        setCount(json?.count ?? 0);
      } catch {
        setCount(null);
      }
    }
    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => clearInterval(id);
  }, []);

  return count;
}

export default function Home() {
  const [screen, setScreen] = useState("landing");
  const [isAttesting, setIsAttesting] = useState(false);
  const [attestationUID, setAttestationUID] = useState("");
  const [error, setError] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [nameEdited, setNameEdited] = useState(false);
  const [confirmedDisplayName, setConfirmedDisplayName] = useState("");

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const countdown = useCountdown(EVENT_DATE);
  const rsvpCount = useRSVPCount();

  const nameQuery = useName(
    address
      ? { address, chain: base }
      : ({ address: undefined as never, chain: base } as never)
  );
  const basename = nameQuery?.data ?? "";

  useEffect(() => {
    if (basename && !nameEdited) setDisplayName(basename);
  }, [basename, nameEdited]);

  async function handleRSVP() {
    if (!address) return;
    setIsAttesting(true);
    setError("");

    try {
      if (!walletClient) throw new Error("Wallet not connected");

      const finalDisplayName = displayName.trim() || basename || getShortWalletLabel(address);

      const schemaEncoder = new SchemaEncoder(
        "string eventName,uint64 eventDate,string coalition,bool attending,string ticketTier,string displayName"
      );

      const encodedData = schemaEncoder.encodeData([
        { name: "eventName", value: "MY CITY OUR MUSIC", type: "string" },
        { name: "eventDate", value: EVENT_TIMESTAMP_UTC, type: "uint64" },
        { name: "coalition", value: "Oakland Bloc", type: "string" },
        { name: "attending", value: true, type: "bool" },
        { name: "ticketTier", value: "General", type: "string" },
        { name: "displayName", value: finalDisplayName, type: "string" },
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
              recipient: address,
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

      let uid = "";
      for (let i = 0; i < 20; i++) {
        await new Promise((r) => setTimeout(r, 3000));
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
                  take: 1
                ) { id }
              }`,
            }),
          });
          const json = await res.json();
          const found = json?.data?.attestations?.[0]?.id;
          if (found) { uid = found; break; }
        } catch { /* keep polling */ }
      }

      if (!uid) uid = txHash as string;

      setConfirmedDisplayName(finalDisplayName);
      setAttestationUID(uid);
      setScreen("confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Attestation failed");
    } finally {
      setIsAttesting(false);
    }
  }

  // ── CONFIRMATION SCREEN ──
  if (screen === "confirmation") {
    const shareText = encodeURIComponent(
      `Just claimed my onchain RSVP for MY CITY OUR MUSIC in Oakland — May 23, 2026. Verified proof of participation on Base, powered by BASE Bloc. 🔵`
    );
    const shareUrl = encodeURIComponent("https://basebloc.app");

    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center text-center px-8 pt-32 pb-12 md:pt-12 relative">
        <TopCornerBrand />
        <div className="flex flex-col items-center max-w-lg w-full">

          {/* Confirmation headline — completion first, culture second */}
          <h1 className="text-3xl font-bold mb-2 text-black">
            Your RSVP is confirmed.
          </h1>
          <p className="text-sm mb-6 text-gray-600">
            Your verified onchain participation record has been created.
          </p>

          {address && (
            <div className="flex flex-col items-center mb-6">
              <Identity
                address={address}
                schemaId={COINBASE_VERIFIED_SCHEMA_ID}
                className="flex flex-col items-center"
              >
                <Avatar address={address} chain={base} className="w-20 h-20 rounded-full mb-3" />
                <Name address={address} chain={base} className="font-semibold text-black text-lg">
                  <Badge />
                </Name>
              </Identity>
              <p className="text-sm mt-2" style={{ color: "#0052FF" }}>
                RSVP recorded as: {confirmedDisplayName}
              </p>
            </div>
          )}

          <p className="text-xs mb-1 text-gray-500">Verification Record</p>
          <p className="text-sm mb-2 break-all font-mono" style={{ color: "#0052FF" }}>
            {attestationUID}
          </p>
          <a
            href={`https://base.easscan.org/attestation/view/${attestationUID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline mb-6 text-sm"
            style={{ color: "#0052FF" }}
          >
            View your onchain record →
          </a>

          {/* Share buttons */}
          <div className="w-full flex flex-col gap-3 mb-6 max-w-xs">
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center px-6 py-3 rounded-full text-sm font-semibold border-2 transition-opacity hover:opacity-80"
              style={{ borderColor: "#0052FF", color: "#0052FF" }}
            >
              Share on X
            </a>
            <a
              href={`https://warpcast.com/~/compose?text=${shareText}&embeds[]=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center px-6 py-3 rounded-full text-sm font-semibold border-2 transition-opacity hover:opacity-80"
              style={{ borderColor: "#0052FF", color: "#0052FF" }}
            >
              Share on Farcaster
            </a>
            <button
              type="button"
              onClick={() => setScreen("landing")}
              className="w-full text-white px-6 py-3 rounded-full text-sm font-semibold cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#0052FF" }}
            >
              Done
            </button>
          </div>

          <p className="text-sm font-semibold" style={{ color: "#0052FF" }}>
            Power to the People. Onchain.
          </p>

        </div>
      </div>
    );
  }

  // ── LANDING SCREEN ──
  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center text-center px-8 pt-32 pb-12 md:pt-12 relative">
      <TopCornerBrand />

      <div className="flex flex-col items-center max-w-lg w-full">

        {/* ── HERO: Event leads, brand supports ── */}
        <p className="text-xs font-bold tracking-widest uppercase mb-3 text-gray-500">
          BASE Oakland Bloc Presents
        </p>

        <h1 className="text-4xl font-black mb-1 text-black leading-none tracking-tight">
          MY CITY OUR MUSIC
        </h1>

        <p className="text-base text-gray-600 mb-4 font-medium">
          Music · Creative Industries · AI Summit
        </p>

        <p className="text-sm font-semibold mb-4 text-black">
          May 23, 2026 · Henry J. Kaiser Center for the Arts · Oakland
        </p>

        {/* Brand line — now supporting, not leading */}
        <p className="text-lg font-bold mb-1 text-black leading-tight">
          Base is for <EveryoneWord />
        </p>

        <p className="text-xs mb-6 text-gray-500">
          Produced by Hip Hop TV &amp; Citiesabc · Powered onchain by BASE Bloc
        </p>

        {/* Countdown timer */}
        <div className="w-full flex justify-center gap-4 mb-6">
          {[
            { label: "Days", value: countdown.days },
            { label: "Hours", value: countdown.hours },
            { label: "Min", value: countdown.minutes },
            { label: "Sec", value: countdown.seconds },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-3xl font-bold text-black w-14 text-center">
                {String(value).padStart(2, "0")}
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Event flyer */}
        <img
          src="/event-flyer.png"
          alt="MY CITY OUR MUSIC summit flyer"
          className="w-full max-w-md mx-auto my-6 rounded-lg"
        />

        {/* ── TRUST BLOCK — benefit-led, no crypto disclaimers ── */}
        <div className="w-full max-w-md mb-6 rounded-xl px-5 py-4 text-left"
          style={{ backgroundColor: "#EEF4FF", border: "1px solid #C7D9FF" }}>
          <p className="text-sm font-bold text-black mb-1">More than a ticket.</p>
          <p className="text-xs text-gray-700 leading-relaxed">
            Your RSVP creates a verified record that shows you were part of this moment. As BASE
            Oakland Bloc grows, that record can help power community recognition, future access,
            and opportunities for the people who showed up early.
          </p>
        </div>

        {/* RSVP count — shown only when meaningful, otherwise hidden */}
        {rsvpCount !== null && rsvpCount >= 5 && (
          <div className="mb-4">
            <p className="text-sm font-semibold" style={{ color: "#0052FF" }}>
              🔵 {rsvpCount} verified {rsvpCount === 1 ? "RSVP" : "RSVPs"} onchain
            </p>
          </div>
        )}

        {/* Name input — shown only when connected */}
        {isConnected && (
          <div className="w-full max-w-md mb-6">
            <input
              type="text"
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setNameEdited(true); }}
              placeholder={basename || "Your name on the onchain record"}
              className="w-full border rounded-full px-4 py-3 text-sm text-black outline-none focus:ring-2"
              style={{ borderColor: "#0052FF" }}
              maxLength={40}
            />
            <p className="text-xs mt-2 text-gray-500">
              {basename
                ? "Pre-filled from your Basename — edit freely"
                : "Optional — leave blank to use your wallet address"}
            </p>
          </div>
        )}

        {/* CTA */}
        {!isConnected ? (
          <Wallet>
            <ConnectWallet disconnectedLabel="RSVP on Base" className="cursor-pointer" />
          </Wallet>
        ) : (
          <>
            <button
              type="button"
              onClick={handleRSVP}
              disabled={isAttesting}
              className="text-white px-8 py-4 rounded-full text-lg font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#0052FF" }}
            >
              {isAttesting ? "Attesting..." : "RSVP on Base"}
            </button>
            {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
            <p className="mt-3 text-xs text-gray-400">
              Connected: {getShortWalletLabel(address)}
            </p>
          </>
        )}

        {/* Brand sign-off — moved to bottom, not stranded mid-page */}
        <p className="mt-10 text-sm font-semibold" style={{ color: "#0052FF" }}>
          Power to the People. Onchain.
        </p>

        {/* ── FOOTER CONTEXT ── */}
        <div className="w-full max-w-lg mt-12 pt-8 text-left" style={{ borderTop: "1px solid #e5e7eb" }}>

          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-2 text-black">About This Event</p>
            <p className="text-xs leading-relaxed text-gray-700">
              MY CITY OUR MUSIC is a summit for artists, builders, and culture-makers exploring
              music, creative industries, and AI in Oakland — brought together at the Henry J.
              Kaiser Center for the Arts on May 23, 2026.
            </p>
          </div>

          <div className="mb-6" style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2 text-black">About BASE Bloc</p>
            <p className="text-xs leading-relaxed text-gray-700">
              BASE Bloc helps communities turn real-world participation into verified onchain
              records on Base — connecting everyone to the global onchain economy, one action at a time.
            </p>
          </div>

          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2 text-black">Why This RSVP Matters</p>
            <p className="text-xs leading-relaxed text-gray-700">
              This RSVP gives you a wallet-linked record that proves you participated in this summit.
              It&apos;s written to Base, connected to your wallet, and readable anywhere that checks it.
              As BASE Oakland Bloc grows, that record can become the foundation for community
              recognition, future access, and opportunities built for people who showed up first.
              No NFT. No token. Just verified proof of participation.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
