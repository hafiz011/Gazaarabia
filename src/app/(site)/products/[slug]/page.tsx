"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Star, Truck, RefreshCw, Phone, Tag } from "lucide-react";
import HowWeDoIt from "@/components/HowWeDoIt";
import ProductSuggestions from "@/components/ProductSuggestions";
import AccordionSection from "@/components/ProductAccordian";
import { getProductBySlug } from "@/lib/services/front-end/productService";
import { wishlistService } from "@/lib/services/front-end/wishlistService";
import { cartService } from "@/lib/services/front-end/cartService";
import Loader from "@/components/Loader";
import NoData from "@/components/NoData";
import { ROUTES } from "@/constants/routes";

import AuthPromptModal from "@/components/AuthPromptModal";
import CartDrawer from "@/components/CartDrawer";


export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.token || null;

  const [product, setProduct] = useState<any>(null);
  const [wishlist, setWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [zoomVisible, setZoomVisible] = useState(false);
  const [backgroundPosition, setBackgroundPosition] = useState("0% 0%");
  const imgRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [cartDrawer, setCartDrawer] = useState(false);

  const fallbackSizes = ["S", "M", "L", "XL", "XXL"];
  const fallbackHighlights = [
    "Premium genuine leather",
    "Regular fit with a modern silhouette",
    "Durable zip closure with high-quality hardware",
    "Soft polyester lining for comfort",
    "Available in 5 classic colors",
  ];

  const reviews: any = [
    {
      name: "Rahul Sharma",
      rating: 5,
      comment: "Excellent quality and fits perfectly! Worth the price.",
      date: "15 Oct 2025",
    },
    {
      name: "Amit Verma",
      rating: 4,
      comment: "Very comfortable and stylish. Recommended.",
      date: "13 Oct 2025",
    },
    {
      name: "Sandeep K",
      rating: 3,
      comment: "Good product but delivery was delayed.",
      date: "10 Oct 2025",
    },
  ];

  // 🧭 Fetch product details
  useEffect(() => {
    if (!slug || status === "loading") return;

    (async () => {
      try {
        setLoading(true);
        const data = await getProductBySlug(token, slug);
        if (data) {
          data.reviews = reviews;
          data.highlights = fallbackHighlights;
          setProduct(data);
          setWishlist(data.isInWishlist || false);

          if (data.productvariant?.length > 0 && data.productvariant[0].color) {
            setSelectedColor({
              name: data.productvariant[0].color.name,
              hex: data.productvariant[0].color.hexCode,
            });
          }
          setSelectedSize(fallbackSizes[0]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch product details:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, token, status]);

  // 🖼 Image zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  // ❤️ Wishlist Toggle
  const handleWishlistToggle = async () => {
    // if (!token) {
    //   alert("Login to add into bag")
    //   return;
    // }

    const newState = !wishlist;
    setWishlist(newState); // Optimistic UI
    if (token) {
      try {
        if (newState) {
          await wishlistService.add(token, product.id);
        } else {
          await wishlistService.remove(token, product.id);
        }
      } catch (error) {
        console.error("❌ Wishlist toggle failed:", error);
        setWishlist(!newState); // Revert UI
      }
    }
  };

  // 🛒 Add to Cart
  const handleAddToCart = async () => {
    if (!token) {
      setShowLoginModal(true)
      return;
    }

    setAddingToCart(true);
    try {
      await cartService.add(token, product.id, 1);
      setCartDrawer(true)
      console.log("Product added to cart");
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setAddingToCart(false);
    }
  };

  const images = Array.isArray(product?.productimage)
    ? product.productimage.map((img: any) => img.url)
    : [];
  const colors = Array.isArray(product?.productvariant)
    ? product.productvariant
      .filter((v: any) => v.color)
      .map((v: any) => ({
        name: v.color.name,
        hex: v.color.hexCode,
      }))
    : [];

  const sizes = fallbackSizes;
  const totalReviews = product?.reviews.length || 0;
  const avgRating =
    totalReviews > 0
      ? (
        product?.reviews.reduce(
          (acc: number, r: any) => acc + r.rating,
          0
        ) / totalReviews
      ).toFixed(1)
      : 0;

  return (
    <>
      {(loading || status === "loading") && <Loader />}

      {(!product && !loading) ? (
        <NoData message="No product found." />
      ) : (
        <>
          {/* 🌟 Product Section */}
          <section className="max-w-[1600px] mx-auto px-2 md:px-4 lg:px-6 pt-20 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-10 bg-[var(--background)]">
            {/* 🖼 Images */}
            <div className="relative flex gap-4 items-start h-[700px]">
              <div className="hidden md:flex flex-col gap-3 w-20 overflow-y-auto h-full">
                {images.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setActiveThumb(index)}
                    className={`relative w-full aspect-[3/4] overflow-hidden rounded-lg border-2 transition ${activeThumb === index
                      ? "border-[var(--brand-primary)]"
                      : "border-gray-200 hover:border-[var(--brand-primary)]"
                      }`}
                  >
                    <img
                      src={img}
                      alt={`thumb-${index}`}
                      className="w-full h-full object-contain bg-white"
                    />
                  </button>
                ))}
              </div>

              <div
                ref={imgRef}
                className="relative flex-1 h-[700px] rounded-2xl bg-white flex items-center justify-center cursor-crosshair border"
                onMouseEnter={() => setZoomVisible(true)}
                onMouseLeave={() => setZoomVisible(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  src={images[activeThumb || 0]}
                  alt={product?.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {zoomVisible && images[activeThumb] && (
                <div
                  className="hidden lg:block absolute top-0 left-[calc(100%+20px)] 
                  w-[700px] h-[750px] rounded-xl border shadow-lg bg-white 
                  bg-no-repeat bg-center z-10"
                  style={{
                    backgroundImage: `url("${images[activeThumb]}")`,
                    backgroundPosition,
                    backgroundSize: "200%",
                  }}
                />
              )}
            </div>

            {/* 🛍 Info */}
            <div className="flex flex-col justify-start text-left">
              <h1 className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)] mb-2">
                {product?.title}
              </h1>
              <p className="text-lg font-medium text-[var(--brand-primary)] mb-4">
                £{product?.sellingPrice}
              </p>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                {product?.shortDescription}
              </p>

              {/* 🎨 Colors */}
              {colors.length > 0 && selectedColor && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">
                    Colour: {selectedColor.name}
                  </h4>
                  <div className="flex gap-2">
                    {colors.map((c: any, i: any) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(c)}
                        className={`w-8 h-8 rounded-full border-2 ${selectedColor.hex === c.hex
                          ? "border-[var(--brand-primary)]"
                          : "border-gray-300"
                          }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 📏 Sizes */}
              {sizes.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">Select Size</h4>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setSelectedSize(s)}
                        className={`px-4 py-2 text-sm rounded border transition ${selectedSize === s
                          ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                          : "border-gray-300 hover:border-[var(--brand-primary)]"
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 🛒 Add to Cart + ❤️ Wishlist */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={`flex-1 py-3 text-white font-semibold rounded transition ${addingToCart
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[var(--brand-primary)] hover:opacity-90"
                    }`}
                >
                  {addingToCart ? "Adding..." : "ADD TO BAG"}
                </button>

                <button
                  onClick={handleWishlistToggle}
                  className="p-3 border rounded bg-white hover:border-[var(--brand-primary)] transition"
                >
                  <Heart
                    size={20}
                    className={`transition ${wishlist
                      ? "fill-[var(--brand-primary)] text-[var(--brand-primary)]"
                      : "text-[var(--text-primary)] hover:fill-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                      }`}
                  />
                </button>
              </div>

              {/* 🧾 Description */}
              <AccordionSection title="Description & Details">
                {product?.description ? (
                  <p>{product?.description}</p>
                ) : (
                  <p>No description available.</p>
                )}
              </AccordionSection>

              {/* 🌿 Material Care */}
              <AccordionSection title="Materials & Care Advice">
                {product?.materialCare ? (
                  <div className="space-y-2">
                    <div className="flex gap-3 items-start">
                      {product?.materialCare.icon && (
                        <img
                          src={product?.materialCare.icon}
                          alt={product?.materialCare.title}
                          className="w-10 h-10 object-contain"
                        />
                      )}
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)]">
                          {product?.materialCare.title}
                        </h4>
                        <p>{product?.materialCare.description}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>No material care information available.</p>
                )}
              </AccordionSection>

              {/* 🚚 Delivery */}
              <AccordionSection title="Delivery & Returns">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <Truck size={18} className="text-[var(--text-primary)]" />
                    <span>Free delivery on all orders over £120.00</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <RefreshCw size={18} className="text-[var(--text-primary)]" />
                    <span>Free exchanges & easy returns</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone size={18} className="text-[var(--text-primary)]" />
                    <span>Contact our customer care team</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Tag size={18} className="text-[var(--text-primary)]" />
                    <span>Discover more about the brand</span>
                  </li>
                </ul>
              </AccordionSection>
            </div>
          </section>

          {/* ⭐ Reviews */}
          <section className="max-w-[1200px] mx-auto px-4 py-12 border-t">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
              Customer Reviews & Ratings
            </h2>
            <div className="flex items-center gap-4 mb-8">
              <div className="text-4xl font-bold text-[var(--brand-primary)]">
                {avgRating}
              </div>
              <div>
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.floor(Number(avgRating))
                          ? "fill-[var(--brand-primary)] text-[var(--brand-primary)]"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Based on {totalReviews} reviews
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {product?.reviews.map((review: any, index: number) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 shadow-sm bg-white flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-[var(--text-primary)]">
                      {review.name}
                    </h4>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {review.date}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < review.rating
                            ? "fill-[var(--brand-primary)] text-[var(--brand-primary)]"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <AuthPromptModal
            show={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onLogin={() => router.push(ROUTES.USER.LOGIN)}
          />

          <CartDrawer isOpen={cartDrawer} onClose={() => setCartDrawer(false)} />

          <ProductSuggestions />
          <HowWeDoIt />
        </>
      )}
    </>
  );
}
