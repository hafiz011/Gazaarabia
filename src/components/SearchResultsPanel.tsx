"use client";

import ProductCard from "@/components/ProductCard";
import Loader from "@/components/Loader";

interface SearchResultsPanelProps {
  loading: boolean;
  products: any[];
  total: number;
  query: string;
  onClose: () => void;
  onShowAll: () => void;
}

export default function SearchResultsPanel({
  loading,
  products,
  total,
  query,
  onClose,
  onShowAll,
}: SearchResultsPanelProps) {
  if (!query) return null;

  return (
    <div className="absolute top-full left-0 mt-6 w-full max-w-[1100px] bg-white shadow-xl border rounded-xl p-6 z-50">

      {/* Loader */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader />
        </div>
      )}

      {/* No results */}
      {!loading && products.length === 0 && (
        <div className="py-10 text-center text-gray-500">
          No products found
        </div>
      )}

      {/* Results Grid */}
      {!loading && products.length > 0 && (
        <>
          <div
            className="
              grid 
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
              gap-x-4 gap-y-8
            "
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onWishlistToggle={() => {}} // optional: wire later
              />
            ))}
          </div>

          {/* Show All */}
          {total > products.length && (
            <div
              onClick={onShowAll}
              className="mt-8 text-center text-sm font-medium cursor-pointer hover:underline"
            >
              Show all ({total}) results
            </div>
          )}
        </>
      )}
    </div>
  );
}
