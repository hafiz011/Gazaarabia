"use client";

import {
  Drawer,
  IconButton,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import { X, Trash2, ShoppingBag, Truck, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { cartService } from "@/lib/services/front-end/cartService";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { data: session } = useSession();
  const token = session?.user?.token || null;

  const [items, setItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [drawerWidth, setDrawerWidth] = useState("360px");

  const quantityList = Array.from({ length: 30 }, (_, i) => i + 1);

  // 🧭 Responsive drawer width
  useEffect(() => {
    const handleResize = () => {
      setDrawerWidth(window.innerWidth < 400 ? "85%" : "360px");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🛒 Fetch cart items
  const fetchCart = async () => {
    if (!token) {
      setItems([]);
      setSubtotal(0);
      return;
    }
    try {
      setLoading(true);
      const data = await cartService.getAll(token);
      setItems(data.cart || []);
      setSubtotal(data.subtotal || 0);
    } catch (err) {
      console.error("❌ Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      fetchCart();
    }
  }, [isOpen, token]);

  const freeShippingThreshold = 60;
  const remaining = Math.max(0, freeShippingThreshold - subtotal);

  // 🗑 Remove item
  const removeItem = async (productId: number) => {
    if (!token) return;
    try {
      const res = await cartService.remove(token, productId);
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      if (res.subtotal !== undefined) setSubtotal(res.subtotal);
    } catch (err) {
      console.error("❌ Failed to remove item", err);
    }
  };

  // ✏️ Update quantity
  const handleQuantity = async (productId: number, value: number) => {
    if (!token) return;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: value } : item
      )
    );

    try {
      const res = await cartService.updateQuantity(token, productId, value);
      if (res.subtotal !== undefined) setSubtotal(res.subtotal);
    } catch (err) {
      console.error("Failed to update quantity", err);
      fetchCart();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: drawerWidth,
          backgroundColor: "var(--background)",
          color: "var(--text-primary)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 0 25px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* 🧭 Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[var(--soft-gray)] bg-[var(--soft-gray)]/30 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <ShoppingBag size={22} className="text-[var(--brand-primary)]" />
          <h2 className="text-lg font-semibold tracking-wide uppercase">
            Shopping Bag
          </h2>
        </div>
        <IconButton onClick={onClose} sx={{ color: "var(--text-primary)" }}>
          <X size={20} />
        </IconButton>
      </div>

      {/* 🛍️ Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && (
          <div className="text-center mt-10 text-[var(--text-muted)] text-sm">
            Loading your cart...
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center mt-10">
            <ShoppingBag
              size={40}
              className="mx-auto mb-3 text-[var(--text-muted)]"
            />
            <p className="text-[var(--text-muted)] text-sm">
              Your cart is empty.
            </p>
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-stretch gap-4 border border-[var(--soft-gray)] rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 bg-white"
          >
            {/* 🖼️ Image */}
            <div className="relative w-24 aspect-square rounded-lg overflow-hidden border border-[var(--soft-gray)] flex-shrink-0 bg-white">
              <Image
                src={
                  item.product.productimage[0]?.url || "/images/placeholder.png"
                }
                alt={item.product.title}
                fill
                className="object-contain p-1"
              />
            </div>

            {/* 📄 Content */}
            <div className="flex-1 flex flex-col justify-between">
              <p className="text-sm font-semibold leading-tight line-clamp-1">
                {item.product.title}
              </p>
              <p className="mt-1 text-[15px] font-semibold text-[var(--brand-primary)]">
                £{(item.product.sellingPrice * item.quantity).toFixed(2)}
              </p>

              <div className="flex items-center justify-between mt-3">
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

                <IconButton
                  onClick={() => removeItem(item.productId)}
                  sx={{
                    backgroundColor: "var(--soft-gray)",
                    color: "var(--brand-primary)",
                    "&:hover": {
                      backgroundColor: "var(--brand-primary)",
                      color: "#fff",
                    },
                    width: 34,
                    height: 34,
                    transition: "0.2s",
                  }}
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 📊 Footer */}
      {items.length > 0 && (
        <div className="border-t border-[var(--soft-gray)] bg-white">
          {/* 🚚 Free shipping message */}
          <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm bg-[var(--soft-gray)]/30">
            <Truck size={18} className="text-[var(--brand-primary)]" />
            {remaining > 0 ? (
              <span className="text-[var(--text-muted)]">
                Spend{" "}
                <span className="font-semibold text-[var(--brand-primary)]">
                  £{remaining}
                </span>{" "}
                more for free shipping.
              </span>
            ) : (
              <span className="font-medium text-[var(--brand-primary)]">
                You’ve unlocked free shipping!
              </span>
            )}
          </div>

          <Divider />

          <div className="px-5 pt-5 pb-7 space-y-4 bg-white shadow-inner">
            <div className="flex justify-between items-center pb-2">
              <span className="text-[16px] font-semibold text-[var(--text-primary)]">
                Subtotal
              </span>
              <span className="text-[22px] font-bold text-[var(--brand-primary)] tracking-wide">
                £{subtotal.toFixed(2)}
              </span>
            </div>

            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center justify-between w-full px-5 py-3 rounded-xl border border-[var(--soft-gray)] bg-white hover:shadow-md hover:border-[var(--brand-primary)] transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 text-[var(--text-primary)] group-hover:text-[var(--brand-primary)]">
                <ShoppingBag size={20} />
                <span className="font-medium text-[15px]">View Your Bag</span>
              </div>
              <ArrowRight
                size={18}
                className="text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition"
              />
            </Link>
          </div>
        </div>
      )}
    </Drawer>
  );
}
