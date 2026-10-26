import React, { useState, useId } from 'react';
import { STAGES, TUTORIAL_BOOKS } from '../data/initialData';
import { useStore } from '../context/StoreContext';
import { Book } from '../types';

export const AgeFinder: React.FC = () => {
  const [age, setAge] = useState<number>(6);
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const sliderId = useId();

  // Find active stage
  const currentStage = STAGES.find((s) => age >= s.minAge && age <= s.maxAge) || STAGES[1];

  // Filter books matching current age
  const matchedBooks = TUTORIAL_BOOKS.filter(
    (b) => b.minAge !== undefined && b.maxAge !== undefined && age >= b.minAge && age <= b.maxAge
  );

  const handleAddBookFormat = (book: Book, format: 'printed' | 'digital') => {
    const price = format === 'digital' ? (book.digitalPrice || 149) : (book.printedPrice || book.price);
    addToCart({
      id: `${book.id}-${format}`,
      title: `${book.title} (${format === 'printed' ? 'Printed Copy' : 'Digital eBook'})`,
      author: book.author,
      price,
      cover: book.cover,
      category: book.category,
      type: 'book',
      qty: 1,
      format
    });
  };

  return (
    <div className="finder">
      <div className="fh">
        <div className="fh-left">
          <span className="age-display" aria-live="polite">
            {age}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="stage-label">{currentStage.name}</span>
            <span style={{ fontSize: '13px', color: 'var(--mut)' }}>Years old</span>
          </div>
        </div>

        <img
          className="fhimg"
          src={currentStage.image}
          alt={currentStage.name}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {/* Stage selection buttons */}
      <div className="stage-buttons" role="group" aria-label="Jump to an age stage">
        {STAGES.map((s) => {
          const isActive = age >= s.minAge && age <= s.maxAge;
          return (
            <button
              key={s.name}
              type="button"
              className={`stage-btn ${isActive ? 'active' : ''}`}
              style={{ '--btn-color': s.hex } as React.CSSProperties}
              onClick={() => setAge(s.minAge)}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      <label htmlFor={sliderId} style={{ position: 'absolute', left: '-9999px' }}>
        Child's age
      </label>
      <input
        type="range"
        id={sliderId}
        className="age-slider"
        min="0"
        max="15"
        value={age}
        onChange={(e) => setAge(parseInt(e.target.value, 10))}
        aria-valuetext={`Age ${age}`}
      />

      <div className="ticks" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i}>{i}</span>
        ))}
      </div>

      <p className="tip">{currentStage.description}</p>

      {/* Matched Books for this age */}
      <div className="book-grid">
        {matchedBooks.map((book) => {
          const inWish = isInWishlist(book.id);
          return (
            <article
              key={book.id}
              className="book-card"
              style={{ borderTop: `8px solid ${currentStage.hex}` }}
            >
              <div
                style={{
                  height: '140px',
                  borderRadius: '12px',
                  background: currentStage.hex,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ink)',
                  marginBottom: '12px',
                  boxShadow: 'inset 0 0 0 1px rgba(27,42,74,0.1)'
                }}
              >
                <div style={{ textAlign: 'center', padding: '12px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>{book.cover}</div>
                  <strong style={{ fontSize: '16px', fontFamily: 'var(--d)' }}>{book.title}</strong>
                </div>
              </div>

              <div className="book-info">
                <h3>{book.title}</h3>
                <div className="author">by {book.author}</div>
                <p className="desc">{book.blurb}</p>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => handleAddBookFormat(book, 'printed')}
                    title="Order a physical printed copy delivered to your door"
                  >
                    📖 Printed · ₹{book.printedPrice || book.price}
                  </button>
                  <button
                    type="button"
                    className="btn sm alt"
                    onClick={() => handleAddBookFormat(book, 'digital')}
                    title="Download instant digital eBook copy"
                  >
                    📱 Digital · ₹{book.digitalPrice || 149}
                  </button>
                  <button
                    type="button"
                    className={`wish-icon-btn ${inWish ? 'in-wishlist' : ''}`}
                    onClick={() =>
                      toggleWishlist({
                        id: book.id,
                        title: book.title,
                        author: book.author,
                        price: book.price,
                        cover: book.cover,
                        category: book.category,
                        type: 'book'
                      })
                    }
                    title="Save to wishlist"
                  >
                    {inWish ? '♥' : '♡'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
