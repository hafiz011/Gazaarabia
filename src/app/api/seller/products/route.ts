import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";
import crypto from 'crypto';
const prisma = new PrismaClient();


export async function GET(request: NextRequest) {
  try {
    /* ================= AUTH ================= */
    // const token: any = getTokenFromHeader(request);
    // const userId = getUserIdFromToken(token);
    const userId = await checkAuth(request);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || user.role?.name.toLowerCase() !== "seller") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const seller = await prisma.seller.findUnique({
      where: { userId: userId },
    });

    try {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get("search") || "";
      // const page = parseInt(searchParams.get("page") || "1");
      // const pageSize = parseInt(searchParams.get("pageSize") || "20");

      const where = search
        ? { title: { contains: search } }
        : {};

      const [totalCount, productsRaw, globalStats] = await Promise.all([
        prisma.products.count({ where: { ...where, sellerId: seller?.id } }),
        prisma.products.findMany({
          where: { ...where, sellerId: seller?.id },
          include: {
            brand: true,
            categories: true,
            subcategories: true,
            productimage: true,
            productvariant: true,
            reviews: {
              select: { rating: true }
            },
            orderItems: {
              select: { quantity: true }
            }
          },
          orderBy: { createdAt: "desc" },
        }),
        // Calculate global aggregates for cards
        prisma.$transaction(async (tx) => {
          const variants = await tx.productvariant.aggregate({
            where: { products: { sellerId: seller?.id } },
            _sum: { stock: true }
          });

          const orderItems = await tx.orderItem.aggregate({
            where: { product: { sellerId: seller?.id } },
            _sum: { quantity: true }
          });

          const reviews = await tx.review.aggregate({
            where: { product: { sellerId: seller?.id } },
            _avg: { rating: true },
            _count: { id: true }
          });

          return {
            totalStock: variants._sum.stock || 0,
            totalSold: orderItems._sum.quantity || 0,
            averageRating: reviews._avg.rating ? Number(reviews._avg.rating.toFixed(1)) : 0,
            totalReviews: reviews._count.id
          };
        })
      ]);

      // Calculate per-product stats
      const products = productsRaw.map(p => {
        const totalStock = p.productvariant.reduce((acc, v) => acc + (v.stock || 0), 0);
        const totalSold = p.orderItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
        const totalReviews = p.reviews.length;
        const averageRating = totalReviews > 0 
          ? Number((p.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
          : 0;

        return {
          ...p,
          totalStock,
          totalSold,
          averageRating,
          totalReviews
        };
      });

      return NextResponse.json({
        success: true,
        total: totalCount,
        stats: globalStats,
        data: products,
      });
    } catch (error) {
      console.error("GET Products Error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch products" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching seller products:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}


// create products for seller
export async function POST(request: NextRequest) {
  const userId = await checkAuth(request);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  if (!user || user.role?.name.toLowerCase() !== "seller") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }


  const seller = await prisma.seller.findUnique({
    where: { userId: userId }
  })

  if (!seller) {
    return NextResponse.json(
      { error: "Seller profile not found" },
      { status: 404 }
    )
  }


  try {
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { success: false, message: "Title is required." },
        { status: 400 }
      );
    }


    const slug = `${body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}-${crypto.randomUUID().split("-")[0]}`;

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
        // sellerId: userId, // Associate product with the authenticated seller
        sellerId: seller.id, // Associate product with the authenticated seller
        slug: slug,
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
