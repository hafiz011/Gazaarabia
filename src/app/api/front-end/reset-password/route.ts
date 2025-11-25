import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendPasswordChangedEmail } from "@/lib/helpers/emailHelper";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        const user = await prisma.users.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() }
            }
        });

        if (!user) {
            return NextResponse.json({ success: false, message: "Invalid or expired token" });
        }

        const hashed = await bcrypt.hash(password, 10);

        await prisma.users.update({
            where: { id: user.id },
            data: {
                password: hashed,
                resetToken: null,
                resetTokenExpiry: null,
            }
        });


        // ------------ SEND PASSWORD CHANGED EMAIL ------------
        await sendPasswordChangedEmail({
            to: user.email,
            name: user.name,
            userId: user.id,
        });


        return NextResponse.json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (err) {
        return NextResponse.json({
            success: false,
            message: "Something went wrong"
        });
    }
}
