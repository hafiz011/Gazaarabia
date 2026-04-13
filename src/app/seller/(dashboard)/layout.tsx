import type { Metadata } from "next";
import SellerLayout from "@/components/layout/SellerLayout";
import "../../globals.css";

export const metadata: Metadata = {
  title: "Seller Panel - Gazaarabia",
  description: "Seller dashboard",
};

export default function SellerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SellerLayout>{children}</SellerLayout>
  );
}
