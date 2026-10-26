import { CoverImage } from '../components/CoverImage';
import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, ArrowLeft, Trash2, ArrowRight, Gift, Sparkles, Check } from 'lucide-react';

export const CartView: React.FC = () => {
  const { cart, removeFromCart, updateCartQty, cartTotal, addReward, setView, setSelectedCategory, formatPrice } = useStore();

  const paidSubtotal = cart
    .filter((i) => i.type !== 'gift')
    .reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);

  const hasGift999 = cart.some((i) => i.id === 'gift-colouring-kit');
  const hasGift1499 = cart.some((i) => i.id === 'gift-mini-toy');

  const shipping = paidSubtotal === 0 || paidSubtotal >= 499 ? 0 : 49;
  const grandTotal = paidSubtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-white font-display mb-3">Your Teleport Basket is Empty</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-8">
          Explore interactive curriculum books, digital holo-scrolls, or pair a story with a hands-on robotics kit.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            onClick={() => {
              setSelectedCategory('all');
              setView('library');
            }}
          >
            Browse All Books
          </button>
          <button
            type="button"
            className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs hover:border-cyan-500/40 hover:text-white transition-colors"
            onClick={() => setView('toys')}
          >
            Explore STEM Toys
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Return Button */}
      <button
        type="button"
        onClick={() => {
          setSelectedCategory('all');
          setView('library');
        }}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Continue Exploring Catalog</span>
      </button>

      <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-display">Teleport Basket</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Review learning works and unlocked complimentary bundles</p>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-lg">
          {cart.length} Line {cart.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Table */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl overflow-hidden shadow-xl">
            <div className="divide-y divide-slate-800/80">
              {cart.map((item) => {
                const isGift = item.type === 'gift';
                const itemTotal = (item.price || 0) * (item.qty || 1);

                return (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    
                    {/* Item info */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-14 h-18 sm:w-16 sm:h-20 rounded-lg bg-slate-950 border border-slate-800 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                        <CoverImage cover={item.cover} alt={item.title} className="w-full h-full object-cover rounded" />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-white truncate font-display">
                          {item.title}
                        </span>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {isGift ? (
                            <span className="text-emerald-400 font-bold">COMPLIMENTARY REWARD</span>
                          ) : (
                            <span>{item.author || 'Kiddie Bloom Studio'} {item.format && `· ${item.format === 'digital' ? 'Holo-Digital' : 'Print'}`}</span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-cyan-400 mt-1 sm:hidden">
                          {isGift ? 'FREE' : formatPrice(item.price)}
                        </div>
                      </div>
                    </div>

                    {/* Qty and Subtotal */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 shrink-0">
                      
                      {/* Price on desktop */}
                      <div className="hidden sm:block text-right font-mono text-xs text-slate-300">
                        {isGift ? 'FREE' : formatPrice(item.price)}
                      </div>

                      {/* Qty */}
                      {isGift ? (
                        <span className="text-xs font-mono text-slate-400 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">
                          Qty: 1
                        </span>
                      ) : (
                        <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, item.qty - 1)}
                            disabled={item.qty <= 1}
                            className="w-7 h-7 rounded text-slate-400 hover:text-white disabled:opacity-30 flex items-center justify-center font-bold"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-bold text-white">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, item.qty + 1)}
                            className="w-7 h-7 rounded text-slate-400 hover:text-white flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      )}

                      {/* Line Total */}
                      <div className="w-24 text-right font-mono text-sm font-bold text-white tabular-nums">
                        {isGift ? 'FREE' : formatPrice(itemTotal)}
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Reward Tiers Unlocking Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-purple-950/40 border border-cyan-500/25 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
              <Gift className="w-4 h-4" />
              <span>COMPLIMENTARY REWARD TIERS</span>
            </div>
            
            <div className="space-y-3 mt-4">
              {/* Tier 1: 999 */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                paidSubtotal >= 999 
                  ? 'bg-cyan-500/10 border-cyan-400/40' 
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-400'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎨</span>
                  <div>
                    <div className="text-xs font-bold text-white">Complimentary Creative Colouring Kit</div>
                    <div className="text-[11px] font-mono text-slate-400">Unlock at {formatPrice(999)}</div>
                  </div>
                </div>

                {paidSubtotal >= 999 ? (
                  hasGift999 ? (
                    <span className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Added
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addReward(999)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition-colors"
                    >
                      Claim Free
                    </button>
                  )
                ) : (
                  <span className="text-[11px] font-mono text-slate-400">
                    Add {formatPrice(999 - paidSubtotal)} more
                  </span>
                )}
              </div>

              {/* Tier 2: 1499 */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                paidSubtotal >= 1499 
                  ? 'bg-purple-500/10 border-purple-400/40' 
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-400'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🧸</span>
                  <div>
                    <div className="text-xs font-bold text-white">Complimentary Companion Mini Toy</div>
                    <div className="text-[11px] font-mono text-slate-400">Unlock at {formatPrice(1499)}</div>
                  </div>
                </div>

                {paidSubtotal >= 1499 ? (
                  hasGift1499 ? (
                    <span className="text-xs font-mono text-purple-300 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Added
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addReward(1499)}
                      className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-bold font-mono text-xs transition-colors"
                    >
                      Claim Free
                    </button>
                  )
                ) : (
                  <span className="text-[11px] font-mono text-slate-400">
                    Add {formatPrice(Math.max(0, 1499 - paidSubtotal))} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl shadow-2xl flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white font-display">Basket Telemetry</h3>

          <div className="space-y-3 pt-2 text-xs font-mono text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Subtotal:</span>
              <span className="text-white font-bold tabular-nums">{formatPrice(paidSubtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Teleport Shipping:</span>
              <span className="tabular-nums font-bold">
                {shipping === 0 ? <span className="text-emerald-400">FREE</span> : formatPrice(shipping)}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between text-base">
              <span className="font-bold text-white">Estimated Total:</span>
              <span className="text-2xl font-black text-cyan-300 tracking-tight tabular-nums font-mono">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setView('checkout')}
            className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold font-mono text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
          >
            <span>Proceed to Quantum Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            {paidSubtotal >= 499 
              ? '✓ Free shipping unlocked for this dispatch.'
              : `Add items worth ${formatPrice(499 - paidSubtotal)} more for free courier dispatch.`}
          </p>
        </div>

      </div>
    </div>
  );
};
