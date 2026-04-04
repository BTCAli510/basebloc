'use client'
import { PrivyProvider } from '@privy-io/react-auth'
import { base } from 'wagmi/chains'

export default function AppPrivyProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  if (!appId) return <>{children}</>

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['wallet'],
        appearance: { theme: 'light', accentColor: '#0052FF' },
        defaultChain: base,
      }}
    >
      {children}
    </PrivyProvider>
  )
}
