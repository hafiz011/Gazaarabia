import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient, Prisma } from "@prisma/client";
import { sendSubscribeConfirmationEmail, sendWelcomeEmail1 } from "@/lib/helpers/emailHelper";
import { generateReferralCode } from "@/lib/helpers/generateReferralCodeHelper";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { logSignupAttempt, logRateLimited } from "@/lib/authLogging";
import { validatePassword } from "@/lib/passwordValidator";

const prisma: any = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Rate limit: 3 signup attempts per hour per IP (prevent account spam)
    const rateLimitResult = await rateLimit(req, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3, // 3 attempts
      keyGenerator: (r) => `signup:${getClientIp(r)}`, // Separate limit for signup
    });

    if (!rateLimitResult.allowed) {
      const { email } = await req.json().catch(() => ({ email: "unknown" }));
      logRateLimited(req, "signup", email);
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    const { name, email, password, role = "customer", phone } = await req.json();

    if (!name || !email || !password) {
      logSignupAttempt(req, email || "unknown", false, "Missing required fields");
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      logSignupAttempt(req, email, false, `Weak password: ${passwordValidation.errors.join(", ")}`);
      return NextResponse.json(
        {
          message: "Password does not meet requirements",
          errors: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      logSignupAttempt(req, email, false, "Email already exists");
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // default role can be customer or any role you have
    // const defaultRole = await prisma.roles.findFirst({ where: { name: "customer" } });

    // Normalise the requested role. Affiliates and ambassadors are BOTH stored
    // with the user role "affiliate" and distinguished by Affiliate.type — so an
    // "ambassador" signup resolves to the "affiliate" user role (no separate
    // "ambassador" role row is required).
    const requestedRole = (role ?? "customer").toLowerCase();
    const isAmbassador = requestedRole === "ambassador";
    const isAffiliate = requestedRole === "affiliate";
    const isPartner = isAmbassador || isAffiliate;

    const userRoleName = isPartner ? "affiliate" : requestedRole;

    // Get the role record dynamically
    const selectedRole = await prisma.roles.findFirst({
      where: { name: userRoleName },
    });

    if (!selectedRole) {
      return NextResponse.json({ message: `Invalid role: ${userRoleName}` }, { status: 400 });
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

    // Send Welcome Email 1 (10% discount code)
    await sendWelcomeEmail1({
      to: user.email,
      name: user.name,
      userId: user.id,
    });

    if (requestedRole === "seller") {
      await prisma.seller.create({
        data: {
          userId: user.id,
          // isApproved: false, // default to false, admin can approve later

        },
      });
    }
    else {

      // Only affiliates/ambassadors get an Affiliate record (with a referral code
      // and coupon-creation rights). Ordinary customers must NOT get one.
      if (isPartner) {

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


        // Create affiliate entry using dynamic commissions.
        // type distinguishes an ambassador from a regular affiliate.
        await prisma.affiliate.create({
          data: {
            userId: user.id,
            baseCommission: baseCommission,
            shareCommission: shareCommission,
            type: isAmbassador ? "ambassador" : "affiliate",
            isActive: true,
            referralCode
          },
        });
      }


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
    }

    // Log successful signup
    logSignupAttempt(req, user.email, true);

    return NextResponse.json({ message: "User created", user }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}