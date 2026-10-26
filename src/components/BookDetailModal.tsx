import { CoverImage } from './CoverImage';
import React, { useEffect, useState } from 'react';
import { Book } from '../types';
import { useStore } from '../context/StoreContext';

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  fiction: 'Fiction & stories',
  learning: 'Learning & growth',
  children: "Children's books",
  gifts: 'Gifts & special reads',
  toys: 'Toys & learning kits'
};

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose }) => {
  const { books, toys, addToCart, toggleWishlist, isInWishlist, setSelectedBook, setView } = useStore();
  const [format, setFormat] = useState<'printed' | 'digital'>('printed');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Reset when another book is opened from "You may also like"
  useEffect(() => {
    setFormat('printed');
    setQty(1);
    setAdded(false);
  }, [book.id]);

  // Close with Esc and stop the page behind from scrolling
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const isToy = book.type === 'toy' || book.category === 'toys';
  const inWishlist = isInWishlist(book.id);
  const hasDigital = Boolean(book.digitalPrice) && !isToy;
  const activePrice = format === 'digital' && book.digitalPrice ? book.digitalPrice : book.printedPrice || book.price;
  const hasAges = book.minAge !== undefined && book.maxAge !== undefined;

  const related = (isToy ? toys : books)
    .filter((b) => b.id !== book.id && b.category === book.category)
    .slice(0, 3);

  const addItem = () =>
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

  const handleAddToBasket = () => {
    addItem();
    setAdded(true);
  };

  // Checkout: make sure the item is in the basket (without adding it twice), then go to checkout
  const handleCheckout = () => {
    if (!added) addItem();
    onClose();
    setView('checkout');
    window.scrollTo({ top: 0 });
  };

  const handleViewBasket = () => {
    onClose();
    setView('cart');
    window.scrollTo({ top: 0 });
  };

  const detailRows: { label: string; value: string }[] = [
    { label: 'Category', value: CATEGORY_LABELS[book.category] || book.category },
    ...(hasAges ? [{ label: 'Recommended age', value: `${book.minAge}–${book.maxAge} years` }] : []),
    { label: 'Type', value: isToy ? 'Toy / learning kit' : 'Book' },
    ...(!isToy ? [{ label: 'Formats', value: hasDigital ? 'Printed copy and digital eBook' : 'Printed copy' }] : []),
    { label: 'Delivery', value: 'Free delivery on orders of ₹499 or more (₹49 below that)' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={book.title}>
      <div className="modal-content bd-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose} aria-label="Close details">
          ✕
        </button>

        <div className="bd-grid">
          <div className="bd-cover">
            <CoverImage
              cover={book.cover}
              alt={book.title}
              emojiStyle={{ fontSize: '72px' }}
              imgStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
              emojiFallback={book.emoji}
            />
          </div>

          <div>
            <h2 style={{ fontSize: '26px', marginBottom: '6px', paddingRight: '28px' }}>{book.title}</h2>
            <div style={{ color: 'var(--mut)', fontSize: '15px', marginBottom: '12px' }}>
              by <strong>{book.author}</strong>
            </div>

            {book.tags && book.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {book.tags.map((t) => (
                  <span key={t} className="bd-tag">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {hasDigital && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--mut)' }}>SELECT FORMAT</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['printed', 'digital'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={`bd-format ${format === f ? 'on' : ''}`}
                      onClick={() => {
                        setFormat(f);
                        setAdded(false);
                      }}
                    >
                      {f === 'printed' ? `📖 Printed · ₹${book.printedPrice || book.price}` : `📱 Digital · ₹${book.digitalPrice}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)', marginBottom: '14px' }}>
              ₹{(activePrice * qty).toLocaleString('en-IN')}
              {qty > 1 && (
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mut)', marginLeft: '8px' }}>
                  ({qty} × ₹{activePrice.toLocaleString('en-IN')})
                </span>
              )}
            </div>

            <div className="bd-buy">
              <div className="qty-control">
                <button type="button" onClick={() => { setQty((q) => Math.max(1, q - 1)); setAdded(false); }} aria-label="Decrease quantity">−</button>
                <input
                  type="number"
                  value={qty}
                  min={1}
                  onChange={(e) => { setQty(Math.max(1, parseInt(e.target.value) || 1)); setAdded(false); }}
                  aria-label="Quantity"
                />
                <button type="button" onClick={() => { setQty((q) => q + 1); setAdded(false); }} aria-label="Increase quantity">+</button>
              </div>

              <button type="button" className="btn" onClick={handleAddToBasket}>
                {added ? '✓ Added to basket' : '🛒 Add to basket'}
              </button>
              <button type="button" className="btn gold" onClick={handleCheckout}>
                Checkout →
              </button>
            </div>

            <div className="bd-secondary">
              {added && (
                <button type="button" className="bd-link" onClick={handleViewBasket}>
                  View basket
                </button>
              )}
              <button
                type="button"
                className={`bd-link ${inWishlist ? 'on' : ''}`}
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
                {inWishlist ? '♥ Saved to favourites' : '♡ Save to favourites'}
              </button>
            </div>
          </div>
        </div>

        <div className="bd-section">
          <h4>About this item</h4>
          <p style={{ color: 'var(--mut)', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>{book.description}</p>
        </div>

        <div className="bd-section">
          <h4>Details</h4>
          <dl className="bd-details">
            {detailRows.map((r) => (
              <React.Fragment key={r.label}>
                <dt>{r.label}</dt>
                <dd>{r.value}</dd>
              </React.Fragment>
            ))}
          </dl>
        </div>

        {related.length > 0 && (
          <div className="bd-section">
            <h4>You may also like</h4>
            <div className="bd-related">
              {related.map((r) => (
                <button key={r.id} type="button" className="bd-rel" onClick={() => setSelectedBook(r)}>
                  <span className="bd-rel-cover">
                    <CoverImage
                      cover={r.cover}
                      alt={r.title}
                      emojiStyle={{ fontSize: '34px' }}
                      imgStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      emojiFallback={r.emoji}
                    />
                  </span>
                  <span className="bd-rel-title">{r.title}</span>
                  <span className="bd-rel-price">₹{r.price.toLocaleString('en-IN')}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
