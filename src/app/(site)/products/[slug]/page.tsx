"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Heart,
  Star,
  Truck,
  RefreshCw,
  Phone,
  Tag,
  Minus,
  Plus,
  X,
} from "lucide-react";

import HowWeDoIt from "@/components/HowWeDoIt";
import ProductSuggestions from "@/components/ProductSuggestions";
import AccordionSection from "@/components/ProductAccordian";
import { getProductBySlug } from "@/lib/services/front-end/productService";
import { wishlistService } from "@/lib/services/front-end/wishlistService";
import { cartService } from "@/lib/services/front-end/cartService";
import Loader from "@/components/Loader";
import NoData from "@/components/NoData";
import AuthPromptModal from "@/components/AuthPromptModal";
import CartDrawer from "@/components/CartDrawer";
import { ROUTES } from "@/constants/routes";
import VariantWarningModal from "@/components/VariantWarningModal";
import { useCart } from "@/app/context/CartContext";
import ErrorAlert from "@/components/ErrorAlert";
import SizeGuideModal from "@/components/home/SizeGuideModal";

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const token: any = session?.user?.token || null;

  const [product, setProduct] = useState<any>(null);
  const [wishlist, setWishlist] = useState<boolean>(false);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [activeThumb, setActiveThumb] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [zoomVisible, setZoomVisible] = useState<boolean>(false);
  const [backgroundPosition, setBackgroundPosition] = useState<string>("0% 0%");
  const imgRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [cartDrawer, setCartDrawer] = useState<boolean>(false);
  const [showVariantWarning, setShowVariantWarning] = useState<boolean>(false);
  const [images, setImages] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { refreshCart } = useCart();
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // identify the mobile or desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);


  // stop modal background scrolling
  useEffect(() => {
    document.body.style.overflow = showImageModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showImageModal]);



  //  Fetch product
  useEffect(() => {
    if (!slug || status === "loading") return;
    (async () => {
      try {
        setLoading(true);
        const data: any = await getProductBySlug(token, slug);
        setProduct(data);
        setWishlist(data?.isInWishlist || false);

        //  Find variant with images or fallback to product images
        if (Array.isArray(data.productvariant) && data.productvariant.length > 0) {
          const variantWithImages = data.productvariant.find(
            (v: any) => Array.isArray(v.variantImages) && v.variantImages.length > 0
          );

          if (variantWithImages) {
            setImages(variantWithImages.variantImages);
          } else if (Array.isArray(data.productimage) && data.productimage.length > 0) {
            setImages(data.productimage);
          } else {
            setImages([]);
          }
        } else if (Array.isArray(data.productimage) && data.productimage.length > 0) {
          setImages(data.productimage);
        } else {
          setImages([]);
        }
      } catch (err) {
        console.error("Failed to fetch product details:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, token, status]);

  const variants: any[] = Array.isArray(product?.productvariant)
    ? product.productvariant
    : [];

  const colors: any[] = Array.from(
    new Map(
      variants.filter((v) => v.color).map((v) => [v.color.id, v.color])
    ).values()
  );

  const sizes: any[] = Array.from(
    new Map(
      variants.filter((v) => v.size).map((v) => [v.size.id, v.size])
    ).values()
  );

  //  Auto select first color & size
  useEffect(() => {
    if (colors.length > 0 && !selectedColor) {
      const firstColor = colors[0];
      setSelectedColor(firstColor);

      const firstVariantForColor = variants.find(
        (v) => v.color?.id === firstColor.id && v.stock > 0
      );
      if (firstVariantForColor?.size) {
        setSelectedSize(firstVariantForColor.size);
      }
    }
  }, [colors, variants]);

  const selectedVariant: any =
    selectedColor && selectedSize
      ? variants.find(
        (v) =>
          v.color?.id === selectedColor.id && v.size?.id === selectedSize.id
      )
      : null;

  const availableStock = selectedVariant?.availableStock || 0;

  // video related vars 
  const hasVideo = Boolean(selectedVariant?.videoUrl);

  const getActiveImage = () => {
    if (!images.length) return null;

    if (hasVideo) {
      // activeThumb 0 = video, so images start from index 1
      return images[activeThumb - 1] || images[0];
    }

    return images[activeThumb] || images[0];
  };

  const getZoomImageUrl = () => {
  if (hasVideo && activeThumb === 0) {
    //  Do NOT zoom video
    return null;
  }

  if (hasVideo) {
    return images[activeThumb - 1]?.url || null;
  }

  return images[activeThumb]?.url || null;
};


  useEffect(() => {
    if (selectedVariant?.videoUrl) {
      setActiveThumb(0);
    } else {
      setActiveThumb(0);
    }
  }, [selectedVariant]);



  //  Color change → update images + size
  const handleColorChange = (color: any) => {
    setSelectedColor(color);
    const colorVariant = variants.find((v) => v.color?.id === color.id);

    //  Update images for selected color
    if (colorVariant?.variantImages?.length > 0) {
      setImages(colorVariant.variantImages);
      setActiveThumb(0);
    } else if (Array.isArray(product?.productimage)) {
      setImages(product.productimage);
      setActiveThumb(0);
    }

    const firstAvailableVariant = variants.find(
      (v) => v.color?.id === color.id && v.stock > 0
    );
    if (firstAvailableVariant?.size) {
      setSelectedSize(firstAvailableVariant.size);
    } else {
      setSelectedSize(null);
    }
    setQuantity(1);
  };

  const handleSizeChange = (size: any) => {
    setSelectedSize(size);
    setQuantity(1);
  };

  const handleQuantityChange = (newQty: number) => {
    if (selectedVariant && newQty > availableStock) return;
    if (newQty < 1) return;
    setQuantity(newQty);
  };

  //  Zoom effect
  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      setShowVariantWarning(true);
      return;
    }

    if (!selectedVariant || availableStock <= 0) return;

    try {
      setAddingToCart(true);

      const productData = {
        id: product.id,
        title: product.title,
        slug: product.slug,
        availableStock: product.availableStock,
        sellingPrice: product.sellingPrice,
        productimage: product.productimage || [],
      };

      const variantData = {
        id: selectedVariant.id,
        sizeId: selectedSize.id,
        colorId: selectedColor.id,
        sizeName: selectedSize.name,
        colorName: selectedColor.name,
        hexCode: selectedColor.hexCode,
        price: selectedVariant.price,
        availableStock: selectedVariant.availableStock,
        variantImages: selectedVariant.variantImages || [],
      };


      console.log('productData:>', productData);
      console.log('variantData:>', variantData);
      // return;

      const res = await cartService.add(
        token,
        product.id,
        quantity,
        selectedVariant.id,
        selectedColor.id,
        selectedSize.id,
        productData,
        variantData
      );
      console.log('res:>', res)

      if (res?.error) {
        setErrorMsg(res.error);
        return;
      }

      await refreshCart(); // instantly updates Header count

      setCartDrawer(true);
    } catch (err: any) {
      console.error("Failed to add to cart:", err);
      setErrorMsg(err.message || "Unexpected error occurred.");
    } finally {
      setAddingToCart(false);
    }
  };


  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  return (
    <>
      {(loading || status === "loading") && <Loader />}
      {!product && !loading ? (
        <div className="mt-16 flex justify-center">
          <NoData message="No product found." />
        </div>
      ) : (
        <>
          <VariantWarningModal
            isOpen={showVariantWarning}
            onClose={() => setShowVariantWarning(false)}
          />

          {/* ========================== PRODUCT SECTION ========================== */}
          <section className="max-w-[1600px] mx-auto px-4 lg:px-6 pt-20 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-10 bg-[var(--background)]">
            {/*  IMAGES */}
            <div className="relative flex flex-col md:flex-row gap-4 items-center md:items-start md:h-[700px]">
              {/* Thumbnails */}
              {/* <div className="order-2 md:order-1 flex md:flex-col gap-3 w-full md:w-20 overflow-x-auto md:overflow-y-auto"> */}
                
                <div className="order-2 md:order-1 flex md:flex-col gap-3 w-full md:w-20 overflow-x-auto md:overflow-y-auto justify-center">

                {/* {images.map((img: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setActiveThumb(index)}
                    className={`relative w-20 h-20 flex-shrink-0 md:w-full md:aspect-[3/4] overflow-hidden rounded-lg border-2 transition ${activeThumb === index
                      ? "border-[var(--brand-primary)]"
                      : "border-gray-200 hover:border-[var(--brand-primary)]"
                      }`}
                  >
                    <img
                      src={img?.url}
                      alt={img?.alt || `thumb-${index}`}
                      className="w-full h-full object-contain bg-white"
                    />
                  </button>
                ))} */}

                {/* VIDEO THUMB (FIRST) */}
                {hasVideo && (
                  <button
                    onClick={() => setActiveThumb(0)}
                    className={`relative w-20 h-20 rounded-lg border-2 ${activeThumb === 0
                      ? "border-[var(--brand-primary)]"
                      : "border-gray-200"
                      }`}
                  >
                    <video
                      src={selectedVariant.videoUrl}
                      muted
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold bg-black/40">
                      ▶
                    </span>
                  </button>
                )}

                {/* IMAGE THUMBS */}
                {images.map((img: any, index: number) => {
                  const thumbIndex = hasVideo ? index + 1 : index;

                  return (
                    <button
                      key={index}
                      onClick={() => setActiveThumb(thumbIndex)}
                      className={`relative w-20 h-20 rounded-lg border-2 ${activeThumb === thumbIndex
                        ? "border-[var(--brand-primary)]"
                        : "border-gray-200"
                        }`}
                    >
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="w-full h-full object-contain bg-white"
                      />
                    </button>
                  );
                })}


              </div>

              {/* Main Image */}
              {/* <div
                ref={imgRef}
                // className="order-1 md:order-2 relative flex-1 h-[500px] md:h-[700px] rounded-2xl bg-white flex items-center justify-center cursor-crosshair border"

                className="order-1 md:order-2 relative flex-1 h-[500px] md:h-[700px] rounded-xl overflow-hidden flex items-center justify-center cursor-crosshair bg-transparent"


                onMouseEnter={() => setZoomVisible(true)}
                onMouseLeave={() => setZoomVisible(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  src={images[activeThumb || 0]?.url}
                  alt={images[activeThumb || 0]?.alt || product?.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div> */}
              {/* <div
                ref={imgRef}
               
                className="order-1 md:order-2 relative flex-1 h-[500px] md:h-[700px] rounded-xl overflow-hidden flex items-center justify-center cursor-crosshair bg-transparent"


                onMouseEnter={() => setZoomVisible(true)}
                onMouseLeave={() => setZoomVisible(false)}
                onMouseMove={handleMouseMove}
              > */}

              <div
                ref={imgRef}
                // className={`order-1 md:order-2 relative flex-1 h-[500px] md:h-[700px] rounded-xl overflow-hidden flex items-center justify-center cursor-crosshair bg-transparent  ${hasVideo && activeThumb === 0 ? "cursor-default" : "cursor-crosshair"}`}
               
               className="order-1 md:order-2 relative w-full md:flex-1 h-[500px] md:h-[700px] rounded-xl overflow-hidden flex items-center justify-center bg-transparent"
                onMouseEnter={() => !isMobile && setZoomVisible(true)}
                onMouseLeave={() => !isMobile && setZoomVisible(false)}
                onMouseMove={(e) => !isMobile && handleMouseMove(e)}
                onClick={() => isMobile && setShowImageModal(true)}
              >


                {hasVideo && activeThumb === 0 ? (
                  <video
                    src={selectedVariant.videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <img
                    src={getActiveImage()?.url}
                    alt={getActiveImage()?.alt || product?.title}
                    className="max-h-full max-w-full object-contain"
                  />
                )}




              </div>

              {/* Main Media (Video / Image) */}



              {/* Zoom Preview (Desktop only) */}
              {/* {zoomVisible && images[activeThumb || 0]?.url && ( */}

              {/* {zoomVisible && !isMobile && images[activeThumb || 0]?.url && ( */}

              {zoomVisible && !isMobile && getZoomImageUrl() && (


                <div
                  className="hidden lg:block absolute top-0 left-[calc(100%+20px)] 
      w-[700px] h-[750px] rounded-xl border shadow-lg bg-white 
      bg-no-repeat bg-center z-10"
                  style={{
                    backgroundImage: `url("${getZoomImageUrl()}")`,
                    backgroundPosition,
                    backgroundSize: "200%",
                  }}
                />
              )}
            </div>


            {/*  PRODUCT INFO */}
            <div className="flex flex-col justify-start text-left">
              <h1 className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)] mb-2">
                {product?.title}
              </h1>
              <p className="text-lg font-medium text-[var(--brand-primary)] mb-4">
                £{selectedVariant?.price || product?.sellingPrice}
              </p>
              <div
                className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product?.shortDescription || "" }}
              />

              {/* Color */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">
                  Colour: {selectedColor?.name || "Select"}
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((c: any) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleColorChange(c)}
                      className={`w-8 h-8 rounded-full border-2 transition ${selectedColor?.id === c.id
                        ? "border-[var(--brand-primary)] scale-110"
                        : "border-gray-300 hover:border-[var(--brand-primary)]"
                        }`}
                      style={{ backgroundColor: c.hexCode }}
                    />
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mb-6">
                {/* Title Row */}
                <div className="flex items-center justify-between mb-3 pr-8">
                  <h4 className="text-sm font-medium text-gray-800">
                    Size: {selectedSize?.name || "Select"}
                  </h4>

                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-sm underline underline-offset-2 text-[var(--brand-primary)] hover:opacity-80"
                  >
                    Size Guide
                  </button>
                </div>


                <div className="flex flex-wrap gap-2">
                  {sizes.map((s: any) => {
                    const variantStock = variants.find(
                      (v) =>
                        v.color?.id === selectedColor?.id && v.size?.id === s.id
                    )?.stock;
                    const isAvailable = variantStock > 0;
                    const isSelected = selectedSize?.id === s.id;

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => isAvailable && handleSizeChange(s)}
                        disabled={!isAvailable}
                        className={`px-4 py-2 text-sm rounded border transition ${isSelected
                          ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                          : isAvailable
                            ? "border-gray-300 hover:border-[var(--brand-primary)]"
                            : "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                          }`}
                        title={
                          isAvailable
                            ? `In Stock: ${variantStock}`
                            : "Out of stock"
                        }
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>


              {/* Stock Display */}
              {selectedVariant && (
                <p
                  className={`mb-2 text-sm ${availableStock > 0
                    ? "text-gray-600"
                    : "text-red-500 font-semibold"
                    }`}
                >
                  {availableStock > 0
                    ? `Only ${availableStock} item(s) left in stock`
                    : "Out of stock"}
                </p>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="px-3 py-1 text-lg font-bold text-[var(--text-primary)] hover:text-[var(--brand-primary)]"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-1 font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={
                      availableStock > 0 && quantity >= availableStock
                    }
                    className={`px-3 py-1 text-lg font-bold ${availableStock > 0 && quantity < availableStock
                      ? "text-[var(--text-primary)] hover:text-[var(--brand-primary)]"
                      : "text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={availableStock <= 0}
                  className={`flex-1 py-3 text-white font-semibold rounded transition ${availableStock <= 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : addingToCart
                      ? "bg-gray-400 cursor-wait"
                      : "bg-[var(--brand-primary)] hover:opacity-90"
                    }`}
                >
                  {availableStock <= 0
                    ? "OUT OF STOCK"
                    : addingToCart
                      ? "ADDING..."
                      : "ADD TO BAG"}
                </button>

                <button
                  onClick={async () => {
                    if (!wishlist) await wishlistService.add(token, product.id);
                    else await wishlistService.remove(token, product.id);
                    setWishlist(!wishlist);
                  }}
                  className="p-3 border rounded bg-white hover:border-[var(--brand-primary)] transition"
                >
                  <Heart
                    size={20}
                    className={`${wishlist
                      ? "fill-[var(--brand-primary)] text-[var(--brand-primary)]"
                      : "text-[var(--text-primary)] hover:fill-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                      }`}
                  />
                </button>
              </div>

              {/* Accordion Sections */}
              <AccordionSection title="Description & Details">
                {product?.description ? (
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: product?.description || "" }}
                  />
                ) : (
                  <p>No description available.</p>
                )}
              </AccordionSection>

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
                        <div
                          className="prose prose-sm max-w-none text-gray-700"
                          dangerouslySetInnerHTML={{ __html: product?.materialCare.description || "" }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>No material care information available.</p>
                )}
              </AccordionSection>


              {/* DELIVERY & RETURNS SECTION */}
              <AccordionSection title="Delivery & Returns">
                {product?.deliverySettings ? (
                  <div className="space-y-5 text-sm text-gray-700 leading-relaxed">

                    {/* FREE DELIVERY */}
                    <p className="font-semibold text-[var(--text-primary)]">
                      {product.deliverySettings.freeDeliveryText}
                    </p>

                    {/* NEXT DAY DELIVERY */}
                    <div>
                      <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                        {product.deliverySettings.nextDayTitle}
                      </h4>

                      <p className="mb-1">
                        Order now to receive:{" "}
                        <span className="font-semibold">
                          {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString("en-UK", {
                            weekday: "long",
                            day: "numeric",
                            month: "long"
                          })}
                        </span>
                      </p>

                      <p className="mb-1">
                        Delivery time: {product.deliverySettings.nextDayDeliveryTime}
                      </p>

                      <p className="mb-1">
                        Cost: £{product.deliverySettings.nextDayCost}
                      </p>

                      <p className="mb-1">
                        Order Monday–Friday before{" "}
                        <span className="font-semibold">
                          {product.deliverySettings.nextDayOrderCutOff}
                        </span>{" "}
                        for next working day delivery.
                      </p>


                      {/* <p className="text-gray-600">
                        Order by {product.deliverySettings.nextDayOrderCutOff} for next working day delivery
                      </p> */}
                    </div>

                    {/* STANDARD DELIVERY */}
                    <div>
                      <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                        {product.deliverySettings.standardDeliveryTitle}
                      </h4>

                      <p className="mb-1">
                        Order now to receive:{" "}
                        <span className="font-semibold">
                          {(() => {
                            const min = product.deliverySettings.standardDeliveryMinDays;
                            const max = product.deliverySettings.standardDeliveryMaxDays;

                            const start = new Date(Date.now() + min * 24 * 60 * 60 * 1000);
                            const end = new Date(Date.now() + max * 24 * 60 * 60 * 1000);

                            return `${start.toLocaleDateString("en-UK", {
                              weekday: "long",
                              day: "numeric",
                              month: "long"
                            })} - ${end.toLocaleDateString("en-UK", {
                              weekday: "long",
                              day: "numeric",
                              month: "long"
                            })}`;
                          })()}
                        </span>
                      </p>

                      <p className="mb-1">
                        Delivery time: {product.deliverySettings.standardDeliveryMinDays}–{product.deliverySettings.standardDeliveryMaxDays} working days
                      </p>

                      <p className="mb-1">
                        Cost: £{product.deliverySettings.standardDeliveryCost}
                      </p>
                    </div>

                    {/* RETURNS */}
                    <p className="font-semibold text-[var(--text-primary)]">
                      {product.deliverySettings.returnText}
                    </p>
                  </div>
                ) : (
                  <p>No delivery information available.</p>
                )}
              </AccordionSection>


              {/* <AccordionSection title="Delivery & Returns">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <Truck size={18} className="text-[var(--text-primary)]" />
                    <span>Free delivery on all orders over £120.00</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <RefreshCw
                      size={18}
                      className="text-[var(--text-primary)]"
                    />
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
              </AccordionSection> */}

            </div>
          </section>

          {/* Reviews */}
          <section className="max-w-[1200px] mx-auto px-4 py-12 border-t">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
              Customer Reviews & Ratings
            </h2>
            <div className="flex items-center gap-4 mb-8">
              <div className="text-4xl font-bold text-[var(--brand-primary)]">
                {product?.reviewsData?.averageRating}
              </div>
              <div>
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i <
                          Math.floor(Number(product?.reviewsData?.averageRating))
                          ? "fill-[var(--brand-primary)] text-[var(--brand-primary)]"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Based on {product?.reviewsData?.totalReviews} reviews
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {product?.reviewsData?.list.map((review: any, index: number) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 shadow-sm bg-white flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-[var(--text-primary)]">
                      {review?.user?.name}
                    </h4>
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
          <CartDrawer
            isOpen={cartDrawer}
            onClose={() => setCartDrawer(false)}
          />

          {product?.wearWith?.length > 0 && (
            <ProductSuggestions wearWith={product.wearWith} />
          )}


          <HowWeDoIt />

          <SizeGuideModal open={showSizeGuide} onClose={() => setShowSizeGuide(false)} />

          {showImageModal && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
              onClick={() => setShowImageModal(false)}
            >
              {/* MODAL CONTENT */}
              <div
                className="relative max-w-[95vw] max-h-[95vh] bg-white rounded-2xl 
                 overflow-hidden shadow-2xl animate-[fadeIn_0.15s_ease-out]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* CLOSE BUTTON */}
                <button
                  onClick={() => setShowImageModal(false)}
                  aria-label="Close preview"
                  className="absolute top-3 right-3 z-10 p-2 rounded-full 
             bg-white/80 backdrop-blur hover:bg-white transition shadow"
                >
                  <X size={20} className="text-gray-800" />
                </button>

                {/* MEDIA */}
                {hasVideo && activeThumb === 0 ? (
                  <video
                    src={selectedVariant.videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="max-w-[95vw] max-h-[95vh] object-contain bg-white"
                  />
                ) : (
                  <img
                    src={getActiveImage()?.url}
                    alt="Preview"
                    className="max-w-[95vw] max-h-[95vh] object-contain bg-white"
                  />
                )}
              </div>
            </div>
          )}




          {/*  Popup alert */}
          {errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg(null)} />}
        </>
      )}
    </>
  );
}
