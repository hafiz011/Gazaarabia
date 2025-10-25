"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Lock,
  ArrowLeft,
  X,
  ShoppingBag,
  Smile,
} from "lucide-react";
import { Button, Select, MenuItem, Divider } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cartService } from "@/lib/services/front-end/cartService";
import { orderService } from "@/lib/services/front-end/orderService";
import Loader from "@/components/Loader";
import PaypalModal from "@/components/PaypalModal";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import { ROUTES } from "@/constants/routes";

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const token = session?.user?.token || null;

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [quantityList] = useState<number[]>(Array.from({ length: 30 }, (_, i) => i + 1));
  const [paypalOpen, setPaypalOpen] = useState(false);

  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  // 🧭 Fetch Cart Items
  const fetchCart = async () => {
    if (!token) {
      setCartItems([]);
      setSubtotal(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await cartService.getAll(token);
      setCartItems(data.cart || []);
      setSubtotal(data.subtotal || 0);
    } catch (err) {
      console.error("❌ Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  // ✏️ Update Quantity
  const handleQuantity = async (productId: number, value: number) => {
    if (!token) return;

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: value } : item
      )
    );

    try {
      const res = await cartService.updateQuantity(token, productId, value);
      if (res.subtotal !== undefined) setSubtotal(res.subtotal);
    } catch (err) {
      console.error("❌ Failed to update quantity", err);
      fetchCart();
    }
  };

  // 🗑 Remove Product
  const handleRemove = async (productId: number) => {
    if (!token) return;

    setPopUpAlertData({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to remove this item from your cart?",
      onConfirm: async () => {
        try {
          const res = await cartService.remove(token, productId);
          setCartItems((prev) => prev.filter((i) => i.productId !== productId));
          if (res.subtotal !== undefined) setSubtotal(res.subtotal);
        } catch (err) {
          console.error("❌ Failed to remove item", err);
        } finally {
          setPopUpAlertData((prev) => ({ ...prev, isOpen: false }));
        }
      },
      onCancel: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
    });
  };

  // 🪙 Proceed to Checkout button
  const handleCheckoutClick = () => {
    if (!token) {
      setPopUpAlertData({
        isOpen: true,
        type: "warning",
        message: "Please login to proceed with checkout.",
        onConfirm: () => router.push(ROUTES.USER.LOGIN),
      });
      return;
    }

    if (cartItems.length === 0) {
      setPopUpAlertData({
        isOpen: true,
        type: "warning",
        message: "Your cart is empty. Please add some items before checking out.",
        onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }

    setPaypalOpen(true);
  };

  // 🧾 Handle payment success
  const handlePaymentSuccess = async (details: any) => {
    try {
      setCheckoutLoading(true); // 🌀 Show loader overlay

      const paypalOrderId = details?.id;
      const paymentStatus = details?.status || "completed";

      const orderPayload = {
        userId: session?.user?.id,
        totalAmount: subtotal,
        paymentMethod: "paypal",
        paymentStatus: paymentStatus.toLowerCase(),
        paypalOrderId,
        orderItems: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.sellingPrice,
        })),
      };

      // 🧾 Save order
      const result = await orderService.create(session?.user?.token, orderPayload);
      console.log("Order Saved:", result);

      // 🧹 Clear cart
      await cartService.clear(session?.user?.token);

      // 🚀 Redirect
      router.push(`/order-success/${result.data.id}`);
    } catch (error) {
      console.error("Failed to save order:", error);
      setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: "Something went wrong while processing your order. Please try again.",
        onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
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
    padding: "8px 0",
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "var(--brand-primary)",
      color: "white",
      borderColor: "var(--brand-primary)",
    },
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : cartItems.length === 0 ? (
        <section className="max-w-[800px] mx-auto text-center py-20 px-4 flex flex-col items-center justify-center">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[var(--soft-gray)] mb-6">
            <ShoppingBag size={40} className="text-[var(--brand-primary)]" />
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-[var(--text-primary)] flex items-center justify-center gap-2">
            Your Cart is Empty
            <Smile size={24} className="text-[var(--brand-primary)]" />
          </h2>
          <p className="text-[var(--text-muted)] mb-8 text-sm">
            Browse products and add them to your bag.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-[var(--brand-primary)] px-6 py-3 rounded-full hover:bg-[var(--brand-secondary)] transition"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
        </section>
      ) : (
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12 bg-[var(--soft-gray)]/20 min-h-screen">
          <h1 className="text-3xl font-semibold text-[var(--text-primary)] mt-5 mb-8 tracking-tight uppercase text-center lg:text-left">
            Shopping Bag
          </h1>

          {/* 📊 Order Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* 🛍 Cart Items */}
            <div className="lg:col-span-2 space-y-10">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[var(--soft-gray)] bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* 🖼 Product Image */}
                    <div className="relative w-full sm:w-40 aspect-square rounded-lg overflow-hidden border border-[var(--soft-gray)] bg-white shadow-sm group-hover:shadow-md transition-all duration-300">
                      <Image
                        src={
                          item.product.productimage[0]?.url ||
                          "/images/placeholder.png"
                        }
                        alt={item.product.title}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* 📝 Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <h3 className="font-semibold text-[var(--text-primary)] text-lg leading-snug">
                          {item.product.title}
                        </h3>
                        <div className="text-[var(--brand-primary)] font-bold text-lg tracking-wide">
                          £{(item.product.sellingPrice * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <Select
                          size="small"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantity(item.productId, Number(e.target.value))
                          }
                          sx={{
                            minWidth: 60,
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "var(--soft-gray)",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "var(--brand-primary)",
                            },
                          }}
                        >
                          {quantityList.map((n) => (
                            <MenuItem key={n} value={n}>
                              {n}
                            </MenuItem>
                          ))}
                        </Select>

                        {/* 🗑 Trash Button */}
                        <button
                          onClick={() => handleRemove(item.productId)}
                          className="p-2 rounded-full bg-[var(--soft-gray)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 💳 Checkout Section */}
            <div className="lg:pl-8 lg:sticky lg:top-24 h-fit rounded-2xl border border-[var(--soft-gray)] bg-white p-7 shadow-md">
              <h2 className="text-lg font-semibold mb-5 text-[var(--text-primary)] uppercase tracking-wide">
                Order Summary
              </h2>

              <div className="space-y-3 text-[var(--text-primary)] mb-6">
                {cartItems.map((i) => (
                  <div key={i.productId} className="flex justify-between text-sm">
                    <span className="inline-flex items-center gap-1 max-w-[220px]">
                      <span className="font-medium">{i.quantity}</span>
                      <X
                        size={12}
                        className="text-[var(--text-muted)] shrink-0 mt-[1px]"
                      />
                      <span
                        className="line-clamp-2 break-words text-[var(--text-primary)] leading-snug"
                        title={i.product.title}
                      >
                        {i.product.title}
                      </span>
                    </span>

                    <span className="font-medium">
                      £{(i.product.sellingPrice * i.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}

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
                onClick={handleCheckoutClick}
              >
                Proceed to Checkout
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
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] underline hover:text-[var(--brand-primary)] transition"
                >
                  <ArrowLeft size={16} />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 📢 Global Popup Alert */}
      <PopupAlert
        type={popUpAlertData.type as any}
        message={popUpAlertData.message}
        confirmText={popUpAlertData.type === "confirm" ? "Yes" : "OK"}
        cancelText={popUpAlertData.type === "confirm" ? "Cancel" : undefined}
        onConfirm={popUpAlertData.onConfirm}
        onCancel={popUpAlertData.onCancel}
        show={popUpAlertData.isOpen}
      />

      {/* Checkout Loader Overlay */}
      {checkoutLoading && <Loader message="Processing your order..." />}

    </>
  );
}
