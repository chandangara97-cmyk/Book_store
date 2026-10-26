import { CoverImage } from '../components/CoverImage';
import React from 'react';
import { useStore } from '../context/StoreContext';

export const CartView: React.FC = () => {
  const { cart, removeFromCart, updateCartQty, cartTotal, addReward, setView, setSelectedCategory } = useStore();

  const paidSubtotal = cart
    .filter((i) => i.type !== 'gift')
    .reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);

  const hasGift999 = cart.some((i) => i.id === 'gift-colouring-kit');
  const hasGift1499 = cart.some((i) => i.id === 'gift-mini-toy');

  const shipping = paidSubtotal === 0 || paidSubtotal >= 499 ? 0 : 49;
  const grandTotal = paidSubtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '54px', marginBottom: '14px' }}>🛒</div>
        <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '17px' }}>
          Discover something wonderful to read or pair with a playful gift.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
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
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setView('toys')}
          >
            Explore Toys & Kits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setView('library');
            }}
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
            ← Continue Shopping
          </button>
          <h1>Your Cart</h1>
          <p>Review your books, toys and unlocked gifts before checkout.</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '70px' }}>
        <div className="cart-table-wrap">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => {
                const isGift = item.type === 'gift';

                return (
                  <tr key={item.id}>
                    <td data-label="Item">
                      <div className="cart-item-info">
                        <div className="cart-item-cover">
                          <CoverImage cover={item.cover} alt={item.title} />
                        </div>
                        <div>
                          <strong>{item.title}</strong>
                          <div style={{ fontSize: '0.8rem', color: isGift ? '#2e7d32' : 'var(--text-muted)' }}>
                            {isGift ? 'FREE GIFT 🎁' : item.type === 'toy' ? 'Toy / learning kit' : 'Book'}
                            {item.format && ` (${item.format})`}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                            {item.author}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td data-label="Price">{isGift ? 'FREE' : `₹${item.price}`}</td>

                    <td data-label="Qty">
                      {isGift ? (
                        <span>1</span>
                      ) : (
                        <div className="qty-control">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, item.qty - 1)}
                            disabled={item.qty <= 1}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={item.qty}
                            min={1}
                            onChange={(e) => updateCartQty(item.id, parseInt(e.target.value) || 1)}
                            aria-label="Quantity"
                          />
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, item.qty + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </td>

                    <td data-label="Subtotal">
                      <strong>{isGift ? 'FREE' : `₹${item.price * item.qty}`}</strong>
                    </td>

                    <td data-label="">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Free Gift Rewards Box */}
        <div className="gift-rewards">
          <h3>🎁 Your book + toy rewards</h3>
          <p>
            Merchandise subtotal: <strong>₹{paidSubtotal.toLocaleString('en-IN')}</strong>
          </p>

          {/* Tier 1: ₹999 */}
          <div className={`reward-line ${paidSubtotal >= 999 ? 'unlocked' : ''}`}>
            <span>₹999 — Complimentary Colouring Kit</span>
            {paidSubtotal >= 999 ? (
              hasGift999 ? (
                <strong>Added ✓</strong>
              ) : (
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => addReward(999)}
                >
                  Choose free gift
                </button>
              )
            ) : (
              <small>Spend ₹{999 - paidSubtotal} more</small>
            )}
          </div>

          {/* Tier 2: ₹1499 */}
          <div className={`reward-line ${paidSubtotal >= 1499 ? 'unlocked' : ''}`}>
            <span>₹1,499 — Complimentary Mini Toy</span>
            {paidSubtotal >= 1499 ? (
              hasGift1499 ? (
                <strong>Added ✓</strong>
              ) : (
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => addReward(1499)}
                >
                  Choose free gift
                </button>
              )
            ) : (
              <small>Spend ₹{Math.max(0, 1499 - paidSubtotal)} more</small>
            )}
          </div>

          <small style={{ display: 'block', marginTop: '10px' }}>
            Rewards are complimentary, subject to stock. Shipping is calculated separately.
          </small>
        </div>

        {/* Cart Summary */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{paidSubtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>

          <button
            type="button"
            className="btn btn-block"
            style={{ marginTop: '20px' }}
            onClick={() => setView('checkout')}
          >
            Proceed to Checkout
          </button>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
            {paidSubtotal >= 499
              ? '✓ Free shipping unlocked for your order!'
              : 'Add items worth ₹' + (499 - paidSubtotal) + ' more for Free Shipping'}
          </p>
        </div>
      </div>
    </div>
  );
};
