// app/api/seller/store/sync/route.ts

import { syncSellerProducts } from '@/lib/syncEngine'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { sellerId }: { sellerId: number } = await req.json()

  const result = await syncSellerProducts(sellerId, 'manual')

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json(result)
}