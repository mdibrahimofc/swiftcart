// Centralized API helpers for FakeStoreAPI
// Docs: https://fakestoreapi.com/

const API_BASE = 'https://fakestoreapi.com';

/**
 * @param {string} path - e.g. '/products' or '/products/categories'
 * @returns {Promise<any>}
 */
async function apiGet(path) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed (${res.status}) ${url} ${text}`);
  }
  return res.json();
}

async function fetchAllProducts() {
  return apiGet('/products');
}

async function fetchCategories() {
  return apiGet('/products/categories');
}

async function fetchProductsByCategory(category) {
  return apiGet(`/products/category/${encodeURIComponent(category)}`);
}

async function fetchProductById(id) {
  return apiGet(`/products/${encodeURIComponent(id)}`);
}
