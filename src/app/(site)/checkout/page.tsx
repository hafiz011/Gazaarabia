"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import {
  ArrowLeft,
  Lock,
  X,
  Building2,
  MapPin,
  Globe2,
  Phone,
  Pencil,
  ShoppingBag,
  Smile,
  PlusCircle,
} from "lucide-react";

import { cartService } from "@/lib/services/front-end/cartService";
import { localCartService } from "@/lib/services/front-end/localCartService";
import { addressService } from "@/lib/services/front-end/addressService";
import { orderService } from "@/lib/services/front-end/orderService";
import Loader from "@/components/Loader";
import PaypalModal from "@/components/PaypalModal";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import GuestAddressModal from "@/components/GuestAddressModal"; // ✅ import new modal

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.token || null;

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [guestAddress, setGuestAddress] = useState<any>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paypalOpen, setPaypalOpen] = useState(false);
  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  // ✅ Fetch cart for both guest & logged-in
  const fetchCart = async () => {
    setLoading(true);
    try {
      if (token) {
        const data = await cartService.getAll(token);
        setCartItems(data.cart || []);
        setSubtotal(data.subtotal || 0);
      } else {
        const data = localCartService.get();
        setCartItems(data.cart || []);
        setSubtotal(data.subtotal || 0);
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch addresses for logged-in users
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

  useEffect(() => {
    fetchCart();
    fetchAddresses();

    if (!token) {
      const saved = localStorage.getItem("guest_address");
      if (saved) setGuestAddress(JSON.parse(saved));
    }
  }, [token]);

  // Auto-refresh local cart
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "guest_cart") {
        const updated = localCartService.get();
        setCartItems(updated.cart || []);
        setSubtotal(updated.subtotal || 0);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ Handle guest save from modal
  const handleGuestAddressSave = (data: any) => {
    setGuestAddress(data);
    localStorage.setItem("guest_address", JSON.stringify(data));
  };

  // ✅ Handle PayPal success
  const handlePaymentSuccess = async (details: any) => {
    try {
      setCheckoutLoading(true);
      const paypalOrderId = details?.id;
      const paymentStatus = details?.status?.toLowerCase() || "completed";

      const addressData = token ? selectedAddress : guestAddress;
      if (!addressData) {
        setPopUpAlertData({
          isOpen: true,
          type: "warning",
          message: "Please provide your delivery address before payment.",
        });
        return;
      }

      const orderPayload: any = {
        payment: {
          totalAmount: subtotal,
          itemsTotal: subtotal,
          subtotal: subtotal,
          paymentMethod: "paypal",
          paymentStatus,
          paypalOrderId,
          paypalResponse: details,
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

      // const result = await orderService.create(token, orderPayload);

      // if (token) await cartService.clear(token);
      // else localCartService.clear();

      // router.push(`/order-success/${result.data.id}`);


      if (token) {
        const result = await orderService.create(token, orderPayload);
        await cartService.clear(token);
        router.push(`/order-success/${result.data.id}`);
      } else {
        // Guest checkout
        const result = await orderService.guestCheckout(orderPayload);
        localCartService.clear();

        localStorage.setItem("guest_order_id", result.data.order.id);
        localStorage.setItem("guest_user_id", result.data.user.id); //store guest userId



        router.push(`/order-success/${result.data.order.id}`);
      }


    } catch (err) {
      console.error("Order creation failed:", err);
      setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: "Something went wrong while processing your order.",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  // ✅ Button styling
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
          {/* 🧾 Left side */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-6 border border-[var(--soft-gray)] shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                  Delivery Address
                </h2>
              </div>

              {/* 👤 Guest Section */}
              {!token ? (
                <>
                  {!guestAddress ? (
                    <div className="text-center py-4">
                      <p className="text-[var(--text-muted)] mb-4">
                        Please add your delivery details to continue.
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
                        onClick={() => setShowGuestModal(true)}
                      >
                        <PlusCircle size={18} className="mr-2" />
                        Add Delivery Address
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[var(--soft-gray)]/30 border border-[var(--soft-gray)]">
                      <p className="font-medium">
                        {guestAddress.firstName} {guestAddress.lastName}
                      </p>
                      <p>{guestAddress.address1}</p>
                      <p>
                        {guestAddress.city}, {guestAddress.country}{" "}
                        {guestAddress.postalCode}
                      </p>
                      <p>{guestAddress.phone}</p>
                      <Button
                        variant="text"
                        sx={{
                          mt: 2,
                          color: "var(--brand-primary)",
                          textTransform: "none",
                        }}
                        onClick={() => setShowGuestModal(true)}
                      >
                        Edit Address
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Logged-in user addresses */}
                  {addresses.length === 0 ? (
                    <p className="text-center text-[var(--text-muted)] py-4">
                      No saved addresses. Please add one from your account.
                    </p>
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

            {/* 🛍️ Order Items */}
            <div className="bg-white rounded-2xl p-6 border border-[var(--soft-gray)] shadow-sm">
              <h2 className="text-lg font-semibold mb-5 text-[var(--text-primary)] uppercase tracking-wide">
                Order Items
              </h2>
              <div className="space-y-4">
                {cartItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 border-b pb-4">
                    <div className="relative w-20 h-20 border rounded-lg overflow-hidden">
                      <Image
                        src={
                          item?.selectedVariantData?.variantImages[0]?.url ||
                          item.product.productimage[0]?.url ||
                          "/images/placeholder.png"
                        }
                        alt={item.product.title}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product.title}</p>
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
                ))}
              </div>
            </div>
          </div>

          {/* 💰 Summary */}
          <div className="lg:sticky lg:top-24 h-fit bg-white p-7 rounded-2xl border border-[var(--soft-gray)] shadow-md">
            <h2 className="text-lg font-semibold mb-5 uppercase text-[var(--text-primary)]">
              Order Summary
            </h2>
            <div className="space-y-3 text-[var(--text-primary)] mb-6">
              {cartItems.map((i, index) => (
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
                if (token && !selectedAddress) {
                  setPopUpAlertData({
                    isOpen: true,
                    type: "warning",
                    message: "Please select a delivery address.",
                  });
                  return;
                }
                if (!token && !guestAddress) {
                  setPopUpAlertData({
                    isOpen: true,
                    type: "warning",
                    message: "Please provide your delivery details first.",
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
          </div>
        </div>
      </section>

      {/* ✅ Guest Modal */}
      {showGuestModal && (
        <GuestAddressModal
          onCancel={() => setShowGuestModal(false)}
          onSave={handleGuestAddressSave}
          initialData={guestAddress}
        />
      )}

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
