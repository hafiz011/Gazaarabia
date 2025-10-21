import { NextResponse } from "next/server";


import { PrismaClient } from "@prisma/client";

const prisma:any = new PrismaClient();

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        subcategory: true,
        images: true,
        variants: true,
      },
    });

    if (!product) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error("GET product error:", error);
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();

    // Delete existing images and variants first (optional, depending on logic)
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productVariant.deleteMany({ where: { productId: id } });

    const updated = await prisma.products.update({
      where: { id },
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT product error:", error);
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    // ✅ 1. Delete related variants
    await prisma.productVariant.deleteMany({
      where: { productId: id },
    });

    // ✅ 2. Delete related images
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    // ✅ 3. Delete the product itself
    await prisma.products.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE product error:", error);
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 });
  }
}
