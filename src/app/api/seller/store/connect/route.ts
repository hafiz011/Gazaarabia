// app/api/seller/store/connect/route.ts

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import type { StoreType } from '@/types/store'

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
  const body: ConnectBody = await req.json()
  const { sellerId, storeType, credentials } = body

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