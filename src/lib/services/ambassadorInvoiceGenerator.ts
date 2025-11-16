import { PrismaClient } from "@prisma/client";
import { generateAmbassadorInvoicePDF } from "@/lib/utils/generateAmbassadorInvoice";

const prisma: any = new PrismaClient();

export async function generateMonthlyAmbassadorInvoices() {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const monthLabel = now.toLocaleString("default", { month: "long", year: "numeric" });

    // find ambassadors
    const ambassadors = await prisma.affiliate.findMany({
        where: { isActive: true, type: "ambassador" },
        select: { id: true, user: { select: { name: true, email: true } } },
    });

    for (const ambassador of ambassadors) {

        // skip existing invoice
        const existing = await prisma.ambassadorInvoice.findFirst({
            where: { ambassadorId: ambassador.id, monthLabel },
        });

        if (existing) continue;

        // fetch UNPAID ambassador items for this ambassador
        const items = await prisma.orderItem.findMany({
            where: {
                ambassadorId: ambassador.id,
                ambassadorPaid: false,
                createdAt: {
                    gte: new Date(year, month, 1),
                    lt: new Date(year, month + 1, 1),
                },
            },
            select: {
                id: true,
                orderId: true,
                quantity: true,
                createdAt: true,
                subtotal: true,
                ambassadorCommission: true,
                ambassadorEarning: true,
            },
        });

        if (items.length === 0) continue;

        // total commission
        const totalAmount = items.reduce(
            (sum: any, i: any) => sum + (i.ambassadorEarning ?? 0),
            0
        );

        const invoiceNumber = `AMB-${ambassador.id}-${year}${String(month + 1).padStart(2, "0")}`;

        // prepare data for PDF
        const invoiceData = {
            ambassadorName: ambassador.user.name,
            ambassadorEmail: ambassador.user.email,
            payoutAmount: totalAmount,
            payoutDate: monthLabel,
            invoiceNumber,
            orders: items.map((i: any) => ({
                itemId: i.id,                 // renamed for clarity
                orderId: i.orderId,           // correct now
                quantity: i.quantity,
                createdAt: i.createdAt,
                subtotal: i.subtotal,
                ambassadorCommission: i.ambassadorCommission,
                ambassadorEarning: i.ambassadorEarning,
            })),
        };

        // generate pdf
        const invoiceUrl = await generateAmbassadorInvoicePDF(invoiceData);

        // save invoice
        await prisma.ambassadorInvoice.create({
            data: {
                ambassadorId: ambassador.id,
                invoiceNumber,
                invoiceUrl,
                monthLabel,
                totalAmount,
            },
        });
    }

    return { success: true, message: "Ambassador invoices generated successfully." };
}
