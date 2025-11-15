import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma = new PrismaClient();

//  Helper: Admin check
async function validateAdmin(req: Request) {
  const token: any = getTokenFromHeader(req);
  const userId = getUserIdFromToken(token);

  if (!userId) return { error: "Unauthorized", status: 401 };

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user || user.role.name.toLowerCase() !== "admin") {
    return { error: "Forbidden", status: 403 };
  }

  return { user };
}

/* -------------------------------------------------------------------------- */
/*                                  GET ALL USERS                             */
/* -------------------------------------------------------------------------- */
export async function GET(req: Request) {
  const auth = await validateAdmin(req);

  if (auth.error)
    return NextResponse.json({ message: auth.error }, { status: auth.status });

  try {
    const users = await prisma.users.findMany({
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        roleId: true,
        role: { select: { name: true } },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET Users Error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/*                                  CREATE USER                               */
/* -------------------------------------------------------------------------- */
// POST /api/users
export async function POST(req: Request) {
  const auth = await validateAdmin(req);

  if (auth.error)
    return NextResponse.json({ message: auth.error }, { status: auth.status });

  try {
    const body = await req.json();

    //  Convert role name → roleId
    const roleRecord = await prisma.roles.findFirst({
      where: { name: body.role.toLowerCase() },
    });

    if (!roleRecord) {
      return NextResponse.json(
        { error: "Invalid role provided" },
        { status: 400 }
      );
    }

    const newUser = await prisma.users.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || "",
        password: body.password,
        roleId: roleRecord.id, // ← FIXED
      },
    });

    return NextResponse.json({
      message: "User created successfully",
      user: newUser,
    });
  }
  catch (error: any) {
    console.error("POST User Error:", error);

    //  Handle unique email error (Prisma P2002)
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return NextResponse.json(
        { error: "Email already exists, please use a different email." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

