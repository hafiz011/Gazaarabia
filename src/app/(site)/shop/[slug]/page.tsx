import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import CategoryContent from "./CategoryContent";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { CollectionPageSchema } from "@/components/CollectionPageSchema";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (slug === "all") {
    return {
      title: "All Products | Gazaarabia",
      description: "Explore our full collection of modest fashion, including hijabs, abayas, and more.",
      robots: { index: true, follow: true },
      alternates: { canonical: "https://gazaarabia.com/shop/all" },
    };
  }

  const category = await prisma.categories.findUnique({
    where: { slug },
  });

  if (!category) {
    const subcategory = await prisma.subcategory.findUnique({
      where: { slug },
    });

    if (subcategory) {
      return {
        title: `${subcategory.name} | Gazaarabia`,
        description: subcategory.description || `Shop our ${subcategory.name} collection.`,
        robots: { index: true, follow: true },
        alternates: { canonical: `https://gazaarabia.com/shop/${slug}` },
      };
    }

    return { title: "Shop | Gazaarabia" };
  }

  return {
    title: `${category.name} | Gazaarabia`,
    description: category.description || `Discover our ${category.name} collection.`,
    robots: { index: true, follow: true },
    alternates: { canonical: `https://gazaarabia.com/shop/${slug}` },
  };
}

async function getCategoryData(slug: string) {
  const category = await prisma.categories.findUnique({
    where: { slug },
  });

  if (!category) {
    const subcategory = await prisma.subcategory.findUnique({
      where: { slug },
    });
    return subcategory;
  }

  return category;
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const category = slug !== "all" ? await getCategoryData(slug) : null;
  const categoryName = category?.name || "All Products";

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://gazaarabia.com" },
          { name: "Shop", url: "https://gazaarabia.com/shop/all" },
          { name: categoryName, url: `https://gazaarabia.com/shop/${slug}` },
        ]}
      />
      <CollectionPageSchema
        name={categoryName}
        description={
          category?.description ||
          `Explore our ${categoryName} collection - Modest Fashion from GAZAARABIA`
        }
        url={`https://gazaarabia.com/shop/${slug}`}
      />
      <CategoryContent />
    </>
  );
}
