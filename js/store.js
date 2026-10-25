/**
 * The Reading Nook - Cart & Wishlist Store
 * Uses localStorage so it works without a backend
 */

const STORE_KEY = 'readingNook';

function getStore() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || { cart: [], wishlist: [] };
  } catch {
    return { cart: [], wishlist: [] };
  }
}

function saveStore(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
  updateCartBadge();
}

/* ========== CART ========== */
function addToCart(book) {
  const store = getStore();
  const existing = store.cart.find(item => item.id === book.id);

  if (existing) {
    existing.qty += book.qty || 1;
  } else {
    store.cart.push({
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      cover: book.cover || '📖',
      category: book.category || '',
      type: book.type || 'book',
      qty: book.qty || 1
    });
  }
  saveStore(store);
  if (window.rnTrack) rnTrack('add_to_cart', { currency: 'INR', value: (Number(book.price) || 0) * (book.qty || 1), items: [{ item_id: book.id, item_name: book.title, price: Number(book.price) || 0, quantity: book.qty || 1 }] });
  showToast(`“${book.title}” added to cart`);
}

function removeFromCart(id) {
  const store = getStore();
  store.cart = store.cart.filter(item => item.id !== id);
  saveStore(store);
}

function updateCartQty(id, qty) {
  const store = getStore();
  const item = store.cart.find(i => i.id === id);
  if (item) {
    item.qty = Math.max(1, qty);
    saveStore(store);
  }
}

function getCart() {
  return getStore().cart;
}

function getCartCount() {
  return getStore().cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return getStore().cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function clearCart() {
  const store = getStore();
  store.cart = [];
  saveStore(store);
}

/* ========== WISHLIST ========== */
function toggleWishlist(book) {
  const store = getStore();
  const index = store.wishlist.findIndex(item => item.id === book.id);

  if (index > -1) {
    store.wishlist.splice(index, 1);
    saveStore(store);
    showToast(`Removed from wishlist`);
    return false;
  } else {
    store.wishlist.push({
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      cover: book.cover || '📖',
      category: book.category || '',
      type: book.type || 'book'
    });
    saveStore(store);
    if (window.rnTrack) rnTrack('add_to_wishlist', { currency: 'INR', value: Number(book.price) || 0, items: [{ item_id: book.id, item_name: book.title, price: Number(book.price) || 0 }] });
    showToast(`“${book.title}” added to wishlist`);
    return true;
  }
}

function isInWishlist(id) {
  return getStore().wishlist.some(item => item.id === id);
}

function getWishlist() {
  return getStore().wishlist;
}

function removeFromWishlist(id) {
  const store = getStore();
  store.wishlist = store.wishlist.filter(item => item.id !== id);
  saveStore(store);
}

/* ========== UI HELPERS ========== */
function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

function showToast(message) {
  let toast = document.getElementById('rn-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'rn-toast';
    toast.style.cssText = `
      position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
      background: #1b2a4a; color: white; padding: 14px 24px; border-radius: 12px;
      font-family: system-ui, sans-serif; font-size: 0.95rem; z-index: 9999;
      box-shadow: 0 8px 30px rgba(0,0,0,0.2); opacity: 0; transition: opacity 0.3s;
      max-width: 90%; text-align: center;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

// Run on every page
document.addEventListener('DOMContentLoaded', updateCartBadge);

/* ========== COVER IMAGES ========== */
const COVER_SLUGS=['atomic-habits', 'becoming', 'deep-work', 'goodnight-moon', 'harry-potter-1', 'little-women', 'percy-jackson', 'pride-and-prejudice', 'the-alchemist', 'the-book-thief', 'the-fault-in-our-stars', 'the-gruffalo', 'the-hate-u-give', 'the-lean-startup', 'the-night-circus', 'the-silent-patient', 'the-very-hungry-caterpillar', 'thinking-fast-and-slow', 'where-the-crawdads-sing', 'where-the-wild-things-are'];
const COVER_ALIAS={'harry-potter-and-the-philosophers-stone':'harry-potter-1','percy-jackson-the-olympians':'percy-jackson','where-the-crawdads-sing':'where-the-crawdads-sing'};
function coverSlug(item){
  const t=String(item.title||'').toLowerCase().replace(/[\u2019']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  if(COVER_ALIAS[t])return COVER_ALIAS[t];
  return COVER_SLUGS.find(s=>s===t||t.startsWith(s))||null;
}
function coverHTML(item){
  const s=coverSlug(item);
  if(!s)return item.cover||'📖';
  return '<img src="img/covers/'+s+'.svg" alt="Cover of '+String(item.title||'').replace(/"/g,'&quot;')+'" loading="lazy">';
}
