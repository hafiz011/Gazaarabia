// app/api/cron/sync-all/route.ts (updated with logging)

import { prisma } from '@/lib/prisma'
import { syncSellerProducts } from '@/lib/syncEngine'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    // ─── Security Check ───────────────────────────────
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const startTime = Date.now()

    const sellers = await prisma.seller.findMany({
        where: {
            isActive: true,
            storeType: { not: null },
        },
        select: {
            id: true,
            shopName: true,
            storeType: true,
        },
    })

    if (sellers.length === 0) {
        await prisma.cronLog.create({
            data: {
                type: 'sync-all',
                status: 'success',
                totalSellers: 0,
                successful: 0,
                failed: 0,
                totalImported: 0,
                duration: Date.now() - startTime,
            },
        })
        return NextResponse.json({ message: 'No sellers to sync' })
    }

    const results = []
    let totalImported = 0

    for (const seller of sellers) {
        try {
            const result = await syncSellerProducts(seller.id, 'auto')
            totalImported += result.imported
            results.push({
                sellerId: seller.id,
                shopName: seller.shopName,
                storeType: seller.storeType,
                imported: result.imported,
                skipped: result.skipped,
                success: true,
            })
        } catch (err) {
            results.push({
                sellerId: seller.id,
                shopName: seller.shopName,
                storeType: seller.storeType,
                imported: 0,
                skipped: 0,
                success: false,
                error: (err as Error).message,
            })
        }
    }

    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length
    const duration = Date.now() - startTime

    // ─── Cron Log Save ────────────────────────────────
    await prisma.cronLog.create({
        data: {
            type: 'sync-all',
            status: failed === 0 ? 'success' : successful === 0 ? 'failed' : 'partial',
            totalSellers: sellers.length,
            successful,
            failed,
            totalImported,
            details: results,
            duration,
        },
    })

    return NextResponse.json({
        synced: sellers.length,
        successful,
        failed,
        totalImported,
        duration: `${duration}ms`,
        syncedAt: new Date().toISOString(),
        results,
    })
}