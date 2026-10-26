import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from '../components/BookCard';
import { Book } from '../types';

export const GiftFinderView: React.FC = () => {
  const { books, setView } = useStore();
  const [step, setStep] = useState<number>(1);
  const [who, setWho] = useState<string>('');
  const [interest, setInterest] = useState<string>('');
  const [ageRange, setAgeRange] = useState<string>('');

  const handleSelectWho = (val: string) => {
    setWho(val);
    setStep(2);
  };

  const handleSelectInterest = (val: string) => {
    setInterest(val);
    if (who === 'child' || who === 'teen') {
      setStep(3);
    } else {
      setStep(4); // Results
    }
  };

  const handleSelectAge = (val: string) => {
    setAgeRange(val);
    setStep(4); // Results
  };

  const handleReset = () => {
    setWho('');
    setInterest('');
    setAgeRange('');
    setStep(1);
  };

  // Recommendations matching logic from original gift-finder.html
  const getRecommendations = (): Book[] => {
    if (who === 'child') {
      if (ageRange === '0-3') {
        return books.filter((b) => b.id === 'the-very-hungry-caterpillar' || b.id === 'goodnight-moon');
      }
      if (ageRange === '4-7') {
        return books.filter((b) => b.id === 'where-the-wild-things-are' || b.id === 'the-gruffalo');
      }
      if (ageRange === '8-12') {
        return books.filter((b) => b.id === 'harry-potter-1' || b.id === 'percy-jackson');
      }
      return books.filter((b) => b.category === 'children');
    }

    if (who === 'teen') {
      return books.filter((b) => b.id === 'the-hate-u-give' || b.id === 'the-fault-in-our-stars');
    }

    if (interest === 'learning') {
      return books.filter((b) => b.id === 'atomic-habits' || b.id === 'deep-work');
    }

    if (interest === 'inspiration') {
      return books.filter((b) => b.id === 'the-alchemist' || b.id === 'becoming');
    }

    if (interest === 'classic') {
      return books.filter((b) => b.id === 'pride-and-prejudice' || b.id === 'little-women');
    }

    // fallback
    return books.filter((b) => b.category === 'gifts' || b.category === 'fiction').slice(0, 3);
  };

  const matchedBooks = getRecommendations();

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
            ← Back to Home
          </button>
          <h1>Gift Finder</h1>
          <p>Answer a few questions and we’ll suggest the perfect book.</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '70px', maxWidth: '800px' }}>
        <div
          style={{
            background: 'var(--card-bg)',
            border: '2px solid var(--border)',
            borderRadius: '24px',
            padding: '36px',
            boxShadow: '0 12px 30px rgba(27,42,74,0.06)'
          }}
        >
          {/* Step 1: Who */}
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '24px', marginBottom: '18px' }}>1. Who is this gift for?</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  { id: 'child', label: '👶 A Child' },
                  { id: 'teen', label: '🎒 A Teenager' },
                  { id: 'adult', label: '☕ An Adult' },
                  { id: 'friend', label: '🤝 A Friend / Colleague' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    style={{
                      padding: '18px',
                      borderRadius: '16px',
                      border: '2px solid var(--border)',
                      background: 'var(--accent)',
                      color: 'var(--ink)',
                      fontSize: '17px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s'
                    }}
                    onClick={() => handleSelectWho(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Interest */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '24px', marginBottom: '18px' }}>2. What do they enjoy?</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  { id: 'stories', label: '📖 Stories & Adventure' },
                  { id: 'learning', label: '🌱 Learning & Growth' },
                  { id: 'inspiration', label: '🌟 Inspiration & Motivation' },
                  { id: 'classic', label: '📜 Timeless Classics' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    style={{
                      padding: '18px',
                      borderRadius: '16px',
                      border: '2px solid var(--border)',
                      background: 'var(--accent)',
                      color: 'var(--ink)',
                      fontSize: '17px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s'
                    }}
                    onClick={() => handleSelectInterest(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-secondary sm"
                style={{ marginTop: '20px' }}
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 3: Age Range */}
          {step === 3 && (
            <div>
              <h3 style={{ fontSize: '24px', marginBottom: '18px' }}>3. Approximate age?</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  { id: '0-3', label: '🧸 0 – 3 years' },
                  { id: '4-7', label: '🎨 4 – 7 years' },
                  { id: '8-12', label: '⚡ 8 – 12 years' },
                  { id: '13+', label: '💡 13 years & above' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    style={{
                      padding: '18px',
                      borderRadius: '16px',
                      border: '2px solid var(--border)',
                      background: 'var(--accent)',
                      color: 'var(--ink)',
                      fontSize: '17px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s'
                    }}
                    onClick={() => handleSelectAge(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-secondary sm"
                style={{ marginTop: '20px' }}
                onClick={() => setStep(2)}
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 4: Results */}
          {step === 4 && (
            <div>
              <h3 style={{ fontSize: '26px', marginBottom: '8px' }}>Perfect matches for you</h3>
              <p style={{ color: 'var(--mut)', marginBottom: '24px' }}>
                Based on your selections, here are the most thoughtful book choices:
              </p>

              <div className="book-grid">
                {matchedBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={handleReset}>
                  Start Over
                </button>
                <button type="button" className="btn" onClick={() => setView('cart')}>
                  View Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
