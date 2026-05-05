// app/api/seller/store/connect/route.ts

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import type { StoreType } from '@/types/store'
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

interface ConnectBody {
  sellerId:    number
  storeType:   StoreType
  credentials: {
    domain?:         string
    accessToken?:    string
    siteUrl?:        string
    consumerKey?:    string
    consumerSecret?: string
  }
}

export async function POST(req: NextRequest) {
  const token: any = getTokenFromHeader(req);
  const userId = getUserIdFromToken(token);

  if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body: ConnectBody = await req.json()
  const { sellerId, storeType, credentials } = body

  // Verify that the sellerId belongs to the authenticated user
  const seller = await prisma.seller.findUnique({
    where: { id: sellerId }
  })

  if (!seller || seller.userId !== userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const updateData: Record<string, any> = { storeType }

  if (storeType === 'shopify') {
    updateData.shopifyDomain      = credentials.domain
    updateData.shopifyAccessToken = credentials.accessToken
  } else if (storeType === 'woocommerce') {
    updateData.wooSiteUrl         = credentials.siteUrl
    updateData.wooConsumerKey     = credentials.consumerKey
    updateData.wooConsumerSecret  = credentials.consumerSecret
  }

  await prisma.seller.update({
    where: { id: sellerId },
    data:  updateData,
  })

  return NextResponse.json({ success: true })
}