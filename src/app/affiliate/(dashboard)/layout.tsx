import type { Metadata } from "next";
import "../../globals.css";
import AffiliateLayout from "@/components/affiliate/AffiliateLayout";

export const metadata: Metadata = {
  title: "Affiliate Dashboard - Gaza Arabia",
  description: "Affiliate panel for managing earnings, payouts, and performance.",
};

export default function AffiliateRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#f5f6fa] text-[var(--text-primary)]">
        <AffiliateLayout>{children}</AffiliateLayout>
      </body>
    </html>
  );
}
