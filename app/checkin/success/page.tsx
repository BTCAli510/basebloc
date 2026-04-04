import { Suspense } from 'react'
import SuccessContent from './SuccessContent'

export default function CheckinSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        Loading…
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
