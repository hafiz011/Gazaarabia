import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export interface AmbassadorInvoiceData {
    ambassadorName: string;
    ambassadorEmail: string;
    payoutAmount: number;
    deductionAmount?: number;
    payoutDate: string;   // e.g. "November 2025"
    invoiceNumber: string;
    orders: {
        orderId: number;
        itemId: number;
        createdAt: Date;
        subtotal: number;
        quantity: number;
        ambassadorCommission: number | null;
        ambassadorEarning: number | null;
    }[];
}

export async function generateAmbassadorInvoicePDF(data: AmbassadorInvoiceData): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            const {
                ambassadorName,
                ambassadorEmail,
                payoutAmount,
                deductionAmount = 0,
                payoutDate,
                invoiceNumber,
                orders,
            } = data;

            // directories
            const folder = "ambassador-invoices";
            const invoicesDir = path.join(process.cwd(), "uploads", folder);
            if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

            const filePath = path.join(invoicesDir, `${invoiceNumber}.pdf`);

            // fonts & logo
            const fontRegular = path.resolve("public/fonts/Roboto-Regular.ttf");
            const fontBold = path.resolve("public/fonts/Roboto-Bold.ttf");
            const logoPath = path.resolve("public/images/logo-dark.png");

            if (!fs.existsSync(fontRegular)) throw new Error("Missing Roboto-Regular.ttf in /public/fonts");
            if (!fs.existsSync(fontBold)) throw new Error("Missing Roboto-Bold.ttf in /public/fonts");

            /* ============= INIT ============= */
            const doc = new PDFDocument({
                margin: 40,
                size: "A4",
                font: fontRegular,
            });

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            doc.registerFont("Regular", fontRegular);
            doc.registerFont("Bold", fontBold);
            doc.font("Regular");

            /* ============= HEADER ============= */
            if (fs.existsSync(logoPath)) doc.image(logoPath, 40, 35, { width: 120 });

            // position under logo
            doc.y = 70;

            // light grey rule
            doc.strokeColor("#D3D3D3").lineWidth(2).moveTo(40, doc.y).lineTo(560, doc.y).stroke();
            doc.strokeColor("#000").lineWidth(1);
            doc.y += 15;

            doc.font("Bold").fontSize(12).text("Ambassador Commission Invoice", 40);
            doc.font("Regular").fontSize(10).text(`Invoice Number: ${invoiceNumber}`, 40);
            doc.text(`Invoice Date: ${payoutDate}`, 40);

            /* ============= SOLD BY / AMBASSADOR (measured & spaced) ============= */
            const leftX = 40;
            const rightX = 300;
            const rightWidth = 260;

            doc.moveDown(1.4);
            const startY = doc.y;

            // Left column (Issued By / Sold By)
            let leftHeight = 0;
            {
                const ty = doc.y;
                doc.font("Bold").fontSize(10).text("Sold By:", leftX, ty);
                doc.font("Regular").fontSize(10).text("GAZAARABIA", leftX);
                doc.text("Online Store", leftX);
                doc.text("www.gazaarabia.com", leftX);
                doc.text("support@gazaarabia.com", leftX);
                leftHeight = doc.y - ty;
            }

            // Right column (Ambassador)
            let rightHeight = 0;
            {
                const ty = startY;
                doc.font("Bold").fontSize(10).text("Ambassador:", rightX, ty, { width: rightWidth, align: "right" });
                doc.font("Regular").fontSize(10).text(ambassadorName, rightX, undefined, { width: rightWidth, align: "right" });
                doc.text(ambassadorEmail, rightX, undefined, { width: rightWidth, align: "right" });
                rightHeight = doc.y - ty;
            }

            // Move Y below the taller column + extra spacing before payout rows
            doc.y = startY + Math.max(leftHeight, rightHeight) + 18;

            // Payout info block (left aligned)
            doc.font("Regular").fontSize(10);
            doc.text(`Payout Period: ${payoutDate}`, leftX);
            doc.text(`Invoice No: ${invoiceNumber}`, leftX);

            doc.moveDown(1);

            /* ============= TABLE HEADER ============= */
            doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke();

            const hY = doc.y + 6;
            doc.font("Bold").fontSize(10);

            const headers = ["Order ID", "Item ID", "Qty", "Date", "Amount", "Rate%", "Earned"];
            const cols = [40, 100, 160, 210, 300, 380, 450];

            // headers.forEach((h, i) => doc.text(h, cols[i], hY));

            headers.forEach((h, i) => {
                doc.text(h, cols[i], hY, {
                    align: i === 6 ? "right" : "left"   // right align only “Earned”
                });
            });


            doc.moveTo(40, hY + 16).lineTo(560, hY + 16).stroke();

            /* ============= TABLE ROWS ============= */
            doc.font("Regular").fontSize(10);

            let y = hY + 24;
            const rowHeight = 18;

            orders.forEach((o) => {
                const dateStr = o.createdAt.toISOString().split("T")[0];

                doc.text(String(o.orderId), cols[0], y);
                doc.text(String(o.itemId), cols[1], y);
                doc.text(String(o.quantity), cols[2], y);        // ✅ NEW
                doc.text(dateStr, cols[3], y);
                doc.text(`£${(o.subtotal ?? 0).toFixed(2)}`, cols[4], y);
                doc.text(`${o.ambassadorCommission ?? 0}%`, cols[5], y);
                doc.text(`£${(o.ambassadorEarning ?? 0).toFixed(2)}`, cols[6], y, { align: "right" });

                y += rowHeight;

                if (y > doc.page.height - 120) {
                    doc.addPage();
                    y = 60;
                }
            });


            /* =============== TOTAL + DEDUCTIONS SECTION =============== */
            doc.moveDown(2);
            doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke();
            doc.moveDown(1);

            const earningsBeforeDeduction = payoutAmount + deductionAmount;

            // Earnings before deduction
            doc.font("Regular").fontSize(10).text(
                `Earnings This Period: £${earningsBeforeDeduction.toFixed(2)}`,
                400,
                doc.y,
                { width: 160, align: "right" }
            );
            doc.moveDown(0.6);

            // Deduction amount
            if (deductionAmount > 0) {
                doc.font("Regular").fontSize(10).fillColor("red").text(
                    `Refund Deductions: -£${deductionAmount.toFixed(2)}`,
                    400,
                    doc.y,
                    { width: 160, align: "right" }
                );
                doc.fillColor("black");
                doc.moveDown(0.8);
            }

            // Final payout
            doc.font("Bold").fontSize(11).text(
                `Final Payout: £${payoutAmount.toFixed(2)}`,
                400,
                doc.y,
                { width: 160, align: "right" }
            );


            /* ============= TOTALS ============= */
            // move doc.y to current y if it's below
            // doc.y = Math.max(doc.y, y) + 8;
            // doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke();
            // doc.moveDown(0.8);

            // doc.font("Bold").fontSize(11).text(
            //     `Total Ambassador Earnings: £${payoutAmount.toFixed(2)}`,
            //     400,
            //     doc.y,
            //     { width: 160, align: "right" }
            // );

            doc.moveDown(1.5);

            /* ============= DECLARATION ============= */
            doc.font("Bold").fontSize(10).text("DECLARATION:", 40);
            doc.font("Regular").fontSize(9).text(
                "This invoice confirms the ambassador commission earned during the specified period. Keep this invoice for your records.",
                { width: 500, align: "left" }
            );

            doc.moveDown(1);
            doc.font("Regular").fontSize(9).text(
                "(This is a computer-generated invoice and does not require a physical signature.)",
                { width: 500, align: "center" }
            );

            /* ============= FINISH ============= */
            doc.end();

            stream.on("finish", () => resolve(`/uploads/${folder}/${invoiceNumber}.pdf`));
            stream.on("error", (e) => reject(e));
        } catch (err) {
            reject(err);
        }
    });
}
