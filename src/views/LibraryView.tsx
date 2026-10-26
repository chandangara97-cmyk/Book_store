import React, { useState, useId } from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from '../components/BookCard';

export const LibraryView: React.FC = () => {
  const { books, selectedCategory, setSelectedCategory, setView } = useStore();
  const [sortBy, setSortBy] = useState<string>('title-asc');
  const [search, setSearch] = useState<string>('');
  const sortSelectId = useId();

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

  return (
    <div>
      <div className="page-header page-header--photo" style={{ backgroundImage: "linear-gradient(100deg, rgba(18,28,47,0.88), rgba(18,28,47,0.45)), url('https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1800&q=85')" }}>
        <div className="container">
          <button
            type="button"
            onClick={() => setView('home')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--mut)',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600
            }}
          >
            ← Back to Home
          </button>
          <h1>All Books</h1>
          <p>Browse the complete collection. Filter by category, search, and sort as you like.</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '70px' }}>
        {/* Controls Bar */}
        <div className="controls-bar">
          <div className="filter-group">
            <label>Filter by Category</label>
            <div className="filter-buttons">
              <button
                type="button"
                className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`filter-btn ${selectedCategory === 'fiction' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('fiction')}
              >
                Fiction & Stories
              </button>
              <button
                type="button"
                className={`filter-btn ${selectedCategory === 'learning' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('learning')}
              >
                Learning & Growth
              </button>
              <button
                type="button"
                className={`filter-btn ${selectedCategory === 'children' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('children')}
              >
                Children’s Books
              </button>
              <button
                type="button"
                className={`filter-btn ${selectedCategory === 'gifts' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('gifts')}
              >
                Gifts & Special Reads
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="bookSearch" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px', display: 'block' }}>
                Search
              </label>
              <input
                id="bookSearch"
                type="text"
                placeholder="Search title, author, tag…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border)',
                  fontSize: '0.92rem',
                  minWidth: '200px'
                }}
              />
            </div>

            <div className="sort-group">
              <label htmlFor={sortSelectId}>Sort by</label>
              <select
                id={sortSelectId}
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="title-asc">Title (A–Z)</option>
                <option value="title-desc">Title (Z–A)</option>
                <option value="author-asc">Author (A–Z)</option>
                <option value="author-desc">Author (Z–A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '22px' }}>
          Showing <strong>{sorted.length}</strong> {sorted.length === 1 ? 'book' : 'books'}
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          {search && ` matching "${search}"`}
        </div>

        {/* Books Grid */}
        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '20px' }}>No books found matching your criteria.</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSelectedCategory('all');
                setSearch('');
              }}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="book-grid">
            {sorted.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
