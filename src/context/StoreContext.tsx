import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, CartItem, WishlistItem, Order, User } from '../types';
import { INITIAL_BOOKS, INITIAL_TOYS } from '../data/initialData';

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
  login: (email: string, name?: string) => void;
  logout: () => void;
  signup: (email: string, name: string) => void;

  // Orders
  lastOrder: Order | null;
  orders: Order[];
  saveOrder: (order: Order) => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const STORE_KEY = 'readingNook';
const ORDERS_KEY = 'readingNookOrders';
const LAST_ORDER_KEY = 'readingNookLastOrder';
const USER_KEY = 'readingNookUser';
const CATALOG_BOOKS_KEY = 'readingNookCustomBooks';
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
    return 'light';
  });

  // View Routing
  const [view, setView] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [ageFilter, setAgeFilter] = useState<number | null>(null);

  // Catalog State
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem(CATALOG_BOOKS_KEY);
      if (saved) return JSON.parse(saved);
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
      if (saved) return JSON.parse(saved);
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
  const login = (email: string, name?: string) => {
    const isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().includes('gara');
    const u: User = { email, name: name || email.split('@')[0], isAdmin };
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    showToast(`Welcome back, ${u.name}!`);
  };

  const signup = (email: string, name: string) => {
    const isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().includes('gara');
    const u: User = { email, name, isAdmin };
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    showToast(`Account created. Welcome, ${u.name}!`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
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
    clearCart();
  };

  // Admin Catalog Management
  const addOrUpdateProduct = (product: Book) => {
    if (product.type === 'toy') {
      setToys(prev => {
        const idx = prev.findIndex(t => t.id === product.id);
        const updated = idx >= 0 ? prev.map(t => (t.id === product.id ? product : t)) : [product, ...prev];
        localStorage.setItem(CATALOG_TOYS_KEY, JSON.stringify(updated));
        return updated;
      });
    } else {
      setBooks(prev => {
        const idx = prev.findIndex(b => b.id === product.id);
        const updated = idx >= 0 ? prev.map(b => (b.id === product.id ? product : b)) : [product, ...prev];
        localStorage.setItem(CATALOG_BOOKS_KEY, JSON.stringify(updated));
        return updated;
      });
    }
    showToast(`Product “${product.title}” saved`);
  };

  const resetCatalogToDefault = () => {
    setBooks(INITIAL_BOOKS);
    setToys(INITIAL_TOYS);
    localStorage.removeItem(CATALOG_BOOKS_KEY);
    localStorage.removeItem(CATALOG_TOYS_KEY);
    showToast('Catalog restored to default');
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
