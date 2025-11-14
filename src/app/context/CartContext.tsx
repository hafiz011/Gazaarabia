"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { cartService } from "@/lib/services/front-end/cartService";
import { useSession } from "next-auth/react";
import { localCartService } from "@/lib/services/front-end/localCartService";

interface CartContextProps {
  cart: any[];
  subtotal: number;
  cartCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  setCart: React.Dispatch<React.SetStateAction<any[]>>;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const token = session?.user?.token || null;

  const [cart, setCart] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Unified refreshCart
  const refreshCart = async () => {
    setLoading(true);
    try {
      const data = await cartService.getAll(token);
      setCart(data.cart || []);
      setSubtotal(data.subtotal || 0);
      const totalQuantity = Array.isArray(data.cart)
        ? data.cart.reduce((sum: any, i: any) => sum + (i.quantity || 0), 0)
        : 0;
      setCartCount(totalQuantity);
    } catch (err) {
      console.error("Error refreshing cart:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load when user logs in/out
  useEffect(() => {
    refreshCart();
  }, [token]);

  return (
    <CartContext.Provider
      value={{ cart, subtotal, cartCount, loading, refreshCart, setCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
