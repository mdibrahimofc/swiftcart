// Cart drawer + localStorage cart state (shared across pages)

const CART_STORAGE_KEY = 'swiftcart_cart_v1';

/** @typedef {{id:number, title:string, price:number, image:string, category?:string, quantity:number}} CartItem */

/** @returns {CartItem[]} */
function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** @param {CartItem[]} cart */
function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

/**
 * Normalize product object from API into CartItem shape
 * @param {any} product
 * @returns {CartItem}
 */
function toCartItem(product) {
  return {
    id: Number(product?.id),
    title: String(product?.title ?? ''),
    price: Number(product?.price ?? 0),
    image: String(product?.image ?? ''),
    category: product?.category,
    quantity: 1,
  };
}

/** @param {any} product */
function addToCart(product) {
  const cart = getCart();
  const id = Number(product?.id);
  if (!id) return;

  const existing = cart.find((x) => x.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push(toCartItem(product));
  }

  saveCart(cart);
  renderCart();
}

/** @param {number} id */
function removeFromCart(id) {
  const cart = getCart().filter((x) => x.id !== Number(id));
  saveCart(cart);
  renderCart();
}

function clearCart() {
  saveCart([]);
  renderCart();
}

/** @param {number} id @param {number} nextQty */
function setCartQuantity(id, nextQty) {
  const qty = Number(nextQty);
  if (!Number.isFinite(qty)) return;

  const cart = getCart();
  const item = cart.find((x) => x.id === Number(id));
  if (!item) return;

  if (qty <= 0) {
    saveCart(cart.filter((x) => x.id !== Number(id)));
  } else {
    item.quantity = qty;
    saveCart(cart);
  }

  renderCart();
}

function formatMoney(value) {
  return `$${Number(value).toFixed(2)}`;
}

function calcCartCount(cart) {
  return cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

function calcCartTotal(cart) {
  return cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
}

function updateCartCountBadge(cart) {
  const countEl = document.getElementById('cart-count');
  if (!countEl) return;
  const count = calcCartCount(cart);

  if (count <= 0) {
    countEl.textContent = '0';
    countEl.classList.add('hidden');
  } else {
    countEl.textContent = String(count);
    countEl.classList.remove('hidden');
  }
}

function renderCart() {
  const cart = getCart();

  updateCartCountBadge(cart);

  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const emptyEl = document.getElementById('cart-empty');

  if (!itemsEl || !totalEl) return; // drawer not on this page

  if (emptyEl) emptyEl.classList.toggle('hidden', cart.length !== 0);

  itemsEl.innerHTML = cart
    .map(
      (item) => `
        <div class="flex gap-3 items-start p-3 rounded-xl border border-base-200 bg-base-100">
          <div class="w-16 h-16 bg-base-200 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="${item.image}" alt="${escapeHtml(item.title)}" class="w-full h-full object-contain" />
          </div>
          <div class="flex-1">
            <p class="font-semibold leading-snug line-clamp-2">${escapeHtml(item.title)}</p>
            <div class="mt-1 flex items-center justify-between">
              <p class="text-sm opacity-70">${formatMoney(item.price)}</p>
              <button class="btn btn-ghost btn-xs text-error" data-action="remove" data-id="${item.id}">Remove</button>
            </div>
            <div class="mt-2 flex items-center gap-2">
              <button class="btn btn-outline btn-xs" data-action="dec" data-id="${item.id}">-</button>
              <span class="min-w-8 text-center font-semibold" aria-label="Quantity">${item.quantity}</span>
              <button class="btn btn-outline btn-xs" data-action="inc" data-id="${item.id}">+</button>
              <span class="ml-auto text-sm font-bold">${formatMoney(item.price * item.quantity)}</span>
            </div>
          </div>
        </div>
      `
    )
    .join('');

  totalEl.textContent = formatMoney(calcCartTotal(cart));
}

function wireCartEvents() {
  // drawer list actions
  const itemsEl = document.getElementById('cart-items');
  if (itemsEl) {
    itemsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = Number(btn.dataset.id);
      if (!id || !action) return;

      const cart = getCart();
      const item = cart.find((x) => x.id === id);
      if (!item) return;

      if (action === 'remove') removeFromCart(id);
      if (action === 'inc') setCartQuantity(id, item.quantity + 1);
      if (action === 'dec') setCartQuantity(id, item.quantity - 1);
    });
  }

  const clearBtn = document.getElementById('clear-cart');
  if (clearBtn) clearBtn.addEventListener('click', clearCart);
}

// --- Modal helpers (shared) ---

function openProductModal(product) {
  const dialog = document.getElementById('product_modal');
  const body = document.getElementById('product-modal-body');
  if (!dialog || !body) return;

  const rating = product?.rating?.rate ?? '—';
  const count = product?.rating?.count ?? '';

  body.innerHTML = `
    <div class="flex flex-col md:flex-row gap-6">
      <div class="md:w-5/12">
        <div class="bg-base-200 rounded-2xl p-6">
          <img src="${product?.image}" alt="${escapeHtml(product?.title ?? '')}" class="w-full h-64 object-contain" />
        </div>
      </div>
      <div class="md:w-7/12">
        <div class="flex items-start justify-between gap-4">
          <h3 class="text-xl font-bold">${escapeHtml(product?.title ?? '')}</h3>
          <span class="badge badge-neutral">${escapeHtml(product?.category ?? '')}</span>
        </div>

        <div class="mt-2 flex items-center gap-2 text-sm">
          <span class="inline-flex items-center gap-1">
            <i class="fa-solid fa-star"></i>
            <span class="font-semibold">${rating}</span>
          </span>
          <span class="opacity-70">(${count})</span>
        </div>

        <p class="mt-3 text-sm opacity-80 leading-relaxed">${escapeHtml(product?.description ?? '')}</p>

        <div class="mt-5 flex items-center justify-between">
          <p class="text-2xl font-extrabold">${formatMoney(product?.price ?? 0)}</p>
          <button id="modal-add-cart" class="btn btn-primary" type="button">
            <i class="fa-solid fa-cart-shopping"></i>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;

  // Add-to-cart inside modal
  const modalAdd = document.getElementById('modal-add-cart');
  if (modalAdd) {
    modalAdd.onclick = () => {
      addToCart(product);
      // open cart drawer after adding (nice UX)
      const drawerToggle = document.getElementById('cart-drawer');
      if (drawerToggle) drawerToggle.checked = true;
    };
  }

  dialog.showModal();
}

// Tiny HTML escaper (prevents broken layout if API strings contain < >)
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Initialize cart UI on every page load
document.addEventListener('DOMContentLoaded', () => {
  wireCartEvents();
  renderCart();
});
