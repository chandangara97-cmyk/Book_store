import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { LearningResource, LearningSection } from '../types';
import { PrintablePayModal } from '../components/PrintablePayModal';
import { downloadPrintable, loadOwnedPrintables } from '../printablesApi';
import { asset } from '../utils/images';

const sections: { id: LearningSection; label: string; emoji: string; text: string }[] = [
  { id: 'worksheet', label: 'Worksheets', emoji: '✏️', text: 'Build skills one little step at a time.' },
  { id: 'activity', label: 'Activities', emoji: '🎨', text: 'Hands-on ideas for curious minds.' },
  { id: 'puzzle', label: 'Puzzles', emoji: '🧩', text: 'Think, match, spot and solve.' },
  { id: 'cut-and-paste', label: 'Cut & Paste', emoji: '✂️', text: 'Create, sort and assemble.' },
  { id: 'coloring', label: 'Coloring', emoji: '🖍️', text: 'Big ideas, bright colors.' },
];
const ageBands = [
  { label: 'Ages 2–3', emoji: '🧸', min: 2, max: 3 },
  { label: 'Ages 4–5', emoji: '🎒', min: 4, max: 5 },
  { label: 'Ages 6–8', emoji: '📚', min: 6, max: 8 },
  { label: 'Ages 9–12', emoji: '🔬', min: 9, max: 12 },
  { label: 'Ages 13–15', emoji: '🚀', min: 13, max: 15 },
];

/** Cover = saved thumbnail, else /img/printables/covers/<id>.jpg (page 1 of the PDF committed to the repo), else the emoji. */
const CoverArt: React.FC<{ r: LearningResource; emoji: string }> = ({ r, emoji }) => {
  const sources = [r.thumbnailUrl, `/img/printables/covers/${r.id}.jpg`].filter((x): x is string => !!x);
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [r.id, r.thumbnailUrl]);
  if (i >= sources.length) return <span aria-hidden style={{ fontSize: 64 }}>{emoji}</span>;
  return <img src={asset(sources[i])} alt={`${r.title} – first page`} loading="lazy" onError={() => setI(i + 1)} />;
};
export const LearningView: React.FC = () => {
  const { learningResources, user, setView, showToast } = useStore();
  const [owned, setOwned] = useState<string[]>([]);
  const [basketOpen, setBasketOpen] = useState(false);
  const [basketIds, setBasketIds] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('kbPrintableBasket') || '[]'); } catch { return []; } });
  useEffect(() => { try { localStorage.setItem('kbPrintableBasket', JSON.stringify(basketIds)); } catch { /* ignore */ } }, [basketIds]);
  const [busy, setBusy] = useState('');
  useEffect(() => { if (user) loadOwnedPrintables().then(setOwned); else setOwned([]); }, [user?.email]);
  const needLogin = () => { showToast('Please sign in to buy or download printables.'); setView('auth'); };
  const download = async (r: LearningResource) => { if (r.pdfUrl && r.price <= 0) { window.open(r.pdfUrl, '_blank', 'noopener'); return; } if (!user) return needLogin(); setBusy(r.id); try { await downloadPrintable(r.id, r.title); } catch (e) { showToast(e instanceof Error ? e.message : 'Download failed'); } setBusy(''); };

  // Guided questions: nothing is listed until the questions are answered.
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false); // PDFs remain hidden until both age and category are selected
  const [ageIdx, setAgeIdx] = useState<number | null>(null);
  const [section, setSection] = useState<LearningSection | null>(null);
  const [query, setQuery] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);
  const toggleBasket = (r: LearningResource) => { const has = basketIds.includes(r.id); setBasketIds(b => has ? b.filter(x => x !== r.id) : [...b, r.id]); showToast(has ? `${r.title} removed from basket` : `${r.title} added to basket`); };

  const active = useMemo(() => learningResources.filter(r => r.active !== false), [learningResources]);
  const basket = useMemo(() => basketIds.map(id => active.find(r => r.id === id)).filter((r): r is LearningResource => !!r && r.price > 0 && !owned.includes(r.id)), [basketIds, active, owned]);
  const basketTotal = basket.reduce((n, r) => n + r.price, 0);
  const totalSteps = 2;
  const fitsAge = (r: LearningResource, i: number | null) => i !== null && (r.minAge <= ageBands[i].max && r.maxAge >= ageBands[i].min);
  const countFor = (sec: LearningSection) => active.filter(r => r.section === sec && fitsAge(r, ageIdx)).length;

  const visible = useMemo(() => {
    if (!done || ageIdx === null || section === null) return [];
    return active.filter(r => fitsAge(r, ageIdx) && r.section === section &&
      `${r.title} ${r.description}`.toLowerCase().includes(query.toLowerCase()));
  }, [active, done, ageIdx, section, query]);

  const firstRun = useRef(true);
  useEffect(() => { if (firstRun.current) { firstRun.current = false; return; } if (done) resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [done]);
  const restart = () => { setDone(false); setStep(0); setAgeIdx(null); setSection(null); setQuery(''); };
  const editStep = (n: number) => { setDone(false); setStep(n); };


  const hasFilters = query !== '';
  const answerChips = <div className="pr-filters">
    <div className="pr-chips" role="group" aria-label="Selected age">
      <span className="pr-filter on">{ageIdx !== null ? `${ageBands[ageIdx].emoji} ${ageBands[ageIdx].label}` : 'Age not selected'}</span>
      <button type="button" className="btn alt pr-restart" onClick={() => editStep(0)}>Change age</button>
    </div>
    <div className="pr-chips" role="group" aria-label="Selected category">
      <span className="pr-filter on">{section ? `${sections.find(s => s.id === section)?.emoji} ${sections.find(s => s.id === section)?.label}` : 'Category not selected'}</span>
      <button type="button" className="btn alt pr-restart" onClick={() => editStep(1)}>Change category</button>
    </div>
    <div className="pr-actions">
      <button type="button" className="btn alt pr-restart" onClick={restart}>↺ Choose again</button>
      {hasFilters && <button type="button" className="btn alt pr-restart" onClick={() => setQuery('')}>Clear search</button>}
    </div>
  </div>;

  return <main className="wrap printables-page kb-index" style={{ paddingTop: 18, paddingBottom: basket.length > 0 ? 150 : 64 }}>
    <style>{`
      .kb-index{max-width:1240px!important;color:#263b32}
      .kb-index .kb-hero{position:relative;display:grid;grid-template-columns:1.08fr .92fr;align-items:center;gap:24px;overflow:hidden;min-height:330px;padding:clamp(24px,5vw,58px);border-radius:30px;background:linear-gradient(125deg,#fff5e9 0%,#f4f8ef 54%,#eaf4f5 100%);border:1px solid #e8eee5;box-shadow:0 18px 48px rgba(42,75,56,.08);margin-bottom:26px}
      .kb-index .kb-hero:before,.kb-index .kb-hero:after{content:"";position:absolute;border-radius:50%;pointer-events:none;background:rgba(255,255,255,.42)}
      .kb-index .kb-hero:before{width:220px;height:220px;right:32%;top:-145px}.kb-index .kb-hero:after{width:150px;height:150px;left:-95px;bottom:-95px}
      .kb-index .kb-hero-copy,.kb-index .kb-hero-art{position:relative;z-index:1}
      .kb-index .kb-kicker{display:inline-flex;align-items:center;gap:8px;padding:8px 13px;border-radius:999px;background:#fff;border:1px solid #e5eadf;color:#55715e;font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
      .kb-index .kb-hero h1{font-family:var(--serif,Georgia,serif);font-size:clamp(34px,5vw,58px);line-height:1.04;letter-spacing:-.035em;color:#244b3a;margin:18px 0 14px;max-width:620px}
      .kb-index .kb-hero p{font-size:clamp(15px,1.5vw,18px);line-height:1.7;color:#617268;max-width:560px;margin:0}
      .kb-index .kb-hero-art{display:flex;justify-content:center;align-items:center;min-width:0}
      .kb-index .kb-hero-art img{display:block;width:min(100%,430px);max-height:265px;object-fit:contain;filter:drop-shadow(0 18px 20px rgba(58,79,61,.12));border-radius:22px}
      .kb-index .kb-flow{display:flex;gap:9px;flex-wrap:wrap;margin-top:24px}
      .kb-index .kb-flow span{display:inline-flex;align-items:center;gap:7px;padding:9px 12px;border-radius:12px;background:rgba(255,255,255,.78);border:1px solid #e6ece2;color:#526b5a;font-size:12px;font-weight:800}
      .kb-index .kb-picker{max-width:1000px;margin:0 auto 26px;padding:clamp(22px,4vw,38px);border-radius:26px;background:#fff;border:1px solid #e8ede6;box-shadow:0 14px 42px rgba(37,67,48,.07);text-align:center}
      .kb-index .kb-step-label{font-size:11px;font-weight:900;letter-spacing:.16em;color:#a07856;text-transform:uppercase}
      .kb-index .kb-step-track{display:flex;align-items:center;justify-content:center;gap:8px;margin:13px 0 18px}
      .kb-index .kb-step-track span{width:34px;height:5px;border-radius:9px;background:#e8eee7}.kb-index .kb-step-track span.on{background:#d88c79;width:52px}
      .kb-index .kb-picker h2{font-family:var(--serif,Georgia,serif);font-size:clamp(25px,3vw,36px);color:#294d3c;margin:0 0 8px}
      .kb-index .kb-picker-sub{color:#77867b;margin:0 auto 22px;max-width:620px;line-height:1.6;font-size:14px}
      .kb-index .kb-choice-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:12px}
      .kb-index .kb-choice-card{position:relative;min-height:122px;padding:18px 12px;border:1px solid #e6ece4;border-radius:18px;background:linear-gradient(180deg,#fff 0%,#fbfcf8 100%);color:#355442;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;font:inherit;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
      .kb-index .kb-choice-card:hover:not(:disabled){transform:translateY(-4px);border-color:#d7b49c;box-shadow:0 12px 24px rgba(51,82,58,.1)}
      .kb-index .kb-choice-card:focus-visible{outline:3px solid #d88c79;outline-offset:3px}
      .kb-index .kb-choice-card:disabled{opacity:.42;cursor:not-allowed}
      .kb-index .kb-choice-emoji{font-size:30px;line-height:1}.kb-index .kb-choice-title{font-size:15px;font-weight:900}.kb-index .kb-choice-sub{font-size:11px;color:#819087;font-weight:700}
      .kb-index .kb-back{margin-top:18px;border:0;background:transparent;color:#6e7f73;font-weight:800;cursor:pointer;padding:9px 14px}
      .kb-index .printables-section-heading{text-align:center;margin:32px 0 18px}
      .kb-index .printables-section-heading .sec-title{color:#294d3c}
      @media(max-width:720px){.kb-index .kb-hero{grid-template-columns:1fr;text-align:center;gap:14px;padding:25px 20px;min-height:0}.kb-index .kb-hero-copy{display:flex;flex-direction:column;align-items:center}.kb-index .kb-hero h1{font-size:clamp(32px,9vw,44px);margin:14px 0 10px}.kb-index .kb-hero-art img{max-height:185px;width:min(78%,320px)}.kb-index .kb-flow{justify-content:center;margin-top:16px}.kb-index .kb-picker{padding:22px 15px}.kb-index .kb-choice-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.kb-index .kb-choice-card{min-height:112px}}
    `}</style>
    <section className="kb-hero" aria-labelledby="kb-home-title">
      <div className="kb-hero-copy">
        <span className="kb-kicker">Kiddie Bloom · Learning printables</span>
        <h1 id="kb-home-title">Little steps. Lovely discoveries.</h1>
        <p>Find the right printable for your child in two simple steps. Choose an age, pick a learning category, and explore only the PDFs that match.</p>
        <div className="kb-flow" aria-label="How it works">
          <span>① Choose age</span><span>② Choose category</span><span>③ View matching PDFs</span>
        </div>
      </div>
      <div className="kb-hero-art">
        <img fetchPriority="high" decoding="async" src={asset('/img/kiddie-bloom-hero.jpg')} alt="Kiddie Bloom friendly learning characters with books and crayons" width={720} height={460} />
      </div>
    </section>

    {!active.length ? <div style={{ textAlign: 'center', padding: '48px 20px', borderRadius: 20, background: '#f7f8f3' }}><div style={{ fontSize: 42 }}>🌼</div><h3>New discoveries are on the way</h3><p>Our printables are being prepared. Please check back soon.</p></div> :
    !done ? <section className="kb-picker" aria-live="polite">
      <span className="kb-step-label">STEP {step + 1} OF {totalSteps}</span>
      <div className="kb-step-track" aria-hidden="true">{Array.from({ length: totalSteps }, (_, i) => <span key={i} className={i <= step ? 'on' : ''} />)}</div>
      {step === 0 && <>
        <h2>How old is your little learner?</h2>
        <p className="kb-picker-sub">Select your child's age group. We will use it to find suitable learning PDFs.</p>
        <div className="kb-choice-grid">
          {ageBands.map((a, i) => {
            const count = active.filter(r => fitsAge(r, i)).length;
            return <button key={a.label} type="button" className="kb-choice-card" disabled={count === 0} onClick={() => { setAgeIdx(i); setSection(null); setStep(1); }}>
              <span className="kb-choice-emoji">{a.emoji}</span><span className="kb-choice-title">{a.label}</span><span className="kb-choice-sub">{count} matching PDFs</span>
            </button>;
          })}
        </div>
      </>}
      {step === 1 && <>
        <h2>Choose a learning category</h2>
        <p className="kb-picker-sub">Showing only categories that have PDFs for {ageIdx !== null ? ageBands[ageIdx].label : 'the selected age group'}.</p>
        <div className="kb-choice-grid">
          {sections.filter(sc => countFor(sc.id) > 0).map(sc => <button key={sc.id} type="button" className="kb-choice-card" onClick={() => { setSection(sc.id); setQuery(''); setDone(true); }}>
            <span className="kb-choice-emoji">{sc.emoji}</span><span className="kb-choice-title">{sc.label}</span><span className="kb-choice-sub">{countFor(sc.id)} matching PDFs</span>
          </button>)}
        </div>
        {!sections.some(sc => countFor(sc.id) > 0) && <p className="kb-picker-sub">No categories have PDFs for this age group yet. Please choose another age.</p>}
        <button type="button" className="kb-back" onClick={() => setStep(0)}>← Change age group</button>
      </>}
    </section> :
    <div ref={resultsRef} style={{ scrollMarginTop: 80 }}>
      <div className="printables-section-heading" style={{ marginBottom: 12 }}><span className="eyebrow">MATCHING PRINTABLES</span><h2 className="sec-title">{visible.length} matching PDF{visible.length === 1 ? '' : 's'}</h2></div>
      <div className="pr-toolbar">
        {answerChips}
        <input className="pr-search" type="search" aria-label="Search these printables" placeholder="Search within results…" value={query} onChange={e => setQuery(e.target.value)} />
      </div>
      {visible.length ? <div className="printables-grid">{visible.map(r => {
        const meta = sections.find(s => s.id === r.section)!;
        const inBasket = basketIds.includes(r.id);
        const isOwned = owned.includes(r.id);
        return <article className={`printable-card${inBasket ? ' in-basket' : ''}`} key={r.id}>
          <div className="printable-card-art">
            <CoverArt r={r} emoji={meta.emoji} />
            <span className="pc-badge">PDF · Instant access</span>
          </div>
          <div className="pc-body">
            <small className="pc-meta">{meta.label} · Ages {r.minAge}–{r.maxAge}</small>
            <h3 className="pc-title">{r.title}</h3>
            <p className="pc-desc">{r.description}</p>
            <div className="pc-foot">
              <strong className="pc-price">{r.price > 0 ? `₹${r.price.toFixed(0)}` : 'Free'}</strong>
              {r.price > 0 && !isOwned
                ? <button className={`btn ${inBasket ? 'alt' : 'gold'}`} onClick={() => toggleBasket(r)} aria-label={inBasket ? `Remove ${r.title} from basket` : `Add ${r.title} to basket`}>{inBasket ? '✓ In basket' : '🧺 Add'}</button>
                : r.price > 0
                  ? <span className="pc-owned">✓ Purchased</span>
                  : <button className="btn gold" disabled={busy === r.id} onClick={() => download(r)}>{busy === r.id ? 'Preparing…' : 'Download ⬇'}</button>}
            </div>
            {inBasket && r.price > 0 && !isOwned && <button type="button" className="pc-remove" onClick={() => toggleBasket(r)}>Remove from basket</button>}
          </div>
        </article>;
      })}</div> : <div style={{ textAlign: 'center', padding: '48px 20px', borderRadius: 20, background: '#f7f8f3' }}><div style={{ fontSize: 42 }}>🌼</div><h3>Nothing matches just yet</h3><p>Try a different age or activity — new printables are added regularly.</p><button type="button" className="btn gold" onClick={restart}>↺ Clear filters</button></div>}
    </div>}
  {basket.length > 0 && !basketOpen && <div style={{ position: 'fixed', left: 0, right: 0, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 74px)', display: 'flex', justifyContent: 'center', zIndex: 40, pointerEvents: 'none' }}>
    <button type="button" className="btn gold pr-basket-bar" onClick={() => setBasketOpen(true)}>🧺 Basket ({basket.length}) · ₹{basketTotal.toFixed(0)} — Review & checkout</button>
  </div>}
  {basketOpen && <PrintablePayModal
    resources={basket}
    isLoggedIn={!!user}
    onNeedLogin={() => { setBasketOpen(false); needLogin(); }}
    onClose={() => setBasketOpen(false)}
    onRemove={id => setBasketIds(b => b.filter(x => x !== id))}
    renderThumb={r => r.thumbnailUrl ? <img src={asset(r.thumbnailUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <>{sections.find(x => x.id === r.section)?.emoji}</>}
    getSubtitle={r => `${sections.find(x => x.id === r.section)?.label ?? ''} · Ages ${r.minAge}–${r.maxAge}`}
    onPaid={ids => { setOwned(o => [...new Set([...o, ...ids])]); setBasketIds(b => b.filter(x => !ids.includes(x))); }}
  />}
  </main>;
};
