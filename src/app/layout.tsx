import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
