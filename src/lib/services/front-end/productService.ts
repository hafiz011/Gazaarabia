export async function getProductBySlug(token: any, slug: string) {
  try {
    const res = await fetch(`/api/front-end/product/${slug}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }), // ✅ only send token if present
      },
    });

    if (!res.ok) throw new Error("Failed to fetch product");
    return res.json();
  } catch (error) {
    console.error("❌ getProductBySlug error:", error);
    return null;
  }
}
