'use client';
import type { ReactNode } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { base } from "wagmi/chains";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      chain={base}
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      config={{
        paymaster: process.env.NEXT_PUBLIC_PAYMASTER_URL,
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}
