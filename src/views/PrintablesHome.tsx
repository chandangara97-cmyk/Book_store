import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { LearningResource, LearningSection } from '../types';
import { PrintablePayModal } from '../components/PrintablePayModal';
import { downloadPrintable, loadOwnedPrintables } from '../printablesApi';
import { asset } from '../utils/images';
import { ArrowRight, Sparkles, Heart, FileText } from 'lucide-react';

const SECTIONS: Record<LearningSection, { label: string; emoji: string; cover: string }> = {
  worksheet: { label: 'Worksheets', emoji: '✏️', cover: '/img/printables/01_worksheets.jpg' },
  activity: { label: 'Activities', emoji: '🎨', cover: '/img/printables/02_activities.jpg' },
  puzzle: { label: 'Puzzles & Matching', emoji: '🧩', cover: '/img/printables/03_puzzles_matching.jpg' },
  'cut-and-paste': { label: 'Cut & Paste', emoji: '✂️', cover: '/img/printables/04_cut_and_paste.jpg' },
  coloring: { label: 'Coloring', emoji: '🖍️', cover: '/img/printables/05_coloring.jpg' },
};
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

  const live = useMemo(() => learningResources.filter(r => r.active !== false), [learningResources]);
  const preview = live.length === 0;
  const items = useMemo(() => {
    const list = preview ? REPO_PREVIEW : live;
    return [...list].sort((a, b) => (Number(!!b.featured) - Number(!!a.featured)) || (ORDER.indexOf(a.section) - ORDER.indexOf(b.section)) || a.title.localeCompare(b.title));
  }, [live, preview]);

  const basket = useMemo(() => basketIds.map(id => live.find(r => r.id === id)).filter((r): r is LearningResource => !!r && r.price > 0 && !owned.includes(r.id)), [basketIds, live, owned]);
  const basketTotal = basket.reduce((n, r) => n + r.price, 0);

  const needLogin = () => { showToast('Please sign in to buy or download printables.'); setView('auth'); };
  const toggleBasket = (r: LearningResource) => { const has = basketIds.includes(r.id); setBasketIds(b => has ? b.filter(x => x !== r.id) : [...b, r.id]); showToast(has ? `${r.title} removed from cart` : `${r.title} added to cart`); };
  const download = async (r: LearningResource) => {
    if (r.pdfUrl && r.price <= 0) { window.open(r.pdfUrl, '_blank', 'noopener'); return; }
    if (!user) return needLogin();
    setBusy(r.id);
    try { await downloadPrintable(r.id, r.title); } catch (e) { showToast(e instanceof Error ? e.message : 'Download failed'); }
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
    <section className="kb-hero-wrap">
      <div className="kb-home-hero">
        <div className="kb-hero-copy">
          <span className="kb-eyebrow"><Sparkles size={15} /> A little wonder in every page</span>
          <h1>Printables that make learning <em>feel like play.</em></h1>
          <p>Worksheets, activities, puzzles, cut-and-paste projects and colouring pages — lovingly made to help little learners grow, one joyful page at a time.</p>
          <div className="kb-hero-buttons"><button className="kb-primary-btn" onClick={goPrintables}>Explore printables <ArrowRight size={17} /></button></div>
          <div className="kb-hero-proof"><span><Heart size={15} /> Made for little learners</span><span><FileText size={15} /> Print-ready PDFs</span></div>
        </div>
        <div className="kb-hero-art">
          <img src={asset('/img/kiddie-bloom-hero.jpg')} alt="Kiddie Bloom's friendly animal characters surrounded by books and art supplies" />
          <div className="kb-floating-note"><span>✦</span><strong>Read. Play. Bloom.</strong><small>Little moments matter.</small></div>
        </div>
      </div>
    </section>

    <section id="printables" className="kb-featured-section">
      <div className="wrap">
        <div className="kb-section-heading">
          <span className="kb-eyebrow">Handpicked for little learners</span>
          <h2>Printables they'll ask for again</h2>
          <p>Lovely pages for rainy days, quiet time and everything in between.</p>
        </div>
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
    </section>

    {detail && <div className="modal-overlay" onClick={() => setDetail(null)}>
      <div className="modal-content kb-pr-detail" role="dialog" aria-label={detail.title} onClick={e => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={() => setDetail(null)} aria-label="Close">✕</button>
        <div className="kb-pr-detail-cover"><CoverArt r={detail} /></div>
        <div className="kb-pr-detail-body">
          <span className="kb-eyebrow">{SECTIONS[detail.section]?.label} · Ages {detail.minAge}–{detail.maxAge}</span>
          <h2>{detail.title}</h2>
          <p>{detail.description}</p>
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
      onPaid={ids => { setOwned(o => [...new Set([...o, ...ids])]); setBasketIds(b => b.filter(x => !ids.includes(x))); }}
    />}
  </main>;
};
