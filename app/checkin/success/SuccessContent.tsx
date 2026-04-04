'use client'
import { useSearchParams } from 'next/navigation'

export default function SuccessContent() {
  const params = useSearchParams()
  const name = params.get('name') || 'Attendee'
  const index = params.get('index') || '?'
  const tier = params.get('tier') || ''
  const uid = params.get('uid') || ''

  const easLink = uid ? `https://base.easscan.org/attestation/view/${uid}` : null

  const tweetText = `I'm attendee #${index} at MY CITY OUR MUSIC — onchain. Power to the People. Onchain. 🔵🟠${easLink ? ` ${easLink}` : ''}`
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
  const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(tweetText)}`

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'IBM Plex Sans', sans-serif",
      color: '#fff',
      padding: '32px 24px',
      textAlign: 'center',
    }}>
      {/* Orbit ring */}
      <div style={{
        width: '96px',
        height: '96px',
        borderRadius: '50%',
        border: '3px solid #0052FF',
        boxShadow: '0 0 24px rgba(0,82,255,0.4), 0 0 48px rgba(0,82,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '36px',
        marginBottom: '32px',
      }}>
        ✓
      </div>

      {/* Index + tier badge */}
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '13px',
        letterSpacing: '0.12em',
        color: '#0052FF',
        marginBottom: '12px',
      }}>
        ATTENDEE #{index} · {tier.toUpperCase()}
      </div>

      {/* Headline */}
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px', lineHeight: 1.2 }}>
        You&apos;re in, {name}.
      </h1>

      {/* Body copy */}
      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', maxWidth: '360px', lineHeight: 1.6, marginBottom: '40px' }}>
        Your attendance is verified onchain. This is your receipt — permanent, portable, yours.
      </p>

      {/* Share buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px', marginBottom: '24px' }}>
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#0A0A0A',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '10px',
            padding: '14px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'block',
          }}
        >
          Share on X
        </a>
        <a
          href={warpcastUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#7C3AED',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '14px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'block',
          }}
        >
          Share on Farcaster
        </a>
      </div>

      {/* EAS link */}
      {easLink && (
        <a
          href={easLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            color: 'rgba(255,255,255,0.4)',
            textDecoration: 'none',
            marginBottom: '48px',
          }}
        >
          View attestation on EAS ↗
        </a>
      )}

      {/* Footer */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '11px',
        letterSpacing: '0.08em',
        color: '#333',
      }}>
        Power to the People. Onchain.
      </div>
    </div>
  )
}
