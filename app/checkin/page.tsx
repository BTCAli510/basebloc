'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type ScanState = 'idle' | 'loading' | 'success' | 'already' | 'error'

interface ScanResult {
  displayName?: string
  ticketTier?: string
  attendeeIndex?: number
  checkedInAt?: string
  attestationUID?: string
  walletAddress?: string
}

const BG: Record<ScanState, string> = {
  idle: '#0A0A0A',
  loading: '#0A0A0A',
  success: '#0A7A3C',
  already: '#C47000',
  error: '#C0392B',
}

export default function CheckinPage() {
  const [state, setState] = useState<ScanState>('idle')
  const [result, setResult] = useState<ScanResult>({})
  const [errorMsg, setErrorMsg] = useState('')
  const [sessionCount, setSessionCount] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const bufferRef = useRef('')
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    focusInput()
    const interval = setInterval(focusInput, 2000)
    return () => clearInterval(interval)
  }, [focusInput])

  const processQR = useCallback(async (raw: string) => {
    const parts = raw.trim().split('|')
    if (parts.length !== 2) {
      setState('error')
      setErrorMsg('Invalid QR format')
      resetAfter4s()
      return
    }
    const [walletAddress, ticketId] = parts

    setState('loading')
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-scanner-token': process.env.NEXT_PUBLIC_SCANNER_SECRET || '',
        },
        body: JSON.stringify({ walletAddress, ticketId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setState('error')
        setErrorMsg(data.error || 'Check-in failed')
        resetAfter4s()
        return
      }

      if (data.alreadyCheckedIn) {
        setState('already')
        setResult({
          displayName: data.displayName,
          ticketTier: data.ticketTier,
          checkedInAt: data.checkedInAt,
          attendeeIndex: data.attendeeIndex,
        })
        resetAfter4s()
        return
      }

      setState('success')
      setSessionCount(c => c + 1)
      setResult({
        displayName: data.displayName,
        ticketTier: data.ticketTier,
        attendeeIndex: data.attendeeIndex,
        attestationUID: data.attestationUID,
        walletAddress: data.walletAddress,
      })

      // Navigate to success/share screen after brief delay
      setTimeout(() => {
        if (data.attestationUID) {
          const params = new URLSearchParams({
            name: data.displayName || '',
            index: String(data.attendeeIndex || ''),
            tier: data.ticketTier || '',
            uid: data.attestationUID,
          })
          router.push(`/checkin/success?${params.toString()}`)
        }
        resetAfter4s()
      }, 1500)
    } catch {
      setState('error')
      setErrorMsg('Network error')
      resetAfter4s()
    }
  }, [router])

  const resetAfter4s = () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    resetTimerRef.current = setTimeout(() => {
      setState('idle')
      setResult({})
      setErrorMsg('')
      focusInput()
    }, 4000)
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const scanned = bufferRef.current
      bufferRef.current = ''
      if (scanned && state === 'idle') {
        processQR(scanned)
      }
    } else if (e.key.length === 1) {
      bufferRef.current += e.key
    }
  }, [state, processQR])

  const handleManualEntry = useCallback(() => {
    const raw = window.prompt('Enter QR value (walletAddress|ticketId):')
    if (raw && state === 'idle') processQR(raw)
  }, [state, processQR])

  const bg = BG[state]

  return (
    <div
      onClick={focusInput}
      style={{
        minHeight: '100vh',
        background: bg,
        transition: 'background 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'IBM Plex Sans', sans-serif",
        color: '#fff',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Hidden scanner input */}
      <input
        ref={inputRef}
        onKeyDown={handleKeyDown}
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1, top: 0, left: 0, pointerEvents: 'none' }}
        readOnly
        tabIndex={0}
      />

      {/* Header */}
      <div style={{ position: 'absolute', top: 24, left: 0, right: 0, textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)' }}>
        MY CITY OUR MUSIC · MAY 23, 2026
      </div>

      {/* Session counter */}
      <div style={{ position: 'absolute', top: 52, left: 0, right: 0, textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
        {sessionCount} checked in this session
      </div>

      {/* Main status */}
      <div style={{ textAlign: 'center', padding: '0 32px', maxWidth: '480px' }}>
        {state === 'idle' && (
          <>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📷</div>
            <div style={{ fontSize: '22px', fontWeight: 600 }}>Ready to scan</div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>Point QR scanner at ticket</div>
          </>
        )}

        {state === 'loading' && (
          <>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>⏳</div>
            <div style={{ fontSize: '22px', fontWeight: 600 }}>Verifying…</div>
          </>
        )}

        {state === 'success' && (
          <>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>✓</div>
            <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Welcome in</div>
            <div style={{ fontSize: '22px', fontWeight: 600, marginBottom: '4px' }}>{result.displayName}</div>
            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.75)', marginBottom: '8px' }}>{result.ticketTier}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '18px', fontWeight: 700, color: '#7DFFB3', marginBottom: '8px' }}>
              Attendee #{result.attendeeIndex}
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
              Attested onchain ✓
            </div>
          </>
        )}

        {state === 'already' && (
          <>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
            <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Already checked in</div>
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>{result.displayName}</div>
            {result.checkedInAt && (
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                First scan: {new Date(result.checkedInAt).toLocaleTimeString()}
              </div>
            )}
          </>
        )}

        {state === 'error' && (
          <>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✗</div>
            <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Not valid</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
              {errorMsg}
            </div>
          </>
        )}
      </div>

      {/* Manual entry button */}
      <button
        onClick={handleManualEntry}
        style={{
          position: 'absolute', bottom: 24, right: 24,
          background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
          padding: '8px 16px', fontSize: '12px', cursor: 'pointer',
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        Manual Entry
      </button>
    </div>
  )
}
