const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    cache: "no-store",
  });

  let result: any = null;
  try {
    result = await res.json();
  } catch {
    result = {};
  }

  if (!res.ok) {
    // ✅ Clean error message extraction
    const message =
      result?.message ||
      result?.error ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return result;
}
