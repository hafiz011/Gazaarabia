import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();
type RouteContext = { params: Promise<{ id: string }> };

//  GET product by ID (includes variant images)
export async function GET(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  if (!user || user.role.name.toLowerCase() !== "seller") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const seller = await prisma.seller.findUnique({
    where: { userId: userId },
  });

  try {
    const { id } = await context.params;
    const productId = Number(id);

    if (!productId) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const product = await prisma.products.findUnique({
      where: { id: productId, sellerId: seller?.id }, // Ensure seller can only access their own product
      include: {
        brand: true,
        categories: true,
        subcategories: true,
        productimage: true,
        productvariant: {
          include: {
            color: true,
            size: true,
            variantImages: true, //  include variant images
          },
        },

        materialCare: true,


        //  Updated for new schema (parent/child relation names)
        asParentRelations: {
          where: { relationType: "wear_with" },
          include: {
            child: {
              include: {
                productimage: true,
                brand: true,
              },
            },
          },
        },


      },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }


    // Extract "Wear With" related products
    const wearWith = product.asParentRelations.map((r: any) => r.child);
    delete product.asParentRelations;


    return NextResponse.json({
      success: true,
      data: { ...product, wearWith },
    });
  } catch (error) {
    console.error(" GET Product Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  const allowedRoles = ["seller"];

  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const seller = await prisma.seller.findUnique({
    where: { userId: userId },
  });

  try {
    const { id } = await context.params; // await the params
    const productId = Number(id);

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    const body = await req.json();


    // 3. Update main product
    const updated = await prisma.products.update({
      where: { id: productId, sellerId: seller?.id }, // Ensure seller can only update their own product
      data: {
        slug: body.slug.trim(),
        title: body.title,
        shortDescription: body.shortDescription,
        description: body.description,
        fitType: body.fitType,
        materialCareId: body.materialCareId
          ? parseInt(body.materialCareId)
          : null,
        costPrice: parseFloat(body.costPrice),
        sellingPrice: parseFloat(body.sellingPrice),
        discountPrice: body.discountPrice
          ? parseFloat(body.discountPrice)
          : null,
        baseQty: parseInt(body.baseQty),
        barcode: body.barcode,
        active: body.active ?? true,
        brandId: body.brandId ? parseInt(body.brandId) : null,
        categoryId: body.categoryId ? parseInt(body.categoryId) : null,
        subcategoryId: body.subcategoryId
          ? parseInt(body.subcategoryId)
          : null,

        soldHighlightDuration: body.soldHighlightDuration
          ? parseInt(body.soldHighlightDuration)
          : null,

        soldCount: body.soldCount
          ? parseInt(body.soldCount)
          : null,

        ambassadorId: body.ambassadorId
          ? parseInt(body.ambassadorId)
          : null,
      },

    });


    // --- UPDATE PRODUCT IMAGES ---
    await prisma.productimage.deleteMany({ where: { productId } });

    if (Array.isArray(body.images)) {
      await prisma.productimage.createMany({
        data: body.images.map((img: any) => ({
          url: img.url,
          alt: img.alt || "",
          colorId: img.colorId ? parseInt(img.colorId) : null,
          primary: img.primary ?? false,
          productId,
        })),
      });
    }


    // --- UPDATE / CREATE / REMOVE VARIANTS ---
    if (Array.isArray(body.variants)) {
      const existingVariantIds = (await prisma.productvariant.findMany({
        where: { productId },
        select: { id: true },
      })).map((v: any) => v.id);

      const receivedVariantIds = body.variants.filter((v: any) => v.id).map((v: any) => v.id);

      // DELETE variants not included anymore
      await prisma.productvariant.deleteMany({
        where: { productId, id: { notIn: receivedVariantIds } },
      });

      for (const v of body.variants) {

        // ---- VARIANT VIDEO VALIDATION ----
        if (v.videoUrl) {
          const lower = v.videoUrl.toLowerCase();

          if (!lower.endsWith(".mp4") && !lower.endsWith(".webm")) {
            return NextResponse.json(
              {
                success: false,
                message: "Only MP4 or WEBM videos are allowed for variants",
              },
              { status: 400 }
            );
          }

          if (v.videoSize && v.videoSize > 15 * 1024 * 1024) {
            return NextResponse.json(
              { success: false, message: "Variant video must be under 15MB" },
              { status: 400 }
            );
          }


        }




        if (v.id) {
          // UPDATE existing variant
          await prisma.productvariant.update({
            where: { id: v.id },
            data: {
              sku: v.sku,
              price: parseFloat(v.price),
              stock: parseInt(v.stock),
              isActive: v.isActive ?? true,
              // colorId: v.colorId ? parseInt(v.colorId) : null,
              // sizeId: v.sizeId ? parseInt(v.sizeId) : null,

              color: v.colorId
                ? { connect: { id: parseInt(v.colorId) } }
                : { disconnect: true },

              size: v.sizeId
                ? { connect: { id: parseInt(v.sizeId) } }
                : { disconnect: true },

              videoUrl: v.videoUrl || null,
              videoThumbnail: v.videoThumbnail || null,
            },
          });

          await prisma.variantImage.deleteMany({ where: { variantId: v.id } });

          if (Array.isArray(v.images)) {
            await prisma.variantImage.createMany({
              data: v.images.map((img: any) => ({
                url: img.url,
                alt: img.alt || "",
                variantId: v.id,
                productId,
              })),
            });
          }

        } else {
          // CREATE new variant
          const newVariant = await prisma.productvariant.create({
            data: {
              sku: v.sku,
              price: parseFloat(v.price),
              stock: parseInt(v.stock),
              isActive: v.isActive ?? true,
              // colorId: v.colorId ? parseInt(v.colorId) : null,
              // sizeId: v.sizeId ? parseInt(v.sizeId) : null,

              color: v.colorId
                ? { connect: { id: parseInt(v.colorId) } }
                : undefined,

              size: v.sizeId
                ? { connect: { id: parseInt(v.sizeId) } }
                : undefined,

              products: {
                connect: { id: productId },
              },

              videoUrl: v.videoUrl || null,
              videoThumbnail: v.videoThumbnail || null,

              // productId,
            },
          });

          if (Array.isArray(v.images)) {
            await prisma.variantImage.createMany({
              data: v.images.map((img: any) => ({
                url: img.url,
                alt: img.alt || "",
                variantId: newVariant.id,
                productId,
              })),
            });
          }
        }
      }
    }


    // Update Wear With relationships
    if (body.wearWith && Array.isArray(body.wearWith)) {
      // Remove old ones first (use parentId now)
      await prisma.productRelation.deleteMany({
        where: { parentId: productId, relationType: "wear_with" },
      });

      // Create new ones (use parentId/childId instead of productId/relatedId)
      if (body.wearWith.length > 0) {
        const relations = body.wearWith.map((childId: number) => ({
          parentId: productId,
          childId,
          relationType: "wear_with",
        }));
        await prisma.productRelation.createMany({ data: relations });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("PUT Product Error:", error);

    if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
      return NextResponse.json(
        {
          success: false,
          message: "Slug must be unique. This one already exists.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  }
}


// DELETE product (removes variant images too)
export async function DELETE(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  if (!user || user.role.name.toLowerCase() !== "seller") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  
  const seller = await prisma.seller.findUnique({
    where: { userId: userId },
  });

  try {
    const { id } = await context.params;
    const productId = Number(id);

    if (!productId) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const variantIds = await prisma.productvariant.findMany({
      where: { productId },
      select: { id: true },
    });

    const variantIdsList = variantIds.map((v: any) => v.id);
    if (variantIdsList.length > 0) {
      await prisma.variantImage.deleteMany({ where: { variantId: { in: variantIdsList } } });
    }

    await prisma.productvariant.deleteMany({ where: { productId } });
    await prisma.productimage.deleteMany({ where: { productId } });
    await prisma.products.delete({ where: { id: productId, sellerId: seller?.id } });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE Product Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
