import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { LearningResource, LearningSection } from '../types';
import { PrintablePayModal } from '../components/PrintablePayModal';
import { downloadPrintable, loadOwnedPrintables } from '../printablesApi';
import { asset } from '../utils/images';

type AgeOption = { minAge: number; maxAge: number; label: string };
type CategoryOption = { id: LearningSection; label: string; emoji: string };

// Labels only decorate categories returned by the live Kiddie Bloom catalogue.
// The list of visible categories is always derived from API/Firebase resources.
const CATEGORY_PRESENTATION: Record<string, { label: string; emoji: string }> = {
  worksheet: { label: 'Worksheets', emoji: '✏️' },
  activity: { label: 'Activities', emoji: '🎨' },
  puzzle: { label: 'Puzzles', emoji: '🧩' },
  'cut-and-paste': { label: 'Cut & Paste', emoji: '✂️' },
  coloring: { label: 'Coloring', emoji: '🖍️' },
};

const CoverArt: React.FC<{ resource: LearningResource; emoji: string }> = ({ resource, emoji }) => {
  const sources = [resource.thumbnailUrl, `/img/printables/covers/${resource.id}.jpg`].filter((x): x is string => !!x);
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [resource.id, resource.thumbnailUrl]);
  if (index >= sources.length) return <span aria-hidden style={{ fontSize: 64 }}>{emoji}</span>;
  return <img src={asset(sources[index])} alt={`${resource.title} cover`} loading="lazy" onError={() => setIndex(value => value + 1)} />;
};

export const LearningView: React.FC = () => {
  const { learningResources, user, setView, showToast } = useStore();
  const [owned, setOwned] = useState<string[]>([]);
  const [basketOpen, setBasketOpen] = useState(false);
  const [basketIds, setBasketIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('kbPrintableBasket') || '[]'); }
    catch { return []; }
  });
  const [busy, setBusy] = useState('');
  const [selectedAge, setSelectedAge] = useState<AgeOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LearningSection | null>(null);
  const [query, setQuery] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { localStorage.setItem('kbPrintableBasket', JSON.stringify(basketIds)); }
    catch { /* local storage is optional */ }
  }, [basketIds]);

  useEffect(() => {
    if (user) loadOwnedPrintables().then(setOwned).catch(() => setOwned([]));
    else setOwned([]);
  }, [user?.email]);

  const activeResources = useMemo(
    () => learningResources.filter(resource => resource.active !== false),
    [learningResources]
  );

  // Age options are generated only from age ranges present in the fetched catalogue.
  const ageOptions = useMemo<AgeOption[]>(() => {
    const unique = new Map<string, AgeOption>();
    activeResources.forEach(resource => {
      const minAge = Number(resource.minAge);
      const maxAge = Number(resource.maxAge);
      if (!Number.isFinite(minAge) || !Number.isFinite(maxAge) || minAge < 0 || maxAge < minAge) return;
      const key = `${minAge}-${maxAge}`;
      if (!unique.has(key)) unique.set(key, { minAge, maxAge, label: `Ages ${minAge}–${maxAge}` });
    });
    return [...unique.values()].sort((a, b) => a.minAge - b.minAge || a.maxAge - b.maxAge);
  }, [activeResources]);

  const matchesAge = (resource: LearningResource, age: AgeOption) =>
    Number(resource.minAge) <= age.maxAge && Number(resource.maxAge) >= age.minAge;

  // Categories are generated only from resources available for the selected age.
  const categoryOptions = useMemo<CategoryOption[]>(() => {
    if (!selectedAge) return [];
    const present = new Set(
      activeResources
        .filter(resource => matchesAge(resource, selectedAge))
        .map(resource => resource.section)
    );
    return [...present].map(section => ({
      id: section,
      label: CATEGORY_PRESENTATION[section]?.label || String(section).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      emoji: CATEGORY_PRESENTATION[section]?.emoji || '📄',
    }));
  }, [activeResources, selectedAge]);

  const visibleResources = useMemo(() => {
    if (!selectedAge || !selectedCategory) return [];
    return activeResources.filter(resource =>
      resource.section === selectedCategory &&
      matchesAge(resource, selectedAge) &&
      `${resource.title} ${resource.description}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [activeResources, selectedAge, selectedCategory, query]);

  const basket = useMemo(
    () => basketIds.map(id => activeResources.find(resource => resource.id === id))
      .filter((resource): resource is LearningResource => !!resource && resource.price > 0 && !owned.includes(resource.id)),
    [basketIds, activeResources, owned]
  );
  const basketTotal = basket.reduce((total, resource) => total + resource.price, 0);

  const selectAge = (age: AgeOption) => {
    setSelectedAge(age);
    setSelectedCategory(null);
    setQuery('');
  };
  const resetSelection = () => {
    setSelectedAge(null);
    setSelectedCategory(null);
    setQuery('');
  };
  const needLogin = () => {
    showToast('Please sign in to buy or download printables.');
    setView('auth');
  };
  const download = async (resource: LearningResource) => {
    if (resource.pdfUrl && resource.price <= 0) {
      window.open(resource.pdfUrl, '_blank', 'noopener');
      return;
    }
    if (!user) return needLogin();
    setBusy(resource.id);
    try { await downloadPrintable(resource.id, resource.title); }
    catch (error) { showToast(error instanceof Error ? error.message : 'Download failed'); }
    finally { setBusy(''); }
  };
  const toggleBasket = (resource: LearningResource) => {
    const exists = basketIds.includes(resource.id);
    setBasketIds(current => exists ? current.filter(id => id !== resource.id) : [...current, resource.id]);
    showToast(exists ? `${resource.title} removed from basket` : `${resource.title} added to basket`);
  };

  useEffect(() => {
    if (selectedCategory) resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedCategory]);

  return (
    <main className="wrap printables-page" style={{ paddingTop: 24, paddingBottom: basket.length ? 150 : 64 }}>
      {!activeResources.length ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', borderRadius: 20, background: '#f7f8f3' }}>
          <h2>No printables available</h2>
          <p>There are currently no active PDFs in the Kiddie Bloom catalogue.</p>
        </div>
      ) : !selectedAge ? (
        <section aria-labelledby="age-heading" style={{ maxWidth: 820, margin: '24px auto', padding: 'clamp(20px,4vw,36px)', borderRadius: 24, background: 'white', border: '1px solid #e5e9e1', boxShadow: '0 10px 30px #264b3712', textAlign: 'center' }}>
          <span className="eyebrow">STEP 1</span>
          <h1 id="age-heading" className="sec-title">Select age group</h1>
          <p>Choose the age range for the learning PDFs you want to explore.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginTop: 22 }}>
            {ageOptions.map(age => (
              <button key={`${age.minAge}-${age.maxAge}`} type="button" className="btn alt" onClick={() => selectAge(age)} style={{ minHeight: 76, borderRadius: 16, fontWeight: 800 }}>
                {age.label}
                <small style={{ display: 'block', fontWeight: 600 }}>{activeResources.filter(resource => matchesAge(resource, age)).length} PDFs</small>
              </button>
            ))}
          </div>
        </section>
      ) : !selectedCategory ? (
        <section aria-labelledby="category-heading" style={{ maxWidth: 820, margin: '24px auto', padding: 'clamp(20px,4vw,36px)', borderRadius: 24, background: 'white', border: '1px solid #e5e9e1', boxShadow: '0 10px 30px #264b3712', textAlign: 'center' }}>
          <span className="eyebrow">STEP 2 · {selectedAge.label}</span>
          <h1 id="category-heading" className="sec-title">Select category</h1>
          <p>Only categories containing PDFs for this age group are shown.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginTop: 22 }}>
            {categoryOptions.map(category => {
              const count = activeResources.filter(resource => resource.section === category.id && matchesAge(resource, selectedAge)).length;
              return (
                <button key={category.id} type="button" className="btn alt" onClick={() => setSelectedCategory(category.id)} style={{ minHeight: 82, borderRadius: 16, fontWeight: 800 }}>
                  <span style={{ fontSize: 23 }}>{category.emoji}</span>
                  {category.label}
                  <small style={{ display: 'block', fontWeight: 600 }}>{count} PDFs</small>
                </button>
              );
            })}
          </div>
          {!categoryOptions.length && <p>No categories have PDFs for this age group.</p>}
          <button type="button" className="btn alt" onClick={resetSelection} style={{ marginTop: 20 }}>← Change age group</button>
        </section>
      ) : (
        <div ref={resultsRef} style={{ scrollMarginTop: 80 }}>
          <div className="printables-section-heading" style={{ marginBottom: 12 }}>
            <span className="eyebrow">{selectedAge.label} · {CATEGORY_PRESENTATION[selectedCategory]?.label || selectedCategory}</span>
            <h1 className="sec-title">{visibleResources.length} matching PDF{visibleResources.length === 1 ? '' : 's'}</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <button type="button" className="btn alt" onClick={() => { setSelectedCategory(null); setQuery(''); }}>Change category</button>
              <button type="button" className="btn alt" onClick={resetSelection}>Change age group</button>
            </div>
          </div>
          <div className="pr-toolbar">
            <input className="pr-search" type="search" aria-label="Search matching PDFs" placeholder="Search these PDFs…" value={query} onChange={event => setQuery(event.target.value)} />
          </div>
          {visibleResources.length ? (
            <div className="printables-grid">
              {visibleResources.map(resource => {
                const category = CATEGORY_PRESENTATION[resource.section] || { label: String(resource.section), emoji: '📄' };
                const inBasket = basketIds.includes(resource.id);
                const isOwned = owned.includes(resource.id);
                return (
                  <article className={`printable-card${inBasket ? ' in-basket' : ''}`} key={resource.id}>
                    <div className="printable-card-art">
                      <CoverArt resource={resource} emoji={category.emoji} />
                      <span className="pc-badge">PDF · Instant access</span>
                    </div>
                    <div className="pc-body">
                      <small className="pc-meta">{category.label} · Ages {resource.minAge}–{resource.maxAge}</small>
                      <h2 className="pc-title">{resource.title}</h2>
                      <p className="pc-desc">{resource.description}</p>
                      <div className="pc-foot">
                        <strong className="pc-price">{resource.price > 0 ? `₹${resource.price.toFixed(0)}` : 'Free'}</strong>
                        {resource.price > 0 && !isOwned ? (
                          <button className={`btn ${inBasket ? 'alt' : 'gold'}`} onClick={() => toggleBasket(resource)} aria-label={inBasket ? `Remove ${resource.title} from basket` : `Add ${resource.title} to basket`}>
                            {inBasket ? '✓ In basket' : '🧺 Add'}
                          </button>
                        ) : resource.price > 0 ? (
                          <span className="pc-owned">✓ Purchased</span>
                        ) : (
                          <button className="btn gold" disabled={busy === resource.id} onClick={() => download(resource)}>
                            {busy === resource.id ? 'Preparing…' : 'Download ⬇'}
                          </button>
                        )}
                      </div>
                      {inBasket && resource.price > 0 && !isOwned && <button type="button" className="pc-remove" onClick={() => toggleBasket(resource)}>Remove from basket</button>}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '42px 20px', borderRadius: 20, background: '#f7f8f3' }}>
              <h2>No matching PDFs found</h2>
              <p>Try another search or select a different category.</p>
              <button type="button" className="btn gold" onClick={() => { setQuery(''); setSelectedCategory(null); }}>Choose another category</button>
            </div>
          )}
        </div>
      )}

      {basket.length > 0 && !basketOpen && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 74px)', display: 'flex', justifyContent: 'center', zIndex: 40, pointerEvents: 'none' }}>
          <button type="button" className="btn gold pr-basket-bar" onClick={() => setBasketOpen(true)}>🧺 Basket ({basket.length}) · ₹{basketTotal.toFixed(0)} — Review & checkout</button>
        </div>
      )}

      {basketOpen && (
        <PrintablePayModal
          resources={basket}
          isLoggedIn={!!user}
          onNeedLogin={() => { setBasketOpen(false); needLogin(); }}
          onClose={() => setBasketOpen(false)}
          onRemove={id => setBasketIds(current => current.filter(itemId => itemId !== id))}
          renderThumb={resource => resource.thumbnailUrl ? <img src={asset(resource.thumbnailUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <>{CATEGORY_PRESENTATION[resource.section]?.emoji || '📄'}</>}
          getSubtitle={resource => `${CATEGORY_PRESENTATION[resource.section]?.label || resource.section} · Ages ${resource.minAge}–${resource.maxAge}`}
          onPaid={ids => {
            setOwned(current => [...new Set([...current, ...ids])]);
            setBasketIds(current => current.filter(id => !ids.includes(id)));
          }}
        />
      )}
    </main>
  );
};
