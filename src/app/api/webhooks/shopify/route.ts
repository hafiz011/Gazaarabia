// app/api/webhooks/shopify/route.ts

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

const STATUS_MAP: Record<string, string> = {
  'orders/fulfilled': 'shipped',
  'orders/cancelled': 'cancelled',
  'orders/paid':      'confirmed',
}

export async function POST(req: NextRequest) {
  const body            = await req.json()
  const topic           = req.headers.get('x-shopify-topic') ?? ''
  const externalOrderId = body?.id?.toString()
  const newStatus       = STATUS_MAP[topic]

  if (newStatus && externalOrderId) {
    const orderItems = await prisma.orderItem.findMany({
      where: { externalOrderId },
    })

    for (const item of orderItems) {
      await prisma.orders.update({
        where: { id: item.orderId },
        data:  { status: newStatus },
      })
    }
  }

  return NextResponse.json({ received: true })
}