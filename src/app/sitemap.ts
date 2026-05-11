import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 86400; // 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://gazaarabia.com";

  // Static routes
  const staticRoutes = [
    "",
    "/shop/all",
    "/about",
    "/contact",
    "/faq",
    "/blogs",
    "/privacy-policy",
    "/terms-and-conditions",
    "/shipping-and-delivery",
    "/returns-exchanges",
    "/cookies-policy",
    "/impact",
    "/charity",
    "/loyalty",
    "/become-partner",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  try {
    // Fetch products
    const products = await prisma.products.findMany({
      where: { active: true, isDeleted: false },
      select: { slug: true, updatedAt: true },
      take: 1000, // Safety limit
    });

    const productRoutes = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

    // Fetch categories
    const categories = await prisma.categories.findMany({
      select: { slug: true, updatedAt: true },
    });

    const categoryRoutes = categories.map((category) => ({
      url: `${baseUrl}/shop/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    // Fetch blogs
    const blogs = await prisma.blogs.findMany({
      select: { slug: true, updatedAt: true },
    });

    const blogRoutes = blogs.map((blog) => ({
      url: `${baseUrl}/blogs/${blog.slug}`,
      lastModified: blog.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...blogRoutes];
  } catch (error) {
    console.error("Sitemap generation error (database unreachable):", error);
    // Return only static routes if database is down to prevent build failure
    return staticRoutes;
  }
}
