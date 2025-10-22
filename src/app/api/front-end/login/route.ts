// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export async function POST(req: Request) {
//   try {
//     const { email, password } = await req.json();

//     if (!email || !password) {
//       return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
//     }

//     const user = await prisma.users.findUnique({ where: { email } });
//     if (!user) {
//       return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
//     }

//     const valid = await bcrypt.compare(password, user.password);
//     if (!valid) {
//       return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
//     }

//     // ✅ Generate JWT
//     const token = jwt.sign(
//       { id: user.id, email: user.email, roleId: user.roleId },
//       process.env.JWT_SECRET as string,
//       { expiresIn: "7d" }
//     );

//     // ✅ Set cookie and return response
//     const res = NextResponse.json({
//       message: "Login successful",
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         roleId: user.roleId,
//       },
//       token,
//     });

//     res.cookies.set("auth_token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       path: "/",
//       maxAge: 60 * 60 * 24 * 7, // 7 days
//     });

//     return res;
//   } catch (err: any) {
//     console.error("Login error:", err);
//     return NextResponse.json({ message: "Server error" }, { status: 500 });
//   }
// }


import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // 👇 Fetch the user and include the related role record
    const user = await prisma.users.findUnique({
      where: { email },
      include: { role: true }, // ✅ this brings the role name
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Generate JWT with role name
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.name, // 👈 added role name
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // ✅ Send role name in response
    const res = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.name, // 👈 here it is
      },
      token,
    });

    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
