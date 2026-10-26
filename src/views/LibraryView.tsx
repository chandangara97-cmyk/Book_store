import React, { useState, useId } from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from '../components/BookCard';
import { Search, SlidersHorizontal, ArrowLeft, BookOpen, RotateCcw } from 'lucide-react';

export const LibraryView: React.FC = () => {
  const { books, selectedCategory, setSelectedCategory, setView } = useStore();
  const [sortBy, setSortBy] = useState<string>('title-asc');
  const [search, setSearch] = useState<string>('');
  const sortSelectId = useId();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter
  const filtered = books.filter((book) => {
    const matchesCat = selectedCategory === 'all' || book.category === selectedCategory;
    const matchesSearch =
      search.trim() === '' ||
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      (book.tags && book.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
    return matchesCat && matchesSearch;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      case 'author-asc':
        return a.author.localeCompare(b.author);
      case 'author-desc':
        return b.author.localeCompare(a.author);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const categories = [
    { id: 'all', label: 'All Works' },
    { id: 'children', label: "Children's Core" },
    { id: 'learning', label: 'STEM & Tutorial' },
    { id: 'fiction', label: 'Imaginative Worlds' },
    { id: 'gifts', label: 'Special Editions' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Top Header */}
      <div className="mb-10">
        <button
          type="button"
          onClick={() => setView('home')}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Overview</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>CENTRAL QUANTUM VAULT</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
              All Holo-Books & Tutorials
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Browse the complete curriculum catalog. Filter by developmental category, search, and sort with live price conversion.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Archive Count:</span>
            <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800 tabular-nums">
              {sorted.length} Works
            </span>
          </div>
        </div>
      </div>

      {/* Futuristic Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search title, author, topic…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <select
            id={sortSelectId}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="title-asc">Title (A–Z)</option>
            <option value="title-desc">Title (Z–A)</option>
            <option value="author-asc">Author (A–Z)</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Grid of Books */}
      {sorted.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl bg-slate-900/40 border border-slate-800">
          <p className="text-base font-mono text-slate-300 mb-2">No holo-works match your query telemetry.</p>
          <p className="text-xs text-slate-500 mb-6">Try clearing your search terms or selecting another category.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearch('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-cyan-300 font-mono text-xs hover:bg-slate-700 transition-colors inline-flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Search & Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sorted.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

    </div>
  );
};
