// src/app/sitemap.ts

import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const baseUrl = "https://gazaarabia.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  try {
    const [products, categories, blogs] = await Promise.all([
      prisma.products.findMany({
        where: { active: true, isDeleted: false },
        select: { slug: true, updatedAt: true },
        take: 1000,
      }),

      prisma.categories.findMany({
        select: { slug: true, updatedAt: true },
      }),

      prisma.blogs.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const productRoutes = products.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

    const categoryRoutes = categories.map((c) => ({
      url: `${baseUrl}/shop/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const blogRoutes = blogs.map((b) => ({
      url: `${baseUrl}/blogs/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [
      ...staticRoutes,
      ...productRoutes,
      ...categoryRoutes,
      ...blogRoutes,
    ];
  } catch (error) {
    console.error("Sitemap error:", error);
    return staticRoutes;
  }
}