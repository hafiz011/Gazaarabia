import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendContactUsEmail } from "@/lib/helpers/emailHelper";

const prisma :any= new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Save to DB
    const contact = await prisma.contactUs.create({
      data: { name, email, subject, message },
    });

    // Send email to admin
    const emailResult = await sendContactUsEmail({ name, email, subject, message });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      contact,
      emailStatus: emailResult.success ? "sent" : "failed",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
