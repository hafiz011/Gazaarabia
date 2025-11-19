import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

interface InvoiceData {
  affiliateName: string;
  affiliateEmail: string;
  payoutAmount: number;
  deductionAmount?: number;
  paymentMethod: string;
  paymentRef: string;
  payoutDate: string;
  invoiceNumber: string;
  orders: {
    id: number;
    createdAt: Date;
    itemsTotal: number;
    couponCode?: string | null;
    coupon?: { discountType: string; discountValue: number } | null;
    couponDiscount: number | null;
    affiliateCommission: number | null;
    affiliateEarning: number | null;
  }[];
}

export async function generateAffiliateInvoicePDF(data: InvoiceData): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const {
        affiliateName,
        affiliateEmail,
        payoutAmount,
        deductionAmount,
        payoutDate,
        invoiceNumber,
        orders,
      } = data;

      const invoicesDir = path.join(process.cwd(), "uploads/invoices");
      if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

      const filePath = path.join(invoicesDir, `${invoiceNumber}.pdf`);

      const fontRegular = path.resolve("public/fonts/Roboto-Regular.ttf");
      const fontBold = path.resolve("public/fonts/Roboto-Bold.ttf");
      const logoPath = path.resolve("public/images/logo-dark.png");

      if (!fs.existsSync(fontRegular)) throw new Error("Missing Roboto-Regular.ttf");
      if (!fs.existsSync(fontBold)) throw new Error("Missing Roboto-Bold.ttf");

      /* =============== INIT (Roboto fix) ============== */
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

      /* =============== HEADER =============== */
      if (fs.existsSync(logoPath)) doc.image(logoPath, 40, 35, { width: 120 });

      doc.y = 70;

      doc.strokeColor("#D3D3D3")
        .lineWidth(2)
        .moveTo(40, doc.y)
        .lineTo(560, doc.y)
        .stroke();

      doc.strokeColor("#000").lineWidth(1);
      doc.y += 15;

      doc.font("Bold").fontSize(12).text("Affiliate Commission Invoice", 40);
      doc.font("Regular").fontSize(10).text(`Invoice Number: ${invoiceNumber}`, 40);
      doc.text(`Invoice Date: ${payoutDate}`, 40);

      /* =============== SOLD BY / AFFILIATE INFO =============== */

      const leftX = 40;
      const rightX = 300;
      const rightWidth = 260;

      doc.moveDown(1.4);

      const startY = doc.y;

      // Left column (Sold By)
      doc.font("Bold").fontSize(10).text("Sold By:", leftX, startY);
      doc.font("Regular").text("GAZAARABIA", leftX);
      doc.text("Online Store", leftX);
      doc.text("www.gazaarabia.com", leftX);
      doc.text("support@gazaarabia.com", leftX);

      // Right column (Affiliate)
      doc.font("Bold").fontSize(10).text("Affiliate:", rightX, startY, {
        width: rightWidth,
        align: "right",
      });

      doc.font("Regular").text(affiliateName, rightX, undefined, {
        width: rightWidth,
        align: "right",
      });

      doc.text(affiliateEmail, rightX, undefined, {
        width: rightWidth,
        align: "right",
      });

      doc.moveDown(3);

      // doc.font("Regular").fontSize(10);
      // doc.text(`Payout Period: ${payoutDate}`, leftX);
      // doc.text(`Invoice No: ${invoiceNumber}`, leftX);

      // doc.moveDown(1);

      /* =============== TABLE HEADER =============== */
      doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke();

      const hY = doc.y + 6;
      doc.font("Bold").fontSize(10);

      const headers = ["Order ID", "Date", "Amount", "Discount", "Coupon", "Rate%", "Earned"];
      const cols = [40, 120, 200, 280, 360, 440, 510];

      headers.forEach((h, i) => {
        doc.text(h, cols[i], hY, { align: "left" });
      });

      doc.moveTo(40, hY + 16).lineTo(560, hY + 16).stroke();

      /* =============== TABLE ROWS =============== */
      doc.font("Regular").fontSize(10);

      let y = hY + 24;

      orders.forEach(o => {
        const couponValue = o.coupon
          ? o.coupon.discountType === "percentage"
            ? `${o.coupon.discountValue}%`
            : `£${o.coupon.discountValue}`
          : "-";

        doc.text(String(o.id), cols[0], y);
        doc.text(o.createdAt.toISOString().split("T")[0], cols[1], y);
        doc.text(`£${o.itemsTotal.toFixed(2)}`, cols[2], y);
        doc.text(`£${(o.couponDiscount ?? 0).toFixed(2)}`, cols[3], y);
        doc.text(o.couponCode ?? "-", cols[4], y);
        doc.text(`${o.affiliateCommission}%`, cols[5], y);
        doc.text(`£${(o.affiliateEarning ?? 0).toFixed(2)}`, cols[6], y, { align: "right" });

        y += 18;
      });


      /* =============== TOTAL + DEDUCTION SECTION =============== */
      doc.moveDown(1.5);
      doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke();
      doc.moveDown(0.8);

      const earningsBeforeDeduction = payoutAmount + (deductionAmount || 0);

      // Earnings Before Deduction
      doc.font("Regular").fontSize(10).text(
        `Earnings This Period: £${earningsBeforeDeduction.toFixed(2)}`,
        400,
        doc.y,
        { width: 160, align: "right" }
      );
      doc.moveDown(0.6);

      // Only show deduction row if deductionAmount > 0
      if (deductionAmount && deductionAmount > 0) {
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


      /* =============== TOTAL SECTION =============== */
      // doc.moveDown(1.5);
      // doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke();
      // doc.moveDown(0.8);

      // doc.font("Bold").fontSize(11).text(
      //   `Total Affiliate Earnings: £${payoutAmount.toFixed(2)}`,
      //   400,
      //   doc.y,
      //   { width: 160, align: "right" }
      // );

      doc.moveDown(1.5);

      /* =============== DECLARATION =============== */
      doc.font("Bold").fontSize(10).text("DECLARATION:", 40);

      doc.font("Regular").fontSize(9).text(
        "This invoice confirms the affiliate commission earned during the specified period.",
        { width: 500, align: "left" }
      );

      doc.moveDown(1);

      doc.font("Regular").fontSize(9).text(
        "(This is a computer-generated invoice and does not require a physical signature.)",
        { width: 500, align: "center" }
      );

      /* =============== END =============== */
      doc.end();

      stream.on("finish", () => resolve(`/uploads/invoices/${invoiceNumber}.pdf`));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
}
