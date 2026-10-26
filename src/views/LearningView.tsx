import React, { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { LearningSection } from '../types';

const sections: { id: LearningSection; label: string; emoji: string; text: string }[] = [
  { id: 'worksheet', label: 'Worksheets', emoji: '✏️', text: 'Build skills one little step at a time.' },
  { id: 'activity', label: 'Activities', emoji: '🎨', text: 'Hands-on ideas for curious minds.' },
  { id: 'puzzle', label: 'Puzzles', emoji: '🧩', text: 'Think, match, spot and solve.' },
  { id: 'cut-and-paste', label: 'Cut & Paste', emoji: '✂️', text: 'Create, sort and assemble.' },
  { id: 'coloring', label: 'Coloring', emoji: '🖍️', text: 'Big ideas, bright colors.' },
];
const ageBands = [{ label: 'All ages', min: 0, max: 99 }, { label: 'Ages 2–3', min: 2, max: 3 }, { label: 'Ages 4–5', min: 4, max: 5 }, { label: 'Ages 6–8', min: 6, max: 8 }, { label: 'Ages 9–12', min: 9, max: 12 }, { label: 'Ages 13–15', min: 13, max: 15 }];
export const LearningView: React.FC = () => {
  const { learningResources } = useStore();
  const [section, setSection] = useState<LearningSection | 'all'>('all');
  const [ageBand, setAgeBand] = useState(0);
  const [query, setQuery] = useState('');
  const visible = useMemo(() => learningResources.filter(r => r.active !== false && (section === 'all' || r.section === section) && r.minAge <= ageBands[ageBand].max && r.maxAge >= ageBands[ageBand].min && `${r.title} ${r.description}`.toLowerCase().includes(query.toLowerCase())), [learningResources, section, ageBand, query]);
  return <main className="wrap" style={{ paddingTop: 32, paddingBottom: 64 }}>
    <section style={{ borderRadius: 28, padding: 'clamp(24px,5vw,54px)', background: 'linear-gradient(120deg,#fff4e6,#f2f8ee 65%,#e8f4ff)', marginBottom: 30 }}>
      <span style={{ color: '#a66a32', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' }}>Kiddie Bloom Printables</span>
      <h1 style={{ fontFamily: 'var(--serif)', color: '#214c3d', fontSize: 'clamp(34px,5vw,54px)', margin: '10px 0' }}>Little hands. Big discoveries.</h1>
      <p style={{ maxWidth: 660, lineHeight: 1.7 }}>Find printable worksheets, playful activities, puzzles, cut-and-paste projects and coloring pages, all organised by your child’s age.</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}><span className="pill">📄 Instant printable PDFs</span><span className="pill">🌱 Age-friendly learning</span><span className="pill">💛 Learn through play</span></div>
    </section>
    <h2 className="sec-title">Choose a fun section</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, margin: '18px 0 28px' }}>
      <button className={`btn ${section === 'all' ? 'gold' : 'alt'}`} onClick={() => setSection('all')}>✨ All printables</button>
      {sections.map(s => <button key={s.id} className={`btn ${section === s.id ? 'gold' : 'alt'}`} onClick={() => setSection(s.id)}>{s.emoji} {s.label}</button>)}
    </div>
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><label htmlFor="printable-age" style={{ alignSelf: 'center', fontWeight: 700 }}>Child’s age</label><select id="printable-age" value={ageBand} onChange={e => setAgeBand(Number(e.target.value))} style={{ padding: '11px 14px', borderRadius: 12, border: '1px solid #d7dfd5', background: 'white' }}>{ageBands.map((a, i) => <option key={a.label} value={i}>{a.label}</option>)}</select></div>
      <input aria-label="Search printables" placeholder="Search activities…" value={query} onChange={e => setQuery(e.target.value)} style={{ padding: '12px 15px', borderRadius: 12, border: '1px solid #d7dfd5', minWidth: 220 }} />
    </div>
    {visible.length ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 18 }}>{visible.map(r => { const meta = sections.find(s => s.id === r.section)!; return <article key={r.id} style={{ border: '1px solid #e5e9e1', borderRadius: 20, overflow: 'hidden', background: 'white', boxShadow: '0 8px 24px #264b3710' }}>
      <div style={{ height: 135, background: 'linear-gradient(135deg,#fff2dd,#edf7f0)', display: 'grid', placeItems: 'center', fontSize: 52 }}>{r.thumbnailUrl ? <img src={r.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : meta.emoji}</div>
      <div style={{ padding: 18 }}><small style={{ color: '#a66a32', fontWeight: 800 }}>{meta.label.toUpperCase()} · AGES {r.minAge}–{r.maxAge}</small><h3 style={{ color: '#214c3d', margin: '9px 0' }}>{r.title}</h3><p style={{ color: '#68756c', minHeight: 42 }}>{r.description}</p><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 16 }}><strong>{r.price > 0 ? `₹${r.price.toFixed(0)}` : 'Free'}</strong>{r.price > 0 ? <span style={{ fontSize: 12, color: '#68756c', textAlign: 'right' }}>Purchase access required</span> : <a className="btn gold" href={r.pdfUrl} target="_blank" rel="noreferrer">Open PDF ↗</a>}</div></div>
    </article>; })}</div> : <div style={{ textAlign: 'center', padding: '48px 20px', borderRadius: 20, background: '#f7f8f3' }}><div style={{ fontSize: 42 }}>🌼</div><h3>New discoveries are on the way</h3><p>There are no printables matching these filters yet. Try another age or section.</p></div>}
  </main>;
};
