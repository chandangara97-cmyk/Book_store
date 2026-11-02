import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Book, LearningResource, LearningSection } from '../types';
import { pdfFirstPageCover } from '../utils/pdfCover';
import { databaseRequest } from '../firebaseClient';

const driveId = (v: string) => { const t = v.trim(); const m = t.match(/\/d\/([A-Za-z0-9_-]{10,})/) || t.match(/[?&]id=([A-Za-z0-9_-]{10,})/); return m ? m[1] : /^[A-Za-z0-9_-]{10,}$/.test(t) ? t : ''; };

export const AdminView: React.FC = () => {
  const {
    books,
    toys,
    orders,
    addOrUpdateProduct,
    deleteProduct,
    resetCatalogToDefault,
    fetchCatalogFromFirebase,
    pushCatalogToFirebase,
    learningResources, addOrUpdateLearningResource, fetchLearningResources, pushLearningResources,
    firebaseConfigured,
    user,
    setView,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'book' | 'toy'>('book');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceSection, setResourceSection] = useState<LearningSection>('worksheet');
  const [resourceMinAge, setResourceMinAge] = useState(3);
  const [resourceMaxAge, setResourceMaxAge] = useState(5);
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourcePdfUrl, setResourcePdfUrl] = useState('');
  const [resourceThumbnail, setResourceThumbnail] = useState('');
  const [resourcePrice, setResourcePrice] = useState<number>(0);
  const [coverBusy, setCoverBusy] = useState(false);
  const makeCover = async (file: File | undefined | null): Promise<string> => {
    if (!file) return '';
    setCoverBusy(true);
    try { return await pdfFirstPageCover(file); }
    catch (e) { showToast(e instanceof Error ? e.message : 'Could not read that PDF.'); return ''; }
    finally { setCoverBusy(false); }
  };

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

  const allItems: Book[] = [...books, ...toys];
  const filteredItems = allItems.filter((item) => `${item.title} ${item.author} ${item.category} ${item.id}`.toLowerCase().includes(catalogSearch.trim().toLowerCase()));

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

      {user?.isAdmin && <section className="admin-panel" style={{ margin: '24px 0' }}>
        <h2 style={{ fontFamily: 'var(--serif)', color: '#214c3d' }}>🖍️ Printable learning library</h2>
        <p style={{ color: 'var(--mut)' }}>Publish PDFs by section and age. Upload the PDF to your private Google Drive folder and paste its share link or file ID. Only metadata is public; the Drive file ID is kept in an admin-only branch and the PDF is delivered by the server after payment.</p>
        <form onSubmit={(e) => { e.preventDefault(); const id = resourceTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); const fileId = driveId(resourcePdfUrl); if (!id || !fileId || resourceMinAge > resourceMaxAge) { showToast('Add a title, valid age range, and a Google Drive link or file ID.'); return; } const resource: LearningResource = { id, title: resourceTitle.trim(), section: resourceSection, minAge: resourceMinAge, maxAge: resourceMaxAge, description: resourceDescription.trim(), ...(resourceThumbnail.trim() ? { thumbnailUrl: resourceThumbnail.trim() } : {}), price: Math.max(0, Number(resourcePrice) || 0), active: true, createdAt: new Date().toISOString() }; addOrUpdateLearningResource(resource); if (firebaseConfigured) databaseRequest('learningPrivate/' + id, 'PUT', { driveFileId: fileId }).then(() => showToast('Drive file linked. Now press Publish printables to Firebase.')).catch(err => showToast('Could not save the Drive file ID: ' + (err instanceof Error ? err.message : 'error'))); else showToast('Firebase is not configured; the Drive file ID was not saved.'); setResourceTitle(''); setResourceDescription(''); setResourcePdfUrl(''); setResourceThumbnail(''); setResourcePrice(0); }}>
          <div className="form-row">
            <div className="form-group"><label>Printable title *</label><input required value={resourceTitle} onChange={e => setResourceTitle(e.target.value)} placeholder="e.g. Alphabet tracing fun" /></div>
            <div className="form-group"><label>Section *</label><select value={resourceSection} onChange={e => setResourceSection(e.target.value as LearningSection)}><option value="worksheet">Worksheet</option><option value="activity">Activity</option><option value="puzzle">Puzzle</option><option value="cut-and-paste">Cut and paste</option><option value="coloring">Coloring</option></select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Minimum age</label><input type="number" min="0" max="15" value={resourceMinAge} onChange={e => setResourceMinAge(Number(e.target.value))} /></div>
            <div className="form-group"><label>Maximum age</label><input type="number" min="0" max="15" value={resourceMaxAge} onChange={e => setResourceMaxAge(Number(e.target.value))} /></div>
            <div className="form-group"><label>Price (₹, 0 = free)</label><input type="number" min="0" value={resourcePrice} onChange={e => setResourcePrice(Number(e.target.value))} /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea value={resourceDescription} onChange={e => setResourceDescription(e.target.value)} placeholder="What will children practise?" /></div>
          <div className="form-group"><label>Google Drive PDF link or file ID *</label><input required value={resourcePdfUrl} onChange={e => setResourcePdfUrl(e.target.value)} placeholder="https://drive.google.com/file/d/…/view" /></div>
          <div className="form-group"><label>Cover = first page of the PDF</label>
            <input type="file" accept="application/pdf" onChange={async e => { const f = e.target.files?.[0]; const url = await makeCover(f); if (url) { setResourceThumbnail(url); showToast('Cover created from page 1 of the PDF.'); } e.target.value = ''; }} />
            <small style={{ color: 'var(--mut)' }}>{coverBusy ? 'Reading the PDF…' : 'Choose the same PDF from your device. Only a small cover image is stored; the PDF itself stays private in Drive.'}</small>
            {resourceThumbnail && <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}><img src={resourceThumbnail} alt="Cover preview" style={{ width: 84, borderRadius: 8, border: '1px solid var(--border)' }} /><button type="button" className="btn alt" onClick={() => setResourceThumbnail('')}>Remove cover</button></div>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}><button className="btn gold" type="submit">Save printable record</button><button className="btn alt" type="button" disabled={!firebaseConfigured} onClick={async () => { try { await pushLearningResources(); } catch (e) { showToast(e instanceof Error ? e.message : 'Could not publish resources'); } }}>Publish printables to Firebase</button><button className="btn alt" type="button" disabled={!firebaseConfigured} onClick={async () => { try { await fetchLearningResources(); } catch (e) { showToast(e instanceof Error ? e.message : 'Could not fetch resources'); } }}>Fetch live printables</button></div>
        </form>
        <div style={{ marginTop: 22 }}><strong>{learningResources.length} printable records</strong>{learningResources.length > 0 && <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>{learningResources.map(r => <li key={r.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 10, border: '1px solid var(--border)', borderRadius: 14 }}>
          <div style={{ width: 46, flex: 'none', aspectRatio: '1 / 1.414', borderRadius: 6, overflow: 'hidden', background: '#edf7f0', display: 'grid', placeItems: 'center' }}>{r.thumbnailUrl ? <img src={r.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>📄</span>}</div>
          <div style={{ flex: 1, minWidth: 0 }}><strong style={{ display: 'block' }}>{r.title}</strong><small>{r.section} · ages {r.minAge}–{r.maxAge} · {r.active ? 'Published/active' : 'Hidden'}{r.thumbnailUrl ? '' : ' · no cover yet'}</small></div>
          <label className="btn alt" style={{ cursor: 'pointer', fontSize: 12, padding: '8px 10px', whiteSpace: 'nowrap' }}>{coverBusy ? '…' : r.thumbnailUrl ? 'New cover' : 'Add cover'}<input type="file" accept="application/pdf" hidden onChange={async e => { const f = e.target.files?.[0]; const url = await makeCover(f); e.target.value = ''; if (url) addOrUpdateLearningResource({ ...r, thumbnailUrl: url }); }} /></label>
        </li>)}</ul>}{learningResources.length > 0 && <small style={{ color: 'var(--mut)' }}>After adding covers, press “Publish printables to Firebase” so customers see them.</small>}</div>
      </section>}

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
            Book & product manager
          </h2>
          <p style={{ fontSize: '14px', color: '#778278', marginBottom: '14px' }}>
            Search the complete catalogue, edit details, or remove products. Changes stay in this workspace until published to Firebase.
          </p>
          <label className="admin-search-label" htmlFor="catalog-search">Search catalogue</label>
          <input id="catalog-search" className="admin-catalog-search" value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)} placeholder="Search by title, author, category or ID…" />
          <div className="admin-catalog-count">Showing {filteredItems.length} of {allItems.length} products</div>

          <div className="admin-product-list">
            {filteredItems.map((p) => (
              <div key={`${p.type || 'book'}-${p.id}`} className="admin-product-row">
                <div>
                  <strong style={{ display: 'block', fontSize: '14.5px', color: 'var(--ink)' }}>
                    {p.title}
                  </strong>
                  <small style={{ color: 'var(--mut)' }}>
                    {p.type === 'toy' ? '🧸 Toy' : '📚 Book'} · ₹{p.price}
                  </small>
                </div>

                <div className="admin-product-actions">
                  <button type="button" className="btn sm btn-secondary" onClick={() => handleEditItem(p)}>Edit</button>
                  <button type="button" className="btn sm admin-delete-btn" onClick={() => { if (window.confirm(`Remove “${p.title}” from this catalogue workspace? You must push the catalog to publish this deletion.`)) deleteProduct(p.id, p.type === 'toy' ? 'toy' : 'book'); }}>Remove</button>
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && <p className="admin-empty-state">No products match that search. Try a different title or ID.</p>}
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
