import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { LearningResource, LearningSection } from '../types';
import { PrintablePayModal } from '../components/PrintablePayModal';
import { downloadPrintable, loadOwnedPrintables } from '../printablesApi';
import { asset } from '../utils/images';
import { track, gaItem } from '../analytics';
import { ArrowRight, Sparkles, Heart, FileText } from 'lucide-react';

const SECTIONS: Record<LearningSection, { label: string; emoji: string; cover: string }> = {
  worksheet: { label: 'Worksheets', emoji: '✏️', cover: '/img/printables/01_worksheets.jpg' },
  activity: { label: 'Activities', emoji: '🎨', cover: '/img/printables/02_activities.jpg' },
  puzzle: { label: 'Puzzles & Matching', emoji: '🧩', cover: '/img/printables/03_puzzles_matching.jpg' },
  'cut-and-paste': { label: 'Cut & Paste', emoji: '✂️', cover: '/img/printables/04_cut_and_paste.jpg' },
  coloring: { label: 'Coloring', emoji: '🖍️', cover: '/img/printables/05_coloring.jpg' },
};
const AGE_BANDS = [
  { label: 'Ages 2–3', min: 2, max: 3 },
  { label: 'Ages 4–5', min: 4, max: 5 },
  { label: 'Ages 6–8', min: 6, max: 8 },
  { label: 'Ages 9–12', min: 9, max: 12 },
  { label: 'Ages 13–15', min: 13, max: 15 },
];
type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating';
const ORDER: LearningSection[] = ['worksheet', 'activity', 'puzzle', 'cut-and-paste', 'coloring'];

/** Shown only until the first printables are published to Firebase, using the cover art that ships in the repo. */
const REPO_PREVIEW: LearningResource[] = [
  { id: 'preview-worksheets', title: 'Nursery Worksheets', section: 'worksheet', minAge: 2, maxAge: 5, description: 'Gentle tracing, counting and early-skills pages for little hands.', price: 0, active: true, createdAt: '' },
  { id: 'preview-activities', title: 'Fun Activities', section: 'activity', minAge: 2, maxAge: 5, description: 'Hands-on ideas that turn a quiet afternoon into a little adventure.', price: 0, active: true, createdAt: '' },
  { id: 'preview-puzzles', title: 'Puzzles & Matching', section: 'puzzle', minAge: 2, maxAge: 5, description: 'Spot, match and solve — playful thinking games for curious minds.', price: 0, active: true, createdAt: '' },
  { id: 'preview-cut-paste', title: 'Cut & Paste Fun', section: 'cut-and-paste', minAge: 2, maxAge: 5, description: 'Snip, sort and stick to build fine-motor skills and big smiles.', price: 0, active: true, createdAt: '' },
  { id: 'preview-coloring', title: 'Coloring Pages', section: 'coloring', minAge: 2, maxAge: 5, description: 'Big, bright pages waiting for every colour in the box.', price: 0, active: true, createdAt: '' },
];

/** Cover = saved thumbnail (Firebase) → cover committed to repo for this id → repo cover for the section → emoji. */
const CoverArt: React.FC<{ r: LearningResource }> = ({ r }) => {
  const sources = [r.thumbnailUrl, `/img/printables/covers/${r.id}.jpg`, SECTIONS[r.section]?.cover].filter((x): x is string => !!x);
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [r.id, r.thumbnailUrl]);
  if (i >= sources.length) return <span className="emoji-cover" aria-hidden>{SECTIONS[r.section]?.emoji ?? '📄'}</span>;
  return <img src={asset(sources[i])} alt={`${r.title} – first page`} loading="lazy" onError={() => setI(i + 1)} />;
};

const clip = (s: string, n = 85) => (s.length > n ? s.slice(0, n).trimEnd() + '…' : s);

export const PrintablesHome: React.FC = () => {
  const { learningResources, user, setView, showToast } = useStore();
  const [owned, setOwned] = useState<string[]>([]);
  const [basketOpen, setBasketOpen] = useState(false);
  const [detail, setDetail] = useState<LearningResource | null>(null);
  const [busy, setBusy] = useState('');
  const [basketIds, setBasketIds] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('kbPrintableBasket') || '[]'); } catch { return []; } });
  useEffect(() => { try { localStorage.setItem('kbPrintableBasket', JSON.stringify(basketIds)); } catch { /* ignore */ } }, [basketIds]);
  useEffect(() => { if (user) loadOwnedPrintables().then(setOwned); else setOwned([]); }, [user?.email]);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDetail(null); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [detail]);

  useEffect(() => { if (detail && !detail.id.startsWith('preview-')) track('view_item', { currency: 'INR', value: detail.price, items: [gaItem(detail)] }); }, [detail?.id]);
  useEffect(() => { if (basketOpen) track('begin_checkout', { currency: 'INR' }); }, [basketOpen]);

  const live = useMemo(() => learningResources.filter(r => r.active !== false), [learningResources]);
  const preview = live.length === 0;
  const [ageIdx, setAgeIdx] = useState<number | null>(null);
  const [sectionFilter, setSectionFilter] = useState<LearningSection | null>(null);
  const [sort, setSort] = useState<SortKey>('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const base = preview ? REPO_PREVIEW : live;
  const fitsAge = (r: LearningResource, i: number | null) => i === null || (r.minAge <= AGE_BANDS[i].max && r.maxAge >= AGE_BANDS[i].min);
  const items = useMemo(() => {
    const list = base.filter(r => fitsAge(r, ageIdx) && (!sectionFilter || r.section === sectionFilter));
    const byDefault = (a: LearningResource, b: LearningResource) => (Number(!!b.featured) - Number(!!a.featured)) || (ORDER.indexOf(a.section) - ORDER.indexOf(b.section)) || a.title.localeCompare(b.title);
    const cmp: Record<SortKey, (a: LearningResource, b: LearningResource) => number> = {
      featured: byDefault,
      'price-asc': (a, b) => (a.price - b.price) || byDefault(a, b),
      'price-desc': (a, b) => (b.price - a.price) || byDefault(a, b),
      // Best rated first; ties by number of reviews; unrated items last.
      rating: (a, b) => ((b.rating ?? -1) - (a.rating ?? -1)) || ((b.reviewCount ?? 0) - (a.reviewCount ?? 0)) || byDefault(a, b),
    };
    return [...list].sort(cmp[sort]);
  }, [base, ageIdx, sectionFilter, sort]);
  const hasFilters = ageIdx !== null || sectionFilter !== null;
  const typeCount = (sec: LearningSection) => base.filter(r => r.section === sec && fitsAge(r, ageIdx)).length;
  const ageCount = (i: number) => base.filter(r => fitsAge(r, i) && (!sectionFilter || r.section === sectionFilter)).length;
  const typesPresent = ORDER.filter(sec => base.some(r => r.section === sec));
  const anyRated = base.some(r => (r.reviewCount ?? 0) > 0 && r.rating !== undefined);

  const basket = useMemo(() => basketIds.map(id => live.find(r => r.id === id)).filter((r): r is LearningResource => !!r && r.price > 0 && !owned.includes(r.id)), [basketIds, live, owned]);
  const basketTotal = basket.reduce((n, r) => n + r.price, 0);

  // Product structured data for Google (rich results). Only real, published printables; added/removed as the list changes.
  useEffect(() => {
    const id = 'kb-ld-printables';
    document.getElementById(id)?.remove();
    if (!live.length) return;
    const el = document.createElement('script');
    el.id = id; el.type = 'application/ld+json';
    el.text = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'ItemList', name: 'Kiddie Bloom printables',
      itemListElement: live.map((r, i) => ({
        '@type': 'ListItem', position: i + 1,
        item: {
          '@type': 'Product', name: r.title, description: r.description, category: SECTIONS[r.section]?.label ?? 'Printable',
          image: `https://kiddiebloom.in${SECTIONS[r.section]?.cover ?? '/img/kiddie-bloom-hero.jpg'}`, brand: { '@type': 'Brand', name: 'Kiddie Bloom' },
          offers: { '@type': 'Offer', price: r.price, priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: 'https://kiddiebloom.in/#printables' },
          ...((r.reviewCount ?? 0) > 0 && r.rating !== undefined ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: r.rating, reviewCount: r.reviewCount } } : {}),
        },
      })),
    });
    document.head.appendChild(el);
    return () => el.remove();
  }, [live]);

  const needLogin = () => { showToast('Please sign in to buy or download printables.'); setView('auth'); };
  const toggleBasket = (r: LearningResource) => { const has = basketIds.includes(r.id); setBasketIds(b => has ? b.filter(x => x !== r.id) : [...b, r.id]); if (!has) track('add_to_cart', { currency: 'INR', value: r.price, items: [gaItem(r)] }); showToast(has ? `${r.title} removed from cart` : `${r.title} added to cart`); };
  const download = async (r: LearningResource) => {
    if (r.pdfUrl && r.price <= 0) { track('download_printable', { item_id: r.id, item_name: r.title }); window.open(r.pdfUrl, '_blank', 'noopener'); return; }
    if (!user) return needLogin();
    setBusy(r.id);
    try { await downloadPrintable(r.id, r.title); track('download_printable', { item_id: r.id, item_name: r.title }); } catch (e) { showToast(e instanceof Error ? e.message : 'Download failed'); }
    setBusy('');
  };

  const action = (r: LearningResource) => {
    if (preview) return <button type="button" className="btn btn-sm" disabled>Coming soon</button>;
    const inBasket = basketIds.includes(r.id);
    if (r.price > 0 && !owned.includes(r.id)) return <button type="button" className="btn btn-sm" onClick={() => toggleBasket(r)}>{inBasket ? '✓ In Cart' : 'Add to Cart'}</button>;
    return <button type="button" className="btn btn-sm" disabled={busy === r.id} onClick={() => download(r)}>{busy === r.id ? 'Preparing…' : owned.includes(r.id) ? 'Download ⬇' : 'Free Download ⬇'}</button>;
  };
  const priceLabel = (r: LearningResource) => preview ? '' : owned.includes(r.id) ? '✓ Purchased' : r.price > 0 ? `₹${r.price.toLocaleString('en-IN')}` : 'Free';
  const goPrintables = () => document.getElementById('printables')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return <main className="kb-home">
    <section className="kb-fw-hero">
      <img className="kb-fw-hero-img" src={asset('/img/kiddie-bloom-hero.jpg')} alt="Kiddie Bloom's friendly animal characters surrounded by books and art supplies" fetchPriority="high" />
      <div className="kb-fw-hero-copy">
        <span className="kb-eyebrow"><Sparkles size={15} /> A little wonder in every page</span>
        <h1>Printables that make learning <em>feel like play.</em></h1>
        <p>Worksheets, activities, puzzles, cut-and-paste projects and colouring pages — lovingly made to help little learners grow, one joyful page at a time.</p>
        <div className="kb-hero-buttons"><button className="kb-primary-btn" onClick={goPrintables}>Explore printables <ArrowRight size={17} /></button></div>
        <div className="kb-hero-proof"><span><Heart size={15} /> Made for little learners</span><span><FileText size={15} /> Print-ready PDFs</span></div>
      </div>
    </section>

    <section id="printables" className="kb-featured-section">
      <div className="wrap">
        <div className="kb-section-heading">
          <span className="kb-eyebrow">Handpicked for little learners</span>
          <h2>Printables they'll ask for again</h2>
          <p>Lovely pages for rainy days, quiet time and everything in between.</p>
        </div>
        <div className="kb-pr-layout">
          <button type="button" className="kb-pr-filter-toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(o => !o)}>⚙️ Filter & sort{hasFilters || sort !== 'featured' ? ' • on' : ''}</button>
          <aside className={`kb-pr-side${filtersOpen ? ' open' : ''}`} aria-label="Filter and sort printables">
            <div className="kb-pr-side-block">
              <h3>Sort by</h3>
              {([['featured', 'Featured'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['rating', anyRated ? 'Top rated' : 'Top rated (no reviews yet)']] as [SortKey, string][]).map(([k, label]) =>
                <label key={k} className={`kb-pr-opt${sort === k ? ' on' : ''}`}><input type="radio" name="kb-sort" checked={sort === k} onChange={() => setSort(k)} /><span>{label}</span></label>)}
            </div>
            <div className="kb-pr-side-block">
              <h3>Age</h3>
              <button type="button" className={`kb-pr-opt${ageIdx === null ? ' on' : ''}`} onClick={() => setAgeIdx(null)}><span>All ages</span></button>
              {AGE_BANDS.map((a, i) => <button key={a.label} type="button" disabled={ageCount(i) === 0 && ageIdx !== i} className={`kb-pr-opt${ageIdx === i ? ' on' : ''}`} onClick={() => setAgeIdx(ageIdx === i ? null : i)}><span>{a.label}</span><small>{ageCount(i)}</small></button>)}
            </div>
            <div className="kb-pr-side-block">
              <h3>Type of activity</h3>
              <button type="button" className={`kb-pr-opt${sectionFilter === null ? ' on' : ''}`} onClick={() => setSectionFilter(null)}><span>All types</span></button>
              {typesPresent.map(sec => <button key={sec} type="button" disabled={typeCount(sec) === 0 && sectionFilter !== sec} className={`kb-pr-opt${sectionFilter === sec ? ' on' : ''}`} onClick={() => setSectionFilter(sectionFilter === sec ? null : sec)}><span>{SECTIONS[sec].emoji} {SECTIONS[sec].label}</span><small>{typeCount(sec)}</small></button>)}
            </div>
            {hasFilters && <button type="button" className="kb-pr-clear" onClick={() => { setAgeIdx(null); setSectionFilter(null); }}>Clear filters</button>}
          </aside>
          <div className="kb-pr-main">
            <div className="kb-pr-count">{items.length} printable{items.length === 1 ? '' : 's'}</div>
            {items.length === 0 && <div className="kb-pr-empty"><div style={{ fontSize: 42 }}>🌼</div><h3>Nothing matches just yet</h3><p>Try a different age or activity — new printables are added regularly.</p><button type="button" className="btn btn-sm" onClick={() => { setAgeIdx(null); setSectionFilter(null); }}>Show all printables</button></div>}
        <div className="kb-featured-grid">
          {items.map(r => {
            const meta = SECTIONS[r.section];
            return <article key={r.id} className="book-card kb-pr-card">
              <div className="book-cover" onClick={() => setDetail(r)}>
                <CoverArt r={r} />
                <span className="kb-pr-chip">PDF</span>
              </div>
              <div className="book-info">
                <h3 onClick={() => setDetail(r)} style={{ cursor: 'pointer' }}>{r.title}</h3>
                <div className="author">{meta?.label ?? 'Printable'} · Ages {r.minAge}–{r.maxAge}</div>
                <p className="desc">{clip(r.description)}</p>
                {(r.reviewCount ?? 0) > 0 && r.rating !== undefined && <div className="kb-pr-stars" aria-label={`Rated ${r.rating} out of 5`}>★ {r.rating.toFixed(1)} <small>({r.reviewCount})</small></div>}
                <div className="price">{priceLabel(r) || '\u00A0'}</div>
                <div className="book-actions-row">
                  <button type="button" className="btn btn-sm alt" onClick={() => setDetail(r)}>View details</button>
                  {action(r)}
                </div>
              </div>
            </article>;
          })}
        </div>
          </div>
        </div>
      </div>
    </section>

    {detail && <div className="modal-overlay" onClick={() => setDetail(null)}>
      <div className="modal-content kb-pr-detail" role="dialog" aria-label={detail.title} onClick={e => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={() => setDetail(null)} aria-label="Close">✕</button>
        <div className="kb-pr-detail-cover"><CoverArt r={detail} /></div>
        <div className="kb-pr-detail-body">
          <span className="kb-eyebrow">{SECTIONS[detail.section]?.label} · Ages {detail.minAge}–{detail.maxAge}</span>
          <h2>{detail.title}</h2>
          <div className="kb-pr-detail-scroll" tabIndex={0} aria-label="Full description"><p>{detail.description}</p></div>
          <div className="kb-pr-detail-foot"><strong>{priceLabel(detail)}</strong>{action(detail)}</div>
        </div>
      </div>
    </div>}

    {basket.length > 0 && !basketOpen && <div className="kb-basket-bar-wrap">
      <button type="button" className="btn gold pr-basket-bar" onClick={() => setBasketOpen(true)}>🧺 Cart ({basket.length}) · ₹{basketTotal.toFixed(0)} — Review & checkout</button>
    </div>}
    {basketOpen && <PrintablePayModal
      resources={basket}
      isLoggedIn={!!user}
      onNeedLogin={() => { setBasketOpen(false); needLogin(); }}
      onClose={() => setBasketOpen(false)}
      onRemove={id => setBasketIds(b => b.filter(x => x !== id))}
      renderThumb={r => <CoverArt r={r} />}
      getSubtitle={r => `${SECTIONS[r.section]?.label ?? ''} · Ages ${r.minAge}–${r.maxAge}`}
      onPaid={ids => { const paid = basket.filter(b => ids.includes(b.id)); track('purchase', { currency: 'INR', value: paid.reduce((n, b) => n + b.price, 0), items: paid.map(gaItem) }); setOwned(o => [...new Set([...o, ...ids])]); setBasketIds(b => b.filter(x => !ids.includes(x))); }}
    />}
  </main>;
};
