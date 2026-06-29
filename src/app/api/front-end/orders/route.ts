import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";
import { sendOrderConfirmationEmail } from "@/lib/helpers/emailHelper";
import { generateCustomerInvoice } from "@/lib/utils/generateCustomerInvoice";
import { getAmbassadorForProduct } from "@/lib/helpers/ambassador";
import { stripe } from "@/lib/stripe";
import { validateStockInTransaction } from "@/lib/helpers/stockHelper";



const prisma: any = new PrismaClient();

//  CREATE NEW ORDER
export async function POST(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { payment, address, orderItems, coupon, charity, referral } = await req.json();

    if (!payment?.totalAmount || !orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // 0️. Backend Price Validation
    let calculatedItemsTotal = 0;
    for (const item of orderItems) {
      const dbVariant = await prisma.productvariant.findUnique({
        where: { id: item.variantId },
        select: { price: true, productId: true },
      });

      if (!dbVariant) {
        return NextResponse.json({ success: false, message: `Variant ${item.variantId} not found.` }, { status: 400 });
      }

      // If variant price is 0, fallback to product price
      let unitPrice = dbVariant.price;
      if (unitPrice === 0) {
        const dbProduct = await prisma.products.findUnique({
          where: { id: dbVariant.productId },
          select: { sellingPrice: true }
        });
        unitPrice = dbProduct?.sellingPrice || 0;
      }

      calculatedItemsTotal += unitPrice * item.quantity;
    }

    // Re-calculate discounts and charity to get final expected total
    // (Logic copied from later steps to ensure consistency)
    let tempFinalDiscountTotal = 0;
    let tempCouponData = null;
    if (coupon?.code) {
      tempCouponData = await prisma.coupon.findUnique({ where: { code: coupon.code } });
    }

    let tempReferralAffiliate = null;
    let tempReferralAffiliateDiscount = 0;
    if (referral?.affiliateId) {
      tempReferralAffiliate = await prisma.affiliate.findUnique({ where: { id: referral.affiliateId }, select: { shareCommission: true } });
      if (tempReferralAffiliate) {
        tempReferralAffiliateDiscount = (calculatedItemsTotal * tempReferralAffiliate.shareCommission) / 100;
      }
    }

    const tempCouponDiscount = coupon?.discountAmount ?? 0; // We still trust the coupon discount amount from frontend for now, or we could re-calculate it.
    // To be even safer, we should re-calculate coupon discount too, but that depends on coupon type (fixed vs percentage).

    if (tempCouponData && tempReferralAffiliate) {
      tempFinalDiscountTotal = Math.max(tempCouponDiscount, tempReferralAffiliateDiscount);
    } else if (tempCouponData) {
      tempFinalDiscountTotal = tempCouponDiscount;
    } else if (tempReferralAffiliate) {
      tempFinalDiscountTotal = tempReferralAffiliateDiscount;
    }

    const expectedTotal = calculatedItemsTotal - tempFinalDiscountTotal + (parseFloat(charity?.amount || "0"));

    // Check if difference is more than 0.01 (handling floating point issues)
    if (Math.abs(expectedTotal - payment.totalAmount) > 0.01) {
      console.error(`Price mismatch: Expected ${expectedTotal}, Got ${payment.totalAmount}`);
      return NextResponse.json(
        { success: false, message: "Price mismatch detected. Please refresh your cart." },
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


    //------------------------------------------------------
    // REFERRAL DISCOUNT LOGIC
    //------------------------------------------------------
    let referralAffiliate = null;
    let referralAffiliateDiscount = 0;

    // frontend MUST send: referral: { affiliateId, discount }
    if (referral?.affiliateId) {
      referralAffiliate = await prisma.affiliate.findUnique({
        where: { id: referral.affiliateId },
        select: { id: true, shareCommission: true }
      });

      if (referralAffiliate) {
        referralAffiliateDiscount = referral?.discount || 0;
      }
    }

    //------------------------------------------------------
    // WHICH DISCOUNT IS APPLIED — COUPON OR REFERRAL?
    // Rule: Apply ONLY THE HIGHER DISCOUNT
    //------------------------------------------------------
    let finalDiscountTotal = 0;
    let discountSource = null; // "coupon" or "referral"
    let finalAffiliateId = null; // which affiliate to credit?

    const couponDiscount = coupon?.discountAmount ?? 0;

    if (couponData && referralAffiliate) {
      if (couponDiscount >= referralAffiliateDiscount) {
        // COUPON WINS
        finalDiscountTotal = couponDiscount;
        discountSource = "coupon";
        finalAffiliateId = couponData.affiliateId; // coupon owner
      } else {
        // REFERRAL WINS
        finalDiscountTotal = referralAffiliateDiscount;
        discountSource = "referral";
        finalAffiliateId = referralAffiliate.id; // referral owner
      }
    }
    else if (couponData) {
      finalDiscountTotal = couponDiscount;
      discountSource = "coupon";
      finalAffiliateId = couponData.affiliateId;
    }
    else if (referralAffiliate) {
      finalDiscountTotal = referralAffiliateDiscount;
      discountSource = "referral";
      finalAffiliateId = referralAffiliate.id;
    }


    // ================================
    //  AFFILIATE LOGIC
    // ================================
    // Determine affiliate (if coupon belongs to one)
    // let affiliateId = null;
    let affiliateId = finalAffiliateId;
    let affiliateCommission = null;
    let affiliateEarning = null;



    if (affiliateId) {
      const affiliateInfo = await prisma.affiliate.findUnique({
        where: { id: affiliateId },
        select: { baseCommission: true },
      });

      affiliateCommission = affiliateInfo?.baseCommission ?? 0;

      // calculate the commission on order items
      const itemsTotal = calculatedItemsTotal;

      const earningBeforeDiscount = (itemsTotal * affiliateCommission) / 100;

      // apply ONLY the selected (winning) discount
      const earningAfterDiscount = earningBeforeDiscount - finalDiscountTotal;

      affiliateEarning = Number(Math.max(earningAfterDiscount, 0).toFixed(2));
    }

    // ============================
    // PLATFORM COMMISSION
    // ============================
    const platform = await prisma.platformSettings.findFirst();
    const platformCommission = platform?.defaultCommissionValue || 0;
    // ==========================================================
    //  AMBASSADOR and SELLER LOGIC — PER PRODUCT
    // ==========================================================
    const orderItemsWithSeller = [];

    for (const item of orderItems) {
      const ambassadorInfo: any = await getAmbassadorForProduct(item.productId);

      const product = await prisma.products.findUnique({
        where: { id: item.productId },
        include: {
          seller: true,
          categories: true,
          subcategories: true
        }
      });

      if (!product) continue;

      const dbVariant = await prisma.productvariant.findUnique({
        where: { id: item.variantId },
        select: { price: true }
      });

      const unitPrice = dbVariant?.price || product.sellingPrice;
      const subtotal = unitPrice * item.quantity;

      // ============================
      // 1. SELLER COMMISSION
      // ============================
      const sellerCommission = product?.seller?.commissionValue || 0;

      // ============================
      // 2. PRODUCT COMMISSION
      // ============================
      const productCommission = product?.commissionValue || 0;

      // ============================
      // 3. CATEGORY / SUBCATEGORY
      // ============================
      let categoryCommission = 0;

      if (product.categoryId) {
        const cat = await prisma.categoryCommission.findUnique({
          where: { categoryId: product.categoryId },
        });

        if (cat && cat.isActive) {
          categoryCommission = cat.commission;
        } else if (product.subcategoryId) {
          const sub = await prisma.subcategoryCommission.findUnique({
            where: { subcategoryId: product.subcategoryId },
          });

          if (sub && sub.isActive) {
            categoryCommission = sub.commission;
          }
        }
      }


      // ============================
      //  TOTAL COMMISSION %
      // ============================
      const totalPercent =
        sellerCommission +
        productCommission +
        categoryCommission +
        platformCommission;

      // ============================
      //  TOTAL AMOUNT
      // ============================
      const commissionAmount = Number(
        ((subtotal * totalPercent) / 100).toFixed(2)
      );

      const sellerEarning = Number(
        (subtotal - commissionAmount).toFixed(2)
      );

      const payoutDays = product?.seller?.payoutDays || 30;

      const payoutEligibleAt = new Date();
      payoutEligibleAt.setDate(payoutEligibleAt.getDate() + payoutDays);

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

        const earningBeforeDiscount = (calculatedItemsTotal * affiliateCommission) / 100;

        // const discountAmount = coupon?.discountAmount ?? 0;

        // const earningAfterDiscount = earningBeforeDiscount - discountAmount;

        // const finalAffiliateEarning = earningAfterDiscount * proportion;

        // use ONLY the final winning discount
        const earningAfterDiscount = earningBeforeDiscount - finalDiscountTotal;

        // split proportionally by item
        const finalAffiliateEarning = earningAfterDiscount * proportion;


        affiliateItemEarning = Number(Math.max(finalAffiliateEarning, 0).toFixed(2));
      }



      // ================= new calculate the affiliating earning on per order item end ==============





      orderItemsWithSeller.push({
        productId: item.productId,
        variantId: item.variantId,
        colorId: item.colorId,
        sizeId: item.sizeId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,

        // Seller/Commission
        sellerId: product?.sellerId || 1, // Fallback if no seller found
        // IMPORTANT SNAPSHOT
        commissionType: "percentage",
        commissionValue: totalPercent,
        commissionAmount: commissionAmount,
        sellerEarning: sellerEarning,

        payoutDays,
        payoutEligibleAt,

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
    const firstItemWithAmbassador = orderItemsWithSeller.find(
      (i) => i.ambassadorId
    );

    const ambassadorIdForOrder = firstItemWithAmbassador?.ambassadorId || null;

    // ==========================================================
    //  VALIDATE STOCK AVAILABILITY (ATOMIC TRANSACTION)
    // ==========================================================
    try {
      await validateStockInTransaction(
        orderItems.map((item: any) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        }))
      );
    } catch (stockError: any) {
      return NextResponse.json(
        {
          success: false,
          message: stockError.message || "Insufficient stock for one or more items",
        },
        { status: 400 }
      );
    }

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
        transactionId: payment.transactionId,

        status: (payment.paymentStatus || "paid").toLowerCase(),

        paymentResponse: payment.paymentResponse,

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

        // discountTotal: coupon?.discountAmount ?? 0,

        // Coupon data (if applied)
        couponId: couponData?.id || null,
        couponCode: couponData?.code || null,
        // couponDiscount: coupon?.discountAmount ?? 0,
        // affiliateId: affiliateId,
        affiliateCommission: affiliateCommission,
        affiliateEarning: affiliateEarning,


        // FINAL DECISION
        affiliateId: finalAffiliateId,   // << important
        discountTotal: finalDiscountTotal,

        couponDiscount:
          discountSource === "coupon"
            ? finalDiscountTotal
            : 0,

        referralDiscount:
          discountSource === "referral"
            ? finalDiscountTotal
            : 0,


        //  NEW — Order-level ambassador tracking
        ambassadorId: ambassadorIdForOrder,
        ambassadorPaid: false,

        charityAmount: charity?.amount || 0,

        //  INSERT order items WITH seller fields
        orderItems: {
          create: orderItemsWithSeller,
        },

      },
      include: { orderItems: true },
    });

    // -------------------------------------------------------
    // UPDATE STRIPE METADATA
    // -------------------------------------------------------
    if (payment.paymentMethod === "stripe" && payment.transactionId) {
      await stripe.paymentIntents.update(payment.transactionId, {
        metadata: {
          orderId: newOrder.id.toString(),
          userId: newOrder.userId.toString(),
        },
      });
    }



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
          transactionId: payment.transactionId,
          paymentMethod: payment.paymentMethod,
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
