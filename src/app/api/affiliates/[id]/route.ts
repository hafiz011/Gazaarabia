import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import { validateCommission } from "@/lib/validation/commission";
import { PrismaClient } from "@prisma/client";

const prisma: any = new PrismaClient();

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // await params

    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);

    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || user.role.name.toLowerCase() !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const affiliate = await prisma.affiliate.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });

    if (!affiliate) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: affiliate });
  } catch (err) {
    return NextResponse.json({ message: "Failed to fetch affiliate" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // affiliateId
    const affiliateId = Number(id);

    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);

    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const admin = await prisma.users.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!admin || admin.role.name.toLowerCase() !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { name, email, phone, password, baseCommission, shareCommission, isActive, type } = body;

    //  First fetch affiliate to get the real userId
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
      include: { user: true },
    });

    if (!affiliate) {
      return NextResponse.json({ message: "Affiliate not found" }, { status: 404 });
    }

    // Bound commission values (fall back to current values when a field is omitted)
    const commissionError = validateCommission(
      baseCommission ?? affiliate.baseCommission,
      shareCommission ?? affiliate.shareCommission
    );
    if (commissionError)
      return NextResponse.json({ message: commissionError }, { status: 400 });

    //  Update User
    await prisma.users.update({
      where: { id: affiliate.userId },
      data: {
        name,
        email,
        phone,
        ...(password ? { password: await hash(password, 10) } : {}),
      },
    });

    //  Update Affiliate
    await prisma.affiliate.update({
      where: { id: affiliateId },
      data: {
        type,
        baseCommission,
        shareCommission,
        isActive,
      },
    });

    // Audit trail. Wrapped so a not-yet-migrated audit_log table never blocks the update.
    try {
      await prisma.auditLog.create({
        data: { actorId: userId, action: "PUT", entity: "Affiliate", entityId: affiliateId },
      });
    } catch (auditErr) {
      console.error("Audit log (affiliate update) failed:", auditErr);
    }

    return NextResponse.json({ success: true, message: "Affiliate updated successfully." });
  } catch (err) {
    console.error("AFFILIATE UPDATE ERROR:", err);
    return NextResponse.json({ message: "Failed to update affiliate" }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; //  await params

    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);

    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || user.role?.name.toLowerCase() !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const affiliate = await prisma.affiliate.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });

    if (!affiliate) return NextResponse.json({ message: "Affiliate not found" }, { status: 404 });

    try {
      //  If the underlying user has orders, keep the user account (its order
      //  history is protected) and remove only the affiliate mapping.
      const orderCount = await prisma.orders.count({ where: { userId: affiliate.userId } });
      if (orderCount > 0) {
        await prisma.affiliate.delete({ where: { id: Number(id) } });
      } else {
        await prisma.$transaction([
          prisma.affiliate.delete({ where: { id: Number(id) } }),
          prisma.users.delete({ where: { id: affiliate.userId } }),
        ]);
      }
    } catch (e: any) {
      if (e?.code === "P2003") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Cannot delete: this affiliate has related records (orders, payouts, or invoices). Deactivate instead.",
          },
          { status: 409 }
        );
      }
      throw e;
    }

    // Audit trail. Wrapped so a not-yet-migrated audit_log table never blocks the delete.
    try {
      await prisma.auditLog.create({
        data: { actorId: userId, action: "DELETE", entity: "Affiliate", entityId: Number(id) },
      });
    } catch (auditErr) {
      console.error("Audit log (affiliate delete) failed:", auditErr);
    }

    return NextResponse.json({ success: true, message: "Affiliate deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("DELETE AFFILIATE ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to delete affiliate" }, { status: 500 });
  }
}
