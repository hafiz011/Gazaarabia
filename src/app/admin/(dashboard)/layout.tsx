import type { Metadata } from "next";
import AdminLayout from "@/components/layout/AdminLayout";
import "../../globals.css";

export const metadata: Metadata = {
  title: "Admin Panel - Gazaarabia",
  description: "Admin dashboard",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout>{children}</AdminLayout>
  );
}
