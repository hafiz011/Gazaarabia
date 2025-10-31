import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//  Configure the transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Generic sendEmail function
 */
export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    try {
        await transporter.sendMail({
            from: `"Gazaarabia" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        return { success: true };
    } catch (error) {
        console.error("Email send error:", error);
        return { success: false };
    }
}

/**
 *  Send Order Confirmation Email (Reusable for guest + logged-in users)
 * Also automatically logs into the notifications table
 */
export async function sendOrderConfirmationEmail(
    to: string,
    details: {
        name: string;
        orderId: number;
        total: number;
        address: string;
        userId?: number;
    }
) {
    const domain = process.env.DOMAIN;
    const subject = "Your Gazaarabia Order Confirmation";

    //  Build email HTML
    const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
      <h2>Hi ${details.name || "there"},</h2>
      <p>Thank you for your order! 🎉</p>
      <p>Your order <strong>#${details.orderId}</strong> has been successfully placed.</p>
      <h3>Order Summary</h3>
      <p><strong>Total:</strong> £${details.total.toFixed(2)}</p>
      <p><strong>Delivery Address:</strong><br>${details.address}</p>
      <a href="${domain}/orders/${details.orderId}" 
         style="display:inline-block;margin-top:10px;padding:10px 16px;background:#000;color:#fff;text-decoration:none;border-radius:6px;">
        View Your Order
      </a>
      <p style="margin-top:16px;">Thank you for shopping with us!<br>The Gazaarabia Team</p>
    </div>
  `;

    // Send the email
    const emailResult = await sendEmail({
        to,
        subject,
        html,
    });

    //  Save notification record
    try {
        await prisma.notifications.create({
            data: {
                userId: details.userId || null,
                email: to,
                subject,
                message: `Order #${details.orderId} confirmation email ${emailResult.success ? "sent successfully" : "failed to send"
                    }.`,
                type: "email",
                status: emailResult.success ? "sent" : "failed",
            },
        });
    } catch (error) {
        console.error("Notification log error:", error);
    }

    return emailResult;
}
