'use client';

import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";
import { EAS, SchemaEncoder, NO_EXPIRATION } from "@ethereum-attestation-service/eas-sdk";
import { BrowserProvider } from "ethers";

const EAS_CONTRACT = "0x4200000000000000000000000000000000000021";
const SCHEMA_UID =
  "0xA953E6BCB14432C88B30183BD4020F349A8A03F2BECA1D5D2E09761F7B5AAC36";

export default function Home() {
  const [screen, setScreen] = useState("landing");
  const [isAttesting, setIsAttesting] = useState(false);
  const [attestationUID, setAttestationUID] = useState("");
  const [error, setError] = useState("");
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

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
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-8 relative">
        <div className="absolute top-4 right-4 text-sm font-medium">
          BASE Bloc
        </div>
        <div className="flex flex-col items-center max-w-lg">
          <h1 className="text-3xl font-bold mb-4">
            You&apos;re in. Power to the People. Onchain.
          </h1>
          <p className="text-sm text-gray-400 mb-2 break-all">{attestationUID}</p>
          <a
            href={`https://base.easscan.org/attestation/view/${attestationUID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline mb-6"
          >
            View on EAS Scan
          </a>
          <button
            type="button"
            onClick={() => setScreen("landing")}
            className="bg-blue-500 text-white px-8 py-4 rounded-full text-lg cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-8 relative">
      <div className="absolute top-4 right-4 text-sm font-medium">
        BASE Bloc
      </div>

      <div className="flex flex-col items-center max-w-lg">
        <h1 className="text-4xl font-bold mb-2">BASE IS FOR EVERYONE</h1>
        <p className="text-blue-400 text-xl mb-2">Oakland Bloc</p>
        <p className="text-2xl font-bold mb-1">MY CITY OUR MUSIC</p>
        <p className="text-sm mb-6">May 23, 2026 — The Henry J. Kaiser Center for the Arts</p>

        <img
          src="/event-flyer.png"
          alt="MY CITY OUR MUSIC summit flyer"
          className="w-full max-w-md mx-auto my-6 rounded-lg"
        />

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
              className="bg-blue-500 text-white px-8 py-4 rounded-full text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAttesting ? "Attesting..." : "RSVP Onchain"}
            </button>
            {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
            <p className="mt-4 text-sm text-gray-400">Connected: {address}</p>
          </>
        )}

        <p className="mt-8 text-sm text-gray-500">Power to the People. Onchain.</p>
        <p className="mt-2 text-xs text-gray-600">Produced by Hip Hop TV & Citiesabc</p>
      </div>
    </div>
  );
}
