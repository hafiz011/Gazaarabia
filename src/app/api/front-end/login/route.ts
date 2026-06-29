import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "Email, password, and role are required" },
        { status: 400 }
      );
    }


    // Fetch the user and include the related role record
    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        role: true,
        affiliate: {
          select: {
            id: true,
            type: true,     // returns "affiliate" | "ambassador"
          }
        }

      }, //  this brings the role name
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Role-based validation
    if (!user.role || user.role.name.toLowerCase() !== role.toLowerCase()) {
      return NextResponse.json(
        {
          message: `Access denied. This account is not associated with the "${role}" portal.`,
        },
        { status: 403 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    //  Generate JWT with role name (1 hour expiration)
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.name,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    //  Generate refresh token (7 days expiration)
    const refreshTokenString = jwt.sign(
      { id: user.id, type: "refresh" },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    //  Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isRevoked: false,
      },
    });

    //  Send role name in response
    const res = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.name,
        affiliateId: user.role.name === "affiliate" ? user.affiliate?.id : null,
        affiliateType: user.role.name === "affiliate" ? user.affiliate?.type : null,
        stripeCustomerId: user.stripeCustomerId
      },
      accessToken,
      refreshToken: refreshTokenString,
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
