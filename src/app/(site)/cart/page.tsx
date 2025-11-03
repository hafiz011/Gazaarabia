"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ArrowLeft, ShoppingBag, Smile, Plus, Minus } from "lucide-react";
import { Button, Divider } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { cartService } from "@/lib/services/front-end/cartService";
import Loader from "@/components/Loader";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import { ROUTES } from "@/constants/routes";
import { localCartService } from "@/lib/services/front-end/localCartService";
import ErrorAlert from "@/components/ErrorAlert";
import { useCart } from "@/app/context/CartContext";
import UnavailableStockAlert from "@/components/UnavailableStockAlert";

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const token = session?.user?.token || null;

  // const [cartItems, setCartItems] = useState<any[]>([]);
  // const [subtotal, setSubtotal] = useState<number>(0);
  const { cart: cartItems, subtotal, refreshCart, loading } = useCart();

  // const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unavailableItems, setUnavailableItems] = useState<any[]>([]);
  const [showUnavailableAlert, setShowUnavailableAlert] = useState(false);
  // const { refreshCart } = useCart();

  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  // Update Quantity
  const handleQuantity = async (productId: number, variantId: number, value: number) => {

    if (value < 1) return;

    try {
      const res = await cartService.updateQuantity(token, productId, variantId, value);

      if (res?.error) {
        console.log('res?.error:>', res?.error)
        setErrorMsg(res.error);
        return;
      }

      await refreshCart(); // updates global cart
    } catch (err: any) {
      console.error("Failed to update quantity", err);
      setErrorMsg(err.message);

    }
  };

  //  Remove Product
  const handleRemove = async (productId: number, variantId: number) => {
    setPopUpAlertData({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to remove this item from your cart?",
      onConfirm: async () => {
        try {
          await cartService.remove(token, productId, variantId);
          await refreshCart(); // instantly updates all pages
        } catch (err) {
          console.error("Failed to remove item", err);
        } finally {
          setPopUpAlertData((prev) => ({ ...prev, isOpen: false }));
        }
      },
      onCancel: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
    });
  };


  // // Proceed to Checkout
  // const handleCheckoutClick = async () => {
  //   // 1. check the cart should not be empty
  //   if (cartItems.length === 0) {
  //     setPopUpAlertData({
  //       isOpen: true,
  //       type: "warning",
  //       message: "Your cart is empty. Please add some items before checking out.",
  //       onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
  //     });
  //     return;
  //   }

  //   // 2️ Validate stock from backend
  //   try {
  //     const data = await cartService.validateStock(session?.user?.token);
  //     console.log('data:>', data)
  //     if (!data.success && data.unavailableItems?.length > 0) {
  //       setUnavailableItems(data.unavailableItems);
  //       setShowUnavailableAlert(true);
  //       return;
  //     }

  //     router.push("/checkout");
  //   } catch (err: any) {
  //     console.error('err:>', err);
  //     setErrorMsg(err?.message)
  //   }

  // };


  const handleCheckoutClick = async () => {
    // 1️. Check that cart isn't empty
    if (cartItems.length === 0) {
      setErrorMsg("Your cart is empty. Please add some items before checking out.");
      return;
    }

    try {
      // 2️. Sync + validate cart first (same as handlePaymentBtn)
      const syncResponse = await cartService.syncCart(session?.user?.token, cartItems);

      if (!syncResponse?.success) {
        setErrorMsg("Something went wrong while syncing your cart. Please refresh.");
        return;
      }

      const { syncedCart, changes } = syncResponse;

      // 3️. Handle changes in cart (price, stock, removal)
      const hasChanges =
        changes.removed > 0 ||
        changes.priceUpdated > 0 ||
        changes.quantityUpdated > 0;

      if (hasChanges) {
        const changedItems = [];

        if (changes.removed > 0) {
          changedItems.push({
            name: "Removed Items",
            issues: [`${changes.removed} item(s) were removed because they're no longer available.`],
          });
        }

        if (changes.quantityUpdated > 0) {
          changedItems.push({
            name: "Quantity Adjusted",
            issues: [`${changes.quantityUpdated} item(s) had reduced stock; quantities updated.`],
          });
        }

        if (changes.priceUpdated > 0) {
          changedItems.push({
            name: "Price Updated",
            issues: [`${changes.priceUpdated} item(s) had a price change.`],
          });
        }

        // Show the unavailable alert to the user
        setUnavailableItems(changedItems);
        setShowUnavailableAlert(true);

        // Refresh local cart data
        await refreshCart();

        return; // stop checkout flow
      }

      // 4️. Refresh cart after sync
      await refreshCart();

      // 5️. Run final stock validation (to catch edge cases)
      const validation = await cartService.validateStock(session?.user?.token);

      if (!validation.success && validation.unavailableItems?.length > 0) {
        setUnavailableItems(validation.unavailableItems);
        setShowUnavailableAlert(true);
        return;
      }

      //  All good — proceed to checkout page
      router.push("/checkout");
    } catch (err: any) {
      console.error("Checkout preparation error:", err);
      setErrorMsg(err?.message || "Unable to proceed to checkout right now.");
    }
  };

  const checkoutButtonStyle = {
    borderColor: "var(--brand-secondary)",
    color: "var(--white)",
    backgroundColor: "var(--brand-secondary)",
    borderRadius: "9999px",
    padding: "10px 0",
    fontSize: "15px",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: "var(--brand-primary)",
      color: "white",
      borderColor: "var(--brand-primary)",
    },
  };

  return (
    <>
      {(loading && cartItems.length === 0) ? (
        <Loader />
      ) : cartItems.length === 0 ? (
       
        // Empty cart UI
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/*  Cart Items */}
            <div className="lg:col-span-2 space-y-10">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[var(--soft-gray)] bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/*  Product Image */}
                    <div className="relative w-full sm:w-40 aspect-square rounded-lg overflow-hidden border border-[var(--soft-gray)] bg-white shadow-sm group-hover:shadow-md transition-all duration-300">
                      <Image
                        src={item?.selectedVariantData?.variantImages?.[0]?.url || item.product.productimage?.[0]?.url || "/images/placeholder.png"}
                        alt={item.product.title}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/*  Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <h3 className="font-semibold text-[var(--text-primary)] text-lg leading-snug">
                          {item.product.title}
                        </h3>
                        <div className="text-[var(--brand-primary)] font-bold text-lg tracking-wide">
                          £{(item.selectedVariantData?.price * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      {/*  Variant Info */}
                      {item.selectedVariantData && (
                        <div className="mt-2 text-sm text-[var(--text-muted)] space-y-1">
                          {item.selectedVariantData.colorName && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Color:</span>
                              <span>{item.selectedVariantData.colorName}</span>
                              <span
                                className="inline-block w-4 h-4 rounded-full border"
                                style={{ backgroundColor: item.selectedVariantData.hexCode }}
                              />
                            </div>
                          )}
                          {item.selectedVariantData.sizeName && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Size:</span>
                              <span>{item.selectedVariantData.sizeName}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/*  Quantity & Remove */}
                      <div className="flex items-center gap-3 mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-[var(--soft-gray)] rounded-full overflow-hidden">
                          {/* Minus Button */}
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantity(
                                item.productId,
                                item.variantId,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            disabled={item.quantity <= 1}
                            className={`px-3 py-1 transition ${item.quantity <= 1
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white"
                              }`}
                          >
                            <Minus size={16} />
                          </button>

                          {/* Quantity Display */}
                          <span className="px-4 min-w-[40px] text-center font-medium">
                            {item.quantity}
                          </span>

                          {/* Plus Button */}
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantity(
                                item.productId,
                                item.variantId,
                                Math.min(30, item.quantity + 1)
                              )
                            }
                            disabled={item.quantity >= (item.availableStock ?? 30)}
                            className={`px-3 py-1 transition ${item.quantity >= (item.availableStock ?? 30)
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white"
                              }`}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemove(item.productId, item.variantId)}
                          className="p-2 rounded-full bg-[var(--soft-gray)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>


                      {/* <div className="flex items-center gap-3 mt-4">
                        <div className="flex items-center border border-[var(--soft-gray)] rounded-full overflow-hidden">
                          <button
                            onClick={() =>
                              handleQuantity(
                                item.productId,
                                item.variantId,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className="px-3 py-1 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition"
                          >
                            −
                          </button>
                          <span className="px-4 min-w-[40px] text-center">{item.quantity}</span>
                          <button
                            onClick={() =>
                              handleQuantity(
                                item.productId,
                                item.variantId,
                                Math.min(30, item.quantity + 1)
                              )
                            }
                            className="px-3 py-1 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.productId, item.variantId)}
                          className="p-2 rounded-full bg-[var(--soft-gray)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/*  Summary */}
            <div className="lg:pl-8 lg:sticky lg:top-24 h-fit rounded-2xl border border-[var(--soft-gray)] bg-white p-7 shadow-md">
              <h2 className="text-lg font-semibold mb-5 text-[var(--text-primary)] uppercase tracking-wide">
                Order Summary
              </h2>

              <div className="space-y-3 text-[var(--text-primary)] mb-6">
                {cartItems.map((i, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="inline-flex flex-col max-w-[220px]">
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium">{i.quantity}</span>
                        <span className="text-[var(--text-muted)]">×</span>
                        <span
                          className="line-clamp-2 break-words text-[var(--text-primary)] leading-snug"
                          title={i.product.title}
                        >
                          {i.product.title}
                        </span>
                      </span>
                    </span>
                    <span className="font-medium">
                      £{(i.selectedVariantData?.price * i.quantity).toFixed(2)}
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

              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)] underline hover:text-[var(--brand-secondary)] transition"
                >
                  <ArrowLeft size={16} />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <PopupAlert
        type={popUpAlertData.type as any}
        message={popUpAlertData.message}
        confirmText={popUpAlertData.type === "confirm" ? "Yes" : "OK"}
        cancelText={popUpAlertData.type === "confirm" ? "Cancel" : undefined}
        onConfirm={popUpAlertData.onConfirm}
        onCancel={popUpAlertData.onCancel}
        show={popUpAlertData.isOpen}
      />


      {errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg(null)} />}

      {/* Show unavailable stock alert */}
      {showUnavailableAlert && (
        <UnavailableStockAlert
          unavailableItems={unavailableItems}
          onClose={() => setShowUnavailableAlert(false)}
        />
      )}

    </>
  );
}
