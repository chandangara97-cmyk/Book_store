import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { AgeFinder } from '../components/AgeFinder';
import { asset, cleanSrc, imgFallback, photo } from '../utils/images';

const IMG_PRINTED = photo('books,bookshelf', 201, '/img/format-printed.svg', 800, 360);
const IMG_DIGITAL = photo('tablet,reading', 202, '/img/format-digital.svg', 800, 360);
const IMG_HELP = photo('child,reading,books', 203, '/img/help.svg', 440, 440);

export const HomeView: React.FC = () => {
  const { setView, setSelectedCategory } = useStore();
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [askAge, setAskAge] = useState('');
  const [askTopic, setAskTopic] = useState('');
  const [askSubmitted, setAskSubmitted] = useState(false);

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAskSubmitted(true);
    setTimeout(() => {
      setAskSubmitted(false);
      setAskModalOpen(false);
      setAskAge('');
      setAskTopic('');
    }, 2200);
  };

  return (
    <main id="main">
      {/* Hero Section */}
      <div className="hero" id="top">
        <div className="wrap hg">
          <div>
            <h1>Little learners bloom with every page.</h1>
            <p className="lead">
              Fun, easy learning for every stage, from first words to age 15. Pick your child's
              age, choose a printed or digital copy, and pay securely.
            </p>
            <div className="acts">
              <a
                href="#find"
                className="btn gold"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('find')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Find books by age
              </a>
              <button
                type="button"
                className="btn alt"
                onClick={() => {
                  setSelectedCategory('all');
                  setView('library');
                }}
              >
                Shop all books
              </button>
            </div>
          </div>

          <img className="hero-logo" src="/img/kiddie-bloom-logo.png" alt="Kiddie Bloom: a girl and her teddy bear with an ABC notebook, crayons and a rainbow" width="520" height="512" />

          <div className="stairs" role="img" aria-label="Four stages of books, from ages 0 to 3 up to ages 13 to 15">
            <div
              className="stair st1"
              onClick={() => {
                document.getElementById('find')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <b>0 to 3</b>
              <span>First words and play</span>
            </div>
            <div
              className="stair st2"
              onClick={() => {
                document.getElementById('find')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <b>4 to 7</b>
              <span>Early learners</span>
            </div>
            <div
              className="stair st3"
              onClick={() => {
                document.getElementById('find')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <b>8 to 12</b>
              <span>Curious minds</span>
            </div>
            <div
              className="stair st4"
              onClick={() => {
                document.getElementById('find')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <b>13 to 15</b>
              <span>Teen skills</span>
            </div>
          </div>
        </div>
      </div>

      {/* Age Finder Section */}
      <section id="find">
        <div className="wrap">
          <h2 className="sec-title">How old is your child?</h2>
          <p className="intro">Slide to their age or tap a stage. The books below change to match.</p>
          <AgeFinder />
        </div>
      </section>

      {/* Formats Section */}
      <section id="formats" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="sec-title">Printed or digital, your choice</h2>
          <p className="intro">
            Every book can be offered in both formats, so you can pick what suits your family.
          </p>
          <div className="two-cols">
            <div className="fmt-card" style={{ borderTop: '10px solid var(--pink)' }}>
              <img src={asset(cleanSrc(IMG_PRINTED))}
              data-src={IMG_PRINTED}
              referrerPolicy="no-referrer"
              onError={imgFallback} alt="An open printed book" loading="lazy" />
              <h3>Printed copy</h3>
              <ul>
                <li>A real book to hold, share and keep on the shelf</li>
                <li>Good for bedtime reading and screen-free learning</li>
                <li>Delivered to your address after payment</li>
              </ul>
            </div>
            <div className="fmt-card" style={{ borderTop: '10px solid var(--sky)' }}>
              <img src={asset(cleanSrc(IMG_DIGITAL))}
              data-src={IMG_DIGITAL}
              referrerPolicy="no-referrer"
              onError={imgFallback} alt="A tablet showing a digital book" loading="lazy" />
              <h3>Digital copy</h3>
              <ul>
                <li>Read on a phone, tablet or computer</li>
                <li>Lower price and no waiting for delivery</li>
                <li>Easy to carry on trips and share across your devices</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Toys & Play Gifting Promo */}
      <section className="toy-promo" id="toys">
        <div className="wrap toy-promo-grid">
          <div>
            <span className="toy-kicker">Play, create, discover</span>
            <h2 className="sec-title">Stories are even better with a little play.</h2>
            <p className="intro">
              Explore toys, puzzles and creative kits that turn reading time into hands-on
              adventures. Pair a book with a toy for a thoughtful gift.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn"
                onClick={() => setView('toys')}
              >
                Explore toys & learning kits
              </button>
              <button
                type="button"
                className="btn alt"
                onClick={() => {
                  setSelectedCategory('gifts');
                  setView('library');
                }}
              >
                Browse book gifts
              </button>
            </div>
            <div className="reward-strip">
              <strong>🎁 Little extras, unlocked</strong>
              <span>Spend ₹999 on books and toys → choose a free colouring kit</span>
              <span>Spend ₹1,499 → unlock a free mini toy too</span>
              <small>Gift thresholds are based on merchandise subtotal before shipping. While stocks last.</small>
            </div>
          </div>
          <div
            className="toy-promo-photo"
            role="img"
            aria-label="Colourful toys, puzzles and children's books arranged together"
          ></div>
        </div>
      </section>

      {/* Visual Storytelling Section */}
      <section className="visual-story" aria-labelledby="story-title">
        <div className="wrap">
          <h2 id="story-title" className="sec-title">Every little learner can bloom.</h2>
          <p className="intro">
            A welcoming place for every kind of learner — from first picture books to the ideas that
            inspire tomorrow.
          </p>
          <div className="story-grid">
            <article className="story-card">
              <img
                src="https://images.unsplash.com/photo-1516627069848-6b6e1b6e8f5f?auto=format&fit=crop&w=900&q=85"
                alt="A parent sharing a book with a young child"
                loading="lazy"
              />
              <div className="story-copy">
                <span>AGES 0–7</span>
                <h3>Make story time special</h3>
                <p>Build joyful little routines with bright, friendly learning books.</p>
              </div>
            </article>

            <article className="story-card">
              <img
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=85"
                alt="A child learning and writing at a desk"
                loading="lazy"
              />
              <div className="story-copy">
                <span>AGES 8–12</span>
                <h3>Curiosity lives here</h3>
                <p>Encourage questions, creativity and the confidence to try.</p>
              </div>
            </article>

            <article className="story-card">
              <img
                src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=85"
                alt="Books and notebooks ready for focused study"
                loading="lazy"
              />
              <div className="story-copy">
                <span>AGES 13–15</span>
                <h3>Ready for what’s next</h3>
                <p>Support stronger study habits and independent thinking.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* How to Buy / Payment steps */}
      <section className="pay-steps-section" id="how">
        <div className="wrap">
          <h2 className="sec-title">Buying takes about a minute</h2>
          <p className="intro">
            Payments are handled by secure payment providers. Use Cards or UPI for domestic
            checkout, and international payment options (PayPal, Wise, Bank Transfer) worldwide.
          </p>
          <div className="steps-grid">
            <div className="step-card">
              <h3>Choose the age</h3>
              <p>Slide to your child's age and see the books made for that stage.</p>
            </div>
            <div className="step-card">
              <h3>Pick a format</h3>
              <p>Tap the printed or digital price on the book you want to add.</p>
            </div>
            <div className="step-card">
              <h3>Pay securely</h3>
              <p>Complete payment through your preferred method with instant order confirmation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Questions Parents Ask (FAQ) */}
      <section id="faq">
        <div className="wrap faq-box">
          <h2 className="sec-title" style={{ textAlign: 'center', marginBottom: '28px' }}>
            Questions parents ask
          </h2>
          <details className="faq-item">
            <summary>How do I know a book suits my child?</summary>
            <p>
              Each book shows an age range. Use the slider above, and remember that children learn
              at their own pace, so a book just below or above their age can also work well.
            </p>
          </details>

          <details className="faq-item">
            <summary>What is the difference between printed and digital?</summary>
            <p>
              The content is the same. A printed copy is delivered to your doorstep. A digital copy
              is read on any phone, tablet, or laptop and is available immediately.
            </p>
          </details>

          <details className="faq-item">
            <summary>Which payment methods can I use?</summary>
            <p>
              We support Credit and Debit Cards (Visa, Mastercard, RuPay, Amex), UPI (Google Pay,
              PhonePe, Paytm), PayPal for international checkout, and direct wire/transfer.
            </p>
          </details>

          <details className="faq-item">
            <summary>Can I ask for a book on a topic you do not have yet?</summary>
            <p>
              Yes! Tap the 'Ask us' button below and let us know your child's age and interests. We
              routinely create tailored tutorial recommendations.
            </p>
          </details>
        </div>
      </section>

      {/* Help Banner */}
      <div className="help-banner">
        <div className="wrap">
          <img
            className="helpimg"
            src={asset(cleanSrc(IMG_HELP))}
              data-src={IMG_HELP}
              referrerPolicy="no-referrer"
              onError={imgFallback}
            alt="A child reading on a stack of books"
            loading="lazy"
          />
          <h2>Need help choosing?</h2>
          <p>Tell us your child's age and interests, and we will suggest the right book.</p>
          <button
            type="button"
            className="btn"
            onClick={() => setAskModalOpen(true)}
          >
            Ask us
          </button>
        </div>
      </div>

      {/* Ask Modal Dialog */}
      {askModalOpen && (
        <div className="modal-overlay" onClick={() => setAskModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setAskModalOpen(false)}>
              ✕
            </button>
            <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Ask for a Recommendation</h3>
            <p style={{ color: 'var(--mut)', marginBottom: '18px' }}>
              Tell us a little about who you are shopping for and we will help you find the best match.
            </p>

            {askSubmitted ? (
              <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '16px', borderRadius: '12px', fontWeight: 600 }}>
                ✓ Thank you! We received your request and will recommend the best titles for age {askAge || 'your learner'}.
              </div>
            ) : (
              <form onSubmit={handleAskSubmit}>
                <div className="form-group">
                  <label>Child's age or grade level</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 7 years old, loves puzzles"
                    value={askAge}
                    onChange={(e) => setAskAge(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Interests or topics they enjoy</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Dinosaurs, space, learning to read independently..."
                    value={askTopic}
                    onChange={(e) => setAskTopic(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-block" style={{ marginTop: '14px' }}>
                  Send message
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
};
