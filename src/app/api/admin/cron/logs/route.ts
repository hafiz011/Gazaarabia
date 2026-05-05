// app/api/admin/cron/logs/route.ts

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { checkAuth } from "@/lib/authToken";

export async function GET(req: NextRequest) {

    const userId = await checkAuth(req);
    if (!userId) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const me = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (me?.role?.name?.toLowerCase() !== "admin") {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '10')

    const [logs, total] = await Promise.all([
        prisma.cronLog.findMany({
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.cronLog.count(),
    ])

    return NextResponse.json({ logs, total, page, limit })
}