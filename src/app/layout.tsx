import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "./SessionProviderWrapper";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayPalProviderWrapper from "@/components/PayPalProviderWrapper";
import { CartProvider } from "./context/CartContext";

export const metadata: Metadata = {
  title: "Gaza Arabia",
  // description: "Inspired by Gazaarabia — Modern modest fashion",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
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
