'use client';
import type { ReactNode } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider, unstable_connector } from "wagmi";
import { fallback } from "viem";
import { base } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

const connector = coinbaseWallet({
  appName: "BASE bloc",
  preference: "all", // shows both Smart Wallet and regular EOA in Coinbase Wallet
});

const wagmiConfig = createConfig({
  chains: [base],
  connectors: [connector],
  // unstable_connector routes wallet methods (wallet_sendCalls, eth_sendTransaction, etc.)
  // through the Coinbase Wallet provider; http() handles public RPC reads as fallback.
  // Fixes viem@2.x "this request method is not supported" on sponsored transactions.
  transports: { [base.id]: fallback([unstable_connector(connector) as any, http()]) },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          chain={base}
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          config={{
            paymaster: process.env.NEXT_PUBLIC_PAYMASTER_URL,
          }}
          miniKit={{ enabled: true }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
