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

  // Shopify is connected via the dedicated OAuth Shopify app (GraphQL), not this
  // legacy paste-a-token form. WooCommerce still connects here.
  if (storeType === 'shopify') {
    return NextResponse.json(
      { message: "Shopify connects through the Gazaarabia Shopify app, not this form." },
      { status: 400 }
    )
  }

  const updateData: Record<string, any> = { storeType }

  if (storeType === 'woocommerce') {
    updateData.wooSiteUrl        = credentials.siteUrl?.replace(/\/+$/, '') // strip trailing slash
    updateData.wooConsumerKey    = credentials.consumerKey
    updateData.wooConsumerSecret = credentials.consumerSecret
  }

  await prisma.seller.update({
    where: { id: sellerId },
    data:  updateData,
  })

  return NextResponse.json({ success: true })
}