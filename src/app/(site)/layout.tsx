import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "../context/CartContext";

export const metadata: Metadata = {
  title: "Gazaarabia",
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
        <Header />
        <main className="pt-20">
          {/* <CartProvider> */}
          {children}
          {/* </CartProvider> */}
        </main>
        <Footer />
      </body>
    </html>
  );
}
