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
async function sendGuestOrderEmail(
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


        const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
        <h2>Hi ${details.name || "there"},</h2>
        <p>Thank you for your order! 🎉</p>
        <p>Your order <strong>#${details.orderId}</strong> has been successfully placed.</p>
        <h3>Order Summary</h3>
        <p><strong>Total:</strong> £${details.total.toFixed(2)}</p>
        <p><strong>Delivery Address:</strong><br>${details.address}</p>
        ${details.generatedPassword
                ? `
                <h3>Your Account Details</h3>
                <p>
                    We've created an account for you so you can track your order easily.<br/>
                    <strong>Username:</strong> ${to}<br/>
                    <strong>Temporary Password:</strong> ${details.generatedPassword}<br/>
                    <a href="${domain}/account/login" 
                        style="display:inline-block;margin-top:10px;padding:10px 16px;background:#000;color:#fff;text-decoration:none;border-radius:6px;">
                        Login to Your Account
                    </a>
                </p>

                `
                : ""
            }
        <p>Thank you for shopping with us!<br>The Gazaarabia Team</p>
      </div>
    `;

        await transporter.sendMail({
            from: `"Gazaarabia" <${process.env.SMTP_USER}>`,
            to,
            subject: "Your Gazaarabia Order Confirmation",
            html,
        });

        return { success: true };
    } catch (error) {
        console.error("Email sending failed:", error);
        return { success: false };
    }
}
