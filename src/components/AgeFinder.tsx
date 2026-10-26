import React, { useState, useId } from 'react';
import { STAGES } from '../data/initialData';
import { useStore } from '../context/StoreContext';
import { BookCard } from './BookCard';
import { Book } from '../types';
import { asset, cleanSrc, imgFallback } from '../utils/images';
import { Sliders, Sparkles, BookOpen, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

export const AgeFinder: React.FC = () => {
  const [age, setAge] = useState<number>(6);
  const [formatFilter, setFormatFilter] = useState<'all' | 'printed' | 'digital'>('all');
  const { books, setSelectedBook, setView } = useStore();
  const sliderId = useId();

  // Find active stage
  const currentStage = STAGES.find((s) => age >= s.minAge && age <= s.maxAge) || STAGES[1];

  // Filter books matching current age
  const matchedBooks = books.filter((b) => {
    const ageMatches = b.minAge !== undefined && b.maxAge !== undefined && age >= b.minAge && age <= b.maxAge;
    if (!ageMatches) return false;
    if (formatFilter === 'printed') return !!b.printedPrice;
    if (formatFilter === 'digital') return !!b.digitalPrice;
    return true;
  });

  return (
    <div className="relative rounded-3xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-2xl p-6 sm:p-8 lg:p-10 shadow-[0_16px_50px_rgba(0,0,0,0.4)] overflow-hidden">
      {/* Background Quantum Mesh Glow */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Top HUD Telemetry Header */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-8 border-b border-slate-800/80">
        
        {/* Left: Giant Holographic Age Gauge */}
        <div className="lg:col-span-5 flex items-center gap-6">
          <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.25)] shrink-0">
            <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-400 tabular-nums">
              {String(age).padStart(2, '0')}
            </span>
            <span className="absolute bottom-1.5 text-[9px] uppercase font-mono tracking-widest text-cyan-400/80">
              Years Old
            </span>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-slate-950 animate-pulse" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>ACTIVE SYNTHESIS STAGE</span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight font-display">
              {currentStage.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              {currentStage.description}
            </p>
          </div>
        </div>

        {/* Center: Stage Teleport Buttons */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
            Developmental Stages:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STAGES.map((s, idx) => {
              const isActive = age >= s.minAge && age <= s.maxAge;
              const stageLabels = ['Alpha Sparks', 'Nova Explorers', 'Cosmos Scholars', 'Quantum Masters'];
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setAge(s.minAge + (idx === 0 ? 1 : 0))}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.2)] text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[10px] font-mono tracking-wider text-cyan-400 mb-0.5">
                    {s.name}
                  </div>
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {stageLabels[idx]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cyber Scrubber & Controls */}
      <div className="py-8 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
          <span>Target Explorer Age: <strong className="text-cyan-300 font-bold">{age} Years</strong></span>
          <span className="text-slate-400">Range: 0 (Infancy) — 15 (Young Adult)</span>
        </div>

        {/* Custom Range Track */}
        <div className="relative py-4">
          <input
            type="range"
            id={sliderId}
            min="0"
            max="15"
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value, 10))}
            aria-valuetext={`Age ${age}`}
            className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none border border-slate-800"
          />

          {/* Tick numbers */}
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2 px-1 select-none">
            {Array.from({ length: 16 }).map((_, i) => (
              <span 
                key={i}
                onClick={() => setAge(i)}
                className={`cursor-pointer transition-colors ${i === age ? 'text-cyan-400 font-bold scale-125' : 'hover:text-slate-300'}`}
              >
                {i}
              </span>
            ))}
          </div>
        </div>

        {/* Format Selector segmented control (Allowed interactive tabs) */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setFormatFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                formatFilter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Formats ({matchedBooks.length})
            </button>
            <button
              type="button"
              onClick={() => setFormatFilter('printed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                formatFilter === 'printed'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Molecular Print
            </button>
            <button
              type="button"
              onClick={() => setFormatFilter('digital')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                formatFilter === 'digital'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Holo-Digital Scroll
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Showing <strong className="text-white font-bold">{matchedBooks.length}</strong> matching works</span>
          </div>
        </div>
      </div>

      {/* Matching Books Matrix */}
      <div className="pt-8">
        {matchedBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {matchedBooks.map((book) => (
              <BookCard key={book.id} book={book} onOpenDetails={setSelectedBook} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-2xl bg-slate-950/40 border border-slate-800">
            <p className="text-sm font-mono text-slate-400">
              No matching holo-books for age {age} under this filter.
            </p>
            <button
              type="button"
              onClick={() => setFormatFilter('all')}
              className="mt-3 px-4 py-2 rounded-xl bg-slate-800 text-xs font-mono text-cyan-300 hover:bg-slate-700 transition-colors"
            >
              Reset Format Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
