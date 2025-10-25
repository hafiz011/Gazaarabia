import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "./SessionProviderWrapper";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayPalProviderWrapper from "@/components/PayPalProviderWrapper";

export const metadata: Metadata = {
  title: "Gaza Arabia",
  description: "Inspired by AAB Collection — Modern modest fashion",
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
             {children}
          </PayPalProviderWrapper>
         
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
