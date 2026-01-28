import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const preview = searchParams.get("preview") === "true";

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.max(1, Number(searchParams.get("limit")) || 12);
  const skip = (page - 1) * limit;

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], total: 0 });
  }

  const where: Prisma.productsWhereInput = {
    OR: [
      { title: { contains: q.toLowerCase() } },
      { slug: { contains: q.toLowerCase() } },
    ],
  };

  const query: Prisma.productsFindManyArgs = {
    where,
    include: {
      productimage: true,
      productvariant: { include: { color: true } },
      brand: true,
    },
    orderBy: { createdAt: "desc" },
  };

  if (preview) {
    query.take = 5;
  } else {
    query.skip = skip;
    query.take = limit;
  }

  const [products, total] = await Promise.all([
    prisma.products.findMany(query),
    prisma.products.count({ where }),
  ]);

  return NextResponse.json({ products, total,  totalPages: Math.ceil(total / limit), page});
}
