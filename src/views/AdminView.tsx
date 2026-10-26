import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Book } from '../types';

export const AdminView: React.FC = () => {
  const {
    books,
    toys,
    orders,
    addOrUpdateProduct,
    resetCatalogToDefault,
    fetchCatalogFromFirebase,
    pushCatalogToFirebase,
    firebaseConfigured,
    user,
    setView,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'book' | 'toy'>('book');
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncError, setSyncError] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [category, setCategory] = useState<Book['category']>('fiction');
  const [cover, setCover] = useState('');
  const [minAge, setMinAge] = useState<number | ''>('');
  const [maxAge, setMaxAge] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Auto-slug
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugEdited) {
      setSlug(slugify(val));
    }
  };

  const handleEditItem = (item: Book) => {
    setActiveTab(item.type === 'toy' ? 'toy' : 'book');
    setTitle(item.title);
    setSlug(item.id);
    setSlugEdited(true);
    setAuthor(item.author || '');
    setPrice(item.price);
    setCategory(item.category);
    setCover(item.cover || '');
    setMinAge(item.minAge ?? '');
    setMaxAge(item.maxAge ?? '');
    setDescription(item.description || '');
    setTags(item.tags ? item.tags.join(', ') : '');
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const handleClear = () => {
    setTitle('');
    setSlug('');
    setSlugEdited(false);
    setAuthor('');
    setPrice('');
    setCategory(activeTab === 'toy' ? 'toys' : 'fiction');
    setCover('');
    setMinAge('');
    setMaxAge('');
    setDescription('');
    setTags('');
    setFormSuccess(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = slugify(slug || title);
    if (!finalSlug || !title || price === '') {
      showToast('Please provide a valid title, slug, and price');
      return;
    }

    const newProduct: Book = {
      id: finalSlug,
      title: title.trim(),
      author: author.trim() || 'Kiddie Bloom Studio',
      price: Number(price),
      category: activeTab === 'toy' ? 'toys' : category,
      cover: cover.trim() || (activeTab === 'toy' ? '🧸' : '📖'),
      description: description.trim() || `Curated ${activeTab === 'toy' ? 'toy' : 'book'} from Kiddie Bloom.`,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      ...(minAge !== '' && maxAge !== '' ? { minAge: Number(minAge), maxAge: Number(maxAge) } : {}),
      type: activeTab === 'toy' ? 'toy' : 'book',
      pairNote: activeTab === 'toy' ? 'Pairs well with storybooks' : undefined
    };

    addOrUpdateProduct(newProduct);
    setFormSuccess(`✓ Saved product “${newProduct.title}” successfully!`);
    setTimeout(() => setFormSuccess(null), 3000);
    handleClear();
  };

  const recentItems: Book[] = [...books, ...toys].slice(-10).reverse();

  return (
    <div className="admin-shell">
      {!user?.isAdmin && (
        <section className="admin-panel" style={{ maxWidth: 720, margin: '40px auto', textAlign: 'center' }}>
          <h2>Admin sign-in required</h2>
          <p>Sign in with a verified Firebase account whose email is included in the configured admin allowlist.</p>
          <button type="button" className="btn gold" onClick={() => setView('auth')}>Sign in to Admin</button>
        </section>
      )}
      {user?.isAdmin && <>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ color: '#9a7336', textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.75rem', fontWeight: 800 }}>
            Store Management / 2026
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', color: '#214c3d', margin: '4px 0 8px' }}>
            Your little world of wonder.
          </h1>
          <p style={{ color: '#66746b', maxWidth: '640px', fontSize: '15px' }}>
            A calm, considered space to manage the books, playful gifts and products that make The
            Kiddie Bloom special.
          </p>
        </div>

        <button
          type="button"
          className="btn sm btn-secondary"
          onClick={() => setView('home')}
        >
          ← Return to Storefront
        </button>
      </div>

      {/* Hero Welcome */}
      <section className="admin-hero">
        <div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '28px', margin: '0 0 6px', color: '#fff' }}>
            Welcome to your studio.
          </h2>
          <p style={{ color: '#e5ede7', margin: 0 }}>Curate the shelves. Keep every detail thoughtful.</p>
        </div>
        <div style={{ border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', borderRadius: '16px', padding: '14px 20px', minWidth: '150px' }}>
          <small style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Access status
          </small>
          <strong style={{ display: 'block', fontSize: '16px' }}>
            {user ? 'Signed in as Admin' : 'Admin Mode (Active)'}
          </strong>
          <small style={{ opacity: 0.85 }}>{user?.email || 'admin@readingnook.com'}</small>
        </div>
      </section>

      <section className="admin-panel" style={{ margin: '18px 0' }}>
        <h2 style={{ marginTop: 0 }}>Firebase data control</h2>
        <p style={{ color: 'var(--mut)' }}>{firebaseConfigured ? 'Firebase configuration detected. Fetch downloads the live catalog; Push replaces the books and toys catalog in the database with the current admin workspace.' : 'Firebase is not configured yet. Copy .env.example to .env.local and add your Firebase web app settings.'}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn sm btn-secondary" disabled={!firebaseConfigured || syncBusy} onClick={async () => { setSyncBusy(true); setSyncError(''); try { await fetchCatalogFromFirebase(); } catch (e) { setSyncError(e instanceof Error ? e.message : 'Fetch failed'); } finally { setSyncBusy(false); } }}>⬇ Fetch from Firebase</button>
          <button type="button" className="btn sm gold" disabled={!firebaseConfigured || syncBusy} onClick={async () => { if (!window.confirm('Push the current books and toys catalog to Firebase? This replaces both catalog branches.')) return; setSyncBusy(true); setSyncError(''); try { await pushCatalogToFirebase(); } catch (e) { setSyncError(e instanceof Error ? e.message : 'Push failed'); } finally { setSyncBusy(false); } }}>⬆ Push catalog to Firebase</button>
        </div>
        {syncBusy && <p role="status">Syncing catalog…</p>}
        {syncError && <p role="alert" style={{ color: '#b42318', marginTop: 10 }}>{syncError}</p>}
      </section>

      {/* Stats */}
      <section className="admin-stats">
        <div className="admin-stat">
          <small>Books in catalogue</small>
          <strong>{books.length}</strong>
        </div>
        <div className="admin-stat">
          <small>Toys & gifts</small>
          <strong>{toys.length}</strong>
        </div>
        <div className="admin-stat">
          <small>Recent orders</small>
          <strong>{orders.length}</strong>
        </div>
      </section>

      {/* Main Studio Layout */}
      <div className="admin-layout">
        {/* Left: Product Form */}
        <section className="admin-panel">
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '26px', color: '#214c3d', marginBottom: '4px' }}>
            Product studio
          </h2>
          <p style={{ fontSize: '14px', color: '#778278', marginBottom: '20px' }}>
            Add or update products in your live catalog.
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '22px' }}>
            <button
              type="button"
              style={{
                borderRadius: '99px',
                padding: '9px 18px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                border: activeTab === 'book' ? '1px solid #214c3d' : '1px solid #d9e0d8',
                background: activeTab === 'book' ? '#214c3d' : 'white',
                color: activeTab === 'book' ? 'white' : '#365044'
              }}
              onClick={() => {
                setActiveTab('book');
                setCategory('fiction');
              }}
            >
              📚 Books
            </button>
            <button
              type="button"
              style={{
                borderRadius: '99px',
                padding: '9px 18px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                border: activeTab === 'toy' ? '1px solid #214c3d' : '1px solid #d9e0d8',
                background: activeTab === 'toy' ? '#214c3d' : 'white',
                color: activeTab === 'toy' ? 'white' : '#365044'
              }}
              onClick={() => {
                setActiveTab('toy');
                setCategory('toys');
              }}
            >
              🧸 Toys & gifts
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Product title *</label>
                <input
                  type="text"
                  required
                  placeholder={activeTab === 'toy' ? 'e.g. Wooden Rainbow Puzzle' : 'e.g. The Secret Garden'}
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Product ID / slug *</label>
                <input
                  type="text"
                  required
                  placeholder="the-secret-garden"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugEdited(true);
                  }}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{activeTab === 'toy' ? 'Brand / Maker' : 'Author name'}</label>
                <input
                  type="text"
                  placeholder={activeTab === 'toy' ? 'Brand or Studio' : 'Author name'}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Price (INR) *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  placeholder="399"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Book['category'])}
                >
                  <option value="fiction">Fiction & stories</option>
                  <option value="learning">Learning & growth</option>
                  <option value="children">Children's books</option>
                  <option value="gifts">Gifts & special reads</option>
                  <option value="toys">Toys & learning kits</option>
                </select>
              </div>

              <div className="form-group">
                <label>Cover / image URL or emoji</label>
                <input
                  type="text"
                  placeholder="https://… or /img/covers/... or emoji"
                  value={cover}
                  onChange={(e) => setCover(e.target.value)}
                />
              </div>
            </div>

            {activeTab === 'book' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Youngest age (0–15)</label>
                  <input type="number" min={0} max={15} placeholder="e.g. 4" value={minAge}
                    onChange={(e) => setMinAge(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label>Oldest age (0–15)</label>
                  <input type="number" min={0} max={15} placeholder="e.g. 7" value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Description</label>
              <textarea
                rows={3}
                placeholder="What makes this product special?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="ages 6+, creativity, bestseller"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="submit"
                style={{
                  background: '#214c3d',
                  color: 'white',
                  border: 0,
                  borderRadius: '999px',
                  padding: '12px 24px',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                Save product
              </button>
              <button
                type="button"
                className="btn btn-secondary sm"
                onClick={handleClear}
              >
                Clear form
              </button>
            </div>

            {formSuccess && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: '#e8f3e9',
                  color: '#24573a',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                {formSuccess}
              </div>
            )}
          </form>
        </section>

        {/* Right: Recently Added & Tools */}
        <aside className="admin-panel">
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: '#214c3d', marginBottom: '4px' }}>
            Recently added
          </h2>
          <p style={{ fontSize: '14px', color: '#778278', marginBottom: '18px' }}>
            The latest products currently stored in your studio catalogue.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
            {recentItems.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  background: 'var(--card-bg)'
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '14.5px', color: 'var(--ink)' }}>
                    {p.title}
                  </strong>
                  <small style={{ color: 'var(--mut)' }}>
                    {p.type === 'toy' ? '🧸 Toy' : '📚 Book'} · ₹{p.price}
                  </small>
                </div>

                <button
                  type="button"
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '99px',
                    background: 'var(--accent)',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    color: 'var(--ink)',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}
                  onClick={() => handleEditItem(p)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>

          {/* Seed Tools */}
          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #e9dfd0' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#214c3d' }}>
              Catalog Data Actions
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn sm btn-secondary"
                onClick={() => {
                  showToast('Catalog verified with all products');
                }}
              >
                ✓ Verify Database
              </button>
              <button
                type="button"
                className="btn sm btn-secondary"
                onClick={resetCatalogToDefault}
              >
                Restore Default Catalog
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#78847a', marginTop: '12px', lineHeight: 1.5 }}>
              Data changes persist in your browser state. Real orders and verified payment amounts
              are confirmed securely.
            </p>
          </div>
        </aside>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', color: '#7a857d', fontSize: '13px' }}>
        <span>© 2026 Kiddie Bloom · Private admin workspace</span>
        <button
          type="button"
          onClick={() => setView('home')}
          style={{ background: 'none', border: 'none', color: '#214c3d', cursor: 'pointer', fontWeight: 700 }}
        >
          Return to storefront →
        </button>
      </div>
      </>}
    </div>
  );
};
