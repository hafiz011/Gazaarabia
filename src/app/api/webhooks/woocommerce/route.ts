// app/api/webhooks/woocommerce/route.ts

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const STATUS_MAP: Record<string, string> = {
  completed:  'shipped',
  cancelled:  'cancelled',
  processing: 'confirmed',
  refunded:   'cancelled',
}

export async function POST(req: NextRequest) {
  // The delivery URL carries ?sellerId=… so we know which store — and therefore
  // which secret — signed this request.
  const sellerId = Number(req.nextUrl.searchParams.get('sellerId'))
  if (!sellerId) {
    return NextResponse.json({ error: 'Missing sellerId' }, { status: 400 })
  }

  const seller = await prisma.seller.findUnique({
    where:  { id: sellerId },
    select: { id: true, wooConsumerSecret: true },
  })

  // The webhook's "Secret" in WooCommerce must be set to this store's Consumer
  // Secret, which is what we verify the HMAC against.
  if (!seller?.wooConsumerSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 403 })
  }

  // HMAC must be computed over the exact raw bytes, so read the body as text
  // before parsing it.
  const rawBody   = await req.text()
  const signature = req.headers.get('x-wc-webhook-signature') ?? ''
  const expected  = crypto
    .createHmac('sha256', seller.wooConsumerSecret)
    .update(rawBody, 'utf8')
    .digest('base64')

  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Signature is valid — safe to parse. (WooCommerce sends a signed non-order
  // ping when the webhook is first created; that just parses to a no-op below.)
  let body: any
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ received: true })
  }

  const externalOrderId = body?.id?.toString()
  const newStatus       = STATUS_MAP[body?.status as string]

  if (newStatus && externalOrderId) {
    // Update item-level status, scoped to THIS seller's items only, so other
    // sellers' items on the same marketplace order are left untouched.
    await prisma.orderItem.updateMany({
      where: { externalOrderId, sellerId: seller.id },
      data:  { fulfillmentStatus: newStatus },
    })
  }

  return NextResponse.json({ received: true })
}
