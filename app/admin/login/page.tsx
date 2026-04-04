'use client'
export const dynamic = 'force-dynamic'
import { usePrivy } from '@privy-io/react-auth'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const { login, authenticated, user } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    if (!authenticated || !user) return
    const wallet = user.wallet?.address?.toLowerCase()
    const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET?.toLowerCase()
    if (wallet === adminWallet) {
      router.push('/admin/merchants')
    } else {
      alert('This wallet is not authorized for admin access.')
    }
  }, [authenticated, user])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF9', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <div style={{ background: '#fff', border: '1px solid #E4E4E0', borderRadius: '12px', padding: '48px', width: '360px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.1em', color: '#0052FF', marginBottom: '12px' }}>// BASEBLOC ADMIN</div>
        <h1 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '8px' }}>Merchant Registry</h1>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '32px' }}>Connect your authorized wallet to continue.</p>
        <button onClick={login} style={{ width: '100%', background: '#0052FF', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
          Connect Wallet
        </button>
      </div>
    </div>
  )
}
