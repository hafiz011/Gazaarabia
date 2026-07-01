import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma: any = new PrismaClient();

// GET — list all ambassador invoices
export async function GET(req: NextRequest) {
    try {
        const token: any = getTokenFromHeader(req);
        const userId = getUserIdFromToken(token);

        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: { role: true }
        });

        if (!user || user.role.name.toLowerCase() !== "admin")
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        const invoices = await prisma.ambassadorInvoice.findMany({
            include: {
                ambassador: {
                    select: {
                        user: { select: { name: true, email: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ data: invoices });
    } catch (err) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

// POST — mark ambassador invoice paid
export async function POST(req: NextRequest) {
    try {
        const { invoiceId, paymentMethod, paymentRef } = await req.json();

        const token: any = getTokenFromHeader(req);
        const userId = getUserIdFromToken(token);

        if (!userId)
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // Only admins may mark invoices as paid (matches the GET handler above)
        const adminUser = await prisma.users.findUnique({
            where: { id: userId },
            include: { role: true }
        });

        if (!adminUser || adminUser.role.name.toLowerCase() !== "admin")
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        const invoice = await prisma.ambassadorInvoice.findUnique({
            where: { id: invoiceId }
        });

        if (!invoice)
            return NextResponse.json({ message: "Invoice not found" }, { status: 404 });

        // Parse month/year
        const [monthName, yearStr] = invoice.monthLabel.split(" ");
        const year = Number(yearStr);
        const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();

        await prisma.ambassadorInvoice.update({
            where: { id: invoiceId },
            data: {
                isPaid: true,
                paymentMethod,
                paymentRef,
                paidAt: new Date()
            }
        });

        // Mark items paid
        await prisma.orderItem.updateMany({
            where: {
                ambassadorId: invoice.ambassadorId,
                ambassadorPaid: false,
                createdAt: {
                    gte: new Date(year, monthIndex, 1),
                    lt: new Date(year, monthIndex + 1, 1)
                }
            },
            data: { ambassadorPaid: true }
        });

        return NextResponse.json({
            success: true,
            message: "Ambassador invoice marked as paid"
        });
    } catch (err) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
