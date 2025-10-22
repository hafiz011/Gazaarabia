import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma:any = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // default role can be customer or any role you have
    const defaultRole = await prisma.roles.findFirst({ where: { name: "Customer" } });

    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: defaultRole?.id ?? 1,
      },
    });

    return NextResponse.json({ message: "User created", user }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
