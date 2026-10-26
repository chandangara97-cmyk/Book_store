import React from 'react';
import { Book } from '../types';
import { useStore } from '../context/StoreContext';
import { CoverImage } from './CoverImage';
import { ShoppingBag, Heart, Eye, Sparkles, BookOpen, Layers } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onOpenDetails?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onOpenDetails }) => {
  const { addToCart, toggleWishlist, isInWishlist, setSelectedBook, formatPrice } = useStore();
  const inWishlist = isInWishlist(book.id);

  const handleCardClick = () => {
    if (onOpenDetails) {
      onOpenDetails(book);
    } else {
      setSelectedBook(book);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      cover: book.cover,
      category: book.category,
      type: book.type || 'book'
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist({
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      cover: book.cover,
      category: book.category,
      type: book.type || 'book'
    });
  };

  return (
    <article 
      onClick={handleCardClick}
      className="group relative flex flex-col rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_12px_36px_rgba(6,182,212,0.15)] hover:-translate-y-1 overflow-hidden cursor-pointer"
    >
      {/* Holographic Top Glow Line */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/0 to-transparent group-hover:via-cyan-400 transition-all duration-500" />

      {/* Book Cover Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center p-4">
        <div className="relative h-full aspect-[3/4] max-h-48 rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1 flex items-center justify-center bg-slate-800/80 overflow-hidden border border-slate-700/60">
          <CoverImage 
            cover={book.cover} 
            alt={`Cover of ${book.title}`} 
            className="w-full h-full object-cover"
            emojiFallback={book.emoji || '📖'} 
          />
          {/* Hologram Sheen on Hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-cyan-400/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>

        {/* Quick Holo-View Floating Overlay */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-cyan-300 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-cyan-500 hover:text-slate-950"
          title="Instant Hologram Preview"
          aria-label="Instant Preview"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Wishlist Icon */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all border ${
            inWishlist 
              ? 'bg-pink-500/20 border-pink-500/50 text-pink-400' 
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-pink-400 hover:border-pink-500/30'
          }`}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Wishlist toggle"
        >
          <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-pink-400' : ''}`} />
        </button>
      </div>

      {/* Book Meta & Info */}
      <div className="flex flex-col flex-1 p-4.5 sm:p-5">
        {/* Unboxed Metadata (Zero-Pill Rule) */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-mono">
          <span className="text-cyan-400 font-medium">
            {book.minAge !== undefined ? `Ages ${book.minAge}–${book.maxAge}` : 'All Ages'}
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="capitalize text-slate-300">{book.category}</span>
          {book.type === 'toy' && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-purple-400">Kit</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1 font-display">
          {book.title}
        </h3>

        {/* Author / Studio */}
        <div className="text-xs text-slate-400 mb-2">
          by <span className="text-slate-300">{book.author}</span>
        </div>

        {/* Pair Note or Blurb */}
        {book.pairNote ? (
          <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-1 rounded-md mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="truncate">{book.pairNote}</span>
          </div>
        ) : (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {book.blurb || book.description}
          </p>
        )}

        <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
          {/* Price with Live Currency */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              {book.digitalPrice ? 'From' : 'Price'}
            </span>
            <div className="text-base font-bold text-white font-mono tracking-tight">
              {formatPrice(book.digitalPrice || book.price)}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleAddToCart}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] flex items-center gap-1.5 active:scale-95 whitespace-nowrap shrink-0"
              title="Add to Teleport Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
