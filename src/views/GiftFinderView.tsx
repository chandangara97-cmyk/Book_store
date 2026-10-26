import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from '../components/BookCard';
import { Book } from '../types';
import { Gift, ArrowLeft, RotateCcw, Sparkles, User, Heart, Compass, CheckCircle2 } from 'lucide-react';

export const GiftFinderView: React.FC = () => {
  const { books, setView } = useStore();
  const [step, setStep] = useState<number>(1);
  const [who, setWho] = useState<string>('');
  const [interest, setInterest] = useState<string>('');
  const [ageRange, setAgeRange] = useState<string>('');

  const handleSelectWho = (val: string) => {
    setWho(val);
    setStep(2);
  };

  const handleSelectInterest = (val: string) => {
    setInterest(val);
    if (who === 'child' || who === 'teen') {
      setStep(3);
    } else {
      setStep(4); // Results
    }
  };

  const handleSelectAge = (val: string) => {
    setAgeRange(val);
    setStep(4); // Results
  };

  const handleReset = () => {
    setWho('');
    setInterest('');
    setAgeRange('');
    setStep(1);
  };

  const getRecommendations = (): Book[] => {
    if (who === 'child') {
      if (ageRange === '0-3') {
        return books.filter((b) => b.id === 'the-very-hungry-caterpillar' || b.id === 'goodnight-moon' || b.id === 'my-first-words');
      }
      if (ageRange === '4-7') {
        return books.filter((b) => b.id === 'where-the-wild-things-are' || b.id === 'the-gruffalo' || b.id === 'learn-and-play-4-7');
      }
      if (ageRange === '8-12') {
        return books.filter((b) => b.id === 'harry-potter-1' || b.id === 'percy-jackson' || b.id === 'young-inventors-handbook');
      }
      return books.filter((b) => b.category === 'children');
    }

    if (who === 'teen') {
      return books.filter((b) => b.id === 'the-hate-u-give' || b.id === 'the-fault-in-our-stars' || b.id === 'thinking-fast-and-slow');
    }

    if (interest === 'learning') {
      return books.filter((b) => b.id === 'atomic-habits' || b.id === 'deep-work' || b.id === 'the-lean-startup');
    }

    if (interest === 'inspiration') {
      return books.filter((b) => b.id === 'the-alchemist' || b.id === 'becoming');
    }

    if (interest === 'classic') {
      return books.filter((b) => b.id === 'pride-and-prejudice' || b.id === 'little-women');
    }

    return books.filter((b) => b.category === 'gifts' || b.category === 'fiction').slice(0, 4);
  };

  const matchedBooks = getRecommendations();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Return Button */}
      <button
        type="button"
        onClick={() => setView('home')}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Overview</span>
      </button>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 mb-2">
          <Gift className="w-3.5 h-3.5" />
          <span>INTELLIGENT GIFT ENGINE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight text-balance">
          Discover the Ideal Learning Gift
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Calibrate recipient age and cognitive interests to synthesize targeted reading pairings.
        </p>
      </div>

      {/* Interactive Step Container */}
      <div className="rounded-3xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl mb-12">
        
        {/* Step Progress Readout */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-6 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-cyan-300 font-semibold">STAGE {step} OF 3</span>
          </div>
          {step > 1 && (
            <button
              type="button"
              onClick={handleReset}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Engine</span>
            </button>
          )}
        </div>

        {/* Step 1: Who */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-white font-display mb-4">
              1. Who is the recipient of this gift?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'child', label: 'Young Child (0–12 Years)', desc: 'Developing words, phonics & early wonders' },
                { id: 'teen', label: 'Adolescent (13–15 Years)', desc: 'Curiosity, skills & coming of age stories' },
                { id: 'adult', label: 'Adult / Parent', desc: 'Growth, habits & cognitive exploration' },
                { id: 'friend', label: 'Educator or Colleague', desc: 'Inspirational reads & special editions' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectWho(opt.id)}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-400/60 hover:bg-cyan-500/10 text-left transition-all group"
                >
                  <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {opt.label}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Focus / Interest */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-white font-display mb-4">
              2. What learning horizon or interest?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'learning', label: 'STEM, Phonics & Skills', desc: 'Tutorial worksheets, mathematics & science' },
                { id: 'inspiration', label: 'Creativity & Imagination', desc: 'Stories that stretch curiosity and courage' },
                { id: 'classic', label: 'Enduring Literature', desc: 'Beloved bedtime classics & timeless tales' },
                { id: 'any', label: 'Surprise Me', desc: 'Top rated studio favorites' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectInterest(opt.id)}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-400/60 hover:bg-cyan-500/10 text-left transition-all group"
                >
                  <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {opt.label}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Age Band if Child */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-white font-display mb-4">
              3. Select explorer age band:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: '0-3', label: '0 to 3 Years', desc: 'Board books, first words & sensory play' },
                { id: '4-7', label: '4 to 7 Years', desc: 'Phonics, early numbers & bedtime stories' },
                { id: '8-12', label: '8 to 12 Years', desc: 'Problem solving, chapter adventures & science' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectAge(opt.id)}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-400/60 hover:bg-cyan-500/10 text-left transition-all group"
                >
                  <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {opt.label}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Synthesized Recommendations */}
        {step === 4 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-display">
                  Recommended Learning Works
                </h2>
                <p className="text-xs font-mono text-cyan-400 mt-0.5">
                  Calibrated for {who} · {interest || 'All Horizons'} {ageRange ? `· Ages ${ageRange}` : ''}
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors"
              >
                Start Over
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {matchedBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
