import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, CartItem, WishlistItem, Order, User } from '../types';
import { INITIAL_BOOKS, INITIAL_TOYS, CURRENCY_SYMBOLS, DEFAULT_FX_RATES } from '../data/initialData';
import { cloudUid, loadAllOrders, loadUserData, mergeById, mergeOrders, saveCart, saveOrderCloud, saveProfile, saveWishlist } from '../userCloud';
import { databaseRequest, firebaseSignIn, firebaseSignUp, firebaseSignOut, isFirebaseAdmin, refreshFirebaseToken, firebaseConfigured } from '../firebaseClient';

// Older Firebase records have no age range; borrow it from the built-in catalog (same id) so the age finder still works.
const withAges = (list: Book[]): Book[] =>
  list.map((b) => {
    if (b.minAge !== undefined && b.maxAge !== undefined) return b;
    const d = INITIAL_BOOKS.find((x) => x.id === b.id);
    return d && d.minAge !== undefined ? { ...b, minAge: d.minAge, maxAge: d.maxAge } : b;
  });

interface StoreContextType {
  // Navigation & View
  view: string;
  setView: (view: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedBook: Book | null;
  setSelectedBook: (book: Book | null) => void;
  ageFilter: number | null;
  setAgeFilter: (age: number | null) => void;

  // Catalog
  books: Book[];
  toys: Book[];
  addOrUpdateProduct: (product: Book) => void;
  resetCatalogToDefault: () => void;
  fetchCatalogFromFirebase: () => Promise<void>;
  pushCatalogToFirebase: () => Promise<void>;
  firebaseConfigured: boolean;

  // Cart
  cart: CartItem[];
  addToCart: (item: Partial<CartItem> & { id: string; title: string; price: number }) => void;
  removeFromCart: (id: string) => void;
  updateCartQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  addReward: (threshold: number) => void;

  // Wishlist
  wishlist: WishlistItem[];
  toggleWishlist: (item: Partial<WishlistItem> & { id: string; title: string; price: number }) => boolean;
  isInWishlist: (id: string) => boolean;
  removeFromWishlist: (id: string) => void;

  // User & Auth
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;

  // Orders
  lastOrder: Order | null;
  orders: Order[];
  saveOrder: (order: Order) => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Currency
  currency: string;
  setCurrency: (currency: string) => void;
  formatPrice: (amountINR: number) => string;
  fxRates: Record<string, number>;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const STORE_KEY = 'readingNook';
const ORDERS_KEY = 'readingNookOrders';
const LAST_ORDER_KEY = 'readingNookLastOrder';
const USER_KEY = 'readingNookUser';
const CATALOG_BOOKS_KEY = 'readingNookCustomBooks';
const CURRENCY_KEY = 'readingNookCurrency';
const CATALOG_TOYS_KEY = 'readingNookCustomToys';
const THEME_KEY = 'readingNookTheme';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      console.error(e);
    }
    return 'dark';
  });

  // Currency State
  const [currency, setCurrencyState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_KEY);
      if (saved && CURRENCY_SYMBOLS[saved]) return saved;
    } catch (e) {
      console.error(e);
    }
    return 'INR';
  });

  const [fxRates, setFxRates] = useState<Record<string, number>>(DEFAULT_FX_RATES);

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(CURRENCY_KEY, c);
    } catch (e) {
      console.error(e);
    }
  };

  const formatPrice = (amountINR: number): string => {
    if (!amountINR && amountINR !== 0) return '—';
    const sym = CURRENCY_SYMBOLS[currency] || '₹';
    if (currency === 'INR') {
      return `${sym}${Math.round(amountINR).toLocaleString('en-IN')}`;
    }
    const rate = fxRates[currency] || DEFAULT_FX_RATES[currency] || 0.012;
    const converted = amountINR * rate;
    return `${sym}${converted.toFixed(2)}`;
  };

  // View Routing
  const [view, setView] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [ageFilter, setAgeFilter] = useState<number | null>(null);

  // Catalog State
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem(CATALOG_BOOKS_KEY);
      if (saved) return withAges(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BOOKS;
  });

  const [toys, setToys] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem(CATALOG_TOYS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TOYS;
  });

  // Store data (Cart & Wishlist)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.cart || [];
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.wishlist || [];
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // User
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) { const parsed = JSON.parse(saved) as User; return { ...parsed, isAdmin: isFirebaseAdmin(parsed.email) }; }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [lastOrder, setLastOrder] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem(LAST_ORDER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2800);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Pull the public catalog from Firebase on startup when configured. Local defaults remain as offline fallback.
  useEffect(() => {
    if (!firebaseConfigured) return;
    (async () => {
      try {
        await refreshFirebaseToken();
        const [remoteBooks, remoteToys] = await Promise.all([
          databaseRequest<Record<string, Book> | Book[]>('books'),
          databaseRequest<Record<string, Book> | Book[]>('toys')
        ]);
        if (remoteBooks) { const list = Array.isArray(remoteBooks) ? remoteBooks : Object.values(remoteBooks); if (list.length) setBooks(withAges(list)); }
        if (remoteToys) { const list = Array.isArray(remoteToys) ? remoteToys : Object.values(remoteToys); if (list.length) setToys(list); }
      } catch (error) { console.warn('Firebase catalog fetch failed; using local catalog.', error); }
    })();
  }, []);

  // Apply Theme to Document
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      showToast(next === 'dark' ? '🌙 Night mode activated' : '☀️ Day mode activated');
      return next;
    });
  };

  // Persist Cart & Wishlist
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ cart, wishlist }));
    } catch (e) {
      console.error(e);
    }
  }, [cart, wishlist]);

  // ---- Per-user cloud sync (cart, favourites, purchases) ----
  // `syncedUid` is set only after the user's saved data has been loaded, so an empty local cart can never overwrite it.
  const [syncedUid, setSyncedUid] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseConfigured) return;
    const uid = user ? cloudUid() : null;
    if (!user || !uid) { setSyncedUid(null); return; }
    let cancelled = false;
    (async () => {
      try {
        await refreshFirebaseToken();
        const remote = await loadUserData(uid);
        if (cancelled) return;
        setCart((prev) => mergeById(remote.cart, prev));
        setWishlist((prev) => mergeById(remote.wishlist, prev));
        if (user.isAdmin) {
          try { const all = await loadAllOrders(); if (!cancelled) setOrders(all.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))); } catch { setOrders((prev) => mergeOrders(remote.orders, prev)); }
        } else {
          setOrders((prev) => mergeOrders(remote.orders, prev));
        }
        setSyncedUid(uid);
      } catch (error) {
        console.warn('Could not load your saved data from Firebase.', error);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  // Save cart & favourites to the signed-in user's account whenever they change.
  useEffect(() => {
    if (!syncedUid) return;
    const t = setTimeout(() => {
      saveCart(syncedUid, cart).catch((e) => console.warn('Cart sync failed', e));
      saveWishlist(syncedUid, wishlist).catch((e) => console.warn('Wishlist sync failed', e));
    }, 600);
    return () => clearTimeout(t);
  }, [cart, wishlist, syncedUid]);

  // Threshold gift verification
  useEffect(() => {
    const paidSubtotal = cart
      .filter(i => i.type !== 'gift')
      .reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);

    const hasInvalidKit = cart.some(i => i.id === 'gift-colouring-kit' && paidSubtotal < 999);
    const hasInvalidToy = cart.some(i => i.id === 'gift-mini-toy' && paidSubtotal < 1499);

    if (hasInvalidKit || hasInvalidToy) {
      setCart(prev =>
        prev.filter(
          i =>
            !(i.id === 'gift-colouring-kit' && paidSubtotal < 999) &&
            !(i.id === 'gift-mini-toy' && paidSubtotal < 1499)
        )
      );
    }
  }, [cart]);

  // Cart operations
  const addToCart = (item: Partial<CartItem> & { id: string; title: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, qty: i.qty + (item.qty || 1) } : i
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          title: item.title,
          author: item.author || 'Kiddie Bloom',
          price: item.price,
          cover: item.cover || '📖',
          category: item.category || 'General',
          type: item.type || 'book',
          qty: item.qty || 1,
          format: item.format || 'printed'
        }
      ];
    });
    showToast(`“${item.title}” added to cart`);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
    showToast('Item removed from cart');
  };

  const updateCartQty = (id: string, qty: number) => {
    setCart(prev =>
      prev.map(i => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);

  const cartTotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0),
    0
  );

  const addReward = (threshold: number) => {
    if (threshold === 999 && cartTotal >= 999) {
      if (!cart.some(i => i.id === 'gift-colouring-kit')) {
        addToCart({
          id: 'gift-colouring-kit',
          title: 'Complimentary Colouring Kit',
          author: 'Kiddie Bloom',
          price: 0,
          cover: '🎨',
          category: 'Gift',
          type: 'gift',
          qty: 1
        });
      }
    } else if (threshold === 1499 && cartTotal >= 1499) {
      if (!cart.some(i => i.id === 'gift-mini-toy')) {
        addToCart({
          id: 'gift-mini-toy',
          title: 'Complimentary Mini Toy',
          author: 'Kiddie Bloom',
          price: 0,
          cover: '🧸',
          category: 'Gift',
          type: 'gift',
          qty: 1
        });
      }
    }
  };

  // Wishlist operations
  const toggleWishlist = (item: Partial<WishlistItem> & { id: string; title: string; price: number }) => {
    const exists = wishlist.some(i => i.id === item.id);
    if (exists) {
      setWishlist(prev => prev.filter(i => i.id !== item.id));
      showToast('Removed from wishlist');
      return false;
    } else {
      setWishlist(prev => [
        ...prev,
        {
          id: item.id,
          title: item.title,
          author: item.author || 'Kiddie Bloom',
          price: item.price,
          cover: item.cover || '📖',
          category: item.category || 'General',
          type: item.type || 'book'
        }
      ]);
      showToast(`“${item.title}” added to wishlist`);
      return true;
    }
  };

  const isInWishlist = (id: string) => wishlist.some(i => i.id === id);

  const removeFromWishlist = (id: string) => {
    setWishlist(prev => prev.filter(i => i.id !== id));
    showToast('Removed from wishlist');
  };

  // Auth operations
  const login = async (email: string, password: string) => {
    const authUser = await firebaseSignIn(email, password);
    const isAdmin = isFirebaseAdmin(authUser.email);
    const u: User = { email: authUser.email, name: authUser.displayName || authUser.email.split('@')[0], isAdmin };
    setUser(u); localStorage.setItem(USER_KEY, JSON.stringify(u));
    saveProfile(authUser.localId, { email: authUser.email, name: authUser.displayName }, false).catch((e) => console.warn('Profile sync failed', e));
    showToast(isAdmin ? 'Welcome back, Admin!' : `Welcome back, ${u.name}!`);
  };

  const signup = async (email: string, password: string, name: string) => {
    const authUser = await firebaseSignUp(email, password, name);
    const u: User = { email: authUser.email, name: name || authUser.email.split('@')[0], isAdmin: isFirebaseAdmin(authUser.email) };
    setUser(u); localStorage.setItem(USER_KEY, JSON.stringify(u));
    saveProfile(authUser.localId, { email: authUser.email, name: u.name }, true).catch((e) => { console.warn('Profile sync failed', e); showToast('Account created, but saving your profile to Firebase failed. Check the database rules.'); });
    showToast(`Account created. Welcome, ${u.name}!`);
  };

  const logout = () => {
    firebaseSignOut();
    setSyncedUid(null);
    setUser(null);
    localStorage.removeItem(USER_KEY);
    if (firebaseConfigured) {
      // Everything is saved in the account, so clear this device (shared phones/tablets).
      setCart([]); setWishlist([]); setOrders([]); setLastOrder(null);
      localStorage.removeItem(ORDERS_KEY); localStorage.removeItem(LAST_ORDER_KEY);
    }
    showToast('Signed out successfully');
  };

  // Orders
  const saveOrder = (order: Order) => {
    setLastOrder(order);
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
    setOrders(prev => {
      const next = [order, ...prev];
      localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
      return next;
    });
    const uid = cloudUid();
    if (user && uid) {
      saveOrderCloud(uid, order).catch((e) => {
        console.warn('Order sync failed', e);
        showToast('Order saved on this device, but syncing it to your account failed.');
      });
    }
    clearCart();
  };

  // Admin Catalog Management. Writes require a valid Firebase token and rules that allow the configured admin email.
  const addOrUpdateProduct = (product: Book) => {
    if (product.type === 'toy') {
      setToys(prev => { const idx = prev.findIndex(t => t.id === product.id); const updated = idx >= 0 ? prev.map(t => t.id === product.id ? product : t) : [product, ...prev]; localStorage.setItem(CATALOG_TOYS_KEY, JSON.stringify(updated)); return updated; });
    } else {
      setBooks(prev => { const idx = prev.findIndex(b => b.id === product.id); const updated = idx >= 0 ? prev.map(b => b.id === product.id ? product : b) : [product, ...prev]; localStorage.setItem(CATALOG_BOOKS_KEY, JSON.stringify(updated)); return updated; });
    }
    showToast(`Product “${product.title}” saved locally. Use Push to Firebase to publish it.`);
  };

  const fetchCatalogFromFirebase = async () => {
    const [remoteBooks, remoteToys] = await Promise.all([databaseRequest<Record<string, Book> | Book[]>('books'), databaseRequest<Record<string, Book> | Book[]>('toys')]);
    const bookList = withAges(remoteBooks ? (Array.isArray(remoteBooks) ? remoteBooks : Object.values(remoteBooks)) : []);
    const toyList = remoteToys ? (Array.isArray(remoteToys) ? remoteToys : Object.values(remoteToys)) : [];
    setBooks(bookList); setToys(toyList);
    localStorage.setItem(CATALOG_BOOKS_KEY, JSON.stringify(bookList)); localStorage.setItem(CATALOG_TOYS_KEY, JSON.stringify(toyList));
    showToast(`Fetched ${bookList.length} books and ${toyList.length} toys from Firebase.`);
  };

  const pushCatalogToFirebase = async () => {
    if (!user?.isAdmin) throw new Error('This account is not on the Firebase admin allowlist.');
    await Promise.all([databaseRequest('books', 'PUT', Object.fromEntries(books.map(item => [item.id, item]))), databaseRequest('toys', 'PUT', Object.fromEntries(toys.map(item => [item.id, { ...item, type: 'toy' }])))]);
    showToast('Books and toys pushed to Firebase successfully.');
  };

  const resetCatalogToDefault = () => {
    if (!window.confirm('Restore the local catalog to defaults? This does not change Firebase until you press Push to Firebase.')) return;
    setBooks(INITIAL_BOOKS); setToys(INITIAL_TOYS);
    localStorage.setItem(CATALOG_BOOKS_KEY, JSON.stringify(INITIAL_BOOKS)); localStorage.setItem(CATALOG_TOYS_KEY, JSON.stringify(INITIAL_TOYS));
    showToast('Local catalog restored to defaults. Push to Firebase to publish.');
  };

  return (
    <StoreContext.Provider
      value={{
        view,
        setView,
        selectedCategory,
        setSelectedCategory,
        selectedBook,
        setSelectedBook,
        ageFilter,
        setAgeFilter,
        books,
        toys,
        addOrUpdateProduct,
        resetCatalogToDefault,
        fetchCatalogFromFirebase,
        pushCatalogToFirebase,
        firebaseConfigured,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        cartCount,
        cartTotal,
        addReward,
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        user,
        login,
        logout,
        signup,
        lastOrder,
        orders,
        saveOrder,
        theme,
        toggleTheme,
        currency,
        setCurrency,
        formatPrice,
        fxRates,
        toastMessage,
        showToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
