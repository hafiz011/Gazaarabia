import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//  Configure the transporter — Zoho Mail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.zoho.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


const logoUrl =
  "https://drive.google.com/uc?export=view&id=12-EA3sW2FQVQU77-roeITSncjskWChiT";


// ========================= password changed email =========================

export async function sendPasswordChangedEmail({
  to,
  name,
  userId,
}: {
  to: string;
  name?: string | null;
  userId?: number | null;
}) {
  const subject = "Your Password Has Been Updated — Gazaarabia";
  const displayName = name || "there";

  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640"
      style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;">
          <img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;">
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:45px 50px;">

          <h2 style="margin:0 0 20px;font-size:22px;font-weight:600;color:#111827;">
            Your Password Has Been Changed
          </h2>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#374151;">
            Hi <strong>${displayName}</strong>,  
            this is a confirmation that your account password was successfully updated.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#374151;">
            If you made this change — you're all set.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:25px;color:#374151;">
            If you did <strong>not</strong> update your password, please reset it immediately or contact support.
          </p>

          <div style="text-align:center;margin:35px 0;">
            <a href="${process.env.DOMAIN}/forgot-password"
              style="display:inline-block;padding:12px 28px;background:#E82C3F;color:#ffffff;
              text-decoration:none;border-radius:8px;font-weight:500;font-size:15px;
              box-shadow:0 2px 6px rgba(0,0,0,0.12);letter-spacing:0.4px;">
              Reset Password Again
            </a>
          </div>

        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#111827;text-align:center;padding:28px 20px;">
          <p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">
            &copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br>
            <span style="color:#9ca3af;">Where Modesty Meets Luxury</span>
          </p>
          <div style="height:3px;width:60px;background:#E82C3F;margin:14px auto 0;border-radius:4px;"></div>
        </td>
      </tr>

    </table>
  </div>
  `;

  const emailResult = await sendEmail({ to, subject, html });

  // Log notification
  try {
    await prisma.notifications.create({
      data: {
        userId: userId || null,
        email: to,
        subject,
        message: `Password changed email sent to ${to} — ${emailResult.success ? "success" : "failed"}.`,
        type: "email",
        status: emailResult.success ? "sent" : "failed",
      },
    });
  } catch (error) {
    console.error("Notification log error:", error);
  }

  return emailResult;
}




// ========================= send forgot password link =========================
export async function sendForgotPasswordLinkEmail({
  to,
  name,
  resetLink,
  userId,
}: {
  to: string;
  name?: string | null;
  resetLink: string;
  userId?: number | null;
}) {
  const subject = "Reset Your Password — Gazaarabia";
  const displayName = name || "there";

  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640"
      style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;">
          <img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;">
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:45px 50px;">

          <h2 style="margin:0 0 20px;font-size:24px;font-weight:600;color:#111827;">
            Reset Your Password
          </h2>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#374151;">
            Hi <strong>${displayName}</strong>,  
            we received a request to reset your password.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:25px;color:#374151;">
            Click the button below to securely reset your password:
          </p>

          <div style="text-align:center;margin:35px 0;">
            <a href="${resetLink}"
              style="display:inline-block;padding:12px 28px;background:#E82C3F;color:#ffffff;
              text-decoration:none;border-radius:8px;font-weight:500;font-size:15px;
              box-shadow:0 2px 6px rgba(0,0,0,0.12);letter-spacing:0.4px;">
              Reset Password
            </a>
          </div>

          <p style="font-size:14px;line-height:1.7;margin-top:20px;color:#374151;">
            If the button does not work, copy and paste this link in your browser:
          </p>

          <p style="font-size:13px;color:#009639;word-break:break-all;margin:10px 0 25px;">
            ${resetLink}
          </p>

          <p style="font-size:14px;color:#6b7280;margin-top:15px;">
            If you did not request this, you can safely ignore this email.
          </p>

        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#111827;text-align:center;padding:28px 20px;">
          <p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">
            &copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br>
            <span style="color:#9ca3af;">Where Modesty Meets Luxury</span>
          </p>

          <div style="height:3px;width:60px;background:#E82C3F;margin:14px auto 0;border-radius:4px;"></div>
        </td>
      </tr>
    </table>
  </div>
  `;

  // ---- SEND EMAIL ---- //
  const emailResult = await sendEmail({
    to,
    subject,
    html,
  });

  // ---- LOG IN DATABASE ---- //
  try {
    await prisma.notifications.create({
      data: {
        userId: userId || null,
        email: to,
        subject,
        message: `Forgot password link email sent to ${to} — ${emailResult.success ? "success" : "failed"}.`,
        type: "email",
        status: emailResult.success ? "sent" : "failed",
      },
    });
  } catch (error) {
    console.error("Notification log error:", error);
  }

  return emailResult;
}





// =============== subscribe confiramtion email =================

export async function sendSubscribeConfirmationEmail({
  to,
  name,
}: {
  to: string;
  name?: string | null;
}) {
  const subject = "You're Subscribed! Welcome to Gazaarabia";
  const displayName = name || "there";

  // Reusable SVG icons
  const starIcon = `<svg width="16" height="16" fill="#E82C3F" style="vertical-align:middle;margin-right:6px;" viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>`;
  const fireIcon = `<svg width="16" height="16" fill="#E82C3F" style="vertical-align:middle;margin-right:6px;" viewBox="0 0 24 24"><path d="M12 2C10 4 8 7 8 9c0 4 3 7 4 7s4-3 4-7c0-2-2-5-4-7zm0 20c-4 0-8-4-8-9 0-3 2-6 3-7 1 4 4 6 5 6s4-2 5-6c1 1 3 4 3 7 0 5-4 9-8 9z"/></svg>`;
  const bagIcon = `<svg width="16" height="16" fill="#009639" style="vertical-align:middle;margin-right:6px;" viewBox="0 0 24 24"><path d="M6 2l1-2h10l1 2h4v4H2V2h4zm3 6a3 3 0 016 0h2a5 5 0 00-10 0h2zm-5 2h16l-1 12H5L4 10z"/></svg>`;
  const moonIcon = `<svg width="16" height="16" fill="#009639" style="vertical-align:middle;margin-right:6px;" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 0111.21 3a7 7 0 100 14A9 9 0 0121 12.79z"/></svg>`;
  const confettiIcon = `<svg width="18" height="18" fill="#009639" style="vertical-align:middle;margin-right:6px;" viewBox="0 0 24 24"><path d="M2 2l20 7-7 20L2 2zm4.5 6.5L6 5l3.5.5L6.5 8zm4 4L12 9l3.5.5L10.5 12z"/></svg>`;

  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640"
      style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <tr>
        <td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;">
          <img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;">
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:45px 50px;">
          <h2 style="margin:0 0 20px;font-size:24px;font-weight:600;color:#111827;">
            ${confettiIcon} Welcome to Gazaarabia!
          </h2>

          <p style="font-size:15px;line-height:1.8;margin-bottom:20px;color:#374151;">
            Hi <strong>${displayName}</strong>,  
            thank you for joining our exclusive community.
          </p>

          <p style="font-size:15px;line-height:1.8;margin-bottom:25px;color:#374151;">
            You're now first in line for:
          </p>

          <ul style="padding-left:5px;font-size:15px;color:#374151;line-height:1.9;list-style:none;">
            <li>${starIcon} New Product Launches</li>
            <li>${fireIcon} Exclusive Deals & Special Offers</li>
            <li>${bagIcon} Early Access to Collections</li>
            <li>${moonIcon} Modest Fashion Inspiration</li>
          </ul>

          <div style="text-align:center;margin:35px 0;">
            <a href="${process.env.DOMAIN}"
              style="display:inline-block;padding:12px 28px;background:#E82C3F;color:#ffffff;
              text-decoration:none;border-radius:8px;font-weight:500;font-size:15px;
              box-shadow:0 2px 6px rgba(0,0,0,0.12);letter-spacing:0.4px;">
              Visit Our Store
            </a>
          </div>

          <p style="font-size:14px;color:#6b7280;margin-top:15px;">
            If you ever wish to unsubscribe, simply reply to this email.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#111827;text-align:center;padding:28px 20px;">
          <p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">
            &copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br>
            <span style="color:#9ca3af;">Where Modesty Meets Luxury</span>
          </p>
          <div style="height:3px;width:60px;background:#E82C3F;margin:14px auto 0;border-radius:4px;"></div>
        </td>
      </tr>

    </table>
  </div>
  `;

  // Send email
  const emailResult = await sendEmail({ to, subject, html });

  // Log notification
  await prisma.notifications.create({
    data: {
      userId: null,
      email: to,
      subject,
      message: `Subscribe email to ${to} ${emailResult.success ? "sent successfully" : "failed to send"}.`,
      type: "email",
      status: emailResult.success ? "sent" : "failed",
    },
  });

  return emailResult;
}



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

export async function sendOrderShippedEmail({
  to,
  name,
  userId,
  trackingNumber,
}: {
  to: string;
  name?: string | null;
  userId?: number | null;
  trackingNumber?: string;
}) {
  const subject = "Your order is on its way 🎁";
  const displayName = name || "there";

  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640"
      style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

      <tr>
        <td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;">
          <img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;">
        </td>
      </tr>

      <tr>
        <td style="padding:45px 50px;">
          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            As-salamu alaykum,
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            Your GAZAARABIA order has been dispatched.
          </p>

          ${trackingNumber ? `
          <div style="margin:25px 0;padding:16px;border-left:4px solid #009639;background:#f0fdf4;">
            <p style="margin:0 0 8px 0;font-weight:600;color:#111827;">Tracking Number:</p>
            <p style="margin:0;font-size:16px;font-weight:700;color:#009639;letter-spacing:1px;">${trackingNumber}</p>
          </div>
          ` : ""}

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            Estimated arrival:
          </p>

          <ul style="font-size:15px;color:#374151;line-height:1.8;margin:0;padding-left:20px;">
            <li><strong>Standard UK:</strong> 3–5 working days</li>
            <li><strong>Express UK:</strong> 1–2 working days</li>
          </ul>

          <p style="font-size:15px;line-height:1.7;margin:20px 0;color:#111827;">
            Quick care guide while you wait:
          </p>

          <ul style="font-size:15px;color:#374151;line-height:1.8;margin:0;padding-left:20px;">
            <li>Nida and Zoom: machine wash 30°C, gentle cycle, hang in shade to dry</li>
            <li>Crepe and embroidered: hand wash or dry clean — check garment label</li>
            <li>White pieces: avoid direct sunlight when drying to prevent yellowing</li>
          </ul>

          <p style="font-size:15px;line-height:1.7;margin:20px 0 0;color:#111827;">
            Not arrived in time? Email info@gazaarabia.com with your order number.
          </p>

          <p style="font-size:15px;line-height:1.7;margin:20px 0;color:#111827;">
            The GAZAARABIA Team
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#111827;text-align:center;padding:28px 20px;">
          <p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">
            &copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br>
            <span style="color:#9ca3af;">Where Modesty Meets Luxury</span>
          </p>
          <div style="height:3px;width:60px;background:#E82C3F;margin:14px auto 0;border-radius:4px;"></div>
        </td>
      </tr>
    </table>
  </div>
  `;

  const emailResult = await sendEmail({ to, subject, html });

  try {
    await prisma.notifications.create({
      data: {
        userId: userId || null,
        email: to,
        subject,
        message: `Order shipped notification sent to ${to} — ${emailResult.success ? "success" : "failed"}.`,
        type: "email",
        status: emailResult.success ? "sent" : "failed",
      },
    });
  } catch (error) {
    console.error("Notification log error:", error);
  }

  return emailResult;
}

export async function sendOrderConfirmationEmail(
  to: string,
  details: {
    name: string;
    orderId: number;
    total: number;
    invoiceNumber: any;
    invoiceUrl: string;
    address: string;
    userId?: number;
    charityAmount?: number; // <-- NEW
  }
) {
  const domain = process.env.DOMAIN;
  const invoiceLink = `${domain}${details.invoiceUrl}`;
  const subject = `Order Confirmation — #${details.orderId} | Gazaarabia`;

  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background-color:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" 
      style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <tr>
        <td style="background-color:#ffffff;text-align:center;padding:30px 0;border-bottom:4px solid #009639;">
          <img 
            src="${logoUrl}" 
            alt="Gazaarabia" 
            width="200" 
            style="display:block;margin:0 auto;max-width:220px;"
          />
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:45px 50px;">
          <h2 style="margin:0 0 25px;font-size:22px;font-weight:600;color:#111827;">
            Thank You for Your Order!
          </h2>
          <p style="font-size:15px;line-height:1.7;margin:0 0 25px;color:#374151;">
            Hi <strong>${details.name || "there"}</strong>,  
            your order <strong>#${details.orderId}</strong> has been placed successfully.
          </p>

          <table cellpadding="10" cellspacing="0" width="100%" 
            style="margin:15px 0 30px;border-collapse:collapse;font-size:15px;color:#111827;border:1px solid #EAEAEA;border-radius:8px;">
            <tr style="background-color:#f9fafb;">
              <td style="width:35%;font-weight:600;color:#374151;">Order ID:</td>
              <td>#${details.orderId}</td>
            </tr>
            <tr>
              <td style="background-color:#ffffff;font-weight:600;color:#374151;">Customer Name:</td>
              <td>${details.name}</td>
            </tr>
            <tr style="background-color:#f9fafb;">
              <td style="font-weight:600;color:#374151;">Total Amount:</td>
              <td style="color:#E82C3F;font-weight:600;">£${details.total.toFixed(2)}</td>
            </tr>
            ${details.charityAmount && details.charityAmount > 0
      ? `
            <tr>
              <td style="background-color:#ffffff;font-weight:600;color:#374151;">Charity Donation:</td>
              <td style="color:#009639;font-weight:600;">£${details.charityAmount.toFixed(2)}</td>
            </tr>
            `
      : ""
    }

            <tr>
              <td style="background-color:#ffffff;font-weight:600;color:#374151;">Delivery Address:</td>
              <td style="line-height:1.7;">${details.address}</td>
            </tr>
          </table>

          <div style="text-align:center;margin:40px 0 20px;">
            <a href="${domain}/orders/${details.orderId}"
              style="display:inline-block;padding:12px 24px;background:#E82C3F;color:#ffffff;
              text-decoration:none;border-radius:8px;font-weight:500;letter-spacing:0.3px;
              box-shadow:0 2px 6px rgba(0,0,0,0.15);margin-right:18px;">
              View Your Order
            </a>

            <a href="${invoiceLink}" target="_blank"
              style="display:inline-block;padding:12px 24px;background:#009639;color:#ffffff;
              text-decoration:none;border-radius:8px;font-weight:500;letter-spacing:0.3px;
              box-shadow:0 2px 6px rgba(0,0,0,0.15);margin-left:18px;">
              Download Invoice
            </a>
          </div>


          <p style="font-size:14px;color:#374151;margin-top:28px;">
            Thank you for shopping with <strong>Gazaarabia</strong> —  
            where <em>modesty meets luxury</em>.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#111827;text-align:center;padding:28px 20px;">
          <p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">
            &copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong>  
            — Where Modesty Meets Luxury<br>
            <span style="color:#9ca3af;">Crafted with care and purpose.</span>
          </p>
          <div style="height:3px;width:60px;background:#E82C3F;margin:14px auto 0;border-radius:4px;"></div>
        </td>
      </tr>
    </table>
  </div>
  `;

  // Send the email
  const emailResult = await sendEmail({
    to,
    subject,
    html,
  });

  // Save record in database
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



/**
 * Send Contact Us Email
 * Sends an email to the admin when a user submits the contact form
 */

export async function sendContactUsEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.SMTP_USER)!;
  const mailSubject = `New Contact Message: ${subject}`;

  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background-color:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" 
      style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      
      <!-- Elegant Header -->
      <tr>
        <td style="background-color:#ffffff;text-align:center;padding:30px 0;position:relative;border-bottom:4px solid #009639;">
          <img 
            src="${logoUrl}" 
            alt="Gazaarabia" 
            width="200" 
            style="display:block;margin:0 auto;max-width:220px;"
          />
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:45px 50px;">
          <h2 style="margin:0 0 25px;font-size:22px;font-weight:600;color:#111827;">
            New Contact Form Message
          </h2>
          <p style="font-size:15px;line-height:1.7;margin:0 0 25px;color:#374151;">
            You’ve received a new inquiry from <strong>Gazaarabia</strong>.  
            Below are the details of the message:
          </p>

          <table cellpadding="10" cellspacing="0" width="100%" 
            style="margin:10px 0 30px;border-collapse:collapse;font-size:15px;color:#111827;border:1px solid #EAEAEA;border-radius:8px;">
            <tr style="background-color:#f9fafb;">
              <td style="width:30%;font-weight:600;color:#374151;">Full Name:</td>
              <td>${name}</td>
            </tr>
            <tr>
              <td style="background-color:#ffffff;font-weight:600;color:#374151;">Email:</td>
              <td><a href="mailto:${email}" style="color:#E82C3F;text-decoration:none;">${email}</a></td>
            </tr>
            <tr style="background-color:#f9fafb;">
              <td style="font-weight:600;color:#374151;">Subject:</td>
              <td>${subject}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:15px;">
                <p style="font-weight:600;color:#E82C3F;margin:8px 0;">Message:</p>
                <p style="white-space:pre-line;line-height:1.7;color:#111827;margin:0;">${message}</p>
              </td>
            </tr>
          </table>

          <p style="font-size:13px;color:#6b7280;margin-top:25px;line-height:1.6;">
            This email was generated automatically from the 
            <strong>Gazaarabia Contact Form</strong>. Please review and respond accordingly.
          </p>
        </td>
      </tr>

      <!-- Modern Footer -->
      <tr>
        <td style="background:#111827;text-align:center;padding:28px 20px;">
          <p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">
            &copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong>  
            — Where Modesty Meets Luxury<br>
            <span style="color:#9ca3af;">Crafted with care and purpose.</span>
          </p>
          <div style="height:3px;width:60px;background:#E82C3F;margin:14px auto 0;border-radius:4px;"></div>
        </td>
      </tr>
    </table>
  </div>
  `;

  const emailResult = await sendEmail({
    to: adminEmail,
    subject: mailSubject,
    html,
  });

  try {
    await prisma.notifications.create({
      data: {
        userId: null,
        email: adminEmail,
        subject: mailSubject,
        message: `Contact email from ${name} (${email}) - ${emailResult.success ? "sent successfully" : "failed to send"
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


// return order items status changed by the admin email

export async function sendReturnStatusEmail({
  to,
  userId,
  orderItemId,
  status,
  adminNote,
  refundAmount,
}: {
  to: string;
  userId: number;
  orderItemId: number;
  status: string;
  adminNote?: string | null;
  refundAmount?: number | null;
}) {

  const subject = `Your Return Request Status Has Been Updated`;

  const statusText = {
    pending: "Submitted",
    approved: "Approved - Awaiting Return",
    returned: "Item Returned - Refund Processing",
    refunded: `Refund Completed${refundAmount ? ` (£${refundAmount.toFixed(2)})` : ""}`,
    rejected: "Return Request Rejected",
  }[status];

  const html = `
  <div style="font-family:Arial, sans-serif;background:#fafafa;padding:40px;">
    <table align="center" width="600" style="background:white;border-radius:12px;overflow:hidden;border:1px solid #eee;">
      <tr>
        <td style="text-align:center;padding:25px 0;border-bottom:4px solid #009639;">
          <img src="${logoUrl}" width="200" alt="Gazaarabia" />
        </td>
      </tr>

      <tr><td style="padding:30px 40px;">
        <h2 style="margin-top:0;font-weight:600;color:#111827;">Return Request Update</h2>
        <p style="font-size:15px;color:#374151;line-height:1.6;">
          Your return request for <strong>Order Item #${orderItemId}</strong> has been updated.
        </p>

        <div style="margin:20px 0;padding:14px;border-left:4px solid #009639;background:#f9fafb;">
          <strong>Status:</strong> ${statusText}
        </div>

        ${adminNote ? `
        <p style="margin-top:15px;"><strong>Message from Support:</strong></p>
        <p style="background:#fff6d8;padding:12px;border-radius:8px;border:1px solid #ffe7a8;">
          ${adminNote}
        </p>` : ""}

        ${refundAmount ? `
        <p style="margin-top:15px;"><strong>Refund Amount:</strong> £${refundAmount.toFixed(2)}</p>
        ` : ""}

        <p style="margin-top:30px;font-size:13px;color:#6b7280;">
          If you have questions, simply reply to this email — we’re here to help ❤️
        </p>
      </td></tr>

      <tr>
        <td style="background:#111827;text-align:center;padding:20px;color:white;font-size:13px;">
          &copy; ${new Date().getFullYear()} Gazaarabia — Crafted with care.
        </td>
      </tr>
    </table>
  </div>
  `;

  await sendEmail({ to, subject, html });

  // Log notification
  await prisma.notifications.create({
    data: {
      userId,
      email: to,
      subject: `Return Request Status Updated`,
      message: `Your return request #${orderItemId} is now: ${statusText}`,
      type: "return-status",
      status: "sent",
    },
  });

  return true;
}




// ========================= FLOW 1: WELCOME SERIES (5 EMAILS) =========================

export async function sendWelcomeEmail1({
  to,
  name,
  userId,
}: {
  to: string;
  name?: string | null;
  userId?: number | null;
}) {
  const subject = "Welcome — your 10% code is inside ðµð¸";
  const displayName = name || "there";

  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640"
      style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

      <tr>
        <td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;">
          <img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;">
        </td>
      </tr>

      <tr>
        <td style="padding:45px 50px;">
          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            As-salamu alaykum,
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            Welcome to GAZAARABIA.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            Here is your 10% welcome discount:
          </p>

          <div style="text-align:center;margin:25px 0;padding:20px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
            <p style="margin:0;font-size:24px;font-weight:700;color:#E82C3F;letter-spacing:2px;">WELCOME10</p>
            <p style="margin:8px 0 0 0;font-size:13px;color:#6b7280;">Valid for 7 days.</p>
          </div>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            But first — something we want you to know before your first order.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            Every purchase at GAZAARABIA — an abaya, a thobe, a hijab, a kaftan, a gift — sends a portion of our profits to humanitarian aid for Muslims in Palestine, Sudan, Yemen, Kashmir and Syria. Not as a campaign. Not seasonally. Every single order, every single month.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            You don't have to choose between looking good and doing good.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:25px;color:#111827;">
            Any questions before ordering — sizing, fabric, delivery — email info@gazaarabia.com. We respond within 24 hours.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            Jazakallah khayran for joining us.<br>
            The GAZAARABIA Team
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#111827;text-align:center;padding:28px 20px;">
          <p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">
            &copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br>
            <span style="color:#9ca3af;">Where Modesty Meets Luxury</span>
          </p>
          <div style="height:3px;width:60px;background:#E82C3F;margin:14px auto 0;border-radius:4px;"></div>
        </td>
      </tr>
    </table>
  </div>
  `;

  const emailResult = await sendEmail({ to, subject, html });

  try {
    await prisma.notifications.create({
      data: {
        userId: userId || null,
        email: to,
        subject,
        message: `Welcome email 1/5 sent to ${to} — ${emailResult.success ? "success" : "failed"}.`,
        type: "email",
        status: emailResult.success ? "sent" : "failed",
      },
    });
  } catch (error) {
    console.error("Notification log error:", error);
  }

  return emailResult;
}

export async function sendWelcomeEmail2({
  to,
  name,
  userId,
}: {
  to: string;
  name?: string | null;
  userId?: number | null;
}) {
  const subject = "The story behind GAZAARABIA ðµð¸";
  const displayName = name || "there";

  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640"
      style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

      <tr>
        <td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;">
          <img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;">
        </td>
      </tr>

      <tr>
        <td style="padding:45px 50px;">
          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            As-salamu alaykum,
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            We want to tell you why GAZAARABIA exists.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            A few years ago, we kept seeing the same thing happen. A Muslim woman orders an abaya online. It arrives see-through. Or two inches too short. Or the fabric is nothing like the photo. She returns it, loses the delivery cost, and gives up on shopping modest fashion online.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            At the same time — the news from Palestine was constant. From Yemen. From Sudan. From Kashmir. And the question kept coming up: what are we actually doing about it? Beyond posting. Beyond donating once a year.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            So we built GAZAARABIA.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            A marketplace where every piece of modest fashion — every abaya, thobe, hijab, kaftan, Islamic gift — comes from a verified vendor, is opacity-tested before listing, and arrives at the length it says it will. Quality you can trust.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            And every month, a portion of every order goes to verified humanitarian organisations supporting Muslims in Palestine, Sudan, Yemen, Kashmir and Syria. Not a one-off donation. A permanent, binding part of how this business operates.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            That is it. That is GAZAARABIA.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            Your WELCOME10 discount is still valid. Use it on your first order.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            The GAZAARABIA Team
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#111827;text-align:center;padding:28px 20px;">
          <p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">
            &copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br>
            <span style="color:#9ca3af;">Where Modesty Meets Luxury</span>
          </p>
          <div style="height:3px;width:60px;background:#E82C3F;margin:14px auto 0;border-radius:4px;"></div>
        </td>
      </tr>
    </table>
  </div>
  `;

  const emailResult = await sendEmail({ to, subject, html });

  try {
    await prisma.notifications.create({
      data: {
        userId: userId || null,
        email: to,
        subject,
        message: `Welcome email 2/5 sent to ${to} — ${emailResult.success ? "success" : "failed"}.`,
        type: "email",
        status: emailResult.success ? "sent" : "failed",
      },
    });
  } catch (error) {
    console.error("Notification log error:", error);
  }

  return emailResult;
}

export async function sendWelcomeEmail3({
  to,
  name,
  userId,
}: {
  to: string;
  name?: string | null;
  userId?: number | null;
}) {
  const subject = "The size chart that stops returns ðµð¸";
  const displayName = name || "there";

  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640"
      style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

      <tr>
        <td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;">
          <img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;">
        </td>
      </tr>

      <tr>
        <td style="padding:45px 50px;">
          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            As-salamu alaykum,
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            The biggest reason people hesitate to buy modest fashion online is uncertainty — will the fabric be what I expect? Will the length be right for my height?
          </p>

          <h3 style="margin:25px 0 15px;font-size:16px;font-weight:600;color:#111827;">FABRIC GUIDE</h3>

          <p style="font-size:15px;line-height:1.7;margin-bottom:12px;color:#111827;">
            <strong>Nida Fabric:</strong> Smooth, flat, lightweight, fully opaque. Most popular everyday abaya and thobe fabric in the UK. Machine washable 30°C. Best for: everyday wear, clean structured look.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:12px;color:#111827;">
            <strong>Zoom Fabric (Crinkle Nida):</strong> Slight stretch, crinkle texture, wrinkle-resistant. Most comfortable all-day fabric. Best for: daily wear, travel, anyone who hates ironing.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            <strong>Crepe Fabric:</strong> Textured surface, medium weight, elegant drape. Best for: Eid, Nikah, formal occasions. Some styles dry clean only.
          </p>

          <h3 style="margin:25px 0 15px;font-size:16px;font-weight:600;color:#111827;">HEIGHT-TO-LENGTH GUIDE</h3>

          <table cellpadding="8" cellspacing="0" width="100%" style="font-size:14px;color:#374151;margin-bottom:20px;">
            <tr style="background:#f9fafb;border:1px solid #e5e7eb;">
              <td style="padding:10px;"><strong>Under 5'2" (157cm)</strong></td>
              <td style="padding:10px;">52" length (Petite)</td>
            </tr>
            <tr style="border:1px solid #e5e7eb;">
              <td style="padding:10px;"><strong>5'2" – 5'5"</strong></td>
              <td style="padding:10px;">54" length</td>
            </tr>
            <tr style="background:#f9fafb;border:1px solid #e5e7eb;">
              <td style="padding:10px;"><strong>5'5" – 5'8"</strong></td>
              <td style="padding:10px;">56" length (Regular)</td>
            </tr>
            <tr style="border:1px solid #e5e7eb;">
              <td style="padding:10px;"><strong>5'8" – 5'11"</strong></td>
              <td style="padding:10px;">58" length (Tall)</td>
            </tr>
            <tr style="background:#f9fafb;border:1px solid #e5e7eb;">
              <td style="padding:10px;"><strong>Over 5'11"</strong></td>
              <td style="padding:10px;">60" or email us</td>
            </tr>
          </table>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            When between sizes, always order longer. A garment that grazes the floor is more modest and more elegant than one that ends above the ankle.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            WELCOME10 is still valid. Use it before it expires.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            The GAZAARABIA Team
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#111827;text-align:center;padding:28px 20px;">
          <p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">
            &copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br>
            <span style="color:#9ca3af;">Where Modesty Meets Luxury</span>
          </p>
          <div style="height:3px;width:60px;background:#E82C3F;margin:14px auto 0;border-radius:4px;"></div>
        </td>
      </tr>
    </table>
  </div>
  `;

  const emailResult = await sendEmail({ to, subject, html });

  try {
    await prisma.notifications.create({
      data: {
        userId: userId || null,
        email: to,
        subject,
        message: `Welcome email 3/5 sent to ${to} — ${emailResult.success ? "success" : "failed"}.`,
        type: "email",
        status: emailResult.success ? "sent" : "failed",
      },
    });
  } catch (error) {
    console.error("Notification log error:", error);
  }

  return emailResult;
}

export async function sendWelcomeEmail4({
  to,
  name,
  userId,
}: {
  to: string;
  name?: string | null;
  userId?: number | null;
}) {
  const subject = "Join our community ðµð¸";
  const displayName = name || "there";

  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640"
      style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

      <tr>
        <td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;">
          <img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;">
        </td>
      </tr>

      <tr>
        <td style="padding:45px 50px;">
          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            As-salamu alaykum,
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            GAZAARABIA is more than a shop. It is a community of Muslims who believe that how we spend our money matters.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:15px;color:#111827;">
            <strong>ð¸ Instagram: @gazaarabia</strong><br>
            Modest fashion inspiration, Palestine stories, community styling and behind-the-scenes. Follow for early access to new drops.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:15px;color:#111827;">
            <strong>ðµ TikTok: @gazaarabia</strong><br>
            Fabric guides, sizing advice, styling tips and the real stories behind our mission.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            <strong>ð¬ WhatsApp Community</strong><br>
            New arrivals, Eid drops, Palestine impact updates — direct to your phone, no algorithm.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            And if you have ordered — post your look and tag @gazaarabia. We share community photos every week.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            See you there.<br>
            The GAZAARABIA Team
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#111827;text-align:center;padding:28px 20px;">
          <p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">
            &copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br>
            <span style="color:#9ca3af;">Where Modesty Meets Luxury</span>
          </p>
          <div style="height:3px;width:60px;background:#E82C3F;margin:14px auto 0;border-radius:4px;"></div>
        </td>
      </tr>
    </table>
  </div>
  `;

  const emailResult = await sendEmail({ to, subject, html });

  try {
    await prisma.notifications.create({
      data: {
        userId: userId || null,
        email: to,
        subject,
        message: `Welcome email 4/5 sent to ${to} — ${emailResult.success ? "success" : "failed"}.`,
        type: "email",
        status: emailResult.success ? "sent" : "failed",
      },
    });
  } catch (error) {
    console.error("Notification log error:", error);
  }

  return emailResult;
}

export async function sendWelcomeEmail5({
  to,
  name,
  userId,
}: {
  to: string;
  name?: string | null;
  userId?: number | null;
}) {
  const subject = "Last chance: WELCOME10 expires at midnight ðµð¸";
  const displayName = name || "there";

  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640"
      style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

      <tr>
        <td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;">
          <img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;">
        </td>
      </tr>

      <tr>
        <td style="padding:45px 50px;">
          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            As-salamu alaykum,
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            WELCOME10 expires at midnight tonight.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            If you have not found the right piece yet, here are the three most popular first orders from new GAZAARABIA customers:
          </p>

          <ul style="font-size:15px;color:#374151;line-height:1.8;margin:20px 0;padding-left:20px;">
            <li>Women: Everyday Black Nida Abaya — the most-ordered piece on the platform.</li>
            <li>Men: Classic White Nida Thobe — UK lengths, dispatched within 1 working day.</li>
            <li>Gifts: Islamic Gift Sets — the most chosen gift for Eid and birthdays.</li>
          </ul>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            Still unsure about sizing? Reply to this email with your height and what you are looking for. We will tell you exactly what to order.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            Code: WELCOME10 — use it tonight.
          </p>

          <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">
            Jazakallah khayran.<br>
            The GAZAARABIA Team
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#111827;text-align:center;padding:28px 20px;">
          <p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">
            &copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br>
            <span style="color:#9ca3af;">Where Modesty Meets Luxury</span>
          </p>
          <div style="height:3px;width:60px;background:#E82C3F;margin:14px auto 0;border-radius:4px;"></div>
        </td>
      </tr>
    </table>
  </div>
  `;

  const emailResult = await sendEmail({ to, subject, html });

  try {
    await prisma.notifications.create({
      data: {
        userId: userId || null,
        email: to,
        subject,
        message: `Welcome email 5/5 sent to ${to} — ${emailResult.success ? "success" : "failed"}.`,
        type: "email",
        status: emailResult.success ? "sent" : "failed",
      },
    });
  } catch (error) {
    console.error("Notification log error:", error);
  }

  return emailResult;
}
