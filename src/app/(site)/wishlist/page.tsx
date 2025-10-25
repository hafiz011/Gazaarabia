"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import ProductCard, { Product } from "@/components/SimpleProductCard";
import Pagination from "@/components/Pagination";
import { wishlistService } from "@/lib/services/front-end/wishlistService";
import { cartService } from "@/lib/services/front-end/cartService";
import Loader from "@/components/Loader";
import AlertMessage from "@/components/AlertMessage";
import CartDrawer from "@/components/CartDrawer";
import { ROUTES } from "@/constants/routes";

export default function WishlistPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const token = session?.user?.token || null;

  const [cartDrawer, setCartDrawer] = useState(false);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "";
    message: string;
  }>({
    isOpen: false,
    type: "",
    message: "",
  });

  // 🧾 Fetch wishlist (only if authenticated)
  const fetchWishlist = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await wishlistService.getAll(token, currentPage, 10);
      const formatted = data.wishlist.map((w: any) => ({
        id: w.product.id,
        slug: w.product.slug,
        title: w.product.title,
        img: w.product.productimage?.[0]?.url || "/images/placeholder.jpg",
        price: `${w.product.sellingPrice}`,
        isNew: false,
        isWishlisted: true,
      }));
      setWishlist(formatted);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setAlert({ isOpen: true, type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && token) {
      fetchWishlist();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, token, currentPage]);

  useEffect(() => {
    if (status === "authenticated") {
      router.push(`?page=${currentPage}`, { scroll: false });
    }
  }, [currentPage, router, status]);

  // ❌ Remove item
  const handleRemove = async (product: Product) => {
    try {
      await wishlistService.remove(token!, Number(product.id));
      fetchWishlist();
      setAlert({
        isOpen: true,
        type: "success",
        message: "Removed from wishlist.",
      });
    } catch (err: any) {
      setAlert({ isOpen: true, type: "error", message: err.message });
    }
  };

  // 🛍️ Add to bag
  const handleAddToBag = async (product: Product) => {
    if (!token) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Please login to add items to your bag.",
      });
      return;
    }

    try {
      await cartService.add(token, Number(product.id), 1);
      setAlert({
        isOpen: true,
        type: "success",
        message: `${product.title} added to your bag.`,
      });
      setCartDrawer(true);
    } catch (error: any) {
      setAlert({
        isOpen: true,
        type: "error",
        message: error.message || "Failed to add to bag.",
      });
    }
  };

  // ❤️ Wishlist toggle
  const handleWishlistToggle = (product: Product) => {
    handleRemove(product);
  };

  // 🌀 Show loader while session resolving
  if (status === "loading" || loading) {
    return <Loader />;
  }

  // 🚨 Show login prompt if not logged in
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center text-center p-6 pt-28 pb-20">
        <Heart size={40} className="text-[var(--brand-primary)] mb-4" />
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
          You’re not logged in
        </h2>
        <p className="text-[var(--text-muted)] text-sm mb-6">
          Please log in to view and manage your wishlist.
        </p>
        <Link
          href={ROUTES.USER.LOGIN}
          className="bg-[var(--brand-primary)] text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition"
        >
          Login
        </Link>
      </div>
    );
  }


  // ✅ Authenticated user wishlist
  return (
    <>
      <div className="max-w-[1400px] mx-auto px-4 py-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            My Wishlist
          </h1>
          {wishlist.length > 0 &&
            <p className="text-[var(--text-muted)] mt-2 text-sm">
              {wishlist.length} item{wishlist.length !== 1 && "s"} on this page
            </p>
          }
        </div>

        {alert.isOpen && alert.type && (
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert((p) => ({ ...p, isOpen: false }))}
          />
        )}

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-8 pb-20">
            <Heart size={50} className="text-[var(--soft-gray)] mb-4" />
            <p className="text-[var(--text-muted)] mb-6 text-center">
              Your wishlist is empty. Start adding products you love!
            </p>
            <Link
              href="/"
              className="bg-[var(--brand-primary)] text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {wishlist.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  removable
                  onRemove={handleRemove}
                  onAddToBag={handleAddToBag}
                  onToggleWishlist={handleWishlistToggle}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* 🛒 Cart Drawer */}
      <CartDrawer isOpen={cartDrawer} onClose={() => setCartDrawer(false)} />
    </>
  );
}
