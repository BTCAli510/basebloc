'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback } from 'react'

interface Merchant {
  id: string
  merchant_id: string
  merchant_name: string
  wallet_address: string
  coalition_id: string
  is_active: boolean
  registration_tx: string | null
  created_at: string
}

interface RegistrationResult {
  merchantId: string
  walletAddress: string
  registrationTx: string
  tabletSecret: string
}

const COALITIONS = [
  { value: 'base-oakland-bloc', label: 'BASE Oakland Bloc' },
  { value: 'base-boston-bloc', label: 'BASE Boston Bloc' },
  { value: 'base-la-bloc', label: 'BASE LA Bloc' },
  { value: 'base-houston-bloc', label: 'BASE Houston Bloc' },
  { value: 'base-atlanta-bloc', label: 'BASE Atlanta Bloc' },
  { value: 'base-chicago-bloc', label: 'BASE Chicago Bloc' },
]

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function truncate(addr: string) {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

const mono: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" }
const sans: React.CSSProperties = { fontFamily: "'IBM Plex Sans', sans-serif" }

export default function AdminMerchantsPage() {
  const [adminKey, setAdminKey] = useState('')
  const [keyInput, setKeyInput] = useState('')
  const [keyError, setKeyError] = useState('')
  const [tab, setTab] = useState<'list' | 'register'>('list')
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')

  // Registration form
  const [merchantName, setMerchantName] = useState('')
  const [coalitionId, setCoalitionId] = useState('base-oakland-bloc')
  const [walletAddress, setWalletAddress] = useState('')
  const [registering, setRegistering] = useState(false)
  const [regError, setRegError] = useState('')
  const [regResult, setRegResult] = useState<RegistrationResult | null>(null)
  const [secretRevealed, setSecretRevealed] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const merchantId = slugify(merchantName)

  const fetchMerchants = useCallback(async (key: string) => {
    setLoading(true)
    setFetchError('')
    try {
      const res = await fetch('/api/admin/merchants', {
        headers: { 'x-admin-key': key },
      })
      const data = await res.json()
      if (!res.ok) {
        setFetchError(data.error || 'Failed to load merchants')
        return false
      }
      setMerchants(data.merchants)
      return true
    } catch {
      setFetchError('Network error')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setKeyError('')
    const ok = await fetchMerchants(keyInput)
    if (ok) {
      setAdminKey(keyInput)
    } else {
      setKeyError('Invalid admin key or server error.')
    }
  }

  useEffect(() => {
    if (adminKey && tab === 'list') fetchMerchants(adminKey)
  }, [adminKey, tab, fetchMerchants])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')
    setRegResult(null)
    setRegistering(true)
    try {
      const res = await fetch('/api/merchant/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ merchantId, merchantName, walletAddress, coalitionId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRegError(data.error || 'Registration failed')
        return
      }
      setRegResult(data)
      setMerchantName('')
      setWalletAddress('')
      setCoalitionId('base-oakland-bloc')
    } catch {
      setRegError('Network error')
    } finally {
      setRegistering(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  // ── Key gate ──────────────────────────────────────────────────────────────
  if (!adminKey) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF9', ...sans }}>
        <div style={{ background: '#fff', border: '1px solid #E4E4E0', borderRadius: '12px', padding: '48px', width: '380px' }}>
          <div style={{ ...mono, fontSize: '11px', letterSpacing: '0.1em', color: '#0052FF', marginBottom: '12px' }}>// BASEBLOC ADMIN</div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>Enter Admin Key</h1>
          <form onSubmit={handleKeySubmit}>
            <input
              type="password"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="Admin registration key"
              style={{ width: '100%', border: '1px solid #E4E4E0', borderRadius: '8px', padding: '12px', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box', ...mono }}
            />
            {keyError && <div style={{ color: '#C0392B', fontSize: '13px', marginBottom: '12px' }}>{keyError}</div>}
            <button type="submit" style={{ width: '100%', background: '#0052FF', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Continue
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', ...sans }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E4E4E0', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ ...mono, fontSize: '11px', letterSpacing: '0.1em', color: '#0052FF' }}>// BASEBLOC ADMIN</span>
        <span style={{ color: '#E4E4E0' }}>|</span>
        <span style={{ fontSize: '14px', fontWeight: 600 }}>Merchant Registry</span>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: '#F0F0EE', padding: '4px', borderRadius: '8px', width: 'fit-content' }}>
          {(['list', 'register'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setRegResult(null); setRegError('') }}
              style={{
                padding: '8px 20px', borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#0A0A0A' : '#666',
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {t === 'list' ? 'Active Merchants' : '+ Register New'}
            </button>
          ))}
        </div>

        {/* ── LIST TAB ── */}
        {tab === 'list' && (
          <div>
            {loading && <div style={{ color: '#666', fontSize: '14px' }}>Loading…</div>}
            {fetchError && <div style={{ color: '#C0392B', fontSize: '14px' }}>{fetchError}</div>}
            {!loading && !fetchError && (
              <div style={{ background: '#fff', border: '1px solid #E4E4E0', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#FAFAF9' }}>
                      {['Name', 'Merchant ID', 'Coalition', 'Wallet', 'Status', 'Registered'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#666', borderBottom: '1px solid #E4E4E0', ...mono, fontSize: '11px', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {merchants.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#999' }}>No merchants registered yet.</td>
                      </tr>
                    )}
                    {merchants.map((m, i) => (
                      <tr key={m.id} style={{ borderBottom: i < merchants.length - 1 ? '1px solid #E4E4E0' : 'none' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600 }}>{m.merchant_name}</td>
                        <td style={{ padding: '14px 16px', ...mono, fontSize: '12px', color: '#0052FF' }}>{m.merchant_id}</td>
                        <td style={{ padding: '14px 16px', fontSize: '12px', color: '#666' }}>{m.coalition_id}</td>
                        <td style={{ padding: '14px 16px', ...mono, fontSize: '12px' }}>{truncate(m.wallet_address)}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: m.is_active ? '#ECFDF5' : '#FEF2F2', color: m.is_active ? '#065F46' : '#991B1B', padding: '3px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600 }}>
                            {m.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', ...mono, fontSize: '11px', color: '#999' }}>
                          {new Date(m.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── REGISTER TAB ── */}
        {tab === 'register' && (
          <div style={{ maxWidth: '520px' }}>
            {/* Success reveal */}
            {regResult && (
              <div style={{ background: '#fff', border: '2px solid #0052FF', borderRadius: '12px', padding: '28px', marginBottom: '28px' }}>
                <div style={{ ...mono, fontSize: '11px', color: '#0052FF', letterSpacing: '0.1em', marginBottom: '8px' }}>// REGISTRATION SUCCESSFUL — SHOWN ONCE</div>
                <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#92400E' }}>
                  ⚠️ Save the merchant secret immediately. It will not be shown again.
                </div>

                {[
                  { label: 'NEXT_PUBLIC_MERCHANT_ID', value: regResult.merchantId },
                  { label: 'NEXT_PUBLIC_MERCHANT_SECRET', value: secretRevealed ? regResult.tabletSecret : '••••••••••••••••' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ marginBottom: '16px' }}>
                    <div style={{ ...mono, fontSize: '11px', color: '#666', marginBottom: '6px' }}>{label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, background: '#FAFAF9', border: '1px solid #E4E4E0', borderRadius: '6px', padding: '10px 14px', ...mono, fontSize: '13px', wordBreak: 'break-all' }}>
                        {value}
                      </div>
                      {label === 'NEXT_PUBLIC_MERCHANT_SECRET' && !secretRevealed ? (
                        <button onClick={() => setSecretRevealed(true)} style={{ background: '#0052FF', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          Reveal
                        </button>
                      ) : (
                        <button onClick={() => copyToClipboard(label === 'NEXT_PUBLIC_MERCHANT_SECRET' ? regResult.tabletSecret : regResult.merchantId, label)} style={{ background: '#0A0A0A', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          {copied === label ? 'Copied!' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {regResult.registrationTx && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ ...mono, fontSize: '11px', color: '#666', marginBottom: '6px' }}>REGISTRATION TX</div>
                    <div style={{ ...mono, fontSize: '12px', color: '#999', wordBreak: 'break-all' }}>{regResult.registrationTx}</div>
                  </div>
                )}

                <button onClick={() => { setRegResult(null); setSecretRevealed(false) }} style={{ marginTop: '20px', width: '100%', background: 'transparent', color: '#0052FF', border: '1px solid #0052FF', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Register Another Merchant
                </button>
              </div>
            )}

            {!regResult && (
              <form onSubmit={handleRegister} style={{ background: '#fff', border: '1px solid #E4E4E0', borderRadius: '12px', padding: '28px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>Register New Merchant</h2>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', ...mono, fontSize: '11px', letterSpacing: '0.05em', color: '#666', marginBottom: '6px' }}>MERCHANT NAME</label>
                  <input
                    value={merchantName}
                    onChange={e => setMerchantName(e.target.value)}
                    placeholder="e.g. Fade Masters Barbershop"
                    required
                    style={{ width: '100%', border: '1px solid #E4E4E0', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                  {merchantName && (
                    <div style={{ ...mono, fontSize: '11px', color: '#0052FF', marginTop: '6px' }}>
                      merchant_id: {merchantId}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', ...mono, fontSize: '11px', letterSpacing: '0.05em', color: '#666', marginBottom: '6px' }}>COALITION</label>
                  <select
                    value={coalitionId}
                    onChange={e => setCoalitionId(e.target.value)}
                    style={{ width: '100%', border: '1px solid #E4E4E0', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', boxSizing: 'border-box', background: '#fff' }}
                  >
                    {COALITIONS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', ...mono, fontSize: '11px', letterSpacing: '0.05em', color: '#666', marginBottom: '6px' }}>WALLET ADDRESS</label>
                  <input
                    value={walletAddress}
                    onChange={e => setWalletAddress(e.target.value)}
                    placeholder="0x…"
                    required
                    pattern="^0x[a-fA-F0-9]{40}$"
                    style={{ width: '100%', border: '1px solid #E4E4E0', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', boxSizing: 'border-box', ...mono }}
                  />
                </div>

                {regError && <div style={{ color: '#C0392B', fontSize: '13px', marginBottom: '16px' }}>{regError}</div>}

                <button type="submit" disabled={registering} style={{ width: '100%', background: '#0052FF', color: '#fff', border: 'none', borderRadius: '8px', padding: '13px', fontSize: '14px', fontWeight: 700, cursor: registering ? 'wait' : 'pointer', opacity: registering ? 0.7 : 1 }}>
                  {registering ? 'Registering…' : 'Register Merchant'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
