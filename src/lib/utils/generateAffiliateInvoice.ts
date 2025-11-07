import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

interface InvoiceData {
  affiliateName: string;
  affiliateEmail: string;
  payoutAmount: number;
  paymentMethod: string;
  paymentRef: string;
  payoutDate: string;   // e.g. "November 2025"
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
        payoutDate,
        invoiceNumber,
        orders,
      } = data;

      const invoicesDir = path.join(process.cwd(), "public", "invoices");
      if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

      const filePath = path.join(invoicesDir, `${invoiceNumber}.pdf`);

      // Assets
      const fontPath = path.resolve("public/fonts/Roboto-Regular.ttf");

      const logoPrimary = path.resolve("public/images/logo-dark.png");
      const logoFallback = path.resolve("public/logo.png");
      const logoPath = fs.existsSync(logoPrimary) ? logoPrimary : logoFallback;

      if (!fs.existsSync(fontPath)) throw new Error("Missing font: /public/fonts/Roboto-Regular.ttf");

      // Brand palette (matches your email)
      const brandPrimary = "#E82C3F";   // Red underline/accent
      const brandSecondary = "#009639"; // Green total card
      const textDark = "#111827";
      const textMuted = "#6B7280";
      const borderGray = "#E5E7EB";
      const tableHeader = "#F3F4F6";
      const rowAlt = "#FAFAFA";

      // Create PDF with Roboto as the default font (prevents Helvetica fallback)
      const doc = new PDFDocument({ margin: 40, size: "A4", font: fontPath });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      doc.font(fontPath);

      /* ---------------- HEADER (match email) ---------------- */
      // Logo centered
      if (fs.existsSync(logoPath)) {
        const logoWidth = 130;
        const x = (doc.page.width - logoWidth) / 2;
        doc.image(logoPath, x, 44, { width: logoWidth });
      } else {
        doc
          .fontSize(22)
          .fillColor(textDark)
          .text("GAZAARABIA", { align: "center", baseline: "alphabetic" });
      }

      // Red underline under logo
      doc
        .moveDown(4)
        .moveTo(40, doc.y)
        .lineTo(560, doc.y)
        .strokeColor(brandPrimary)
        .lineWidth(2)
        .stroke();

      doc.moveDown(1.8);

      doc
        .fontSize(20)
        .fillColor(textDark)
        .text("Affiliate Commission Invoice", { align: "center" });

      doc
        .fontSize(12)
        .fillColor(textMuted)
        .text(payoutDate, { align: "center" });

      doc.moveDown(2);

      /* ---------------- INFO CARD ---------------- */
      const infoTop = doc.y;

      const infoHeight = 84;

      doc
        .roundedRect(40, infoTop, 520, infoHeight, 10)
        .strokeColor(borderGray)
        .lineWidth(1)
        .stroke();

      doc
        .fontSize(12)
        .fillColor(textDark)
        .text(`Invoice Number: ${invoiceNumber}`, 58, infoTop + 14);
      doc.text(`Affiliate Name: ${affiliateName}`, 58, infoTop + 34);
      doc.text(`Email: ${affiliateEmail}`, 58, infoTop + 54);

      // Tighten space before table
      const tableStartY = infoTop + infoHeight + 18;


      /* ---------------- TABLE HEADER ---------------- */

      const headers = ["Order", "Date", "Items", "Discount", "Coupon", "Value", "Rate %", "Earned"];
      const cols = [55, 120, 190, 255, 320, 385, 450, 510];


      doc
        .fillColor(tableHeader)
        .rect(40, tableStartY, 520, 26)
        .fill();

      doc.fillColor(textDark).fontSize(10);
      headers.forEach((h, i) => doc.text(h, cols[i], tableStartY + 7));

      /* ---------------- TABLE ROWS ---------------- */
      let y = tableStartY + 28;
      let alt = false;

      orders.forEach((o) => {
        const couponValue = o.coupon
          ? o.coupon.discountType === "percentage"
            ? `${o.coupon.discountValue}%`
            : `£${o.coupon.discountValue}`
          : "-";

        // Alternating strip (subtle)
        doc
          .fillColor(alt ? rowAlt : "white")
          .rect(40, y, 520, 22)
          .fill();
        alt = !alt;

        doc.fillColor(textDark).fontSize(10);
        doc.text(String(o.id), cols[0], y + 5);
        doc.text(o.createdAt.toISOString().split("T")[0], cols[1], y + 5);
        doc.text(`£${o.itemsTotal.toFixed(2)}`, cols[2], y + 5);
        doc.text(`£${(o.couponDiscount ?? 0).toFixed(2)}`, cols[3], y + 5);
        doc.text(o.couponCode ?? "-", cols[4], y + 5);
        doc.text(couponValue, cols[5], y + 5);
        doc.text(`${o.affiliateCommission}%`, cols[6], y + 5);
        doc.text(`£${(o.affiliateEarning ?? 0).toFixed(2)}`, cols[7], y + 5);

        y += 22;
      });

      /* ---------------- TOTAL SUMMARY (green card) ---------------- */
      // Reduced vertical gap; professional CTA-style block
      y += 24;
      const cardH = 72;
      doc
        .roundedRect(40, y, 520, cardH, 10)
        .fill(brandSecondary);

      doc
        .fillColor("white")
        .fontSize(14)
        .text("Total Commission Earned", 58, y + 18);
      doc
        .fontSize(26)
        .text(`£${payoutAmount.toFixed(2)}`, 58, y + 40);

      /* ---------------- FOOTER ---------------- */
      doc.moveDown(3);
      doc
        .fillColor(textMuted)
        .fontSize(9)
        .text(
          "This invoice is generated automatically and does not require a signature.",
          { align: "center" }
        );

      doc.end();
      stream.on("finish", () => resolve(`/invoices/${invoiceNumber}.pdf`));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
}
