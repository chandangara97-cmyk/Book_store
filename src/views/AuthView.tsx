import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

export const AuthView: React.FC = () => {
  const { user, login, signup, logout, orders, setView } = useStore();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (tab === 'signin') {
      login(email);
    } else {
      signup(email, name || email.split('@')[0]);
    }
  };

  if (user) {
    return (
      <div className="container" style={{ padding: '40px 24px 70px', maxWidth: '640px' }}>
        <button
          type="button"
          onClick={() => setView('home')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--mut)',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '16px',
            fontWeight: 600
          }}
        >
          ← Back to Home
        </button>

        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            padding: '36px',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(27,42,74,0.06)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--ink)',
              color: 'white',
              fontSize: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            {user.name ? user.name[0].toUpperCase() : '👤'}
          </div>

          <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>{user.name || 'Member'}</h2>
          <p style={{ color: 'var(--mut)', fontSize: '15px', marginBottom: '14px' }}>{user.email}</p>

          {user.isAdmin && (
            <span
              style={{
                display: 'inline-block',
                background: '#e8f3e9',
                color: '#24573a',
                padding: '4px 12px',
                borderRadius: '99px',
                fontSize: '12px',
                fontWeight: 800,
                marginBottom: '20px',
                letterSpacing: '0.05em'
              }}
            >
              STUDIO ADMIN
            </span>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px', flexWrap: 'wrap' }}>
            {user.isAdmin && (
              <button
                type="button"
                className="btn sm gold"
                onClick={() => setView('admin')}
              >
                Go to Studio Admin
              </button>
            )}
            <button
              type="button"
              className="btn sm"
              onClick={() => setView('library')}
            >
              Browse Catalogue
            </button>
            <button
              type="button"
              className="btn sm btn-outline"
              onClick={logout}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Order History */}
        <div style={{ marginTop: '36px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Your Recent Orders</h3>
          {orders.length === 0 ? (
            <div
              style={{
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                color: 'var(--mut)'
              }}
            >
              No orders placed yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.map((ord) => (
                <div
                  key={ord.orderId}
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '16px' }}>{ord.orderId}</strong>
                    <div style={{ color: 'var(--mut)', fontSize: '13px' }}>
                      {new Date(ord.createdAt).toLocaleDateString()} · {ord.items.length} items
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '16px' }}>
                      ₹{ord.totalsINR.total.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '12px', color: '#2e7d32' }}>{ord.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px 70px', maxWidth: '440px' }}>
      <button
        type="button"
        onClick={() => setView('home')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--mut)',
          fontSize: '14px',
          cursor: 'pointer',
          marginBottom: '16px',
          fontWeight: 600
        }}
      >
        ← Back to Home
      </button>

      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          padding: '36px 30px',
          boxShadow: '0 8px 30px rgba(27,42,74,0.06)'
        }}
      >
        <div style={{ display: 'flex', borderBottom: '1.5px solid var(--border)', marginBottom: '24px' }}>
          <button
            type="button"
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '12px',
              border: 0,
              background: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '15px',
              color: tab === 'signin' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: `2px solid ${tab === 'signin' ? 'var(--primary)' : 'transparent'}`,
              marginBottom: '-1.5px'
            }}
            onClick={() => setTab('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '12px',
              border: 0,
              background: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '15px',
              color: tab === 'signup' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: `2px solid ${tab === 'signup' ? 'var(--primary)' : 'transparent'}`,
              marginBottom: '-1.5px'
            }}
            onClick={() => setTab('signup')}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-block" style={{ marginTop: '16px' }}>
            {tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          <p style={{ fontSize: '12px', color: 'var(--mut)', marginTop: '18px', textAlign: 'center' }}>
            Tip: Sign in with any email (or use an admin email like <code>admin@readingnook.com</code>)
          </p>
        </form>
      </div>
    </div>
  );
};
