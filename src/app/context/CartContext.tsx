"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { localCartService } from "@/lib/services/front-end/localCartService";
import { cartService } from "@/lib/services/front-end/cartService";
import { useSession } from "next-auth/react";

interface CartContextProps {
  cartCount: number;
  refreshCart: () => Promise<void>;
  setCartCount: React.Dispatch<React.SetStateAction<number>>;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const token = session?.user?.token || null;

  const [cartCount, setCartCount] = useState(0);

const refreshCart = async () => {
  try {
    let totalQuantity = 0;

    if (token) {
      const data = await cartService.getAll(token);
      if (Array.isArray(data.cart)) {
        totalQuantity = data.cart.reduce(
          (sum:any, item:any) => sum + (item.quantity || 0),
          0
        );
      }
    } else {
      const data = localCartService.get();
      if (Array.isArray(data.cart)) {
        totalQuantity = data.cart.reduce(
          (sum:any, item:any) => sum + (item.quantity || 0),
          0
        );
      }
    }

    setCartCount(totalQuantity);
  } catch (err) {
    console.error("Error fetching cart:", err);
  }
};


  useEffect(() => {
    refreshCart();
  }, [token]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, setCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
