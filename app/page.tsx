'use client';

import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";
import { EAS, SchemaEncoder, NO_EXPIRATION } from "@ethereum-attestation-service/eas-sdk";
import { BrowserProvider } from "ethers";

const EAS_CONTRACT = "0x4200000000000000000000000000000000000021";
const SCHEMA_UID =
  "0xA953E6BCB14432C88B30183BD4020F349A8A03F2BECA1D5D2E09761F7B5AAC36";

const EVENT_DATE = new Date("2026-05-23T00:00:00");

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calc() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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
        const res = await fetch("/api/rsvp-count");
        const json = await res.json();
        setCount(json.count ?? 0);
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
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const countdown = useCountdown(EVENT_DATE);
  const rsvpCount = useRSVPCount();

  async function handleRSVP() {
    if (!address) return;
    setIsAttesting(true);
    setError("");
    try {
      if (!walletClient) throw new Error("Wallet not connected");
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const eas = new EAS(EAS_CONTRACT);
      eas.connect(signer);

      const schemaEncoder = new SchemaEncoder(
        "string eventName,string eventDate,string coalition,bool attending"
      );
      const encodedData = schemaEncoder.encodeData([
        { name: "eventName", value: "MY CITY OUR MUSIC", type: "string" },
        { name: "eventDate", value: "May 23 2026", type: "string" },
        { name: "coalition", value: "Oakland Bloc", type: "string" },
        { name: "attending", value: true, type: "bool" },
      ]);

      const tx = await eas.attest({
        schema: SCHEMA_UID,
        data: {
          recipient: address,
          expirationTime: NO_EXPIRATION,
          revocable: true,
          data: encodedData,
        },
      });

      const uid = await tx.wait();
      setAttestationUID(uid);
      setScreen("confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Attestation failed");
    } finally {
      setIsAttesting(false);
    }
  }

  if (screen === "confirmation") {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center text-center p-8 relative">
        <div className="absolute top-4 right-4 text-sm font-medium text-black">
          BASE Bloc
        </div>
        <div className="flex flex-col items-center max-w-lg">
          <h1 className="text-3xl font-bold mb-4 text-black">
            You&apos;re in. Power to the People. Onchain.
          </h1>
          <p className="text-sm mb-2 break-all" style={{ color: "#0052FF" }}>{attestationUID}</p>
          <a
            href={`https://base.easscan.org/attestation/view/${attestationUID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline mb-6"
            style={{ color: "#0052FF" }}
          >
            View on EAS Scan
          </a>
          <button
            type="button"
            onClick={() => setScreen("landing")}
            className="text-white px-8 py-4 rounded-full text-lg cursor-pointer"
            style={{ backgroundColor: "#0052FF" }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center text-center p-8 relative">
      <div className="absolute top-4 right-4 text-sm font-medium text-black">
        BASE Bloc
      </div>

      <div className="flex flex-col items-center max-w-lg w-full">
        <h1 className="text-4xl font-bold mb-2 text-black">BASE IS FOR EVERYONE</h1>
        <p className="text-xl mb-2 font-semibold" style={{ color: "#0052FF" }}>Oakland Bloc</p>
        <p className="text-2xl font-bold mb-1 text-black">MY CITY OUR MUSIC</p>
        <p className="text-sm mb-6" style={{ color: "#0052FF" }}>
          May 23, 2026 — The Henry J. Kaiser Center for the Arts
        </p>

        {/* Countdown Timer */}
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
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#0052FF" }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <img
          src="/event-flyer.png"
          alt="MY CITY OUR MUSIC summit flyer"
          className="w-full max-w-md mx-auto my-6 rounded-lg"
        />

        {/* RSVP Counter */}
        <div className="mb-4">
          {rsvpCount !== null ? (
            <p className="text-sm font-semibold" style={{ color: "#0052FF" }}>
              🔵 {rsvpCount} onchain {rsvpCount === 1 ? "activation" : "activations"} and counting
            </p>
          ) : (
            <p className="text-sm" style={{ color: "#0052FF" }}>Loading activations...</p>
          )}
        </div>

        {!isConnected ? (
          <Wallet>
            <ConnectWallet disconnectedLabel="RSVP Onchain" className="cursor-pointer" />
          </Wallet>
        ) : (
          <>
            <button
              type="button"
              onClick={handleRSVP}
              disabled={isAttesting}
              className="text-white px-8 py-4 rounded-full text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#0052FF" }}
            >
              {isAttesting ? "Attesting..." : "RSVP Onchain"}
            </button>
            {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
            <p className="mt-4 text-sm" style={{ color: "#0052FF" }}>Connected: {address}</p>
          </>
        )}

        <p className="mt-8 text-sm" style={{ color: "#0052FF" }}>Power to the People. Onchain.</p>
        <p className="mt-2 text-xs" style={{ color: "#0052FF" }}>Produced by Hip Hop TV & Citiesabc</p>
      </div>
    </div>
  );
}
