import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

// GET all products with search and pagination (Protected)
export async function GET(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  const allowedRoles = ["admin"];

  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }


  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    // const page = parseInt(searchParams.get("page") || "1");
    // const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where = search
      ? { title: { contains: search } }
      : {};

    const [total, products] = await Promise.all([
      prisma.products.count({ where }),
      prisma.products.findMany({
        where,
        // skip: (page - 1) * pageSize,
        // take: pageSize,
        include: {
          brand: true,
          categories: true,
          subcategories: true,
          productimage: true,
          productvariant: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      total,
      // page,
      // pageSize,
      data: products,
    });
  } catch (error) {
    console.error("GET Products Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  const allowedRoles = ["admin"];

  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }


  try {
    const body = await req.json();

    if (!body.slug || !body.title) {
      return NextResponse.json(
        { success: false, message: "Slug and Title are required." },
        { status: 400 }
      );
    }

    if (body.title.length < 5 || body.title.length > 70) {
      return NextResponse.json(
        {
          success: false,
          message: "Product title must be between 5 and 70 characters",
        },
        { status: 400 }
      );
    }


    // ---- VARIANT VIDEO VALIDATION (BEFORE DB CALL) ----
    if (Array.isArray(body.variants)) {
      for (const v of body.variants) {
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
              {
                success: false,
                message: "Variant video must be under 15MB",
              },
              { status: 400 }
            );
          }
        }
      }
    }


    //  Create product with nested variants and variant images
    const product = await prisma.products.create({
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


        // Highlight duration & sold count
        soldHighlightDuration: body.soldHighlightDuration
          ? parseInt(body.soldHighlightDuration)
          : null,

        soldCount: body.soldCount
          ? parseInt(body.soldCount)
          : null,

        // Ambassador assignment
        ambassadorId: body.ambassadorId
          ? parseInt(body.ambassadorId)
          : null,


        //  Product Images
        productimage: {
          create:
            body.images?.map((img: any) => ({
              url: img.url,
              alt: img.alt || "",
              colorId: img.colorId ? parseInt(img.colorId) : null,
              primary: img.primary ?? false,
            })) || [],
        },

        // Variants with nested variant images (including productId)
        productvariant: {
          create:
            body.variants?.map((v: any) => ({
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


              // VIDEO
              videoUrl: v.videoUrl || null,
              videoThumbnail: v.videoThumbnail || null,

              variantImages: {
                create:
                  v.images?.map((img: any) => ({
                    url: img.url,
                    alt: img.alt || "",
                    // Include productId directly during creation
                    productId: undefined,
                  })) || [],
              },
            })) || [],
        },
      },
      include: {
        productimage: true,
        productvariant: {
          include: {
            variantImages: true,
          },
        },
      },
    });

    // Now update variant images with the correct productId (since we only know it after creation)
    if (product?.productvariant?.length) {
      const updatePromises = product.productvariant.flatMap((variant: any) =>
        variant.variantImages.map((img: any) =>
          prisma.variantImage.update({
            where: { id: img.id },
            data: { productId: product.id }, //  assign the actual product ID
          })
        )
      );

      await Promise.all(updatePromises);
    }

    //  Refetch final product with updated images
    const finalProduct = await prisma.products.findUnique({
      where: { id: product.id },
      include: {
        productimage: true,
        productvariant: {
          include: { variantImages: true },
        },
      },
    });


    //  NEW: Save Wear With relationships
    if (body.wearWith && Array.isArray(body.wearWith) && body.wearWith.length > 0) {
      const relations = body.wearWith.map((relatedId: number) => ({
        productId: product.id,
        relatedId,
        relationType: "wear_with",
      }));
      await prisma.productRelation.createMany({ data: relations });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: finalProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(" POST products error:", error);

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
      { success: false, message: "Failed to create product" },
      { status: 500 }
    );
  }
}
