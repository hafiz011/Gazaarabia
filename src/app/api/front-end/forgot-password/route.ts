import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendForgotPasswordLinkEmail } from "@/lib/helpers/emailHelper";


export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        // 1. Check if user exists and is a content manager
        const user = await prisma.users.findUnique({
            where: { email },
            include: { role: true },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Email not found",
            });
        }

        // 2. Generate secure token (instead of Math.random)
        const token = crypto.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

        // 3. Save token + expiry
        await prisma.users.update({
            where: { id: user.id },
            data: {
                resetToken: token,
                resetTokenExpiry: expiry,
            },
        });

        // 4. Build reset URL
        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

        // 5. Send branded email (our new template)
        await sendForgotPasswordLinkEmail({
            to: user.email,
            name: user.name,
            resetLink: resetUrl,
            userId: user.id,
        });

        return NextResponse.json({
            success: true,
            message: "A password reset link has been sent to your email.",
        });
    } catch (err) {
        console.error("Forgot-password error:", err);
        return NextResponse.json({
            success: false,
            message: "Something went wrong.",
        });
    }
}
