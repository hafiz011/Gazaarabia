import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "./SessionProviderWrapper";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayPalProviderWrapper from "@/components/PayPalProviderWrapper";
import { CartProvider } from "./context/CartContext";
import CookieConsentModal from "@/components/CookieConsentModal";
import GoogleTagManager from "@/components/analytics/GoogleTagManager";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import FacebookPixel from "@/components/analytics/FacebookPixel";



export const metadata: Metadata = {
  metadataBase: new URL("https://gazaarabia.com"),
  title: {
    default: "Gazaarabia | Inspired by Gazaarabia — Modern modest fashion",
    template: "%s | Gazaarabia",
  },
  description:
    "Gazaarabia offers modern modest fashion inspired by the resilience and beauty of Gaza. Shop our unique collection of hijabs, abayas, and modest wear.",
  keywords: [
    "Gazaarabia",
    "modest fashion",
    "hijab",
    "abaya",
    "Islamic clothing",
    "modern modest wear",
    "Gaza inspired fashion",
  ],
  authors: [{ name: "Gazaarabia Team" }],
  creator: "Gazaarabia",
  publisher: "Gazaarabia",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://gazaarabia.com",
    siteName: "Gazaarabia",
    title: "Gazaarabia | Modern Modest Fashion",
    description:
      "Modern modest fashion inspired by the resilience and beauty of Gaza.",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Gazaarabia - Modern Modest Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gazaarabia | Modern Modest Fashion",
    description:
      "Modern modest fashion inspired by the resilience and beauty of Gaza.",
    images: ["/images/logo.png"],
    creator: "@gazaarabia",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GoogleTagManager />
        <GoogleAnalytics />
        <FacebookPixel />
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
