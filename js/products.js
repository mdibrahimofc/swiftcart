// Products page: categories + product grid

let currentProducts = [];
let currentCategory = 'All';

function setProductsLoading(isLoading) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  if (!isLoading) return;
  grid.innerHTML = `
    <div class="col-span-full flex items-center justify-center py-20">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  `;
}

function setActiveCategoryButton(category) {
  const wrap = document.getElementById('category-buttons');
  if (!wrap) return;
  [...wrap.querySelectorAll('button[data-category]')].forEach((btn) => {
    const isActive = btn.dataset.category === category;
    btn.classList.toggle('btn-primary', isActive);
    btn.classList.toggle('btn-outline', !isActive);
  });
}

function renderCategories(categories) {
  const wrap = document.getElementById('category-buttons');
  if (!wrap) return;

  const all = ['All', ...categories];
  wrap.innerHTML = all
    .map(
      (c) => `
        <button class="btn btn-sm ${c === currentCategory ? 'btn-primary' : 'btn-outline'}" data-category="${c}">${c}</button>
      `
    )
    .join('');
}

function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = `
      <div class="col-span-full">
        <div class="alert">
          <span>No products found for this category.</span>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = products
    .map(
      (p) => `
      <div class="card bg-base-100 shadow-sm border border-base-200">
        <figure class="bg-base-200 p-6">
          <img src="${p?.image}" alt="${p?.title}" class="w-full h-56 object-contain" />
        </figure>
        <div class="card-body">
          <div class="flex items-center justify-between gap-3">
            <span class="badge badge-ghost">${p?.category}</span>
            <span class="text-sm opacity-70 inline-flex items-center gap-1">
              <i class="fa-solid fa-star"></i>
              <span class="font-semibold">${p?.rating?.rate ?? '—'}</span>
              <span>(${p?.rating?.count ?? 0})</span>
            </span>
          </div>

          <h2 class="card-title text-base line-clamp-2">${p?.title}</h2>
          <p class="text-xl font-extrabold">$${p?.price}</p>

          <div class="card-actions mt-2">
            <button class="btn btn-outline btn-sm flex-1 btn-details" data-id="${p?.id}">
              <i class="fa-regular fa-eye"></i>
              Details
            </button>
            <button class="btn btn-primary btn-sm flex-1 btn-add-cart" data-id="${p?.id}">
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

async function loadProductsForCategory(category) {
  currentCategory = category;
  setActiveCategoryButton(category);

  try {
    setProductsLoading(true);
    if (category === 'All') {
      currentProducts = await fetchAllProducts();
    } else {
      currentProducts = await fetchProductsByCategory(category);
    }
    renderProducts(currentProducts);
  } catch (err) {
    console.error(err);
    const grid = document.getElementById('products-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full">
          <div class="alert alert-error">
            <span>Failed to load products. Please refresh and try again.</span>
          </div>
        </div>
      `;
    }
  }
}

async function initProductsPage() {
  try {
    const categories = await fetchCategories();
    renderCategories(categories);
  } catch (err) {
    console.error(err);
  }

  await loadProductsForCategory('All');

  // Category clicks
  const wrap = document.getElementById('category-buttons');
  if (wrap) {
    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-category]');
      if (!btn) return;
      const category = btn.dataset.category;
      if (!category) return;
      loadProductsForCategory(category);
    });
  }

  // Product actions (event delegation)
  const grid = document.getElementById('products-grid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      const detailsBtn = e.target.closest('.btn-details');
      const addBtn = e.target.closest('.btn-add-cart');
      const id = Number(detailsBtn?.dataset?.id ?? addBtn?.dataset?.id);
      if (!id) return;

      const product = currentProducts.find((p) => Number(p?.id) === id);
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
  }
}

document.addEventListener('DOMContentLoaded', initProductsPage);
