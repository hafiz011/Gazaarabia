// lib/syncEngine.ts

import { prisma } from '@/lib/prisma'
import { fetchExternalProducts } from '@/lib/storeHelper'

interface SyncResult {
  success: boolean
  imported: number
  skipped: number
  error?: string
}

export async function syncSellerProducts(
  sellerId: number,
  syncType: 'manual' | 'auto' = 'manual'
): Promise<SyncResult> {
  const seller = await prisma.seller.findUnique({ where: { id: sellerId } })

  if (!seller?.storeType) throw new Error('No store connected')

  const syncLog = await prisma.storeSync.create({
    data: { sellerId, status: 'running', syncType, imported: 0, skipped: 0 },
  })

  let imported = 0
  let skipped = 0

  try {
    const products = await fetchExternalProducts(seller)

    for (const p of products) {
      try {
        const saved = await prisma.products.upsert({
          where: { externalProductId: p.externalProductId },
          update: {
            title: p.title,
            description: p.description,
            sellingPrice: p.sellingPrice,
            costPrice: p.costPrice,
            baseQty: p.baseQty,
            updatedAt: new Date(),
          },
          create: {
            sellerId: seller.id,
            title: p.title,
            slug: p.slug,
            description: p.description,
            sellingPrice: p.sellingPrice,
            costPrice: p.costPrice,
            baseQty: p.baseQty,
            externalProductId: p.externalProductId,
            externalVariantId: p.externalVariantId,
            externalSource: p.externalSource,
            isExternalProduct: true,
            commissionValue: seller.commissionValue,
            active: true,
          },
        })

        // Image save
        if (p.image) {
          const existing = await prisma.productimage.findFirst({
            where: { productId: saved.id, primary: true },
          })
          if (!existing) {
            await prisma.productimage.create({
              data: {
                url: p.image,
                alt: p.title,
                primary: true,
                productId: saved.id,
              },
            })
          }
        }

        imported++
      } catch (err) {
        console.error(`Skipped: ${p.title}`, (err as Error).message)
        skipped++
      }
    }

    await prisma.storeSync.update({
      where: { id: syncLog.id },
      data: { status: 'success', imported, skipped },
    })

    await prisma.seller.update({
      where: { id: sellerId },
      data: { lastSyncedAt: new Date() },
    })

    return { success: true, imported, skipped }
  } catch (err) {
    const message = (err as Error).message
    await prisma.storeSync.update({
      where: { id: syncLog.id },
      data: { status: 'failed', error: message },
    })
    return { success: false, imported, skipped, error: message }
  }
}