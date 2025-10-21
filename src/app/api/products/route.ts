import { NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

const prisma:any = new PrismaClient();


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where = search
      ? { title: { contains: search, mode: "insensitive" } }
      : {};

    const [total, products] = await Promise.all([
      prisma.products.count({ where }),
      prisma.products.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          brand: true,
          category: true,
          subcategory: true,
          images: true,
          variants: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ total, data: products });
  } catch (error) {
    console.error("GET products error:", error);
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const product = await prisma.products.create({
      data: {
        title: body.title,
        shortDescription: body.shortDescription,
        description: body.description,
        fitType: body.fitType,
        careAdvice: body.careAdvice,
        costPrice: parseFloat(body.costPrice),
        sellingPrice: parseFloat(body.sellingPrice),
        discountPrice: body.discountPrice ? parseFloat(body.discountPrice) : null,
        baseQty: parseInt(body.baseQty),
        barcode: body.barcode,
        active: body.active ?? true,
        brandId: body.brandId ? parseInt(body.brandId) : null,
        categoryId: body.categoryId ? parseInt(body.categoryId) : null,
        subcategoryId: body.subcategoryId ? parseInt(body.subcategoryId) : null,

        images: {
          create: body.images?.map((img: any) => ({
            url: img.url,
            alt: img.alt || "",
            colorId: img.colorId ? parseInt(img.colorId) : null,
            primary: img.primary ?? false,
          })) || [],
        },

        variants: {
          create: body.variants?.map((v: any) => ({
            sku: v.sku,
            price: parseFloat(v.price),
            stock: parseInt(v.stock),
            isActive: v.isActive ?? true,
            colorId: v.colorId ? parseInt(v.colorId) : null,
            sizeId: v.sizeId ? parseInt(v.sizeId) : null,
          })) || [],
        },
      },
      include: { images: true, variants: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST products error:", error);
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 });
  }
}
