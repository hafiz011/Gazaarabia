import type { Metadata, ResolvingMetadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductDetails from "./ProductDetails";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;

  // Fetch product data
  const product = await prisma.products.findUnique({
    where: { slug },
    include: {
      productimage: {
        where: { primary: true },
        take: 1,
      },
    },
  });

  if (!product) {
    return {
      title: "Product Not Found | Gazaarabia",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const productImage = product.productimage[0]?.url || "/images/logo.png";

  return {
    title: product.title,
    description: product.shortDescription || `Buy ${product.title} at Gazaarabia. Modern modest fashion inspired by Gaza.`,
    alternates: {
      canonical: `https://gazaarabia.com/products/${slug}`,
    },
    openGraph: {
      title: `${product.title} | Gazaarabia`,
      description: product.shortDescription || `Explore ${product.title} in our collection.`,
      url: `https://gazaarabia.com/products/${slug}`,
      images: [productImage, ...previousImages],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.shortDescription || `Explore ${product.title} in our collection.`,
      images: [productImage],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.products.findUnique({
    where: { slug },
    include: {
      productimage: true,
      productvariant: true,
      reviews: {
        select: { rating: true },
      },
    },
  });

  if (!product) return <ProductDetails />;

  const price = product.sellingPrice;
  const productImage = product.productimage[0]?.url || "https://gazaarabia.com/images/logo.png";
  const inStock = product.productvariant.some((v) => v.stock > 0);
  
  const averageRating = product.reviews.length > 0 
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length 
    : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: productImage,
    description: product.shortDescription || product.title,
    sku: product.barcode || `GA-${product.id}`,
    brand: {
      "@type": "Brand",
      name: "Gazaarabia",
    },
    offers: {
      "@type": "Offer",
      url: `https://gazaarabia.com/products/${slug}`,
      priceCurrency: "GBP",
      price: price,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Gazaarabia",
      },
    },
    ...(product.reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: averageRating.toFixed(1),
        reviewCount: product.reviews.length,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetails />
    </>
  );
}

