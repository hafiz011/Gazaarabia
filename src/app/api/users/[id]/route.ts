import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma = new PrismaClient();

//  Helper: Validate Admin
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
/*                                  GET USER                                  */
/* -------------------------------------------------------------------------- */
// GET /api/users/[id]
export async function GET(req: Request, { params }: any) {
  const auth = await validateAdmin(req);

  if (auth.error) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: Number(params.id) },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roleId: true,
        createdAt: true,
        role: { select: { name: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET User Error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/*                                  UPDATE USER                               */
/* -------------------------------------------------------------------------- */
// PUT /api/users/[id]
export async function PUT(req: Request, { params }: any) {
  const auth = await validateAdmin(req);

  if (auth.error) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();

    //  Find roleId using role name
    const roleRecord = await prisma.roles.findFirst({
      where: { name: body.role.toLowerCase() }, // role comes as "customer" / "content_manager"
    });

    if (!roleRecord) {
      return NextResponse.json(
        { error: "Invalid role provided" },
        { status: 400 }
      );
    }

    const updateData: any = {
      name: body.name,
      phone: body.phone,
      roleId: roleRecord.id,
    };

    // Optional: update password if present
    if (body.password && body.password.trim() !== "") {
      updateData.password = body.password;
    }

    const updatedUser = await prisma.users.update({
      where: { id: Number(params.id) },
      data: updateData,
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("PUT User Error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/*                                  DELETE USER                               */
/* -------------------------------------------------------------------------- */
// DELETE /api/users/[id]
export async function DELETE(req: Request, { params }: any) {
  const auth = await validateAdmin(req);

  if (auth.error) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    await prisma.users.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE User Error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
