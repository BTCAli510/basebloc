import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ethers } from 'ethers'

export const runtime = 'nodejs'

const MERCHANT_RESOLVER_ABI = [
  'function confirmService(bytes32 attestationUID, bytes32 merchantId) external',
]

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function emitBlocPartiPoints(
  supabase: ReturnType<typeof getSupabase>,
  walletAddress: string,
  pointsAwarded: number,
  attestationUID: string,
  source: string
) {
  await supabase.from('bloc_parti_points').insert({
    wallet_address: walletAddress,
    points_awarded: pointsAwarded,
    source,
    attestation_uid: attestationUID,
  })
}

export async function POST(req: NextRequest) {
  let body: { attestationUID?: string; merchantId?: string; merchantSecret?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { attestationUID, merchantId, merchantSecret } = body
  if (!attestationUID || !merchantId || !merchantSecret) {
    return NextResponse.json({ error: 'Missing attestationUID, merchantId, or merchantSecret' }, { status: 400 })
  }

  const supabase = getSupabase()

  // Validate merchant secret
  const secretHash = ethers.keccak256(ethers.toUtf8Bytes(merchantSecret))
  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('id, is_active, wallet_address')
    .eq('merchant_id', merchantId)
    .eq('secret_hash', secretHash)
    .single()

  if (merchantError || !merchant) {
    return NextResponse.json({ error: 'Invalid merchant credentials' }, { status: 401 })
  }

  if (!merchant.is_active) {
    return NextResponse.json({ error: 'Merchant account is inactive' }, { status: 403 })
  }

  // Look up attestation
  const { data: attestation, error: attestationError } = await supabase
    .from('merchant_attestations')
    .select('id, merchant_id, customer_wallet, points_pending, merchant_confirmed, confirmed_at')
    .eq('attestation_uid', attestationUID)
    .single()

  if (attestationError || !attestation) {
    return NextResponse.json({ error: 'Attestation not found' }, { status: 404 })
  }

  if (attestation.merchant_id !== merchantId) {
    return NextResponse.json({ error: 'Attestation does not belong to this merchant' }, { status: 403 })
  }

  // Idempotency
  if (attestation.merchant_confirmed) {
    return NextResponse.json({
      success: true,
      idempotent: true,
      attestationUID,
      confirmedAt: attestation.confirmed_at,
    })
  }

  // Call on-chain confirmService if resolver is configured
  let txHash: string | null = null
  const resolverAddress = process.env.MERCHANT_RESOLVER_ADDRESS
  if (resolverAddress) {
    try {
      const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL || 'https://mainnet.base.org')
      const signer = new ethers.Wallet(process.env.ATTESTATION_SIGNER_PRIVATE_KEY!, provider)
      const contract = new ethers.Contract(resolverAddress, MERCHANT_RESOLVER_ABI, signer)

      const attestationBytes32 = attestationUID.startsWith('0x')
        ? attestationUID
        : `0x${attestationUID}`
      const merchantIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(merchantId))

      const tx = await contract.confirmService(attestationBytes32, merchantIdBytes32)
      const receipt = await tx.wait()
      txHash = receipt.hash
    } catch (err) {
      console.error('[confirm-service] on-chain call failed:', err instanceof Error ? err.message : err)
      // Continue — DB update still proceeds
    }
  }

  const confirmedAt = new Date().toISOString()
  const { error: updateError } = await supabase
    .from('merchant_attestations')
    .update({
      merchant_confirmed: true,
      confirmed_at: confirmedAt,
      confirm_tx_hash: txHash,
    })
    .eq('attestation_uid', attestationUID)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const pointsAwarded = attestation.points_pending ?? 0
  if (pointsAwarded > 0) {
    await emitBlocPartiPoints(supabase, attestation.customer_wallet, pointsAwarded, attestationUID, `merchant:${merchantId}`)
  }

  return NextResponse.json({
    success: true,
    attestationUID,
    txHash,
    pointsAwarded,
  })
}
