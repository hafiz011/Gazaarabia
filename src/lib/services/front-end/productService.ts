export async function getProductBySlug(slug: string) {
  try {
    const res = await fetch(`/api/front-end/product/${slug}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch product");
    return res.json();
  } catch (error) {
    console.error("❌ getProductBySlug error:", error);
    return null;
  }
}
