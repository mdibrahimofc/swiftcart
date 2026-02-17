// Homepage: Trending products (Top 3 by rating)

let allProducts = [];

function setTrendingLoading(isLoading) {
  const container = document.getElementById('products');
  if (!container) return;
  if (!isLoading) return;
  container.innerHTML = `
    <div class="col-span-full flex items-center justify-center py-16">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  `;
}

function renderTrending(products) {
  const container = document.getElementById('products');
  if (!container) return;

  const top3 = [...products]
    .sort((a, b) => (b?.rating?.rate ?? 0) - (a?.rating?.rate ?? 0))
    .slice(0, 3);

  container.innerHTML = top3
    .map(
      (p) => `
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="bg-gray-100 p-6">
          <img src="${p?.image}" alt="${p?.title}" class="w-full h-56 object-contain" />
        </div>

        <div class="p-6">
          <div class="flex items-center justify-between mb-3">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600">
              ${p?.category}
            </span>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span class="inline-flex items-center gap-1">
                <i class="fa-solid fa-star text-amber-400"></i>
                <span class="font-medium text-gray-700">${p?.rating?.rate ?? '—'}</span>
              </span>
              <span>(${p?.rating?.count ?? 0})</span>
            </div>
          </div>

          <h3 class="text-base font-semibold text-gray-900 leading-snug mb-2 line-clamp-2">
            ${p?.title}
          </h3>

          <div class="text-lg font-bold text-gray-900 mb-5">$${p?.price}</div>

          <div class="flex items-center gap-3">
            <button class="btn-details flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition" data-id="${p?.id}">
              <i class="fa-regular fa-eye"></i>
              Details
            </button>
            <button class="btn-add-cart flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition" data-id="${p?.id}">
              <i class="fa-solid fa-cart-shopping"></i>
              Add
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join('');
}

async function initHome() {
  try {
    setTrendingLoading(true);
    allProducts = await fetchAllProducts();
    renderTrending(allProducts);
  } catch (err) {
    console.error(err);
    const container = document.getElementById('products');
    if (container) {
      container.innerHTML = `
        <div class="col-span-full">
          <div class="alert alert-error">
            <span>Failed to load products. Please refresh and try again.</span>
          </div>
        </div>
      `;
    }
  }

  const container = document.getElementById('products');
  if (!container) return;

  container.addEventListener('click', async (e) => {
    const detailsBtn = e.target.closest('.btn-details');
    const addBtn = e.target.closest('.btn-add-cart');

    const id = Number(detailsBtn?.dataset?.id ?? addBtn?.dataset?.id);
    if (!id) return;

    // Find from already fetched list
    const product = allProducts.find((p) => Number(p?.id) === id);
    if (!product) return;

    if (addBtn) {
      addToCart(product);
      const drawerToggle = document.getElementById('cart-drawer');
      if (drawerToggle) drawerToggle.checked = true;
      return;
    }

    if (detailsBtn) {
      openProductModal(product);
    }
  });

  // Hero "Shop Now" button goes to products page
  const shopNow = document.getElementById('shop-now');
  if (shopNow) {
    shopNow.addEventListener('click', () => {
      window.location.href = './allproducts.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', initHome);
