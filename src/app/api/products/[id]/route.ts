import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
type RouteContext = { params: Promise<{ id: string }> };

// ✅ GET product by ID
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const productId = Number(id);

    if (!productId) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const product = await prisma.products.findUnique({
      where: { id: productId },
      include: {
        brand: true,
        categories: true,
        subcategories: true,
        productimage: true,
        productvariant: true,
      },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("❌ GET product error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// ✅ PUT - Update product
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const productId = Number(id);

    if (!productId) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();

    // Delete existing images and variants
    await prisma.productimage.deleteMany({ where: { productId } });
    await prisma.productvariant.deleteMany({ where: { productId } });

    const updated = await prisma.products.update({
      where: { id: productId },
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

        productimage: {
          create:
            body.images?.map((img: any) => ({
              url: img.url,
              alt: img.alt || "",
              colorId: img.colorId ? parseInt(img.colorId) : null,
              primary: img.primary ?? false,
            })) || [],
        },

        productvariant: {
          create:
            body.variants?.map((v: any) => ({
              sku: v.sku,
              price: parseFloat(v.price),
              stock: parseInt(v.stock),
              isActive: v.isActive ?? true,
              colorId: v.colorId ? parseInt(v.colorId) : null,
              sizeId: v.sizeId ? parseInt(v.sizeId) : null,
            })) || [],
        },
      },
      include: {
        productimage: true,
        productvariant: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ PUT product error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  }
}

// ✅ DELETE product
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const productId = Number(id);

    if (!productId) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    // 1. Delete related variants
    await prisma.productvariant.deleteMany({
      where: { productId },
    });

    // 2. Delete related images
    await prisma.productimage.deleteMany({
      where: { productId },
    });

    // 3. Delete the product itself
    await prisma.products.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE product error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
