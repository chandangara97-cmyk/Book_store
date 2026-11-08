import React from 'react';
import { useStore } from '../context/StoreContext';
import { asset } from '../utils/images';
import { Sparkles, ArrowRight } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { setView, setSelectedCategory } = useStore();

  const openPrintables = () => {
    setSelectedCategory('all');
    setView('printables');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="kb-home">
      <section className="kb-learning-feature wrap" aria-labelledby="learning-studio-title">
        <div className="kb-learning-art">
          <img
            src={asset('/img/kiddie-bloom-banner.jpg')}
            alt="Kiddie Bloom learning characters and creative supplies"
            fetchPriority="high"
          />
        </div>

        <div className="kb-learning-copy">
          <span className="kb-eyebrow">
            <Sparkles size={14} /> Kiddie Bloom Learning Studio
          </span>
          <h1 id="learning-studio-title">Make learning feel like play.</h1>
          <p>
            Explore printable worksheets, activities, puzzles, cut-and-paste
            projects and colouring pages — thoughtfully grouped to help
            children learn at their own pace.
          </p>

          <div className="kb-learning-tags">
            <span>Worksheets</span>
            <span>Activities</span>
            <span>Puzzles</span>
            <span>Colouring</span>
          </div>

          <button className="kb-primary-btn" onClick={openPrintables}>
            Explore printables <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </main>
  );
};
