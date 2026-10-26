import React from 'react';
import { useStore } from '../context/StoreContext';

export const WishlistView: React.FC = () => {
  const { wishlist, removeFromWishlist, addToCart, setView, setSelectedCategory } = useStore();

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
    <div>
      <div className="page-header">
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
            ← Continue Browsing
          </button>
          <h1>Your Wishlist</h1>
          <p>Books and gifts you’re saving for later.</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '70px' }}>
        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '14px' }}>♡</div>
            <h3 style={{ fontSize: '24px', color: 'var(--ink)', marginBottom: '8px' }}>
              Your wishlist is empty
            </h3>
            <p style={{ margin: '8px 0 24px', fontSize: '16px' }}>
              Tap the save button on any book or toy to keep it here.
            </p>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setSelectedCategory('all');
                setView('library');
              }}
            >
              Browse Books
            </button>
          </div>
        ) : (
          <div className="book-grid">
            {wishlist.map((item) => {
              const isEmoji =
                item.cover && item.cover.length <= 4 && !item.cover.includes('/') && !item.cover.includes('.');

              return (
                <article key={item.id} className="book-card">
                  <div className="book-cover">
                    {isEmoji ? (
                      <span className="emoji-cover">{item.cover}</span>
                    ) : (
                      <img src={item.cover} alt={item.title} />
                    )}
                  </div>

                  <div className="book-info">
                    <h3>{item.title}</h3>
                    <div className="author">by {item.author}</div>
                    <div className="price">₹{item.price.toLocaleString('en-IN')}</div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
