export async function getProductBySlug(token: any, slug: string) {
  try {
    const res = await fetch(`/api/front-end/product/${slug}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }), // only send token if present
      },
    });

    if (!res.ok) throw new Error("Failed to fetch product");
    return res.json();
  } catch (error) {
    console.error(" getProductBySlug error:", error);
    return null;
  }
}


export async function getAllProducts(search: string, preview: boolean = false, page = 1, limit = 12) {
  try {

    const url = preview ?
      `/api/front-end/product?q=${search}&preview=${preview}`
      :
      `/api/front-end/product?q=${search}&page=${page}&limit=${limit}`
      ;

    const res = await fetch(`${url}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        // ...(token && { Authorization: `Bearer ${token}` }), // only send token if present
      },
    });

    if (!res.ok) throw new Error("Failed to fetch product");
    return res.json();
  } catch (error) {
    console.error(" getProductBySlug error:", error);
    return null;
  }
}
