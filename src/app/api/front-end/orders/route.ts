import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";
import { sendOrderConfirmationEmail } from "@/lib/helpers/emailHelper";
import { generateCustomerInvoice } from "@/lib/utils/generateCustomerInvoice";
import { getAmbassadorForProduct } from "@/lib/helpers/ambassador";


const prisma: any = new PrismaClient();

//  CREATE NEW ORDER
export async function POST(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { payment, address, orderItems, coupon, charity } = await req.json();

    if (!payment?.totalAmount || !orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // 1️. Optional: validate coupon again before saving
    let couponData = null;
    if (coupon?.code) {
      couponData = await prisma.coupon.findUnique({
        where: { code: coupon.code },
      });

      if (!couponData || !couponData.isActive) {
        return NextResponse.json(
          { message: "Invalid or inactive coupon." },
          { status: 400 }
        );
      }
    }

    // ================================
    //  AFFILIATE LOGIC
    // ================================
    // Determine affiliate (if coupon belongs to one)
    let affiliateId = null;
    let affiliateCommission = null;
    let affiliateEarning = null;

    if (couponData?.affiliateId) {
      affiliateId = couponData.affiliateId;


      // Get affiliate account to read the current commission %
      const affiliateInfo = await prisma.affiliate.findUnique({
        where: { id: affiliateId },
        select: { baseCommission: true }, // ex: 7% or 10%
      });


      // affiliateCommission = affiliateInfo?.baseCommission ?? 0; // % at order time
      // affiliateEarning = (payment.totalAmount * affiliateCommission) / 100; // £ earned

      affiliateCommission = affiliateInfo?.baseCommission ?? 0;

      const itemsTotal = payment.itemsTotal ?? 0;
      const discountAmount = coupon?.discountAmount ?? 0;

      // Apply percentage first, then subtract discount
      const earningBeforeDiscount = (itemsTotal * affiliateCommission) / 100;
      const finalEarning = earningBeforeDiscount - discountAmount;

      // Avoid negative commission
      // affiliateEarning = Math.max(finalEarning, 0);
      affiliateEarning = Number(Math.max(finalEarning, 0).toFixed(2));
    }

    // ==========================================================
    //  AMBASSADOR LOGIC — PER PRODUCT
    // ==========================================================
    const orderItemsWithAmbassador = [];

    for (const item of orderItems) {
      const ambassadorInfo: any = await getAmbassadorForProduct(item.productId);

      let ambassadorEarning = null;

      if (ambassadorInfo.isAmbassadorProduct) {
        ambassadorEarning = Number(
          ((item.subtotal * ambassadorInfo.commissionPercent) / 100).toFixed(2)
        );
      }




      // ================= new calculate the affiliating earning on per order item start ==============

      const totalItemValue = orderItems.reduce((sum: any, item: any) => sum + item.subtotal, 0);

      let affiliateItemEarning = null;

      if (affiliateId && affiliateCommission) {

        const itemValue = item.subtotal;

        // proportion of affiliate earning for this item
        const proportion = itemValue / totalItemValue;

        const earningBeforeDiscount = (payment.itemsTotal * affiliateCommission) / 100;

        const discountAmount = coupon?.discountAmount ?? 0;

        const earningAfterDiscount = earningBeforeDiscount - discountAmount;

        const finalAffiliateEarning = earningAfterDiscount * proportion;

        affiliateItemEarning = Number(Math.max(finalAffiliateEarning, 0).toFixed(2));
      }



      // ================= new calculate the affiliating earning on per order item end ==============





      orderItemsWithAmbassador.push({
        productId: item.productId,
        variantId: item.variantId,
        colorId: item.colorId,
        sizeId: item.sizeId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,

        affiliateEarning: affiliateItemEarning,

        // from common function
        ambassadorId: ambassadorInfo.ambassadorId,
        ambassadorCommission: ambassadorInfo.commissionPercent,
        ambassadorEarning,
        ambassadorPaid: false,
      });
    }

    // ==========================================================
    //  OPTIONAL: SAVE ORDER-LEVEL AMBASSADOR (first found)
    // ==========================================================
    const firstItemWithAmbassador = orderItemsWithAmbassador.find(
      (i) => i.ambassadorId
    );

    const ambassadorIdForOrder = firstItemWithAmbassador?.ambassadorId || null;


    // ===============================
    //  CREATE ORDER
    // ===============================
    const newOrder = await prisma.orders.create({
      data: {
        userId: Number(userId),

        //  Payment Info
        totalAmount: payment.totalAmount,
        itemsTotal: payment.itemsTotal,
        subtotal: payment.subtotal,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.paypalOrderId,
        status: (payment.paymentStatus || "completed").toLowerCase(),
        paypalResponse: payment.paypalResponse,

        //  Address Snapshot
        addressId: address.id,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        country: address.country,
        postalCode: address.postalCode,
        phone: address.phone,

        discountTotal: coupon?.discountAmount ?? 0,

        // Coupon data (if applied)
        couponId: couponData?.id || null,
        couponCode: couponData?.code || null,
        couponDiscount: coupon?.discountAmount ?? 0,
        affiliateId: affiliateId,
        affiliateCommission: affiliateCommission,
        affiliateEarning: affiliateEarning,

        //  NEW — Order-level ambassador tracking
        ambassadorId: ambassadorIdForOrder,
        ambassadorPaid: false,


        //  Order Items
        // orderItems: {
        //   create: orderItems.map((item: any) => ({
        //     productId: item.productId,
        //     variantId: item.variantId,
        //     colorId: item.colorId,
        //     sizeId: item.sizeId,
        //     quantity: item.quantity,
        //     price: item.price,
        //     subtotal: item.subtotal,
        //   })),
        // },

        charityAmount: charity?.amount || 0,

        //  INSERT order items WITH ambassador fields
        orderItems: {
          create: orderItemsWithAmbassador,
        },

      },
      include: { orderItems: true },
    });

    // -------------------------------
    // Charity donation
    // -------------------------------
    // Store donation in CharityDonations table
    if (charity?.amount && charity.amount > 0) {
      const donationRecord = await prisma.charityDonations.create({
        data: {
          name: charity?.anonymous ? null : charity?.name,
          email: charity?.email,
          amount: charity.amount,
          anonymous: charity?.anonymous || false,
          transactionId: payment.paypalOrderId,
          paymentMethod: "paypal",
          paymentStatus: payment.paymentStatus || "completed",

          //  IMPORTANT — link donation to order
          orderId: newOrder.id,
        },
      });

      // Link donation to this specific order
      await prisma.orders.update({
        where: { id: newOrder.id },
        data: {
          charityDonationId: donationRecord.id,
        }
      });

    }


    //  Generate invoice
    const invoice: any = await generateCustomerInvoice(newOrder.id);

    //  Increment coupon usage count
    if (couponData) {
      await prisma.coupon.update({
        where: { id: couponData.id },
        data: {
          usageCount: { increment: 1 },
        },
      });
    }


    // 2️. Fetch user info for email
    const user = await prisma.users.findUnique({
      where: { id: Number(userId) },
      select: { name: true, email: true },
    });

    // 3️. Send confirmation email
    const emailResult = await sendOrderConfirmationEmail(user.email, {
      name: user.name,
      orderId: newOrder.id,
      total: payment.totalAmount,
      invoiceNumber: invoice?.invoiceNumber,
      invoiceUrl: invoice?.invoiceUrl,
      address: `${address.address1}, ${address.city}, ${address.country}, ${address.postalCode}`,
      userId: user.id,
      charityAmount: charity?.amount ?? 0

    });


    return NextResponse.json({
      success: true,
      emailResult: emailResult,
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    console.error("POST Orders Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order." },
      { status: 500 }
    );
  }
}

//  GET ALL ORDERS FOR USER (with selectedVariantData)
export async function GET(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all orders with nested data
    const orders = await prisma.orders.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                productimage: true,
                productvariant: {
                  include: {
                    color: true,
                    size: true,
                    variantImages: true, //  include variant images here
                  },
                },
              },
            },
          },
        },
      },
    });

    //  Enrich orderItems like single order API
    const enrichedOrders = orders.map((order: any) => ({
      ...order,
      orderItems: order.orderItems.map((item: any) => {
        const selectedVariant = item.product.productvariant.find(
          (variant: any) => variant.id === item.variantId
        );

        const selectedVariantData = selectedVariant
          ? {
            id: selectedVariant.id,
            sizeId: selectedVariant.sizeId,
            colorId: selectedVariant.colorId,
            sizeName: selectedVariant.size?.name || null,
            colorName: selectedVariant.color?.name || null,
            hexCode: selectedVariant.color?.hexCode || null,
            price: selectedVariant.price,
            variantImages: selectedVariant.variantImages || [],
          }
          : null;

        return {
          ...item,
          selectedVariantData,
          reviewed: item.reviewed,
        };
      }),
    }));

    return NextResponse.json({
      success: true,
      data: enrichedOrders,
    });
  } catch (error) {
    console.error("GET Orders Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}
