import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma: any = new PrismaClient();

// STORE INFO
const STORE_NAME = "GAZAARABIA";
const STORE_ADDRESS = "Online Store";
const STORE_LOCATION = "www.gazaarabia.com";
const SUPPORT_EMAIL = "support@gazaarabia.com";

export async function generateCustomerInvoice(orderId: number) {
    const fontRegular = path.resolve("public/fonts/Roboto-Regular.ttf");
    const fontBold = path.resolve("public/fonts/Roboto-Bold.ttf");

    if (!fs.existsSync(fontRegular)) throw new Error("Missing Roboto-Regular.ttf");
    if (!fs.existsSync(fontBold)) throw new Error("Missing Roboto-Bold.ttf");

    const order = await prisma.orders.findUnique({
        where: { id: orderId },
        include: {
            orderItems: {
                include: {
                    product: true,
                    variant: {
                        include: {
                            color: true,
                            size: true
                        }
                    }
                }
            },
            user: true
        }
    });

    if (!order) return null;

    const invoiceNumber = `INV-${order.id.toString().padStart(6, "0")}`;

    const invoicesDir = path.join(process.cwd(), "uploads", "invoices");
    if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

    const filePath = path.join(invoicesDir, `${invoiceNumber}.pdf`);

    /* ================= PDF INIT (fixes Helvetica error) ================= */
    // --- PDF INIT (Helvetica Error Fixed) ---
    const doc = new PDFDocument({
        margin: 40,
        size: "A4",
        font: fontRegular // Force Roboto as default to avoid Helvetica.afm lookup
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Register fonts BEFORE drawing text
    doc.registerFont("Regular", fontRegular);
    doc.registerFont("Bold", fontBold);
    doc.font("Regular");

    /* ================= HEADER ================= */
    const logoPath = path.resolve("public/images/logo-dark.png");
    if (fs.existsSync(logoPath)) doc.image(logoPath, 40, 35, { width: 120 });

    /* Move below the logo */
    doc.y = 70;

    /* style line */
    doc.strokeColor("#D3D3D3")      // Light grey
        .lineWidth(2)
        .moveTo(40, doc.y)
        .lineTo(560, doc.y)
        .stroke();

    /* Reset line style to black for the rest of the document */
    doc.strokeColor("#000000").lineWidth(1);

    /* Move down below line */
    doc.y += 15;

    /* Receipt Title + Info */
    doc.font("Bold").fontSize(12).text("Payment Receipt", 40);
    doc.font("Regular").fontSize(10).text(`Receipt Number: ${invoiceNumber}`, 40);
    doc.text(`Receipt Date: ${order.createdAt.toISOString().split("T")[0]}`, 40);


    /* ================= SOLD BY + BILL TO SIDE BY SIDE ================= */
    const leftX = 40;
    const rightX = 340;

    doc.moveDown(1.4);

    /* ================= SOLD BY + BILL TO SIDE BY SIDE (Clean Alignment) ================= */

    // doc.moveDown(1.5);

    const soldByY = doc.y; // Capture current Y so both columns align

    // Left Column (Sold By)
    doc.font("Bold").fontSize(10).text("Sold By:", 40, soldByY);
    doc.font("Regular").fontSize(10).text(STORE_NAME, 40);
    doc.text(STORE_ADDRESS, 40);
    doc.text(STORE_LOCATION, 40);
    doc.text(`Support: ${SUPPORT_EMAIL}`, 40);

    // Right Column (Bill To) — fully right-aligned block
    const rightColumnX = 300; // start of Bill To column
    const rightColumnWidth = 260; // width available for text wrapping

    doc.font("Bold").fontSize(10).text("Bill To:", rightColumnX, soldByY, {
        width: rightColumnWidth,
        align: "right"
    });

    doc.font("Regular").fontSize(10).text(`${order.firstName} ${order.lastName}`, rightColumnX, undefined, {
        width: rightColumnWidth,
        align: "right"
    });

    doc.text(order.address1, rightColumnX, undefined, {
        width: rightColumnWidth,
        align: "right"
    });

    doc.text(order.city, rightColumnX, undefined, {
        width: rightColumnWidth,
        align: "right"
    });

    doc.text(`${order.country} - ${order.postalCode}`, rightColumnX, undefined, {
        width: rightColumnWidth,
        align: "right"
    });

    if (order.phone) {
        doc.text(order.phone, rightColumnX, undefined, {
            width: rightColumnWidth,
            align: "right"
        });
    }


    // doc.moveDown(2);

    doc.moveDown(1.6);
    doc.font("Regular").fontSize(10);
    doc.text(`Order No: ORD-${order.id}`, leftX);
    doc.text(`Order Date: ${order.createdAt.toISOString().split("T")[0]}`, leftX);
    doc.text(`Invoice Date: ${order.createdAt.toISOString().split("T")[0]}`, leftX);

    doc.moveDown(1);

    /* ================= TABLE HEADER ================= */
    doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke();

    const headerY = doc.y + 6;
    doc.font("Bold").fontSize(10);
    doc.text("Description", 40, headerY, { width: 120 });
    doc.text("Color", 170, headerY, { width: 60 });
    doc.text("Size", 240, headerY, { width: 60 });
    doc.text("Net Amount", 300, headerY, { width: 80, align: "right" });
    doc.text("Qty", 390, headerY, { width: 40, align: "right" });

    doc.text("Total", 510, headerY, { width: 50, align: "right" });


    doc.moveTo(40, headerY + 16).lineTo(560, headerY + 16).stroke();

    /* ================= TABLE ROWS ================= */
    let y = headerY + 24;
    doc.font("Regular").fontSize(10);

    order.orderItems.forEach((item: any) => {
        const color = item.variant?.color?.name || "-";
        const size = item.variant?.size?.name || "-";
        // const discount = item.discount || item.product?.discount || 0;
        // const netAmount = item.price;
        // const discountedAmount = discount ? netAmount - (netAmount * discount / 100) : netAmount;
        // const total = discountedAmount * item.quantity;


        const netAmount = item.price;
        const total = netAmount * item.quantity;


        doc.text(item.product?.title ?? "Product", 40, y, { width: 120 });
        doc.text(color, 170, y, { width: 60 });
        doc.text(size, 240, y, { width: 60 });
        doc.text(`£${netAmount.toFixed(2)}`, 300, y, { width: 80, align: "right" });
        doc.text(String(item.quantity), 390, y, { width: 40, align: "right" });

        doc.text(`£${total.toFixed(2)}`, 510, y, { width: 50, align: "right" });

        y += 18;
    });

    /* ================= TOTAL SECTION (Myntra Style) ================= */

    doc.moveDown(1.5);
    doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke();
    doc.moveDown(0.8);




    // Discount amount (show only if discount > 0)
    // if (order.couponDiscount && order.couponDiscount > 0) {
    if (order.discountTotal && order.discountTotal > 0) {
        doc.moveDown(1);
        const discountText = `Discount Amount: - £${order.discountTotal.toFixed(2)}`;

        doc.font("Regular").fontSize(10).text(discountText, 400, doc.y, {
            width: 160,
            align: "right"
        });
    }

    // Charity Donation (NEW)
    if (Number(order?.charityAmount) > 0) {
        doc.moveDown(1);
        doc.font("Regular").fontSize(10).text(
            `Charity Donation: £${order.charityAmount.toFixed(2)}`,
            400,
            doc.y,
            { width: 160, align: "right" }
        );
    }


    // Total Amount (Right aligned)
    doc.moveDown(1);
    const amountText = `Total Amount:  £${order.totalAmount.toFixed(2)}`;

    // Position the text starting near the right side (no wrapping)
    doc.font("Bold").fontSize(11).text(amountText, 400, doc.y, {
        width: 160,
        align: "right"
    });

    doc.moveDown(1.5);

    // Payment Method
    doc.font("Bold").fontSize(10).text("Payment Method:", 40);
    doc.font("Regular").fontSize(10).text(order.paymentMethod, 40);
    doc.moveDown(2);

    /* ================= DECLARATION (CENTERED) ================= */
    doc.font("Bold").fontSize(10).text("DECLARATION:", 40);

    doc.font("Regular").fontSize(9)
        .text("This is an invoice for confirmation of the receipt of the amount paid for the service as described above. Keep this invoice for future warranty and verification purposes.", {
            width: 500,
            align: "left"
        });

    doc.moveDown(1);

    doc.font("Regular").fontSize(9)
        .text("(This is a computer generated invoice and does not require a physical signature.)", {
            width: 500,
            align: "center"
        });

    /* ================= FINISH PDF ================= */
    doc.end();
    await new Promise((resolve: any) => stream.on("finish", resolve));

    const invoiceUrl = `/uploads/invoices/${invoiceNumber}.pdf`;
    await prisma.orders.update({ where: { id: order.id }, data: { invoiceNumber, invoiceUrl } });

    return { invoiceNumber, invoiceUrl };
}
