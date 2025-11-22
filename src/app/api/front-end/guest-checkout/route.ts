import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { generateCustomerInvoice } from "@/lib/utils/generateCustomerInvoice";
import { sendSubscribeConfirmationEmail } from "@/lib/helpers/emailHelper";
import { getAmbassadorForProduct } from "@/lib/helpers/ambassador";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * @route POST /api/front-end/guest-checkout
 * @desc Create a guest user (if needed), save delivery address, place order, and send confirmation email
 */
export async function POST(req: NextRequest) {
  try {
    const { address, orderItems, payment, coupon, charity, referral } = await req.json();

    // Validate required fields
    if (
      !address?.email ||
      !address?.firstName ||
      !address?.address1 ||
      !orderItems?.length ||
      !payment?.totalAmount
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // 1️. Validate coupon if sent
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
        finalAffiliateId = couponData.affiliateId;
      } else {
        // REFERRAL WINS
        finalDiscountTotal = referralAffiliateDiscount;
        discountSource = "referral";
        finalAffiliateId = referralAffiliate.id;
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


    let affiliateId = finalAffiliateId;
    let affiliateCommission = null;
    let affiliateEarning = null;

    if (affiliateId) {
      const affiliateInfo = await prisma.affiliate.findUnique({
        where: { id: affiliateId },
        select: { baseCommission: true },
      });

      affiliateCommission = affiliateInfo?.baseCommission ?? 0;

      const itemsTotal = payment.itemsTotal ?? 0;

      const earningBeforeDiscount = (itemsTotal * affiliateCommission) / 100;

      // apply ONLY the selected (winning) discount
      const earningAfterDiscount = earningBeforeDiscount - finalDiscountTotal;

      affiliateEarning = Number(Math.max(earningAfterDiscount, 0).toFixed(2));
    }


    // 3️. Find or create user
    let user = await prisma.users.findUnique({
      where: { email: address.email },
    });

    let generatedPassword: string | null = null;

    if (!user) {
      generatedPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      const defaultRole = await prisma.roles.findFirst({
        where: { name: "Customer" },
      });

      user = await prisma.users.create({
        data: {
          name: `${address.firstName} ${address.lastName || ""}`.trim(),
          email: address.email,
          phone: address.phone || "",
          password: hashedPassword,
          roleId: defaultRole?.id ?? 1,
          isGuest: true,
        },
      });
    }


    // -------------------------------------------
    // 3.1 Ensure user has a Stripe Customer ID
    // -------------------------------------------
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name
      });

      await prisma.users.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id }
      });

      // Also add it to local user object for next steps
      user.stripeCustomerId = customer.id;
    }



    // 4️. Save delivery address
    const deliveryAddress = await prisma.address.create({
      data: {
        userId: user.id,
        firstName: address.firstName,
        lastName: address.lastName || "",
        company: address.company || null,
        address1: address.address1,
        address2: address.address2 || null,
        city: address.city,
        country: address.country,
        postalCode: address.postalCode,
        phone: address.phone,
        isDefault: true,
      },
    });



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

        // const discountAmount = coupon?.discountAmount ?? 0;

        // const earningAfterDiscount = earningBeforeDiscount - discountAmount;

        // use ONLY the final winning discount
        const earningAfterDiscount = earningBeforeDiscount - finalDiscountTotal;


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
        userId: Number(user.id),

        //  Payment Info
        totalAmount: payment.totalAmount,
        itemsTotal: payment.itemsTotal,
        subtotal: payment.subtotal,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        status: (payment.paymentStatus || "completed").toLowerCase(),
        paymentResponse: payment.paymentResponse,

        //  Address Snapshot
        addressId: deliveryAddress.id,
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


        discountTotal: finalDiscountTotal,

        couponDiscount:
          discountSource === "coupon"
            ? finalDiscountTotal
            : 0,

        referralDiscount:
          discountSource === "referral"
            ? finalDiscountTotal
            : 0,

        affiliateId: finalAffiliateId,



        affiliateCommission: affiliateCommission,
        affiliateEarning: affiliateEarning,

        //  NEW — Order-level ambassador tracking
        ambassadorId: ambassadorIdForOrder,
        ambassadorPaid: false,

        charityAmount: charity?.amount || 0,

        //  INSERT order items WITH ambassador fields
        orderItems: {
          create: orderItemsWithAmbassador,
        },

      },
      include: { orderItems: true },
    });


    // 5️. Create order with coupons + affiliate fields
    // const newOrder = await prisma.orders.create({
    //   data: {
    //     userId: user.id,
    //     addressId: deliveryAddress.id,

    //     totalAmount: payment.totalAmount,
    //     itemsTotal: payment.itemsTotal,
    //     subtotal: payment.subtotal,
    //     paymentMethod: payment.paymentMethod,
    //     transactionId: payment.paypalOrderId,
    //     status: (payment.paymentStatus || "completed").toLowerCase(),
    //     paypalResponse: payment.paypalResponse,

    //     firstName: address.firstName,
    //     lastName: address.lastName,
    //     company: address.company,
    //     address1: address.address1,
    //     address2: address.address2,
    //     city: address.city,
    //     country: address.country,
    //     postalCode: address.postalCode,
    //     phone: address.phone,

    //     discountTotal: coupon?.discountAmount ?? 0,

    //     //  Coupon Fields
    //     couponId: couponData?.id || null,
    //     couponCode: couponData?.code || null,
    //     couponDiscount: coupon?.discountAmount ?? 0,

    //     // Affiliate Fields
    //     affiliateId,
    //     affiliateCommission,
    //     affiliateEarning,

    //     orderItems: {
    //       create: orderItems.map((item: any) => ({
    //         productId: item.productId,
    //         variantId: item.variantId,
    //         colorId: item.colorId,
    //         sizeId: item.sizeId,
    //         quantity: item.quantity,
    //         price: item.price,
    //         subtotal: item.subtotal,
    //       })),
    //     },

    //     charityAmount: charity?.amount || 0,

    //   },
    //   include: { orderItems: true },
    // });


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




    let donationRecord = null;

    if (charity?.amount && charity.amount > 0) {
      donationRecord = await prisma.charityDonations.create({
        data: {
          name: charity?.anonymous ? null : charity?.name,
          email: address.email,
          amount: charity.amount,
          anonymous: charity?.anonymous || false,
          transactionId: payment.transactionId,
          paymentMethod: payment?.paymentMethod,
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


    // 5.5 Generate Invoice PDF
    const invoice: any = await generateCustomerInvoice(newOrder.id);


    // 6️. Increment coupon usage
    if (couponData) {
      await prisma.coupon.update({
        where: { id: couponData.id },
        data: { usageCount: { increment: 1 } },
      });
    }

    // 7️. Send email confirmation
    const emailResult = await sendGuestOrderEmail(user.email, {
      name: user.name,
      orderId: newOrder.id,
      total: payment.totalAmount,
      address: `${address.address1}, ${address.city}, ${address.country}, ${address.postalCode}`,
      generatedPassword,
      invoiceNumber: invoice?.invoiceNumber,
      invoiceUrl: invoice?.invoiceUrl,
      charityAmount: charity?.amount ?? 0
    });


    // 3.5 SUBSCRIBE: create only if not exists, otherwise update (no email on update)
    const subEmail = address.email;
    const subscriberExists = await prisma.subscriber.findUnique({
      where: { email: subEmail },
    });

    if (!subscriberExists) {
      // create and send email
      const newSubscriber = await prisma.subscriber.create({
        data: {
          email: subEmail,
          name: `${address.firstName} ${address.lastName || ""}`.trim(),
          phone: address.phone || "",
          isActive: true,
        },
      });

      // send confirmation email only when newly created
      await sendSubscribeConfirmationEmail({
        to: newSubscriber.email,
        name: newSubscriber.name || undefined,
      });
    } else {
      // update existing subscriber (no email)
      await prisma.subscriber.update({
        where: { email: subEmail },
        data: {
          name: `${address.firstName} ${address.lastName || ""}`.trim(),
          phone: address.phone || "",
          isActive: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Guest order placed successfully",
      data: { user, order: newOrder, orderEmail: emailResult },
    });
  } catch (err: any) {
    console.error("Guest Checkout Error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to process guest checkout." },
      { status: 500 }
    );
  }
}

/**
 *  Helper: Send guest order confirmation email
 */

export async function sendGuestOrderEmail(
  to: string,
  details: {
    name: string;
    orderId: number;
    total: number;
    address: string;
    generatedPassword?: string | null;
    invoiceNumber?: string | null;
    invoiceUrl?: string | null;
    charityAmount?: number;
  }
) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const domain = process.env.DOMAIN;
    const logoUrl =
      "https://drive.google.com/uc?export=view&id=12-EA3sW2FQVQU77-roeITSncjskWChiT";

    const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;background-color:#f7f7f7;padding:50px 0;color:#111827;">
      <table align="center" cellpadding="0" cellspacing="0" width="640"
        style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr>
          <td style="background-color:#ffffff;text-align:center;padding:30px 0;border-bottom:4px solid #009639;">
            <img 
              src="${logoUrl}" 
              alt="Gazaarabia" 
              width="200" 
              style="display:block;margin:0 auto;max-width:220px;"
            />
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:45px 50px;">
            <h2 style="margin:0 0 25px;font-size:22px;font-weight:600;color:#111827;">
              Thank You for Your Order!
            </h2>
            <p style="font-size:15px;line-height:1.7;margin:0 0 25px;color:#374151;">
              Hi <strong>${details.name || "there"}</strong>,  
              your order <strong>#${details.orderId}</strong> has been placed successfully.
            </p>

            <table cellpadding="10" cellspacing="0" width="100%" 
              style="margin:15px 0 30px;border-collapse:collapse;font-size:15px;color:#111827;border:1px solid #EAEAEA;border-radius:8px;">
              <tr style="background-color:#f9fafb;">
                <td style="width:35%;font-weight:600;color:#374151;">Order ID:</td>
                <td>#${details.orderId}</td>
              </tr>
              <tr>
                <td style="background-color:#ffffff;font-weight:600;color:#374151;">Customer Name:</td>
                <td>${details.name}</td>
              </tr>
              <tr style="background-color:#f9fafb;">
                <td style="font-weight:600;color:#374151;">Total Amount:</td>
                <td style="color:#E82C3F;font-weight:600;">£${details.total.toFixed(2)}</td>
              </tr>
              ${details.charityAmount && details.charityAmount > 0 ? `
                <tr>
                  <td style="background-color:#ffffff;font-weight:600;color:#374151;">Charity Donation:</td>
                  <td style="color:#009639;font-weight:600;">£${details.charityAmount.toFixed(2)}</td>
                </tr>` : ""}

              <tr>
                <td style="background-color:#ffffff;font-weight:600;color:#374151;">Delivery Address:</td>
                <td style="line-height:1.7;">${details.address}</td>
              </tr>
            </table>

            ${details.generatedPassword
        ? `
              <div style="background:#f9fafb;border-radius:10px;padding:20px 25px;margin-top:30px;">
                <h3 style="margin:0 0 12px;font-size:18px;color:#111827;">Your Account Has Been Created</h3>
                <p style="font-size:15px;line-height:1.8;margin:0 0 16px;color:#374151;">
                  We’ve created a customer account for you so you can track your order and manage future purchases.
                </p>
                <table cellpadding="6" cellspacing="0" width="100%" 
                  style="font-size:14px;color:#111827;">
                  <tr>
                    <td style="width:40%;font-weight:600;">Email:</td>
                    <td>${to}</td>
                  </tr>
                  <tr>
                    <td style="font-weight:600;">Temporary Password:</td>
                    <td style="color:#E82C3F;font-weight:600;">${details.generatedPassword}</td>
                  </tr>
                </table>

                <div style="text-align:center;margin-top:25px;">
                  <a href="${domain}/account/login" 
                    style="display:inline-block;padding:12px 24px;background:#E82C3F;color:#ffffff;text-decoration:none;
                    border-radius:8px;font-weight:500;letter-spacing:0.3px;box-shadow:0 2px 6px rgba(0,0,0,0.15);">
                    Login to Your Account
                  </a>
                </div>
              </div>
              `
        : ""
      }

            <div style="text-align:center;margin:40px 0 20px;">
              <a href="${domain}/orders/${details.orderId}"
                style="display:inline-block;padding:12px 24px;background:#E82C3F;color:#ffffff;
                text-decoration:none;border-radius:8px;font-weight:500;letter-spacing:0.3px;
                box-shadow:0 2px 6px rgba(0,0,0,0.15);margin-right:18px;">
                View Your Order
              </a>
              ${details?.invoiceUrl
        ? `
                  <a href="${domain}/${details?.invoiceUrl}" target="_blank"
                    style="display:inline-block;padding:12px 24px;background:#009639;color:#ffffff;
                    text-decoration:none;border-radius:8px;font-weight:500;letter-spacing:0.3px;
                    box-shadow:0 2px 6px rgba(0,0,0,0.15);margin-left:18px;">
                    Download Invoice
                  </a>
                  `
        : ""
      }
            </div>

            <p style="font-size:14px;color:#374151;margin-top:28px;">
              Thank you for shopping with <strong>Gazaarabia</strong> —  
              where <em>modesty meets luxury</em>.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#111827;text-align:center;padding:28px 20px;">
            <p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">
              &copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong>  
              — Where Modesty Meets Luxury<br>
              <span style="color:#9ca3af;">Crafted with care and purpose.</span>
            </p>
            <div style="height:3px;width:60px;background:#E82C3F;margin:14px auto 0;border-radius:4px;"></div>
          </td>
        </tr>
      </table>
    </div>
    `;

    await transporter.sendMail({
      from: `"Gazaarabia" <${process.env.SMTP_USER}>`,
      to,
      subject: `Your Gazaarabia Order Confirmation — #${details.orderId}`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false };
  }
}
