import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "./SessionProviderWrapper";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayPalProviderWrapper from "@/components/PayPalProviderWrapper";
import { CartProvider } from "./context/CartContext";

export const metadata: Metadata = {
  title: "Gaza Arabia",
  // description: "Inspired by Gazaarabia — Modern modest fashion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
           <PayPalProviderWrapper>
             <CartProvider>
             {children}
             </CartProvider>
          </PayPalProviderWrapper>
         
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
