import { CoverImage } from './CoverImage';
import React, { useEffect, useState } from 'react';
import { Book } from '../types';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  ShoppingBag, 
  Heart, 
  ArrowRight, 
  Check, 
  BookOpen, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Zap,
  RotateCcw
} from 'lucide-react';

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  fiction: 'Fiction & Stories',
  learning: 'Tutorial & Growth',
  children: "Children's Works",
  gifts: 'Gifts & Special Editions',
  toys: 'STEM & Robotics Kits'
};

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose }) => {
  const { books, toys, addToCart, toggleWishlist, isInWishlist, setSelectedBook, setView, formatPrice } = useStore();
  const [format, setFormat] = useState<'printed' | 'digital'>('printed');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Reset when another book is opened from "You may also like"
  useEffect(() => {
    setFormat('printed');
    setQty(1);
    setAdded(false);
  }, [book.id]);

  // Close with Esc and stop the page behind from scrolling
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const isToy = book.type === 'toy' || book.category === 'toys';
  const inWishlist = isInWishlist(book.id);
  const hasDigital = Boolean(book.digitalPrice) && !isToy;
  const activePrice = format === 'digital' && book.digitalPrice ? book.digitalPrice : book.printedPrice || book.price;
  const hasAges = book.minAge !== undefined && book.maxAge !== undefined;

  const related = (isToy ? toys : books)
    .filter((b) => b.id !== book.id && b.category === book.category)
    .slice(0, 3);

  const addItem = () =>
    addToCart({
      id: format === 'digital' ? `${book.id}-digital` : book.id,
      title: `${book.title}${format === 'digital' ? ' (Holo-Digital Edition)' : ' (Molecular Print)'}`,
      author: book.author,
      price: activePrice,
      cover: book.cover,
      category: book.category,
      type: book.type || 'book',
      qty,
      format
    });

  const handleAddToBasket = () => {
    addItem();
    setAdded(true);
  };

  const handleCheckout = () => {
    if (!added) addItem();
    onClose();
    setView('checkout');
    window.scrollTo({ top: 0 });
  };

  const handleViewBasket = () => {
    onClose();
    setView('cart');
    window.scrollTo({ top: 0 });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto"
      onClick={onClose}
      role="dialog" 
      aria-modal="true" 
      aria-label={book.title}
    >
      <div 
        className="relative w-full max-w-3xl rounded-3xl bg-slate-900/95 border border-cyan-500/30 p-6 sm:p-8 md:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.7)] text-slate-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Hologram Cover */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative aspect-[3/4] w-full max-w-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 shadow-2xl p-2 flex items-center justify-center">
              <CoverImage
                cover={book.cover}
                alt={book.title}
                className="w-full h-full object-cover rounded-xl"
                emojiStyle={{ fontSize: '72px' }}
                emojiFallback={book.emoji}
              />
              <div className="absolute top-4 left-4 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-cyan-400 border border-cyan-500/30">
                VERIFIED ARCHIVE
              </div>
            </div>

            {/* Quick Status */}
            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>In Stock · Instant Dispatch</span>
            </div>
          </div>

          {/* Right Column: Title, Metadata, Formats, and Actions */}
          <div className="md:col-span-7 flex flex-col">
            
            {/* Category and Age metadata */}
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono mb-2">
              <span>{CATEGORY_LABELS[book.category] || book.category}</span>
              {hasAges && (
                <>
                  <span className="text-slate-600">·</span>
                  <span>Ages {book.minAge}–{book.maxAge}</span>
                </>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight mb-1 pr-8">
              {book.title}
            </h2>

            <div className="text-sm text-slate-400 mb-4">
              Authored by <span className="text-slate-200 font-medium">{book.author}</span>
            </div>

            {/* Synopsis / Blurb */}
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {book.description}
            </p>

            {/* Format Selector if digital available */}
            {hasDigital && (
              <div className="mb-6">
                <span className="block text-xs font-mono uppercase text-slate-400 mb-2">
                  Select Edition Format:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setFormat('printed'); setAdded(false); }}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col ${
                      format === 'printed'
                        ? 'bg-cyan-500/15 border-cyan-400/60 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold text-white">Molecular Print</span>
                    <span className="text-[11px] font-mono text-cyan-400 mt-1">{formatPrice(book.printedPrice || book.price)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setFormat('digital'); setAdded(false); }}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col ${
                      format === 'digital'
                        ? 'bg-cyan-500/15 border-cyan-400/60 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold text-white">Holo-Digital Scroll</span>
                    <span className="text-[11px] font-mono text-cyan-400 mt-1">{formatPrice(book.digitalPrice || 0)}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Active Price Readout */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-slate-800">
              <span className="text-3xl font-black text-white font-mono tracking-tight tabular-nums">
                {formatPrice(activePrice * qty)}
              </span>
              {qty > 1 && (
                <span className="text-xs font-mono text-slate-400">
                  ({qty} × {formatPrice(activePrice)})
                </span>
              )}
            </div>

            {/* Buy and Cart Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              
              {/* Quantity */}
              <div className="flex items-center justify-between sm:justify-start rounded-xl bg-slate-950 border border-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => { setQty((q) => Math.max(1, q - 1)); setAdded(false); }}
                  className="w-8 h-8 rounded-lg bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center font-bold text-base"
                >
                  −
                </button>
                <span className="w-10 text-center font-mono font-bold text-sm text-white">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => { setQty((q) => q + 1); setAdded(false); }}
                  className="w-8 h-8 rounded-lg bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center font-bold text-base"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToBasket}
                className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs font-mono tracking-wide transition-all flex items-center justify-center gap-2 ${
                  added 
                    ? 'bg-emerald-500 text-slate-950' 
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              {/* Instant Checkout Button */}
              <button
                type="button"
                onClick={handleCheckout}
                className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sub-actions */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2">
              <button
                type="button"
                onClick={() =>
                  toggleWishlist({
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    price: book.price,
                    cover: book.cover,
                    category: book.category,
                    type: book.type || 'book'
                  })
                }
                className={`flex items-center gap-1.5 transition-colors ${inWishlist ? 'text-pink-400' : 'hover:text-white'}`}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-pink-400' : ''}`} />
                <span>{inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              {added && (
                <button
                  type="button"
                  onClick={handleViewBasket}
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Cart ({qty})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Related Works strip */}
        {related.length > 0 && (
          <div className="mt-10 pt-8 border-t border-slate-800">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4">
              Paired Learning Works:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {related.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedBook(r)}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center gap-3"
                >
                  <div className="w-10 h-14 rounded bg-slate-900 shrink-0 overflow-hidden">
                    <CoverImage cover={r.cover} alt={r.title} className="w-full h-full object-cover" emojiFallback="📖" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">{r.title}</span>
                    <span className="text-[11px] font-mono text-cyan-400">{formatPrice(r.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
