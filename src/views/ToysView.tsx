import React from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from '../components/BookCard';
import { Bot, ArrowLeft, Sparkles, Gift, BookOpen, ShoppingBag, CheckCircle2 } from 'lucide-react';

const TOY_HERO_IMG = '/src/assets/images/futuristic_learning_toy_1793017195881.jpg';

export const ToysView: React.FC = () => {
  const { toys, setView, setSelectedCategory, formatPrice } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Return to Home */}
      <button
        type="button"
        onClick={() => setView('home')}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Overview</span>
      </button>

      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-slate-950 border border-purple-500/25 p-8 sm:p-12 mb-12 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 flex flex-col">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-purple-400 mb-2">
              <Bot className="w-3.5 h-3.5" />
              <span>HANDS-ON TACTILE HORIZONS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight mb-4 text-balance">
              Big Discoveries Begin with Tactile Adventures.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed mb-8 max-w-xl">
              Pair favourite holographic tutorial stories with programmable robotics, spatial blocks, and creative lab kits. Every item invites hands-on imagination and real engineering curiosity.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#toy-products"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('toy-products')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs font-mono transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center gap-2"
              >
                <span>Explore Kits</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setView('library');
                }}
                className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500/40 text-slate-300 text-xs font-mono transition-colors flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>Pair with a Book</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl">
              <img 
                src={TOY_HERO_IMG} 
                alt="Futuristic educational STEM robotics kit" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-slate-950/80 text-[10px] font-mono text-purple-300 border border-purple-500/30">
                TACTILE LAB VERIFIED
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Reward Teleport Threshold Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/25 mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">
              Book + Toy Quantum Pairing Rewards
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Spend <strong className="text-cyan-300 font-mono">{formatPrice(999)}</strong> across works and toys to unlock a complimentary Creative Colouring Kit. Reach <strong className="text-cyan-300 font-mono">{formatPrice(1499)}</strong> to claim a free companion mini learning toy.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setView('cart')}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs hover:bg-cyan-500 hover:text-slate-950 transition-all whitespace-nowrap shrink-0"
        >
          Check Threshold Status
        </button>
      </div>

      {/* Toys Grid */}
      <div id="toy-products" className="scroll-mt-24 mb-12">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-white font-display">STEM & Discovery Kits</h2>
            <p className="text-xs text-slate-400 mt-0.5">Curated physical kits designed to amplify cognitive comprehension.</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{toys.length} Kits Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {toys.map((toy) => (
            <BookCard key={toy.id} book={toy} />
          ))}
        </div>
      </div>

    </div>
  );
};
