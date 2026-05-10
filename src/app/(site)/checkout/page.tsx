"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import {
  ArrowLeft,
  MapPin,
  ShoppingBag,
  Smile,
  PlusCircle,
  Edit3,
  CheckCircle,
} from "lucide-react";

import { cartService } from "@/lib/services/front-end/cartService";
import { localCartService } from "@/lib/services/front-end/localCartService";
import { addressService } from "@/lib/services/front-end/addressService";
import { orderService } from "@/lib/services/front-end/orderService";
import Loader from "@/components/Loader";
import PaypalModal from "@/components/PaypalModal";
import GuestAddressModal from "@/components/GuestAddressModal"; //  import new modal
import { useCart } from "@/app/context/CartContext";
import UnavailableStockAlert from "@/components/UnavailableStockAlert";
import ErrorAlert from "@/components/ErrorAlert";
import { frontCouponService } from "@/lib/services/front-end/couponService";
import { loadWithExpiry, saveWithExpiry } from "@/lib/helpers/localExpiry";
import { referralService } from "@/lib/services/referralService";
import StripePaymentModal from "@/components/StripePaymentModal";
import { PaymentIntent } from "@stripe/stripe-js";


interface AffiliateInfo {
  id: number;
  referralCode: string;
  baseCommission: number;
  shareCommission: number;
  isActive: boolean;
}


export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.token || null;

  // const [cartItems, setCartItems] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [guestAddress, setGuestAddress] = useState<any>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);

  // const [subtotal, setSubtotal] = useState(0);
  // const [loading, setLoading] = useState(true);
  const { cart, subtotal, loading, refreshCart } = useCart();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paypalOpen, setPaypalOpen] = useState(false);


  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unavailableItems, setUnavailableItems] = useState<any[]>([]);
  const [showUnavailableAlert, setShowUnavailableAlert] = useState(false);

  // coupon related 
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const [charityAmount, setCharityAmount] = useState<string>("");

  const [affiliateInfo, setAffiliateInfo] = useState<AffiliateInfo | null>(null);

  const [affiliateDiscountAmount, setAffiliateDiscountAmount] = useState(0);

  const [stripeOpen, setStripeOpen] = useState(false);




  // FINAL CALCULATED TOTAL
  const donation = parseFloat(charityAmount || "0");
  // const grandTotal = subtotal - discountAmount + donation;


  let finalAffiliateDiscount =
    !appliedCoupon || affiliateDiscountAmount > discountAmount
      ? affiliateDiscountAmount
      : 0;

  let finalCouponDiscount =
    appliedCoupon && discountAmount >= affiliateDiscountAmount
      ? discountAmount
      : 0;

  const grandTotal =
    subtotal -
    finalAffiliateDiscount -
    finalCouponDiscount +
    donation;


  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("gaza_arabia_affiliate_ref="));

    if (!cookie) return;

    const ref = cookie.split("=")[1];

    (async () => {
      try {
        const data = await referralService.resolveReferral(ref);

        if (data.success) {
          const affiliate = data.affiliate;
          setAffiliateInfo(affiliate);

          const discount = (subtotal * affiliate.shareCommission) / 100;
          setAffiliateDiscountAmount(discount);
        }
      } catch (err: any) {
        console.error("Referral error:", err.message);
      }
    })();
  }, [subtotal]);



  // useEffect(() => {
  //   const cookie = document.cookie
  //     .split("; ")
  //     .find((c) => c.startsWith("gaza_arabia_affiliate_ref="));

  //   if (!cookie) return;

  //   const ref = cookie.split("=")[1];

  //   fetch(`/api/affiliates/resolve?ref=${ref}`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data.success) {
  //         setAffiliateInfo(data.affiliate);
  //         const discount = (subtotal * data.affiliate.shareCommission) / 100;
  //         setAffiliateDiscountAmount(discount);
  //       }
  //     });
  // }, [subtotal]);


  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    try {
      setCouponError(null);
      const data = await frontCouponService.validate(
        token, // first param
        couponCode.trim().toUpperCase(),
        subtotal
      );
      setAppliedCoupon(data.coupon);
      setDiscountAmount(data.coupon.discountAmount);
    } catch (err: any) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponError(err.message || "Failed to apply coupon.");
    }
  };




  //  Fetch addresses for logged-in users
  const fetchAddresses = async () => {
    if (!token) return;
    try {
      const res = await addressService.getAll(token);
      setAddresses(res || []);
      if (res?.length > 0) setSelectedAddress(res[0]);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    }
  };


  // ================== save in cookie ================
  const setGuestAddressCookie = (data: any) => {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString(); // 24 hours

    document.cookie = `gaza_guest_address=${encodeURIComponent(
      JSON.stringify(data)
    )}; expires=${expires}; path=/`;
  };


  // ========================== get from cookie ===============
  const getGuestAddressCookie = () => {
    const cookieArr = document.cookie.split(";");

    for (let c of cookieArr) {
      const [key, value] = c.trim().split("=");

      if (key === "gaza_guest_address") {
        try {
          return JSON.parse(decodeURIComponent(value));
        } catch {
          return null;
        }
      }
    }

    return null;
  };


  useEffect(() => {
    fetchAddresses();

    if (!token) {
      const saved = getGuestAddressCookie();
      if (saved) setGuestAddress(saved);
    }
  }, [token]);


  //  Handle guest save from modal
  const handleGuestAddressSave = (data: any) => {
    setGuestAddress(data);
    setGuestAddressCookie(data);
  };


  const handleStripeSuccess = async (pi: PaymentIntent) => {
    try {
      setCheckoutLoading(true);

      const addressData = token ? selectedAddress : guestAddress;
      if (!addressData) {
        setErrorMsg("Please provide your delivery address before payment.");
        return;
      }

      const orderPayload: any = {
        payment: {
          totalAmount: grandTotal,
          itemsTotal: subtotal,
          subtotal: subtotal,
          paymentMethod: "stripe",
          paymentStatus: pi.status,
          transactionId: pi.id,
          paymentResponse: pi,
        },

        address: {
          id: addressData?.id || null,
          firstName: addressData.firstName,
          lastName: addressData.lastName,
          company: addressData.company,
          address1: addressData.address1,
          address2: addressData.address2,
          city: addressData.city,
          country: addressData.country,
          postalCode: addressData.postalCode,
          phone: addressData.phone,
          email: addressData.email,
        },
        orderItems: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.selectedVariantData?.price ?? item.product.sellingPrice,
          variantId: item.variantId,
          colorId: item.selectedVariantData?.colorId,
          sizeId: item.selectedVariantData?.sizeId,
          subtotal:
            (item.selectedVariantData?.price ?? item.product.sellingPrice) *
            item.quantity,
        })),
        coupon: appliedCoupon
          ? {
            code: appliedCoupon.code,
            discountAmount: appliedCoupon.discountAmount,
          }
          : null,

        referral: affiliateInfo
          ? {
            affiliateId: affiliateInfo?.id || null,
            Code: affiliateInfo.referralCode,
            discount: finalAffiliateDiscount,
          }
          : null,

        charity: {
          amount: parseFloat(charityAmount || "0"),
          email: token ? session?.user.email : guestAddress.email,
          name: token
            ? session?.user.name
            : `${guestAddress.firstName} ${guestAddress.lastName}`,
          anonymous: false,
        },
      };

      let result;

      if (token) {
        result = await orderService.create(token, orderPayload);
        await cartService.clear(token);
      } else {
        result = await orderService.guestCheckout(orderPayload);

        localCartService.clear();
        localStorage.setItem("gaza_arabia_guest_order_id", result.data.order.id);
        localStorage.setItem("gaza_arabia_guest_user_id", result.data.user.id);
      }

      await refreshCart();
      router.push(`/order-success/${result.data.id || result.data.order.id}`);

    } catch (err) {
      console.error("Stripe order creation failed:", err);
      setErrorMsg("Something went wrong while processing your Stripe order.");
    } finally {
      setCheckoutLoading(false);
    }
  };



  //  Handle PayPal success
  const handlePaymentBtn = async (paymentType: string) => {
    // 1️. Address validation
    if (token && !selectedAddress) {
      setErrorMsg("Please select a delivery address.");
      return;
    }

    if (!token && !guestAddress) {
      setErrorMsg("Please provide your delivery details first.");
      return;
    }

    try {
      // 2️. Sync + validate cart before checkout
      const syncResponse = await cartService.syncCart(token, cart);

      if (!syncResponse.success) {
        setErrorMsg("Something went wrong while syncing your cart. Please refresh.");
        return;
      }

      const { syncedCart, changes } = syncResponse;

      // 3️. Handle cart changes (price, quantity, or removal)
      const hasChanges =
        changes.removed > 0 ||
        changes.priceUpdated > 0 ||
        changes.quantityUpdated > 0;

      if (hasChanges) {
        // Construct the message for UnavailableStockAlert
        const changedItems = [];

        if (changes.removed > 0) {
          changedItems.push({
            name: "Removed Items",
            issues: [`${changes.removed} item(s) removed because they are no longer available.`],
          });
        }

        if (changes.quantityUpdated > 0) {
          changedItems.push({
            name: "Quantity Adjusted",
            issues: [`${changes.quantityUpdated} item(s) had reduced stock; quantities adjusted.`],
          });
        }

        if (changes.priceUpdated > 0) {
          changedItems.push({
            name: "Price Updated",
            issues: [`${changes.priceUpdated} item(s) had a price change.`],
          });
        }

        // Show alert for user
        setUnavailableItems(changedItems);
        setShowUnavailableAlert(true);

        // Refresh local cart context with latest data
        await refreshCart();

        return; // stop payment flow
      }

      // Refresh local cart context with latest data
      await refreshCart();
      // 4️. Validate stock one more time before proceeding
      const validation = await cartService.validateStock(token);

      if (!validation.success && validation.unavailableItems?.length > 0) {
        setUnavailableItems(validation.unavailableItems);
        setShowUnavailableAlert(true);
        return;
      }

      if (paymentType == 'paypal') {
        //  All good — open PayPal modal
        setPaypalOpen(true);
      }

      if (paymentType == 'card') {
        setStripeOpen(true)
      }


    } catch (err: any) {
      console.error("Payment preparation error:", err);
      setErrorMsg(err?.message || "Unable to process checkout right now.");
    }
  };


  const handlePaymentSuccess = async (details: any) => {
    try {
      setCheckoutLoading(true);
      const paypalOrderId = details?.id;
      const paymentStatus = details?.status?.toLowerCase() || "completed";

      const addressData = token ? selectedAddress : guestAddress;
      if (!addressData) {
        setErrorMsg("Please provide your delivery address before payment.");
        return;

      }

      const totalAmount = subtotal - discountAmount;
      const orderPayload: any = {
        payment: {
          // totalAmount: totalAmount,
          totalAmount: grandTotal,
          itemsTotal: subtotal,
          subtotal: subtotal,
          paymentMethod: "paypal",
          paymentStatus,
          transactionId: paypalOrderId,
          paymentResponse: details,
        },
        address: {
          id: addressData?.id || null,
          firstName: addressData.firstName,
          lastName: addressData.lastName,
          company: addressData.company,
          address1: addressData.address1,
          address2: addressData.address2,
          city: addressData.city,
          country: addressData.country,
          postalCode: addressData.postalCode,
          phone: addressData.phone,
          email: addressData.email,
        },
        orderItems: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.selectedVariantData?.price ?? item.product.sellingPrice,
          variantId: item.variantId,
          colorId: item.selectedVariantData?.colorId,
          sizeId: item.selectedVariantData?.sizeId,
          subtotal:
            (item.selectedVariantData?.price ?? item.product.sellingPrice) *
            item.quantity,
        })),
        coupon: appliedCoupon
          ? {
            code: appliedCoupon.code,
            discountAmount: appliedCoupon.discountAmount,
          }
          : null,

        referral: affiliateInfo
          ? {
            affiliateId: affiliateInfo?.id || null,
            Code: affiliateInfo.referralCode,
            discount: finalAffiliateDiscount,
          }
          : null,

        charity: {
          amount: parseFloat(charityAmount || "0"),
          email: token ? session?.user.email : guestAddress.email,
          name: token ? session?.user.name : `${guestAddress.firstName} ${guestAddress.lastName}`,
          anonymous: false, // or based on a toggle in UI
        },

      };

      if (token) {
        const result = await orderService.create(token, orderPayload);
        await cartService.clear(token);
        await refreshCart();
        router.push(`/order-success/${result.data.id}`);
      } else {
        // Guest checkout
        const result = await orderService.guestCheckout(orderPayload);
        localCartService.clear();
        await refreshCart();
        localStorage.setItem("gaza_arabia_guest_order_id", result.data.order.id);
        localStorage.setItem("gaza_arabia_guest_user_id", result.data.user.id); //store guest userId

        router.push(`/order-success/${result.data.order.id}`);
      }


    } catch (err) {
      console.error("Order creation failed:", err);
      setErrorMsg("Something went wrong while processing your order.");
      return;
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Button styling
  const checkoutButtonStyle = {
    borderColor: "var(--brand-secondary)",
    color: "var(--white)",
    backgroundColor: "var(--brand-secondary)",
    borderRadius: "9999px",
    padding: "12px 0",
    fontSize: "16px",
    fontWeight: 600,
    textTransform: "none",
    "&:hover": {
      backgroundColor: "var(--brand-primary)",
      borderColor: "var(--brand-primary)",
    },
  };

  const getItemImage = (item: any) => {
    if (item?.selectedVariantData?.variantImages?.length)
      return item.selectedVariantData.variantImages[0].url;
    if (item?.product?.productimage?.length)
      return item.product.productimage[0].url;
    return "/images/placeholder.png";
  };

  // if (loading) return <Loader />;
  if (loading && cart.length === 0) return <Loader />;

  if (cart.length === 0)
    return (
      <section className="max-w-[800px] mx-auto text-center py-24 px-4 flex flex-col items-center mt-10">
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[var(--soft-gray)] mb-6">
          <ShoppingBag size={40} className="text-[var(--brand-primary)]" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-[var(--text-primary)] flex items-center justify-center gap-2">
          No Items in Checkout
          <Smile size={24} className="text-[var(--brand-primary)]" />
        </h2>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-white bg-[var(--brand-primary)] px-6 py-3 rounded-full hover:bg-[var(--brand-secondary)] transition"
        >
          <ArrowLeft size={16} />
          Continue Shopping
        </Link>
      </section>
    );

  return (
    <>
      <section className="max-w-[1200px] mx-auto px-4 lg:px-8 py-8 md:py-12 md:mt-8 min-h-screen bg-white md:bg-[var(--soft-gray)]/30 md:rounded-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-8 md:mb-10 uppercase tracking-tight text-center lg:text-left">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
          {/* Left side */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-6 border border-[var(--soft-gray)] shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                  Delivery Address
                </h2>
              </div>

              {/* Guest Section */}
              {!token ? (
                <>
                  {!guestAddress ? (
                    <div className="text-center py-10 px-6 border border-[var(--soft-gray)] rounded-2xl bg-[var(--soft-gray)]/10">
                      <p className="text-lg font-medium text-[var(--text-primary)] mb-2">
                        Please add your delivery details to continue.
                      </p>

                      <button
                        onClick={() => setShowGuestModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--brand-primary)] text-white font-medium shadow-sm transition-all duration-200 hover:brightness-110 hover:shadow-md hover:-translate-y-0.5"
                      >
                        <PlusCircle size={18} />
                        Add Delivery Address
                      </button>
                    </div>

                  ) : (

                    <div className="p-6 rounded-2xl border border-[var(--soft-gray)] bg-white shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between">
                        {/* Left: Address info */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                            <MapPin size={20} />
                          </div>

                          <div>
                            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                              {guestAddress.firstName} {guestAddress.lastName}
                            </h3>

                            <div className="text-sm text-[var(--text-muted)] leading-relaxed space-y-0.5">
                              <p>{guestAddress.address1}</p>
                              <p>
                                {guestAddress.city}, {guestAddress.country}{" "}
                                {guestAddress.postalCode}
                              </p>
                              <p>{guestAddress.phone}</p>
                            </div>
                          </div>
                        </div>

                        {/* Right: Edit button */}
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            borderColor: "var(--brand-primary)",
                            color: "var(--brand-primary)",
                            fontWeight: 500,
                            textTransform: "none",
                            borderRadius: "10px",
                            px: 2,
                            py: 0.5,
                            minWidth: "auto",
                            "&:hover": {
                              backgroundColor: "var(--brand-primary)",
                              color: "#fff",
                            },
                            transition: "all 0.25s ease-in-out",
                          }}
                          onClick={() => setShowGuestModal(true)}
                        >
                          <Edit3 size={16} className="mr-1.5" />
                          Edit
                        </Button>
                      </div>
                    </div>


                  )}
                </>
              ) : (
                <>
                  {/* Logged-in user addresses */}
                  {addresses.length === 0 ? (

                    <div className="text-center py-10 px-6 border border-[var(--soft-gray)] rounded-2xl bg-[var(--soft-gray)]/10">
                      <p className="text-lg font-medium text-[var(--text-primary)] mb-2">
                        No saved addresses found
                      </p>
                      <p className="text-[var(--text-muted)] mb-6">
                        You don’t have any saved addresses yet. Please add one to continue with your order.
                      </p>

                      <button
                        onClick={() => router.push("/account/details")}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--brand-primary)] text-white font-medium shadow-sm transition-all duration-200 hover:brightness-110 hover:shadow-md hover:-translate-y-0.5"
                      >
                        <PlusCircle size={18} />
                        Add New Address
                      </button>

                    </div>

                  ) : (
                    addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer ${selectedAddress?.id === address.id
                          ? "border-[var(--brand-primary)] bg-[var(--soft-gray)]/20"
                          : "border-[var(--soft-gray)]"
                          }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress?.id === address.id}
                          onChange={() => setSelectedAddress(address)}
                          className="mt-1 accent-[var(--brand-primary)]"
                        />
                        <div className="text-sm">
                          <p className="font-medium">
                            {address.firstName} {address.lastName}
                          </p>
                          <p>{address.address1}</p>
                          <p>
                            {address.city}, {address.country}{" "}
                            {address.postalCode}
                          </p>
                          <p>{address.phone}</p>
                        </div>
                      </label>
                    ))
                  )}
                </>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl p-6 border border-[var(--soft-gray)] shadow-sm">
              <h2 className="text-lg font-semibold mb-5 text-[var(--text-primary)] uppercase tracking-wide">
                Order Items
              </h2>
              <div className="space-y-4">

                {cart.map((item, i) => (


                  <div key={i} className="flex items-center gap-4 border-b pb-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 border rounded-lg overflow-hidden bg-white">
                      <Image
                        // src={
                        //   item?.selectedVariantData?.variantImages?.[0]?.url ||
                        //   item.product.productimage?.[0]?.url ||
                        //   "/images/placeholder.png"
                        // }
                        src={getItemImage(item)}
                        alt={item.product.title}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <p className="font-medium text-[var(--text-primary)] leading-snug">
                        {item.product.title}
                      </p>

                      {/* Variant Info (Size + Color) */}
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-[var(--text-muted)]">


                        <span className="flex items-center gap-1">
                          <span className="font-medium text-[var(--text-primary)]">Qty:</span>
                          <span>{item.quantity}</span>
                        </span>

                        {(item.selectedVariantData?.sizeName || item.selectedVariantData?.colorName) &&
                          <>
                            {item.selectedVariantData?.sizeName && (
                              <span className="flex items-center gap-1">
                                <span className="font-medium text-[var(--text-primary)]">Size:</span>
                                <span>{item.selectedVariantData.sizeName}</span>
                              </span>
                            )}

                            {item.selectedVariantData?.colorName && (
                              <span className="flex items-center gap-1">
                                <span className="font-medium text-[var(--text-primary)]">Color:</span>
                                <span>{item.selectedVariantData.colorName}</span>

                                {item.selectedVariantData?.hexCode && (
                                  <span
                                    className="inline-block w-3.5 h-3.5 rounded-full border border-gray-300"
                                    style={{ backgroundColor: item.selectedVariantData.hexCode }}
                                    title={item.selectedVariantData.colorName}
                                  />
                                )}
                              </span>
                            )}
                          </>
                        }

                      </div>

                      {/* Quantity
                      <p className="text-sm text-[var(--text-muted)] mt-1">
                        Qty: {item.quantity}
                      </p> */}
                    </div>

                    {/* Price */}
                    <div className="font-semibold text-[var(--brand-primary)] whitespace-nowrap">
                      £
                      {(
                        (item.selectedVariantData?.price ?? item.product.sellingPrice) *
                        item.quantity
                      ).toFixed(2)}
                    </div>
                  </div>


                  // <div key={i} className="flex items-center gap-4 border-b pb-4">
                  //   <div className="relative w-20 h-20 border rounded-lg overflow-hidden">
                  //     <Image
                  //       src={
                  //         item?.selectedVariantData?.variantImages?.[0]?.url ||
                  //         item.product.productimage[0]?.url ||
                  //         "/images/placeholder.png"
                  //       }
                  //       alt={item.product.title}
                  //       fill
                  //       className="object-contain"
                  //     />
                  //   </div>
                  //   <div className="flex-1">
                  //     <p className="font-medium">{item.product.title}</p>
                  //     <p className="text-sm text-[var(--text-muted)] mt-1">
                  //       Qty: {item.quantity}
                  //     </p>
                  //   </div>
                  //   <div className="font-semibold text-[var(--brand-primary)]">
                  //     £
                  //     {(
                  //       (item.selectedVariantData?.price ??
                  //         item.product.sellingPrice) * item.quantity
                  //     ).toFixed(2)}
                  //   </div>
                  // </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 h-fit bg-white p-7 rounded-2xl border border-[var(--soft-gray)] shadow-md">
            <h2 className="text-lg font-semibold mb-5 uppercase text-[var(--text-primary)]">
              Order Summary
            </h2>
            <div className="space-y-3 text-[var(--text-primary)] mb-6">
              {cart.map((i, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {i.quantity} × {i.product.title}
                  </span>
                  <span>
                    £
                    {(
                      (i.selectedVariantData?.price ??
                        i.product.sellingPrice) * i.quantity
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
              <Divider />


              {/* Coupon Input */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="border border-[var(--soft-gray)] rounded-lg px-3 py-2 flex-1 text-sm focus:outline-none focus:border-[var(--brand-secondary)]"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    type="button"
                    className="bg-[var(--brand-secondary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--brand-primary)] transition"
                  >
                    Apply
                  </button>
                </div>

                {couponError && (
                  <p className="text-sm text-[var(--brand-primary)] mt-2">{couponError}</p>
                )}

                {appliedCoupon && (

                  <div className="flex items-center gap-2 bg-[var(--brand-secondary)]/10 border border-[var(--brand-secondary)] rounded-md px-3 py-2 mt-3 text-[var(--brand-secondary)] text-sm font-medium">
                    <CheckCircle size={16} />
                    <span>
                      Coupon <b>{appliedCoupon.code}</b> applied —{" "}
                      {appliedCoupon.discountType === "percentage"
                        ? `${appliedCoupon.discountValue}% off`
                        : `£${appliedCoupon.discountValue.toFixed(2)} off`}
                    </span>
                  </div>

                )}

                {/*  ADD THIS FOR AFFILIATE DISCOUNT */}
                {affiliateInfo && finalAffiliateDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 py-2">
                    <span>Affiliate Discount ({affiliateInfo?.shareCommission}%)</span>
                    <span>-£{finalAffiliateDiscount.toFixed(2)}</span>
                  </div>
                )}

              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-£{discountAmount.toFixed(2)}</span>
                </div>
              )}

              {/*  -------------------- ADD CHARITY DONATION HERE -------------------- */}
              {/* <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">
                  Charity Donation (optional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={charityAmount}
                  onChange={(e) => setCharityAmount(Number(e.target.value))}
                  className="border border-[var(--soft-gray)] rounded-lg px-3 py-2 w-full mt-1 text-sm 
               focus:outline-none focus:border-[var(--brand-secondary)]"
                  placeholder="Enter amount (e.g., 5.00)"
                />
              </div> */}

              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">
                  Charity Donation (optional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={charityAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string for clearing, otherwise enforce min 0
                    if (value === "" || parseFloat(value) >= 0) {
                      setCharityAmount(value);
                    }
                  }}
                  onBlur={(e) => {
                    // Clean up on blur: remove negative signs if somehow entered
                    const value = parseFloat(e.target.value || "0");
                    setCharityAmount(Math.max(0, value).toString());
                  }}
                  className="border border-[var(--soft-gray)] rounded-lg px-3 py-2 w-full mt-1 text-sm 
      focus:outline-none focus:border-[var(--brand-secondary)]"
                  placeholder="Enter amount (e.g., 5.00)"
                />
              </div>

              {/* -------------------------------------------------------------------  */}

              <Divider />
              <div className="flex justify-between font-bold pt-3 text-lg text-[var(--brand-primary)]">
                <span>Total</span>
                {/* <span>£{(subtotal - discountAmount).toFixed(2)}</span> */}
                <span>£{grandTotal.toFixed(2)}</span>

              </div>



              {/* <div className="flex justify-between font-bold pt-3 text-lg text-[var(--brand-primary)]">
                <span>Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div> */}
            </div>

            {/* <Button
              fullWidth
              variant="outlined"
              sx={checkoutButtonStyle}
              onClick={() => { handlePaymentBtn() }}
            >
              Proceed to Payment
            </Button> */}

            {/* Pay with Stripe */}
            <button
              // onClick={() => setStripeOpen(true)}
              onClick={() => { handlePaymentBtn('card') }}
              className="
    w-full mt-4 py-3 rounded-full font-semibold 
    bg-[var(--brand-primary)] text-white text-sm
    hover:bg-[var(--brand-secondary)]
    transition-all duration-200 shadow-sm
  "
            >
              Pay with Card
            </button>

            {/* Pay with PayPal */}
            <button
              onClick={() => { handlePaymentBtn('paypal') }}
              className="
    w-full mt-3 py-3 rounded-full font-semibold 
    border-2 border-[var(--brand-secondary)] text-[var(--brand-secondary)] text-sm
    bg-white hover:bg-[var(--brand-secondary)] hover:text-white
    transition-all duration-200 shadow-sm
  "
            >
              Pay with PayPal
            </button>

            <PaypalModal
              open={paypalOpen}
              // total={subtotal - discountAmount}
              total={grandTotal}
              onClose={() => setPaypalOpen(false)}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      </section>

      {/* Guest Modal */}
      {showGuestModal && (
        <GuestAddressModal
          onCancel={() => setShowGuestModal(false)}
          onSave={handleGuestAddressSave}
          initialData={guestAddress}
        />
      )}

      {errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg(null)} />}

      {/* Show unavailable stock alert */}
      {showUnavailableAlert && (
        <UnavailableStockAlert
          unavailableItems={unavailableItems}
          onClose={() => setShowUnavailableAlert(false)}
        />
      )}

      {checkoutLoading && <Loader message="Processing your order..." />}

      <StripePaymentModal
        open={stripeOpen}
        onClose={() => setStripeOpen(false)}
        amount={grandTotal}
        customerId={session?.user?.stripeCustomerId ?? null}

        onSuccess={(result) => handleStripeSuccess(result)}
      />

    </>
  );
}
