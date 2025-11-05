import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

interface InvoiceData {
  affiliateName: string;
  affiliateEmail: string;
  payoutAmount: number;
  paymentMethod: string;
  paymentRef: string;
  payoutDate: string;
  invoiceNumber: string;
}

export async function generateAffiliateInvoicePDF(data: InvoiceData): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const { affiliateName, affiliateEmail, payoutAmount, paymentMethod, paymentRef, payoutDate, invoiceNumber } = data;

      const invoicesDir = path.join(process.cwd(), "public", "invoices");
      if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

      const filePath = path.join(invoicesDir, `${invoiceNumber}.pdf`);

      // Load custom font FIRST
      const fontPath = path.join(process.cwd(), "public", "fonts", "Roboto-Regular.ttf");

      // Force default font at document creation → fixes Helvetica.afm error permanently
      const doc = new PDFDocument({
        margin: 40,
        font: fontPath
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      //  Ensure PDFKit uses Roboto going forward
      doc.font(fontPath);

      // ===== HEADER =====
      doc.fontSize(22).text("Gaza Arabia", { align: "center" });
      doc.fontSize(14).text("Affiliate Payout Invoice", { align: "center" });
      doc.moveDown(1.5);

      // Invoice metadata
      doc.fontSize(12).text(`Invoice Number: ${invoiceNumber}`);
      doc.text(`Date: ${payoutDate}`);
      doc.moveDown(1);

      // Affiliate details
      doc.text(`Affiliate Name: ${affiliateName}`);
      doc.text(`Email: ${affiliateEmail}`);
      doc.moveDown(1);

      // Payment Details
      doc.fontSize(14).text("Payment Details", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Payout Amount: £${payoutAmount.toFixed(2)}`);
      doc.text(`Payment Method: ${paymentMethod}`);
      doc.text(`Transaction Reference: ${paymentRef}`);
      doc.moveDown(2);

      // Footer
      doc.fontSize(10).fillColor("gray").text(
        "This invoice was generated automatically and does not require a signature.",
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
