import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient, Prisma } from "@prisma/client";
import { sendSubscribeConfirmationEmail } from "@/lib/helpers/emailHelper";
import { generateReferralCode } from "@/lib/helpers/generateReferralCodeHelper";

const prisma: any = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password, role = "customer", phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // default role can be customer or any role you have
    // const defaultRole = await prisma.roles.findFirst({ where: { name: "customer" } });

    // Get the role record dynamically
    const selectedRole = await prisma.roles.findFirst({
      where: { name: role.toLowerCase() },
    });

    if (!selectedRole) {
      return NextResponse.json({ message: `Invalid role: ${role}` }, { status: 400 });
    }

    const user = await prisma.users.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        roleId: selectedRole.id,
      },
    });



    // Get commission values from HomePageSetting
    const settings = await prisma.homePageSetting.findFirst();

    const baseCommission = settings?.affiliateCommission || 10;
    const shareCommission = 7;


    // ==============================
    // GENERATE UNIQUE REFERRAL CODE
    // ==============================
    let referralCode = generateReferralCode();

    // Ensure uniqueness
    let exists = await prisma.affiliate.findUnique({
      where: { referralCode },
    });

    while (exists) {
      referralCode = generateReferralCode();
      exists = await prisma.affiliate.findUnique({
        where: { referralCode },
      });
    }


    // Create affiliate entry using dynamic commissions
    await prisma.affiliate.create({
      data: {
        userId: user.id,
        baseCommission: baseCommission,
        shareCommission: shareCommission,
        isActive: true,
        referralCode
      },
    });


    // //If the role is affiliate → insert record into Affiliate table
    // if (role.toLowerCase() === "affiliate") {
    //   await prisma.affiliate.create({
    //     data: {
    //       userId: user.id,
    //       baseCommission: 10,     // default 10%
    //       shareCommission: 7,     // default 7%
    //       isActive: true,
    //     },
    //   });
    // }


    //  AUTO-SUBSCRIBE LOGIC (IMPORTANT)
    await prisma.subscriber.upsert({
      where: { email },
      update: {
        name,
        phone,
        isActive: true,
      },
      create: {
        email,
        name,
        phone,
        isActive: true,
      },
    });

    //  SEND subscriber CONFIRMATION EMAIL
    await sendSubscribeConfirmationEmail({
      to: email,
      name,
    });

    return NextResponse.json({ message: "User created", user }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
