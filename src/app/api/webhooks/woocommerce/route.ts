// app/api/webhooks/woocommerce/route.ts

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

const STATUS_MAP: Record<string, string> = {
  completed:  'shipped',
  cancelled:  'cancelled',
  processing: 'confirmed',
  refunded:   'cancelled',
}

export async function POST(req: NextRequest) {
  const body            = await req.json()
  const externalOrderId = body?.id?.toString()
  const wooStatus       = body?.status as string
  const newStatus       = STATUS_MAP[wooStatus]

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