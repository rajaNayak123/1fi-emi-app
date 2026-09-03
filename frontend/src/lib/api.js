const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with ${res.status}`);
  }
  return res.json();
}

export const api = {
  listProducts: () => request("/products"),
  getProduct: (slug, variantId) =>
    request(`/products/${slug}${variantId ? `?variantId=${variantId}` : ""}`),
  checkout: (slug, variantId, planId) =>
    request(`/products/${slug}/checkout`, {
      method: "POST",
      body: JSON.stringify({ variantId, planId }),
    }),
};

export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
