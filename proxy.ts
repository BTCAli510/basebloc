import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Soft gate: checks for privy-token cookie presence.
// Full wallet authorization is enforced client-side in /admin/login.
export async function proxy(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/admin')) return NextResponse.next()
  if (req.nextUrl.pathname === '/admin/login') return NextResponse.next()

  const token = req.cookies.get('privy-token')?.value
  if (!token) return NextResponse.redirect(new URL('/admin/login', req.url))

  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
