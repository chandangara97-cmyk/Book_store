import React, { useState } from 'react';
import { Book } from '../types';
import { useStore } from '../context/StoreContext';

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [format, setFormat] = useState<'printed' | 'digital'>('printed');
  const [qty, setQty] = useState(1);

  const inWishlist = isInWishlist(book.id);
  const activePrice =
    format === 'digital' && book.digitalPrice ? book.digitalPrice : (book.printedPrice || book.price);

  const handleAddToCart = () => {
    addToCart({
      id: format === 'digital' ? `${book.id}-digital` : book.id,
      title: `${book.title}${format === 'digital' ? ' (Digital Edition)' : ''}`,
      author: book.author,
      price: activePrice,
      cover: book.cover,
      category: book.category,
      type: book.type || 'book',
      qty,
      format
    });
    onClose();
  };

  const isEmoji = book.cover && book.cover.length <= 4 && !book.cover.includes('/') && !book.cover.includes('.');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 180px) 1fr', gap: '24px', alignItems: 'start' }}>
          <div
            style={{
              width: '100%',
              height: '240px',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#f0f4fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(27,42,74,0.12)'
            }}
          >
            {isEmoji ? (
              <span style={{ fontSize: '72px' }}>{book.cover}</span>
            ) : (
              <img
                src={book.cover}
                alt={book.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>

          <div>
            <h2 style={{ fontSize: '26px', marginBottom: '6px' }}>{book.title}</h2>
            <div style={{ color: 'var(--mut)', fontSize: '15px', marginBottom: '14px' }}>
              by <strong>{book.author}</strong>
            </div>

            {book.tags && book.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {book.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      background: '#eef2f9',
                      padding: '3px 10px',
                      borderRadius: '99px',
                      fontSize: '12px',
                      color: 'var(--ink)',
                      fontWeight: 600
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Format choice if available */}
            {book.digitalPrice && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--mut)' }}>
                  SELECT FORMAT:
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: `2px solid ${format === 'printed' ? 'var(--sun)' : 'var(--border)'}`,
                      background: format === 'printed' ? 'var(--accent)' : 'var(--card-bg)',
                      color: 'var(--ink)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={() => setFormat('printed')}
                  >
                    📖 Printed (₹{book.printedPrice || book.price})
                  </button>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: `2px solid ${format === 'digital' ? 'var(--sun)' : 'var(--border)'}`,
                      background: format === 'digital' ? 'var(--accent)' : 'var(--card-bg)',
                      color: 'var(--ink)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={() => setFormat('digital')}
                  >
                    📱 Digital (₹{book.digitalPrice})
                  </button>
                </div>
              </div>
            )}

            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink)', marginBottom: '16px' }}>
              ₹{activePrice.toLocaleString('en-IN')}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="qty-control">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <input
                  type="number"
                  value={qty}
                  min={1}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button type="button" onClick={() => setQty((q) => q + 1)}>+</button>
              </div>

              <button type="button" className="btn" onClick={handleAddToCart}>
                Add to Cart
              </button>

              <button
                type="button"
                className={`btn btn-secondary ${inWishlist ? 'wish-icon-btn in-wishlist' : ''}`}
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
              >
                {inWishlist ? '♥ In Wishlist' : '♡ Wishlist'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>About this item</h4>
          <p style={{ color: '#4a5772', fontSize: '15px', lineHeight: 1.6 }}>{book.description}</p>
        </div>
      </div>
    </div>
  );
};
