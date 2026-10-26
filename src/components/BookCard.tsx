import React from 'react';
import { Book } from '../types';
import { useStore } from '../context/StoreContext';

interface BookCardProps {
  book: Book;
  onOpenDetails?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onOpenDetails }) => {
  const { addToCart, toggleWishlist, isInWishlist, setSelectedBook } = useStore();
  const inWishlist = isInWishlist(book.id);

  const handleCardClick = () => {
    if (onOpenDetails) {
      onOpenDetails(book);
    } else {
      setSelectedBook(book);
    }
  };

  const isEmoji = book.cover && book.cover.length <= 4 && !book.cover.includes('/') && !book.cover.includes('.');

  return (
    <article className="book-card" style={{ cursor: 'pointer' }}>
      <div className="book-cover" onClick={handleCardClick}>
        {isEmoji ? (
          <span className="emoji-cover">{book.cover}</span>
        ) : (
          <img
            src={book.cover}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            onError={(e) => {
              // fallback to emoji or placeholder
              (e.currentTarget as HTMLElement).style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) parent.innerHTML = '<span class="emoji-cover">📖</span>';
            }}
          />
        )}
      </div>

      <div className="book-info">
        <h3 onClick={handleCardClick} style={{ cursor: 'pointer' }}>
          {book.title}
        </h3>
        <div className="author">by {book.author}</div>
        {book.pairNote && (
          <div style={{
            fontSize: '12px',
            background: '#edf8f0',
            color: '#2e6843',
            padding: '4px 8px',
            borderRadius: '6px',
            marginBottom: '8px',
            display: 'inline-block',
            fontWeight: 600
          }}>
            {book.pairNote}
          </div>
        )}
        <p className="desc">{book.blurb || book.description.slice(0, 85) + '…'}</p>
        <div className="price">₹{book.price.toLocaleString('en-IN')}</div>

        <div className="book-actions-row">
          <button
            type="button"
            className="btn btn-sm"
            onClick={(e) => {
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
            }}
          >
            Add to Cart
          </button>

          <button
            type="button"
            className={`wish-icon-btn ${inWishlist ? 'in-wishlist' : ''}`}
            title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            onClick={(e) => {
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
            }}
          >
            {inWishlist ? '♥ Saved' : '♡ Save'}
          </button>
        </div>
      </div>
    </article>
  );
};
