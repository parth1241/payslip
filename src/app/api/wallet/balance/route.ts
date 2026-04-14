import { NextRequest, NextResponse } from 'next/server'
import { Horizon, Keypair } from '@stellar/stellar-sdk'

const HORIZON_URL = process.env.NEXT_PUBLIC_STELLAR_HORIZON || 'https://horizon-testnet.stellar.org'
const server = new Horizon.Server(HORIZON_URL)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    Keypair.fromPublicKey(address)
  } catch {
    return NextResponse.json({ error: 'Invalid Stellar address' }, { status: 400 })
  }

  try {
    const account = await server.loadAccount(address)
    const nativeBalance = account.balances.find(b => b.asset_type === 'native')
    const balance = nativeBalance ? parseFloat(nativeBalance.balance) : 0

    return NextResponse.json({
      address,
      balance,
      funded: true
    })
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: unknown }).response === "object" &&
      (error as { response?: { status?: unknown } }).response !== null &&
      (error as { response?: { status?: unknown } }).response?.status === 404
    ) {
      return NextResponse.json({
        address,
        balance: 0,
        funded: false
      })
    }
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}
