import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import CategoryContent from "./CategoryContent";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (slug === "all") {
    return {
      title: "All Products | Gazaarabia",
      description: "Explore our full collection of modest fashion, including hijabs, abayas, and more.",
      alternates: { canonical: "https://gazaarabia.com/shop/all" },
    };
  }

  // Fetch category data
  const category = await prisma.categories.findUnique({
    where: { slug },
  });

  if (!category) {
    // Try subcategory
    const subcategory = await prisma.subcategory.findUnique({
      where: { slug },
    });

    if (subcategory) {
      return {
        title: `${subcategory.name} | Gazaarabia`,
        description: subcategory.description || `Shop our ${subcategory.name} collection.`,
        alternates: { canonical: `https://gazaarabia.com/shop/${slug}` },
      };
    }

    return { title: "Shop | Gazaarabia" };
  }

  return {
    title: `${category.name} | Gazaarabia`,
    description: category.description || `Discover our ${category.name} collection.`,
    alternates: { canonical: `https://gazaarabia.com/shop/${slug}` },
  };
}

export default function Page() {
  return <CategoryContent />;
}
