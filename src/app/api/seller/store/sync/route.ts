// app/api/seller/store/sync/route.ts

import { prisma } from '@/lib/prisma'
import { syncSellerProducts } from '@/lib/syncEngine'
import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

export async function POST(req: NextRequest) {
  const token: any = getTokenFromHeader(req);
  const userId = getUserIdFromToken(token);

  if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { sellerId }: { sellerId: number } = await req.json()

  // Verify that the sellerId belongs to the authenticated user
  const seller = await prisma.seller.findUnique({
    where: { id: sellerId }
  })

  if (!seller || seller.userId !== userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const result = await syncSellerProducts(sellerId, 'manual')

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json(result)
}