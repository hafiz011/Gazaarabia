import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const prisma: any = new PrismaClient();

/**
 * @route POST /api/front-end/guest-checkout
 * @desc Create a guest user (if needed), save delivery address, place order, and send confirmation email
 */
export async function POST(req: NextRequest) {
    try {
        const { address, orderItems, payment } = await req.json();

        // 1️.  Validate incoming data
        if (
            !address?.email ||
            !address?.firstName ||
            !address?.address1 ||
            !orderItems?.length ||
            !payment?.totalAmount
        ) {
            return NextResponse.json(
                { success: false, message: "Missing required fields." },
                { status: 400 }
            );
        }

        // 2️. Check if user already exists
        let user = await prisma.users.findUnique({
            where: { email: address.email },
        });

        // 3️. If not, create new guest user
        let generatedPassword: string | null = null;

        if (!user) {
            generatedPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);

            const defaultRole = await prisma.roles.findFirst({
                where: { name: "Customer" },
            });

            user = await prisma.users.create({
                data: {
                    name: `${address.firstName} ${address.lastName || ""}`.trim(),
                    email: address.email,
                    phone: address.phone || "",
                    password: hashedPassword,
                    roleId: defaultRole?.id ?? 1,
                    isGuest: true,
                },
            });
        }

        // 4️. Save delivery address to addresses table
        const deliveryAddress = await prisma.address.create({
            data: {
                userId: user.id,
                firstName: address.firstName,
                lastName: address.lastName || "",
                company: address.company || null,
                address1: address.address1,
                address2: address.address2 || null,
                city: address.city,
                country: address.country,
                postalCode: address.postalCode,
                phone: address.phone,
                isDefault: true,
            },
        });

        // 5️. Create the order
        const newOrder = await prisma.orders.create({
            data: {
                userId: user.id,
                addressId: deliveryAddress.id,
                totalAmount: payment.totalAmount,
                itemsTotal: payment.itemsTotal,
                subtotal: payment.subtotal,
                paymentMethod: payment.paymentMethod,
                transactionId: payment.paypalOrderId,
                status: (payment.paymentStatus || "completed").toLowerCase(),
                paypalResponse: payment.paypalResponse,

                // Store snapshot too (so even if user edits address later, order remains correct)
                firstName: address.firstName,
                lastName: address.lastName,
                company: address.company,
                address1: address.address1,
                address2: address.address2,
                city: address.city,
                country: address.country,
                postalCode: address.postalCode,
                phone: address.phone,

                orderItems: {
                    create: orderItems.map((item: any) => ({
                        productId: item.productId,
                        variantId: item.variantId,
                        colorId: item.colorId,
                        sizeId: item.sizeId,
                        quantity: item.quantity,
                        price: item.price,
                        subtotal: item.subtotal,
                    })),
                },
            },
            include: { orderItems: true },
        });

        // 6️. Send email confirmation to guest
        const emailResult = await sendGuestOrderEmail(user.email, {
            name: user.name,
            orderId: newOrder.id,
            total: payment.totalAmount,
            address: `${address.address1}, ${address.city}, ${address.country}, ${address.postalCode}`,
            generatedPassword,
        });

        // 7️. Log email notification
        await prisma.notifications.create({
            data: {
                userId: user.id,
                email: user.email,
                subject: "Your Order Confirmation",
                message: `Order #${newOrder.id} confirmation email sent.`,
                type: "email",
                status: emailResult.success ? "sent" : "failed",
            },
        });

        return NextResponse.json({
            success: true,
            message: "Guest order placed successfully",
            data: {
                user,
                order: newOrder,
            },
        });
    } catch (err: any) {
        console.error("Guest Checkout Error:", err);
        return NextResponse.json(
            { success: false, message: "Failed to process guest checkout." },
            { status: 500 }
        );
    }
}

/**
 *  Helper: Send guest order confirmation email
 */
// async function sendGuestOrderEmail(
//     to: string,
//     details: {
//         name: string;
//         orderId: number;
//         total: number;
//         address: string;
//         generatedPassword?: string | null;
//     }
// ) {
//     try {
//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: process.env.SMTP_USER,
//                 pass: process.env.SMTP_PASS,
//             },
//         });


//         const domain = process.env.DOMAIN;


//         const html = `
//       <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
//         <h2>Hi ${details.name || "there"},</h2>
//         <p>Thank you for your order! 🎉</p>
//         <p>Your order <strong>#${details.orderId}</strong> has been successfully placed.</p>
//         <h3>Order Summary</h3>
//         <p><strong>Total:</strong> £${details.total.toFixed(2)}</p>
//         <p><strong>Delivery Address:</strong><br>${details.address}</p>
//         ${details.generatedPassword
//                 ? `
//                 <h3>Your Account Details</h3>
//                 <p>
//                     We've created an account for you so you can track your order easily.<br/>
//                     <strong>Username:</strong> ${to}<br/>
//                     <strong>Temporary Password:</strong> ${details.generatedPassword}<br/>
//                     <a href="${domain}/account/login" 
//                         style="display:inline-block;margin-top:10px;padding:10px 16px;background:#000;color:#fff;text-decoration:none;border-radius:6px;">
//                         Login to Your Account
//                     </a>
//                 </p>

//                 `
//                 : ""
//             }
//         <p>Thank you for shopping with us!<br>The Gazaarabia Team</p>
//       </div>
//     `;

//         await transporter.sendMail({
//             from: `"Gazaarabia" <${process.env.SMTP_USER}>`,
//             to,
//             subject: "Your Gazaarabia Order Confirmation",
//             html,
//         });

//         return { success: true };
//     } catch (error) {
//         console.error("Email sending failed:", error);
//         return { success: false };
//     }
// }



export async function sendGuestOrderEmail(
  to: string,
  details: {
    name: string;
    orderId: number;
    total: number;
    address: string;
    generatedPassword?: string | null;
  }
) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const domain = process.env.DOMAIN;
    const logoUrl =
      "https://drive.google.com/uc?export=view&id=12-EA3sW2FQVQU77-roeITSncjskWChiT";

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
                <td style="color:#E82C3F;font-weight:600;">₹${details.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="background-color:#ffffff;font-weight:600;color:#374151;">Delivery Address:</td>
                <td style="line-height:1.7;">${details.address}</td>
              </tr>
            </table>

            ${
              details.generatedPassword
                ? `
              <div style="background:#f9fafb;border-radius:10px;padding:20px 25px;margin-top:30px;">
                <h3 style="margin:0 0 12px;font-size:18px;color:#111827;">Your Account Has Been Created</h3>
                <p style="font-size:15px;line-height:1.8;margin:0 0 16px;color:#374151;">
                  We’ve created a customer account for you so you can track your order and manage future purchases.
                </p>
                <table cellpadding="6" cellspacing="0" width="100%" 
                  style="font-size:14px;color:#111827;">
                  <tr>
                    <td style="width:40%;font-weight:600;">Email:</td>
                    <td>${to}</td>
                  </tr>
                  <tr>
                    <td style="font-weight:600;">Temporary Password:</td>
                    <td style="color:#E82C3F;font-weight:600;">${details.generatedPassword}</td>
                  </tr>
                </table>

                <div style="text-align:center;margin-top:25px;">
                  <a href="${domain}/account/login" 
                    style="display:inline-block;padding:12px 24px;background:#E82C3F;color:#ffffff;text-decoration:none;
                    border-radius:8px;font-weight:500;letter-spacing:0.3px;box-shadow:0 2px 6px rgba(0,0,0,0.15);">
                    Login to Your Account
                  </a>
                </div>
              </div>
              `
                : ""
            }

            <div style="text-align:center;margin:40px 0 20px;">
              <a href="${domain}/orders/${details.orderId}"
                style="display:inline-block;padding:12px 24px;background:#009639;color:#ffffff;
                text-decoration:none;border-radius:8px;font-weight:500;letter-spacing:0.3px;
                box-shadow:0 2px 6px rgba(0,0,0,0.15);">
                View Your Order
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

    await transporter.sendMail({
      from: `"Gazaarabia" <${process.env.SMTP_USER}>`,
      to,
      subject: `Your Gazaarabia Order Confirmation — #${details.orderId}`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false };
  }
}
