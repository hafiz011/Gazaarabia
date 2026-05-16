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
    default: "GAZAARABIA | UK's Muslim Fashion Marketplace",
    template: "%s | GAZAARABIA",
  },
  description:
    "Shop modest fashion from Muslim-owned UK brands. Abayas, kaftans & hijabs — every purchase helps people in Palestine, Gaza, Sudan, Yemen & Beyond.",
  keywords: [
    // Brand
    "GAZAARABIA",
    "Muslim fashion with purpose",
    "modest fashion with purpose",

    // Homepage core
    "modest fashion UK",
    "Muslim clothing UK",
    "Muslim owned fashion brand UK",
    "modest fashion marketplace UK",
    "Islamic clothing online UK",
    "ethical Muslim fashion UK",
    "buy modest fashion from Muslim brands UK",
    "modest fashion charity UK",

    // Abayas
    "abaya UK",
    "buy abaya UK",
    "abayas UK online",
    "black abaya UK",
    "open abaya UK",
    "luxury abaya UK",
    "Eid abaya UK",
    "everyday abaya UK",
    "modest dress Muslim women UK",

    // Kaftans
    "kaftan UK",
    "buy kaftan UK online",
    "modest kaftan women UK",
    "Muslim kaftan UK",
    "kaftan for Eid UK",
    "Moroccan kaftan UK",
    "occasion kaftan Muslim women UK",

    // Hijabs
    "hijab UK",
    "buy hijab online UK",
    "chiffon hijab UK",
    "jersey hijab UK",
    "instant hijab UK",
    "hijab fashion UK",
    "Islamic headscarf UK",

    // New In & Sale
    "new modest fashion UK",
    "latest Muslim fashion arrivals UK",
    "modest fashion sale UK",
    "abaya sale UK",
    "affordable abayas UK",
    "hijab sale UK",
    "kaftan sale UK",
  ],
  authors: [{ name: "GAZAARABIA Team" }],
  creator: "GAZAARABIA",
  publisher: "GAZAARABIA",
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
    siteName: "GAZAARABIA",
    title: "GAZAARABIA | Modest Fashion With Purpose",
    description:
      "The UK's Muslim Fashion Movement. Shop abayas, kaftans & hijabs from Muslim-owned brands — every order helps people in Palestine, Gaza, Sudan, Yemen & Beyond.",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "GAZAARABIA - UK Muslim Fashion Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GAZAARABIA | UK's Muslim Fashion Marketplace",
    description:
      "Modest fashion. Muslim brands. Real purpose. Every purchase funds The Ummah Fund — Gaza, Sudan, Yemen & beyond.",
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
