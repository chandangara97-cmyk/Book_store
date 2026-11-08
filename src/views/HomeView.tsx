import React from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from '../components/BookCard';
import { asset } from '../utils/images';
import { BookOpen, Puzzle, Palette, Gift, ArrowRight, Sparkles, Heart, Truck, ShieldCheck } from 'lucide-react';

const collections = [
  { title: 'Storybook shop', copy: 'Bedtime favourites and stories to treasure.', icon: BookOpen, tone: 'rose', view: 'library' },
  { title: 'Play & discover', copy: 'Toys, puzzles and creative little adventures.', icon: Puzzle, tone: 'sage', view: 'toys' },
  { title: 'Learning studio', copy: 'Printables made for curious growing minds.', icon: Palette, tone: 'lilac', view: 'printables' },
  { title: 'Gifts with meaning', copy: 'Find a thoughtful surprise for every age.', icon: Gift, tone: 'peach', view: 'gifts' },
];

export const HomeView: React.FC = () => {
  const { books, toys, setView, setSelectedCategory } = useStore();
  const featuredBooks = books.slice(0, 4);
  const featuredToys = toys.slice(0, 3);
  const go = (view: string) => { setSelectedCategory('all'); setView(view); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return <main className="kb-home">
    <section className="kb-hero-wrap">
      <div className="kb-home-hero">
        <div className="kb-hero-copy">
          <span className="kb-eyebrow"><Sparkles size={15}/> A little wonder in every day</span>
          <h1>Growing curious minds, <em>one little joy</em> at a time.</h1>
          <p>Stories to get lost in, playful things to explore and joyful learning made for the wonderful way children grow.</p>
          <div className="kb-hero-buttons"><button className="kb-primary-btn" onClick={() => go('library')}>Explore the shop <ArrowRight size={17}/></button><button className="kb-text-btn" onClick={() => go('printables')}>Visit the learning studio</button></div>
          <div className="kb-hero-proof"><span><Heart size={15}/> Made for little learners</span><span><ShieldCheck size={15}/> Parent-friendly shopping</span></div>
        </div>
        <div className="kb-hero-art"><img src={asset('/img/kiddie-bloom-hero.jpg')} alt="Kiddie Bloom's friendly animal characters surrounded by books and art supplies"/><div className="kb-floating-note"><span>✦</span><strong>Read. Play. Bloom.</strong><small>Little moments matter.</small></div></div>
      </div>
      <div className="kb-trust-strip"><span><Truck size={17}/> Thoughtful delivery</span><i/><span><ShieldCheck size={17}/> Secure checkout</span><i/><span><Heart size={17}/> Gifts picked with care</span></div>
    </section>

    <section className="kb-collection-section wrap">
      <div className="kb-section-heading"><div><span className="kb-eyebrow">Find your happy place</span><h2>Little worlds to explore</h2><p>Everything they need to imagine, make and discover.</p></div></div>
      <div className="kb-collection-grid">{collections.map(({title,copy,icon:Icon,tone,view}) => <button key={view} className={`kb-collection-card ${tone}`} onClick={() => go(view)}><span className="kb-collection-icon"><Icon size={25}/></span><span className="kb-collection-title">{title}</span><span className="kb-collection-copy">{copy}</span><span className="kb-collection-link">Explore <ArrowRight size={15}/></span></button>)}</div>
    </section>

    <section className="kb-featured-section"><div className="wrap"><div className="kb-section-heading kb-heading-row"><div><span className="kb-eyebrow">Handpicked for storytime</span><h2>Books they'll ask for again</h2><p>Lovely reads for bedtime, playtime and everything in between.</p></div><button className="kb-outline-btn" onClick={() => go('library')}>Shop all books <ArrowRight size={16}/></button></div><div className="kb-featured-grid">{featuredBooks.map(book => <BookCard key={book.id} book={book}/>)}</div></div></section>

    <section className="kb-learning-feature wrap"><div className="kb-learning-art"><img src={asset('/img/kiddie-bloom-banner.jpg')} alt="Colourful Kiddie Bloom learning characters and creative supplies"/></div><div className="kb-learning-copy"><span className="kb-eyebrow"><Sparkles size={14}/> Kiddie Bloom Learning Studio</span><h2>Make learning feel like play.</h2><p>Explore printable worksheets, activities, puzzles, cut-and-paste projects and colouring pages — thoughtfully grouped to help children learn at their own pace.</p><div className="kb-learning-tags"><span>Worksheets</span><span>Activities</span><span>Puzzles</span><span>Colouring</span></div><button className="kb-primary-btn" onClick={() => go('printables')}>Explore printables <ArrowRight size={17}/></button></div></section>

    {featuredToys.length > 0 && <section className="kb-toy-section"><div className="wrap"><div className="kb-section-heading kb-heading-row"><div><span className="kb-eyebrow">A little extra magic</span><h2>Playful picks & happy gifts</h2><p>Bring a story to life with something they can hold, build or create.</p></div><button className="kb-outline-btn" onClick={() => go('toys')}>Explore toys <ArrowRight size={16}/></button></div><div className="kb-featured-grid">{featuredToys.map(toy => <BookCard key={toy.id} book={toy}/>)}</div></div></section>}

    <section className="kb-age-band wrap"><div><span className="kb-eyebrow">A perfect fit for every stage</span><h2>What are they curious about today?</h2><p>Find a thoughtful starting point for every little personality.</p></div><div className="kb-age-options">{[{age:'0–3',name:'First discoveries',tone:'rose'},{age:'4–7',name:'Little learners',tone:'sage'},{age:'8–12',name:'Big questions',tone:'lilac'},{age:'13–15',name:'Growing minds',tone:'peach'}].map((a,i)=><button key={a.age} className={`kb-age-card ${a.tone}`} onClick={() => go(i===0||i===1?'library':'printables')}><strong>{a.age}</strong><span>{a.name}</span><ArrowRight size={15}/></button>)}</div></section>

    <section className="kb-gift-cta"><div className="wrap kb-gift-inner"><div><span className="kb-eyebrow">For birthdays, milestones & just-because days</span><h2>Give a gift that keeps their imagination growing.</h2><p>Answer a few simple questions and discover a thoughtful pick they'll love.</p></div><button className="kb-primary-btn" onClick={() => go('gifts')}>Find a gift <Gift size={17}/></button></div></section>
  </main>;
};
