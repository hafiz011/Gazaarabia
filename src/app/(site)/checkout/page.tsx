"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button, Divider } from "@mui/material";
import {
  ArrowLeft,
  Lock,
  PlusCircle,
  X,
  Building2,
  MapPin,
  Globe2,
  Phone,
  Pencil,
  ShoppingBag,
  Smile,
} from "lucide-react";

import { cartService } from "@/lib/services/front-end/cartService";
import { addressService } from "@/lib/services/front-end/addressService";
import { orderService } from "@/lib/services/front-end/orderService";
import Loader from "@/components/Loader";
import PaypalModal from "@/components/PaypalModal";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.token;

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paypalOpen, setPaypalOpen] = useState(false);
  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  // 📥 Fetch Cart Items
  const fetchCart = async () => {
    if (!token) return router.push("/cart");
    try {
      setLoading(true);
      const data = await cartService.getAll(token);
      setCartItems(data.cart || []);
      setSubtotal(data.subtotal || 0);
    } catch (err) {
      console.error("❌ Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  };

  // 📥 Fetch Address
  const fetchAddresses = async () => {
    try {
      const res = await addressService.getAll(token);
      setAddresses(res || []);
      if (res?.length > 0) setSelectedAddress(res[0]);
    } catch (err) {
      console.error("❌ Failed to fetch addresses:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCart();
      fetchAddresses();
    }
  }, [token]);

  // 💳 Payment Success Handler
const handlePaymentSuccess = async (details: any) => {
  try {
    setCheckoutLoading(true);
    const paypalOrderId = details?.id;
    const paymentStatus = details?.status?.toLowerCase() || "completed";

    const orderPayload :any= {
      payment: {
        totalAmount: subtotal,
        itemsTotal: subtotal, // if no shipping/tax for now
        subtotal: subtotal,
        paymentMethod: "paypal",
        paymentStatus,
        paypalOrderId,
        paypalResponse: details,
      },
      address: {
        id: selectedAddress.id,
        firstName: selectedAddress.firstName,
        lastName: selectedAddress.lastName,
        company: selectedAddress.company,
        address1: selectedAddress.address1,
        address2: selectedAddress.address2,
        city: selectedAddress.city,
        country: selectedAddress.country,
        postalCode: selectedAddress.postalCode,
        phone: selectedAddress.phone,
      },
      orderItems: cartItems.map((item) => ({
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
    };

    const result = await orderService.create(token, orderPayload);
    await cartService.clear(token);
    router.push(`/order-success/${result.data.id}`);
  } catch (err) {
    console.error("❌ Order creation failed:", err);
    setPopUpAlertData({
      isOpen: true,
      type: "error",
      message: "Something went wrong while processing your order.",
    });
  } finally {
    setCheckoutLoading(false);
  }
};


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

  // ⏳ Loader or Empty Cart
  if (loading) return <Loader />;
  if (cartItems.length === 0)
    return (
      <section className="max-w-[800px] mx-auto text-center py-24 px-4 flex flex-col items-center mt-10">
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[var(--soft-gray)] mb-6">
          <ShoppingBag size={40} className="text-[var(--brand-primary)]" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-[var(--text-primary)] flex items-center justify-center gap-2">
          No Items in Checkout
          <Smile size={24} className="text-[var(--brand-primary)]" />
        </h2>
        <p className="text-[var(--text-muted)] mb-8 text-sm">
          Your cart is empty — please add items before proceeding to checkout.
        </p>
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
      <section className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12 mt-8 min-h-screen bg-[var(--soft-gray)]/30 rounded-xl">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-10 uppercase tracking-tight text-center lg:text-left">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* 📍 Address + Items */}
          <div className="lg:col-span-2 space-y-8">
            {/* 📦 Delivery Address */}
            <div className="bg-white rounded-2xl p-6 border border-[var(--soft-gray)] shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                  Delivery Address
                </h2>
                {addresses.length > 0 && (
                  <button
                    onClick={() => router.push("/account/details")}
                    className="flex items-center gap-2 text-sm text-[var(--brand-primary)] hover:text-[var(--brand-secondary)]"
                  >
                    <Pencil size={16} />
                    Manage
                  </button>
                )}
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-[var(--text-muted)] mb-4">
                    No addresses found.
                  </p>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      borderColor: "var(--brand-primary)",
                      color: "var(--brand-primary)",
                      "&:hover": {
                        backgroundColor: "var(--brand-primary)",
                        color: "white",
                      },
                    }}
                    onClick={() => router.push("/account/details")}
                  >
                    <PlusCircle size={18} className="mr-2" />
                    Add New Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address, index) => (
                    <label
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition border ${
                        selectedAddress?.id === address.id
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
                      <div className="text-sm text-[var(--text-primary)] space-y-2 leading-snug">
                        <p className="font-medium">
                          {address.firstName} {address.lastName}
                        </p>
                        {address.company && (
                          <p className="flex items-center gap-2 text-[var(--text-muted)]">
                            <Building2 size={16} />
                            {address.company}
                          </p>
                        )}
                        <p className="flex items-center gap-2 text-[var(--text-muted)]">
                          <MapPin size={16} />
                          {address.address1}
                          {address.address2 && `, ${address.address2}`}
                        </p>
                        <p className="flex items-center gap-2 text-[var(--text-muted)]">
                          <Globe2 size={16} />
                          {address.city}, {address.country} - {address.postalCode}
                        </p>
                        <p className="flex items-center gap-2 text-[var(--text-muted)]">
                          <Phone size={16} />
                          {address.phone}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 🛍 Order Items */}
            <div className="bg-white rounded-2xl p-6 border border-[var(--soft-gray)] shadow-sm">
              <h2 className="text-lg font-semibold mb-5 text-[var(--text-primary)] uppercase tracking-wide">
                Order Items
              </h2>
              <div className="space-y-4">
                {cartItems.map((item, index) => {
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 border-b pb-4"
                    >
                      <div className="relative w-20 h-20 rounded-lg border border-[var(--soft-gray)] overflow-hidden bg-white">
                        <Image
                          src={
                            item?.selectedVariantData?.variantImages[0]?.url || item.product.productimage[0]?.url ||
                            "/images/placeholder.png"
                          }
                          alt={item.product.title}
                          fill
                          className="object-contain"
                        />
                      </div>

                      <div className="flex-1">
                        <p className="font-medium text-[var(--text-primary)] line-clamp-1">
                          {item.product.title}
                        </p>

                        {(item.selectedVariantData?.colorName ||
                          item.selectedVariantData?.sizeName) && (
                          <div className="text-sm text-[var(--text-secondary)] mt-1 flex flex-wrap items-center gap-4">
                            {item.selectedVariantData?.colorName && (
                              <span className="flex items-center gap-2">
                                <span className="font-medium">Color:</span>
                                <span>{item.selectedVariantData.colorName}</span>
                                <span
                                  className="inline-block w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: item.selectedVariantData.hexCode }}
                                />
                              </span>
                            )}

                            {item.selectedVariantData?.sizeName && (
                              <span className="flex items-center gap-2">
                                <span className="font-medium">Size:</span>
                                <span>{item.selectedVariantData.sizeName}</span>
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-sm text-[var(--text-muted)] mt-1">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <div className="font-semibold text-[var(--brand-primary)]">
                        £
                        {(
                          (item.selectedVariantData?.price ??
                            item.product.sellingPrice) * item.quantity
                        ).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 💳 Summary & Payment */}
          <div className="lg:sticky lg:top-24 h-fit bg-white p-7 rounded-2xl border border-[var(--soft-gray)] shadow-md">
            <h2 className="text-lg font-semibold mb-5 text-[var(--text-primary)] uppercase tracking-wide">
              Order Summary
            </h2>

            <div className="space-y-3 text-[var(--text-primary)] mb-6">
              {cartItems.map((i, index) => {
                
                return (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="inline-flex flex-col max-w-[220px]">
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium">{i.quantity}</span>
                        <X
                          size={12}
                          className="text-[var(--text-muted)] shrink-0 mt-[1px]"
                        />
                        <span
                          className="line-clamp-2 break-words leading-snug"
                          title={i.product.title}
                        >
                          {i.product.title}
                        </span>
                      </span>
                      {/* {(i.selectedVariantData?.colorName ||
                        i.selectedVariantData?.sizeName) && (
                        <span className="text-[var(--text-muted)] text-xs mt-1 flex items-center gap-2 flex-wrap">
                          {i.selectedVariantData?.colorName && (
                            <span className="flex items-center gap-1">
                              Color: {i.selectedVariantData.colorName}
                              <span
                                className="inline-block w-3 h-3 rounded-full border"
                                style={{ backgroundColor: variantHex }}
                              />
                            </span>
                          )}
                          {i.selectedVariantData?.sizeName && (
                            <span>Size: {i.selectedVariantData.sizeName}</span>
                          )}
                        </span>
                      )} */}
                    </span>
                    <span className="font-medium">
                      £
                      {(
                        (i.selectedVariantData?.price ?? i.product.sellingPrice) *
                        i.quantity
                      ).toFixed(2)}
                    </span>
                  </div>
                );
              })}

              <Divider />

              <div className="flex justify-between font-bold pt-3 text-lg text-[var(--brand-primary)]">
                <span>Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              fullWidth
              variant="outlined"
              sx={checkoutButtonStyle}
              onClick={() => {
                if (!selectedAddress) {
                  setPopUpAlertData({
                    isOpen: true,
                    type: "warning",
                    message: "Please select a delivery address.",
                  });
                  return;
                }
                setPaypalOpen(true);
              }}
            >
              Proceed to Payment
            </Button>

            <PaypalModal
              open={paypalOpen}
              total={subtotal}
              onClose={() => setPaypalOpen(false)}
              onSuccess={handlePaymentSuccess}
            />

            <div className="mt-4 text-xs text-[var(--text-muted)] text-center flex items-center justify-center gap-2">
              <Lock size={12} /> Secure Checkout — All payments are safe
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/cart"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)] underline hover:text-[var(--brand-secondary)] transition"
              >
                <ArrowLeft size={16} />
                Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PopupAlert
        type={popUpAlertData.type as any}
        message={popUpAlertData.message}
        confirmText="OK"
        onConfirm={() =>
          setPopUpAlertData((prev) => ({ ...prev, isOpen: false }))
        }
        show={popUpAlertData.isOpen}
      />

      {checkoutLoading && <Loader message="Processing your order..." />}
    </>
  );
}
