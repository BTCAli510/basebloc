'use client'
import { useState } from 'react'

const mono: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" }

export default function MerchantConfirmPage() {
  const merchantId = process.env.NEXT_PUBLIC_MERCHANT_ID || ''
  const merchantSecret = process.env.NEXT_PUBLIC_MERCHANT_SECRET || ''

  const [attestationUID, setAttestationUID] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; pointsAwarded?: number; txHash?: string | null; error?: string } | null>(null)

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!attestationUID.trim()) return
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/merchant/confirm-service', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ attestationUID: attestationUID.trim(), merchantId, merchantSecret }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResult({ success: false, error: data.error || 'Confirmation failed' })
      } else {
        setResult({ success: true, pointsAwarded: data.pointsAwarded, txHash: data.txHash })
        setAttestationUID('')
      }
    } catch {
      setResult({ success: false, error: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  const truncateTx = (tx: string) => tx.length > 16 ? `${tx.slice(0, 8)}…${tx.slice(-8)}` : tx

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAF9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'IBM Plex Sans', sans-serif",
      padding: '24px',
    }}>
      <div style={{ background: '#fff', border: '1px solid #E4E4E0', borderRadius: '14px', padding: '36px', width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ ...mono, fontSize: '10px', letterSpacing: '0.12em', color: '#0052FF', marginBottom: '8px' }}>
          // MERCHANT TABLET
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Confirm Service</h1>
        {merchantId && (
          <div style={{ ...mono, fontSize: '11px', color: '#999', marginBottom: '28px' }}>{merchantId}</div>
        )}

        {!merchantId && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#991B1B', marginBottom: '20px' }}>
            NEXT_PUBLIC_MERCHANT_ID is not configured.
          </div>
        )}

        <form onSubmit={handleConfirm}>
          <label style={{ display: 'block', ...mono, fontSize: '10px', letterSpacing: '0.08em', color: '#666', marginBottom: '6px' }}>
            ATTESTATION UID
          </label>
          <input
            value={attestationUID}
            onChange={e => setAttestationUID(e.target.value)}
            placeholder="0x…"
            required
            style={{
              width: '100%',
              border: '1px solid #E4E4E0',
              borderRadius: '8px',
              padding: '13px 14px',
              fontSize: '13px',
              marginBottom: '20px',
              boxSizing: 'border-box',
              ...mono,
            }}
          />

          <button
            type="submit"
            disabled={loading || !merchantId || !merchantSecret}
            style={{
              width: '100%',
              background: '#0052FF',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '15px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: loading || !merchantId || !merchantSecret ? 'not-allowed' : 'pointer',
              opacity: loading || !merchantId || !merchantSecret ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Confirming…' : '✓ Confirm Service Complete'}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div style={{
            marginTop: '20px',
            background: result.success ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${result.success ? '#A7F3D0' : '#FEE2E2'}`,
            borderRadius: '10px',
            padding: '16px',
          }}>
            {result.success ? (
              <>
                <div style={{ fontWeight: 700, color: '#065F46', marginBottom: '8px', fontSize: '14px' }}>
                  ✓ Service confirmed
                </div>
                {(result.pointsAwarded ?? 0) > 0 && (
                  <div style={{ ...mono, fontSize: '12px', color: '#047857', marginBottom: '4px' }}>
                    +{result.pointsAwarded} Bloc Parti points awarded
                  </div>
                )}
                {result.txHash && (
                  <div style={{ ...mono, fontSize: '11px', color: '#6EE7B7' }}>
                    tx: {truncateTx(result.txHash)}
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontWeight: 600, color: '#991B1B', fontSize: '14px' }}>
                ✗ {result.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
