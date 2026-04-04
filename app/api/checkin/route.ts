import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import { ethers } from 'ethers'

export const runtime = 'nodejs'

const EAS_CONTRACT_ADDRESS = '0x4200000000000000000000000000000000000021'

// Schema #1275 fields: eventName, eventDate, coalition, attending, ticketTier, displayName, verified_attendance
const CHECKIN_SCHEMA = 'string eventName,uint64 eventDate,string coalition,bool attending,string ticketTier,string displayName,bool verified_attendance'

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const scannerToken = req.headers.get('x-scanner-token')
  if (!scannerToken || scannerToken !== process.env.SCANNER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { walletAddress?: string; ticketId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { walletAddress, ticketId } = body
  if (!walletAddress || !ticketId) {
    return NextResponse.json({ error: 'Missing walletAddress or ticketId' }, { status: 400 })
  }

  const supabase = getSupabase()

  // Look up ticket
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('id, wallet_address, event_name, event_date, ticket_tier, display_name, checked_in, checked_in_at, attestation_uid, attendee_index')
    .eq('id', ticketId)
    .eq('wallet_address', walletAddress)
    .single()

  if (ticketError || !ticket) {
    return NextResponse.json({ error: 'Ticket not found or wallet mismatch' }, { status: 404 })
  }

  // Idempotency — already checked in
  if (ticket.checked_in) {
    return NextResponse.json({
      success: true,
      alreadyCheckedIn: true,
      checkedInAt: ticket.checked_in_at,
      attendeeIndex: ticket.attendee_index,
      displayName: ticket.display_name,
      ticketTier: ticket.ticket_tier,
      walletAddress: ticket.wallet_address,
    })
  }

  // Get next attendee index
  const { count } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('event_name', ticket.event_name)
    .eq('checked_in', true)

  const attendeeIndex = (count ?? 0) + 1

  // Write EAS attestation
  let attestationUID: string | null = null
  const schemaUID = process.env.SCHEMA_1275_UID
  if (schemaUID && process.env.ATTESTATION_SIGNER_PRIVATE_KEY) {
    try {
      const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL || 'https://mainnet.base.org')
      const signer = new ethers.Wallet(process.env.ATTESTATION_SIGNER_PRIVATE_KEY, provider)

      const eas = new EAS(EAS_CONTRACT_ADDRESS)
      eas.connect(signer as unknown as Parameters<typeof eas.connect>[0])

      const encoder = new SchemaEncoder(CHECKIN_SCHEMA)
      const encodedData = encoder.encodeData([
        { name: 'eventName', value: ticket.event_name, type: 'string' },
        { name: 'eventDate', value: BigInt(ticket.event_date), type: 'uint64' },
        { name: 'coalition', value: 'base-oakland-bloc', type: 'string' },
        { name: 'attending', value: true, type: 'bool' },
        { name: 'ticketTier', value: ticket.ticket_tier, type: 'string' },
        { name: 'displayName', value: ticket.display_name, type: 'string' },
        { name: 'verified_attendance', value: true, type: 'bool' },
      ])

      const tx = await eas.attest({
        schema: schemaUID,
        data: {
          recipient: walletAddress,
          expirationTime: BigInt(0),
          revocable: false,
          data: encodedData,
        },
      })

      attestationUID = await tx.wait()
    } catch (err) {
      console.error('[checkin] EAS attestation failed:', err instanceof Error ? err.message : err)
      // Continue — still mark as checked in even if attestation fails
    }
  }

  const checkedInAt = new Date().toISOString()
  const { error: updateError } = await supabase
    .from('tickets')
    .update({
      checked_in: true,
      checked_in_at: checkedInAt,
      attestation_uid: attestationUID,
      attendee_index: attendeeIndex,
    })
    .eq('id', ticketId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    attestationUID,
    attendeeIndex,
    displayName: ticket.display_name,
    ticketTier: ticket.ticket_tier,
    walletAddress: ticket.wallet_address,
  })
}
