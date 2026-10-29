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
type PriceChoice = 'any' | 'free' | 'paid';
const chipStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 13px', borderRadius: 999, border: '1px solid #cfe0d3', background: 'white', color: '#214c3d', fontWeight: 800, fontSize: 13, cursor: 'pointer' };

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
  const [checkoutItems, setCheckoutItems] = useState<LearningResource[] | null>(null);
  const [basketOpen, setBasketOpen] = useState(false);
  const [basketIds, setBasketIds] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('kbPrintableBasket') || '[]'); } catch { return []; } });
  useEffect(() => { try { localStorage.setItem('kbPrintableBasket', JSON.stringify(basketIds)); } catch { /* ignore */ } }, [basketIds]);
  const [busy, setBusy] = useState('');
  const [mineOnly, setMineOnly] = useState(false);
  useEffect(() => { if (user) loadOwnedPrintables().then(setOwned); else setOwned([]); }, [user?.email]);
  const needLogin = () => { showToast('Please sign in to buy or download printables.'); setView('auth'); };
  const download = async (r: LearningResource) => { if (r.pdfUrl && r.price <= 0) { window.open(r.pdfUrl, '_blank', 'noopener'); return; } if (!user) return needLogin(); setBusy(r.id); try { await downloadPrintable(r.id, r.title); } catch (e) { showToast(e instanceof Error ? e.message : 'Download failed'); } setBusy(''); };

  // Guided questions: nothing is listed until the questions are answered.
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [ageIdx, setAgeIdx] = useState<number | null>(null); // null = any age
  const [section, setSection] = useState<LearningSection | 'all'>('all');
  const [priceChoice, setPriceChoice] = useState<PriceChoice>('any');
  const [query, setQuery] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);
  const toggleBasket = (r: LearningResource) => { const has = basketIds.includes(r.id); setBasketIds(b => has ? b.filter(x => x !== r.id) : [...b, r.id]); showToast(has ? `${r.title} removed from basket` : `${r.title} added to basket`); };

  const active = useMemo(() => learningResources.filter(r => r.active !== false), [learningResources]);
  const hasFree = active.some(r => r.price <= 0), hasPaid = active.some(r => r.price > 0);
  const basket = useMemo(() => basketIds.map(id => active.find(r => r.id === id)).filter((r): r is LearningResource => !!r && r.price > 0 && !owned.includes(r.id)), [basketIds, active, owned]);
  const basketTotal = basket.reduce((n, r) => n + r.price, 0);
  const askPrice = hasFree && hasPaid;
  const totalSteps = askPrice ? 3 : 2;
  const fitsAge = (r: LearningResource, i: number | null) => i === null || (r.minAge <= ageBands[i].max && r.maxAge >= ageBands[i].min);
  const fitsPrice = (r: LearningResource, c: PriceChoice) => c === 'any' || (c === 'free' ? r.price <= 0 : r.price > 0);
  const countFor = (sec: LearningSection) => active.filter(r => r.section === sec && fitsAge(r, ageIdx)).length;

  const visible = useMemo(() => active.filter(r =>
    (!mineOnly || owned.includes(r.id)) && fitsAge(r, ageIdx) && (section === 'all' || r.section === section) && fitsPrice(r, priceChoice) &&
    `${r.title} ${r.description}`.toLowerCase().includes(query.toLowerCase())), [active, mineOnly, owned, ageIdx, section, priceChoice, query]);

  useEffect(() => { if (done) resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [done, mineOnly]);
  const finish = () => { setQuery(''); setDone(true); };
  const next = () => { if (step + 1 >= totalSteps) finish(); else setStep(step + 1); };
  const restart = () => { setDone(false); setMineOnly(false); setStep(0); setAgeIdx(null); setSection('all'); setPriceChoice('any'); setQuery(''); };
  const editStep = (n: number) => { setMineOnly(false); setDone(false); setStep(n); };
  const showMine = () => { setMineOnly(true); setAgeIdx(null); setSection('all'); setPriceChoice('any'); setQuery(''); setDone(true); };

  const optionBtn = (key: string, label: string, sub: string | undefined, onClick: () => void, disabled = false, selected = false) =>
    <button key={key} type="button" disabled={disabled} onClick={onClick} className={`btn ${selected ? 'gold' : 'alt'}`} style={{ minHeight: 64, borderRadius: 16, fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, opacity: disabled ? .45 : 1 }}>
      <span>{label}</span>{sub && <small style={{ fontWeight: 600, opacity: .8 }}>{sub}</small>}
    </button>;

  const answerChips = <div className="pr-chips">
    {mineOnly ? <span style={{ ...chipStyle, cursor: 'default' }}>📥 My purchases</span> : <>
      <button type="button" style={chipStyle} onClick={() => editStep(0)}>{ageIdx === null ? '🌈 Any age' : `${ageBands[ageIdx].emoji} ${ageBands[ageIdx].label}`} ✎</button>
      <button type="button" style={chipStyle} onClick={() => editStep(1)}>{section === 'all' ? '✨ Anything fun' : `${sections.find(s => s.id === section)!.emoji} ${sections.find(s => s.id === section)!.label}`} ✎</button>
      {askPrice && <button type="button" style={chipStyle} onClick={() => editStep(2)}>{priceChoice === 'any' ? '💛 Free & paid' : priceChoice === 'free' ? '🎁 Free only' : '⭐ Paid only'} ✎</button>}
    </>}
    <button type="button" className="btn alt pr-restart" onClick={restart}>↺ Start over</button>
  </div>;

  return <main className="wrap printables-page" style={{ paddingTop: 20, paddingBottom: basket.length > 0 ? 150 : 64 }}>
    <section className="printables-hero" style={{ borderRadius: 28, padding: 0, background: '#fff', marginBottom: 30 }}>
      <img src={asset('/img/kiddie-bloom-hero.jpg')} alt="Kiddie Bloom – a giraffe, bunny, panda, bear and squirrel with books, crayons and an open storybook" width={1600} height={593} style={{ display: 'block', width: '100%', height: 'auto' }} />
      <div style={{ padding: 'clamp(18px,3.5vw,34px)', textAlign: 'center', background: 'linear-gradient(120deg,#fff4e6,#f2f8ee 65%,#e8f4ff)' }}>
        <h1 style={{ fontFamily: 'var(--serif)', color: '#214c3d', fontSize: 'clamp(26px,4vw,40px)', margin: '0 auto 8px' }}>Little hands. Big discoveries.</h1>
        <p style={{ maxWidth: 620, margin: '0 auto', lineHeight: 1.6 }}>Answer a few quick questions and we’ll show the printable worksheets, activities, puzzles and colouring pages that fit your child.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 14 }}><span className="pill">📄 Instant printable PDFs</span><span className="pill">🌱 Age-friendly learning</span><span className="pill">💛 Learn through play</span></div>
      </div>
    </section>

    {!active.length ? <div style={{ textAlign: 'center', padding: '48px 20px', borderRadius: 20, background: '#f7f8f3' }}><div style={{ fontSize: 42 }}>🌼</div><h3>New discoveries are on the way</h3><p>Our printables are being prepared. Please check back soon.</p></div> :
    !done ? <section aria-live="polite" style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(18px,4vw,32px)', borderRadius: 24, background: 'white', border: '1px solid #e5e9e1', boxShadow: '0 10px 30px #264b3712', textAlign: 'center' }}>
      <span className="eyebrow">QUESTION {step + 1} OF {totalSteps}</span>
      <div aria-hidden style={{ display: 'flex', gap: 6, justifyContent: 'center', margin: '10px 0 14px' }}>{Array.from({ length: totalSteps }, (_, i) => <span key={i} style={{ width: i === step ? 28 : 10, height: 10, borderRadius: 99, background: i <= step ? '#ff7aa2' : '#e5e9e1', transition: 'width .2s' }} />)}</div>
      {step === 0 && <>
        <h2 className="sec-title">How old is your little learner?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginTop: 18 }}>
          {ageBands.map((a, i) => optionBtn(a.label, `${a.emoji} ${a.label}`, `${active.filter(r => fitsAge(r, i)).length} printables`, () => { setAgeIdx(i); next(); }, !active.some(r => fitsAge(r, i)), ageIdx === i))}
          {optionBtn('any-age', '🌈 Any age', 'Show me all ages', () => { setAgeIdx(null); next(); }, false, false)}
        </div></>}
      {step === 1 && <>
        <h2 className="sec-title">What would you like to do today?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginTop: 18 }}>
          {sections.map(sc => optionBtn(sc.id, `${sc.emoji} ${sc.label}`, countFor(sc.id) ? sc.text : 'Coming soon', () => { setSection(sc.id); next(); }, countFor(sc.id) === 0, section === sc.id))}
          {optionBtn('all', '✨ Surprise me', 'Show everything', () => { setSection('all'); next(); })}
        </div></>}
      {step === 2 && <>
        <h2 className="sec-title">Free downloads or premium packs?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginTop: 18 }}>
          {optionBtn('free', '🎁 Free', 'Download right away', () => { setPriceChoice('free'); finish(); })}
          {optionBtn('paid', '⭐ Premium', 'Complete packs', () => { setPriceChoice('paid'); finish(); })}
          {optionBtn('both', '💛 Show both', undefined, () => { setPriceChoice('any'); finish(); })}
        </div></>}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
        {step > 0 && <button type="button" className="btn alt" onClick={() => setStep(step - 1)}>← Back</button>}
        {user && owned.length > 0 && <button type="button" className="btn alt" onClick={showMine}>📥 My purchases</button>}
      </div>
    </section> :
    <div ref={resultsRef} style={{ scrollMarginTop: 80 }}>
      <div className="printables-section-heading" style={{ marginBottom: 12 }}><span className="eyebrow">{mineOnly ? 'YOUR LIBRARY' : 'PICKED FOR YOU'}</span><h2 className="sec-title">{visible.length} printable{visible.length === 1 ? '' : 's'} {mineOnly ? 'purchased' : 'ready for you'}</h2></div>
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
      })}</div> : <div style={{ textAlign: 'center', padding: '48px 20px', borderRadius: 20, background: '#f7f8f3' }}><div style={{ fontSize: 42 }}>🌼</div><h3>Nothing matches just yet</h3><p>Try a different age or activity — new printables are added regularly.</p><button type="button" className="btn gold" onClick={restart}>↺ Answer the questions again</button></div>}
    </div>}
  {basket.length > 0 && !basketOpen && !checkoutItems && <div style={{ position: 'fixed', left: 0, right: 0, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 74px)', display: 'flex', justifyContent: 'center', zIndex: 40, pointerEvents: 'none' }}>
    <button type="button" className="btn gold pr-basket-bar" onClick={() => setBasketOpen(true)}>🧺 Basket ({basket.length}) · ₹{basketTotal.toFixed(0)} — Review & checkout</button>
  </div>}
  {basketOpen && <div className="modal-overlay" onClick={() => setBasketOpen(false)}>
    <div className="modal-content" role="dialog" aria-label="Your basket" style={{ maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
      <button className="close-modal-btn" onClick={() => setBasketOpen(false)}>✕</button>
      <h2 style={{ fontSize: 24, marginBottom: 4, color: 'var(--ink)' }}>🧺 Your basket</h2>
      <p style={{ color: '#5c6472', fontSize: 14, margin: '0 0 14px' }}>Check everything you’ve selected before you pay.</p>
      {basket.length ? <>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
          {basket.map(r => { const meta = sections.find(x => x.id === r.section); return <li key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, border: '1px solid #e5e9e1', borderRadius: 14 }}>
            <div style={{ width: 52, flex: 'none', aspectRatio: '1 / 1.414', borderRadius: 8, overflow: 'hidden', background: '#edf7f0', display: 'grid', placeItems: 'center', fontSize: 26 }}>{r.thumbnailUrl ? <img src={asset(r.thumbnailUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : meta?.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}><strong style={{ display: 'block', color: '#214c3d', lineHeight: 1.3 }}>{r.title}</strong><small style={{ color: '#68756c' }}>{meta?.label} · Ages {r.minAge}–{r.maxAge}</small></div>
            <div style={{ textAlign: 'right' }}><strong>₹{r.price.toFixed(0)}</strong><button type="button" onClick={() => setBasketIds(b => b.filter(x => x !== r.id))} style={{ display: 'block', background: 'none', border: 0, color: '#b3261e', fontWeight: 700, fontSize: 12, cursor: 'pointer', padding: '4px 0 0', marginLeft: 'auto' }}>Remove</button></div>
          </li>; })}
        </ul>
        <p style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18, margin: '16px 0 4px' }}><span>Total ({basket.length} item{basket.length === 1 ? '' : 's'})</span><span>₹{basketTotal.toFixed(0)}</span></p>
        <p style={{ color: '#5c6472', fontSize: 12, margin: '0 0 14px' }}>Digital PDFs · no shipping · pay securely with PayPal in your choice of currency.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn gold" style={{ flex: 1, minWidth: 160 }} onClick={() => { if (!user) { setBasketOpen(false); needLogin(); return; } setBasketOpen(false); setCheckoutItems(basket); }}>Checkout · ₹{basketTotal.toFixed(0)}</button>
          <button type="button" className="btn alt" onClick={() => setBasketOpen(false)}>Keep browsing</button>
        </div>
        {!user && <p style={{ fontSize: 12, color: '#5c6472', marginTop: 10 }}>You’ll be asked to sign in first. Your basket is saved.</p>}
      </> : <p style={{ textAlign: 'center', padding: '24px 0' }}>Your basket is empty. Tap “Add to basket” on any printable.</p>}
    </div>
  </div>}
  {checkoutItems && <PrintablePayModal resources={checkoutItems} onClose={() => setCheckoutItems(null)} onPaid={ids => { setOwned(o => [...new Set([...o, ...ids])]); setBasketIds(b => b.filter(x => !ids.includes(x))); }} />}
  </main>;
};
