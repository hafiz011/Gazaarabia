import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "./SessionProviderWrapper";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayPalProviderWrapper from "@/components/PayPalProviderWrapper";
import { CartProvider } from "./context/CartContext";
import CookieConsentModal from "@/components/CookieConsentModal";


export const metadata: Metadata = {
  title: "Gazaarabia",
  // description: "Inspired by Gazaarabia — Modern modest fashion",
  icons: {
    icon: "/favicon.png",
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
              <CookieConsentModal />
              {children}
            </CartProvider>
          </PayPalProviderWrapper>

        </SessionProviderWrapper>
      </body>
    </html>
  );
}
