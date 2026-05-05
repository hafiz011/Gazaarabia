// app/api/seller/store/status/route.ts

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

export async function GET(req: NextRequest) {
  const token: any = getTokenFromHeader(req);
  const userId = getUserIdFromToken(token);

  if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { role: true },
  });

  if (!user || user.role?.name.toLowerCase() !== "seller") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const seller = await prisma.seller.findUnique({
    where: { userId: user.id },
    select: {
      storeType: true,
      shopifyDomain: true,
      shopifyAccessToken: true,
      wooSiteUrl: true,
      wooConsumerKey: true,
      wooConsumerSecret: true,
      lastSyncedAt: true,
    }
  })

  if (!seller) {
    return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
  }

  return NextResponse.json(seller)
}
