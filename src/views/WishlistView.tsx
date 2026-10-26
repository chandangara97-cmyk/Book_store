import { CoverImage } from '../components/CoverImage';
import React from 'react';
import { useStore } from '../context/StoreContext';
import { Heart, ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { wishlist, removeFromWishlist, addToCart, setView, setSelectedCategory, formatPrice } = useStore();

  const handleAddToCart = (item: typeof wishlist[0]) => {
    addToCart({
      id: item.id,
      title: item.title,
      author: item.author,
      price: item.price,
      cover: item.cover,
      category: item.category,
      type: item.type || 'book',
      qty: 1
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Return Button */}
      <button
        type="button"
        onClick={() => setView('home')}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Overview</span>
      </button>

      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-pink-400 mb-1">
            <Heart className="w-3.5 h-3.5 fill-pink-400" />
            <span>SAVED FOR FUTURE TELEPORTATION</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display">Your Wishlist Vault</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Saved books, holo-scrolls and learning companion tools</p>
        </div>
        <span className="text-xs font-mono text-pink-400 bg-pink-500/10 border border-pink-500/30 px-3 py-1 rounded-lg">
          {wishlist.length} Saved {wishlist.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {wishlist.length === 0 ? (
        <div className="max-w-md mx-auto py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-pink-500/30 flex items-center justify-center mx-auto mb-4 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.15)]">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white font-display mb-2">Wishlist Vault is Empty</h2>
          <p className="text-xs text-slate-400 mb-6 font-mono">
            Click the heart icon on any learning work or STEM kit to bookmark it here.
          </p>
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 transition-colors"
            onClick={() => {
              setSelectedCategory('all');
              setView('library');
            }}
          >
            Explore Holo-Vault
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <article 
              key={item.id} 
              className="rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl p-4 flex flex-col justify-between hover:border-pink-500/40 transition-all shadow-lg"
            >
              <div>
                <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-950 mb-3 flex items-center justify-center p-2 border border-slate-800">
                  <CoverImage cover={item.cover} alt={item.title} className="h-full object-contain" />
                </div>
                <h3 className="text-sm font-bold text-white font-display line-clamp-1 mb-1">{item.title}</h3>
                <div className="text-xs text-slate-400 mb-2">by {item.author}</div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                <span className="text-sm font-bold font-mono text-white">{formatPrice(item.price)}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Cart</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

    </div>
  );
};
