import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ethers } from 'ethers'

export const runtime = 'nodejs'

const MERCHANT_RESOLVER_ABI = [
  'function registerMerchant(bytes32 merchantId, address wallet) external',
]

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (!adminKey || adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { merchantId?: string; merchantName?: string; walletAddress?: string; coalitionId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { merchantId, merchantName, walletAddress, coalitionId } = body
  if (!merchantId || !merchantName || !walletAddress || !coalitionId) {
    return NextResponse.json({ error: 'Missing required fields: merchantId, merchantName, walletAddress, coalitionId' }, { status: 400 })
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  // Generate secret — shown once, never stored in plain text
  const rawSecret = ethers.hexlify(ethers.randomBytes(32))
  const secretHash = ethers.keccak256(ethers.toUtf8Bytes(rawSecret))

  // Deterministic bytes32 from merchantId string
  const merchantIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(merchantId))

  let registrationTx: string | null = null

  // Register on-chain if resolver address is configured
  const resolverAddress = process.env.MERCHANT_RESOLVER_ADDRESS
  if (resolverAddress) {
    try {
      const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL || 'https://mainnet.base.org')
      const signer = new ethers.Wallet(process.env.ATTESTATION_SIGNER_PRIVATE_KEY!, provider)
      const contract = new ethers.Contract(resolverAddress, MERCHANT_RESOLVER_ABI, signer)
      const tx = await contract.registerMerchant(merchantIdBytes32, walletAddress)
      const receipt = await tx.wait()
      registrationTx = receipt.hash
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[merchant/register] on-chain registration failed:', msg)
      // Continue — DB record still created, operator can retry on-chain later
    }
  }

  const supabase = getSupabase()
  const { error: insertError } = await supabase.from('merchants').insert({
    merchant_id: merchantId,
    merchant_name: merchantName,
    wallet_address: walletAddress,
    coalition_id: coalitionId,
    secret_hash: secretHash,
    registration_tx: registrationTx,
    is_active: true,
  })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    merchantId,
    walletAddress,
    registrationTx,
    tabletSecret: rawSecret,
  })
}
