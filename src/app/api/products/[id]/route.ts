import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();
type RouteContext = { params: Promise<{ id: string }> };

// ✅ GET product by ID (Protected)
export async function GET(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const productId = Number(id);

    if (!productId) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const product = await prisma.products.findUnique({
      where: { id: productId },
      include: {
        brand: true,
        categories: true,
        subcategories: true,
        productimage: true,
        productvariant: true,
        materialCare: true,
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("❌ GET Product Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// // ✅ PUT - Update product (Protected)
// export async function PUT(req: NextRequest, context: RouteContext) {
//   const userId = await checkAuth(req);
//   if (!userId) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const { id } = await context.params;
//     const productId = Number(id);

//     if (!productId) {
//       return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
//     }

//     const body = await req.json();

//     // Delete existing images and variants before updating
//     await prisma.productimage.deleteMany({ where: { productId } });
//     await prisma.productvariant.deleteMany({ where: { productId } });

//     const updated = await prisma.products.update({
//       where: { id: productId },
//       data: {
//         title: body.title,
//         shortDescription: body.shortDescription,
//         description: body.description,
//         fitType: body.fitType,
//         careAdvice: body.careAdvice,
//         costPrice: parseFloat(body.costPrice),
//         sellingPrice: parseFloat(body.sellingPrice),
//         discountPrice: body.discountPrice ? parseFloat(body.discountPrice) : null,
//         baseQty: parseInt(body.baseQty),
//         barcode: body.barcode,
//         active: body.active ?? true,
//         brandId: body.brandId ? parseInt(body.brandId) : null,
//         categoryId: body.categoryId ? parseInt(body.categoryId) : null,
//         subcategoryId: body.subcategoryId ? parseInt(body.subcategoryId) : null,

//         productimage: {
//           create:
//             body.images?.map((img: any) => ({
//               url: img.url,
//               alt: img.alt || "",
//               colorId: img.colorId ? parseInt(img.colorId) : null,
//               primary: img.primary ?? false,
//             })) || [],
//         },

//         productvariant: {
//           create:
//             body.variants?.map((v: any) => ({
//               sku: v.sku,
//               price: parseFloat(v.price),
//               stock: parseInt(v.stock),
//               isActive: v.isActive ?? true,
//               colorId: v.colorId ? parseInt(v.colorId) : null,
//               sizeId: v.sizeId ? parseInt(v.sizeId) : null,
//             })) || [],
//         },
//       },
//       include: {
//         productimage: true,
//         productvariant: true,
//       },
//     });

//     return NextResponse.json({ success: true, message: "Product updated successfully", data: updated });
//   } catch (error) {
//     console.error("❌ PUT Product Error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to update product" },
//       { status: 500 }
//     );
//   }
// }


// ✅ PUT - Update product (Hard delete old variants & images)
export async function PUT(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id }: any = context.params;
    const productId = Number(id);

    if (!productId) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();

    // 1️⃣ Delete dependent records (Cart + Order Items) before variants
    await prisma.cart.deleteMany({
      where: { variant: { productId } },
    });

    await prisma.orderItem.deleteMany({
      where: { variant: { productId } },
    });

    // 2️⃣ Delete images & variants
    await prisma.productimage.deleteMany({ where: { productId } });
    await prisma.productvariant.deleteMany({ where: { productId } });

    // 3️⃣ Update product with new values
    const updated = await prisma.products.update({
      where: { id: productId },
      data: {
        slug: body.slug.trim(),
        title: body.title,
        shortDescription: body.shortDescription,
        description: body.description,
        fitType: body.fitType,
        // careAdvice: body.careAdvice,
        materialCareId: body.materialCareId,
        costPrice: parseFloat(body.costPrice),
        sellingPrice: parseFloat(body.sellingPrice),
        discountPrice: body.discountPrice ? parseFloat(body.discountPrice) : null,
        baseQty: parseInt(body.baseQty),
        barcode: body.barcode,
        active: body.active ?? true,
        brandId: body.brandId ? parseInt(body.brandId) : null,
        categoryId: body.categoryId ? parseInt(body.categoryId) : null,
        subcategoryId: body.subcategoryId ? parseInt(body.subcategoryId) : null,

        // 🖼️ Re-create images
        productimage: {
          create:
            body.images?.map((img: any) => ({
              url: img.url,
              alt: img.alt || "",
              colorId: img.colorId ? parseInt(img.colorId) : null,
              primary: img.primary ?? false,
            })) || [],
        },

        // 🧩 Re-create variants
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

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("❌ PUT Product Error:", error);

    if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
      return NextResponse.json(
        { success: false, message: "Slug must be unique. This one already exists." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  }
}


// ✅ DELETE product (Protected)
export async function DELETE(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const productId = Number(id);

    if (!productId) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    // 1. Delete variants
    await prisma.productvariant.deleteMany({ where: { productId } });

    // 2. Delete images
    await prisma.productimage.deleteMany({ where: { productId } });

    // 3. Delete product
    await prisma.products.delete({ where: { id: productId } });

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE Product Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
