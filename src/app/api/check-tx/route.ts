import { getServer } from '@/lib/stellar';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const hash = url.searchParams.get('hash');

  if (!hash) {
    return NextResponse.json({ error: 'Missing transaction hash parameter' }, { status: 400 });
  }

  try {
    const server = getServer();
    const tx = await server.transactions().transaction(hash).call();
    
    return NextResponse.json({ 
      status: 'success', 
      successful: tx.successful,
      createdAt: tx.created_at,
      feeCharged: tx.fee_charged,
    });
  } catch (error: unknown) {
    // If the horizon server returns 404, it means the transaction constitutes pending status
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: unknown }).response === 'object' &&
      (error as { response?: { status?: unknown } }).response !== null &&
      (error as { response?: { status?: unknown } }).response?.status === 404
    ) {
      return NextResponse.json({ status: 'pending', successful: false });
    }
    
    return NextResponse.json({ error: 'Failed to verify transaction' }, { status: 500 });
  }
}
