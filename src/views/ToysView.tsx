import React from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from '../components/BookCard';

export const ToysView: React.FC = () => {
  const { toys, setView, setSelectedCategory } = useStore();

  return (
    <div>
      <div
        style={{
          padding: '65px 0',
          background: "linear-gradient(100deg, rgba(22,43,57,0.88), rgba(22,43,57,0.3)), url('https://images.unsplash.com/photo-1560961911-ba7ef651a56c?auto=format&fit=crop&w=1800&q=85') center/cover",
          color: 'white',
          marginBottom: '36px'
        }}
      >
        <div className="wrap">
          <button
            type="button"
            onClick={() => setView('home')}
            style={{
              background: 'none',
              border: 'none',
              color: '#dbe7f5',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600
            }}
          >
            ← Back to Home
          </button>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 56px)', color: '#fff', maxWidth: '14ch', marginBottom: '14px' }}>
            Big ideas begin with little adventures.
          </h1>
          <p style={{ maxWidth: '620px', color: '#f3f8f5', fontSize: '18px', marginBottom: '24px' }}>
            Pair favourite stories with puzzles, creative kits and playful learning tools. Every
            gift is an invitation to imagine, build and discover.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="#toy-products"
              className="btn gold"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('toy-products')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Shop toys & kits
            </a>
            <button
              type="button"
              className="btn btn-outline"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: '#fff' }}
              onClick={() => {
                setSelectedCategory('all');
                setView('library');
              }}
            >
              Find a book to pair
            </button>
          </div>
        </div>
      </div>

      <main className="wrap" style={{ paddingBottom: '70px' }}>
        {/* Reward banner */}
        <div className="gift-rewards" style={{ margin: '20px 0 36px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>
            🎁 Book + toy = an extra-special gift
          </h2>
          <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.55 }}>
            Spend <strong>₹999</strong> on books and toys to choose a free colouring kit. Spend{' '}
            <strong>₹1,499</strong> to unlock a free mini toy as well. Gifts can be selected in your
            cart once you reach each threshold.
          </p>
        </div>

        <h2 id="toy-products" className="sec-title">Toys & creative kits</h2>
        <p className="intro">
          Playful add-ons for curious minds. Pair a toy with a storybook for a ready-made gift
          bundle.
        </p>

        <div className="book-grid">
          {toys.map((toy) => (
            <BookCard key={toy.id} book={toy} />
          ))}
        </div>

        <div style={{ marginTop: '48px', display: 'flex', gap: '16px', color: 'var(--mut)', fontSize: '15px' }}>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setView('library');
            }}
            style={{ background: 'none', border: 'none', color: 'var(--ink)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            ← Browse books
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => setView('cart')}
            style={{ background: 'none', border: 'none', color: 'var(--ink)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            View cart
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('gifts');
              setView('library');
            }}
            style={{ background: 'none', border: 'none', color: 'var(--ink)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Book gifts
          </button>
        </div>
      </main>
    </div>
  );
};
