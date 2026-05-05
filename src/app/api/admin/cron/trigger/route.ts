
import { prisma } from '@/lib/prisma';
import { checkAuth } from "@/lib/authToken";
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
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

    const baseUrl = process.env.DOMAIN
    const secret = process.env.CRON_SECRET

    const res = await fetch(`${baseUrl}/api/cron/sync-all`, {
        headers: { Authorization: `Bearer ${secret}` },
    })

    const data = await res.json()
    return NextResponse.json(data)
}