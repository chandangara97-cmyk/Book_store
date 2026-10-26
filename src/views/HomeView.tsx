import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { AgeFinder } from '../components/AgeFinder';
import { asset, cleanSrc, imgFallback } from '../utils/images';
import { 
  Sparkles, 
  Sliders, 
  BookOpen, 
  Bot, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Eye, 
  Zap, 
  ShieldCheck, 
  Send,
  X
} from 'lucide-react';

const HERO_IMG = '/src/assets/images/hero_futuristic_book_1793017194843.jpg';
const TOY_IMG = '/src/assets/images/futuristic_learning_toy_1793017195881.jpg';
const TABLET_IMG = '/src/assets/images/digital_holo_tablet_1793017195631.jpg';

export const HomeView: React.FC = () => {
  const { setView, setSelectedCategory, books, setSelectedBook } = useStore();
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [askAge, setAskAge] = useState('');
  const [askTopic, setAskTopic] = useState('');
  const [askSubmitted, setAskSubmitted] = useState(false);

  const featuredBook = books[0] || null;

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAskSubmitted(true);
    setTimeout(() => {
      setAskSubmitted(false);
      setAskModalOpen(false);
      setAskAge('');
      setAskTopic('');
    }, 2200);
  };

  const scrollToAge = (targetAge: number) => {
    const el = document.getElementById('find');
    el?.scrollIntoView({ behavior: 'smooth' });
    // Trigger window event or user intent
  };

  return (
    <main id="main" className="flex flex-col gap-20 sm:gap-28 pb-24 overflow-hidden">
      
      {/* 1. Futuristic Hero Section (1440px presence) */}
      <section id="top" className="relative pt-8 sm:pt-14 lg:pt-18">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 -z-10 w-96 h-96 rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 -z-10 w-96 h-96 rounded-full bg-blue-600/15 blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            {/* Left Column: Vision & Actions */}
            <div className="lg:col-span-7 flex flex-col">
              
              {/* Quiet Section Kicker */}
              <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-cyan-400 mb-4">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                <span>01. QUANTUM LEARNING HORIZONS · AGES 0 TO 15</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-display leading-[1.08] mb-6 text-balance">
                Where Young Minds <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">Bloom</span> Into Tomorrow's Explorers.
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mb-8">
                Hyper-interactive tutorial books, digital holo-scrolls, and hands-on robotics kits designed for every developmental horizon. Step into the future of learning with screen-safe and printed editions.
              </p>

              {/* Primary Actions */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <a
                  href="#find"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('find')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-[0_0_24px_rgba(6,182,212,0.35)] flex items-center gap-2.5 active:scale-98 whitespace-nowrap shrink-0"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Initialize Age Synthesizer</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setView('library');
                  }}
                  className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/40 font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Access Holo-Vault</span>
                </button>
              </div>

              {/* Stage Teleport Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-6 border-t border-slate-800/80">
                <div 
                  onClick={() => scrollToAge(2)}
                  className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group"
                >
                  <div className="text-[10px] font-mono text-cyan-400 font-bold">STAGE 01</div>
                  <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">0 to 3 Years</div>
                  <div className="text-[11px] text-slate-400 truncate">First Words & Play</div>
                </div>

                <div 
                  onClick={() => scrollToAge(5)}
                  className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group"
                >
                  <div className="text-[10px] font-mono text-cyan-400 font-bold">STAGE 02</div>
                  <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">4 to 7 Years</div>
                  <div className="text-[11px] text-slate-400 truncate">Nova Explorers</div>
                </div>

                <div 
                  onClick={() => scrollToAge(10)}
                  className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group"
                >
                  <div className="text-[10px] font-mono text-cyan-400 font-bold">STAGE 03</div>
                  <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">8 to 12 Years</div>
                  <div className="text-[11px] text-slate-400 truncate">Cosmos Scholars</div>
                </div>

                <div 
                  onClick={() => scrollToAge(14)}
                  className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group"
                >
                  <div className="text-[10px] font-mono text-cyan-400 font-bold">STAGE 04</div>
                  <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">13 to 15 Years</div>
                  <div className="text-[11px] text-slate-400 truncate">Quantum Mastery</div>
                </div>
              </div>
            </div>

            {/* Right Column: Holographic Interactive Showcase */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              
              {/* Outer Glowing Cyber HUD Frame */}
              <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] rounded-3xl p-1 bg-gradient-to-br from-cyan-500/30 via-slate-800/40 to-purple-600/30 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                
                <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-slate-950 flex flex-col">
                  
                  {/* Generated High-Fidelity Hologram Visual */}
                  <img 
                    src={HERO_IMG} 
                    alt="Futuristic holographic learning book in advanced library laboratory" 
                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                  />

                  {/* Gradient Overlay for Text Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* HUD Corner Accents */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>HOLO-SYNTHESIS v4</span>
                  </div>

                  {/* Floating Action Badge */}
                  {featuredBook && (
                    <div className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">Featured Hologram</span>
                        <span className="text-sm font-bold text-white truncate font-display">{featuredBook.title}</span>
                        <span className="text-xs text-slate-400">{featuredBook.author}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedBook(featuredBook)}
                        className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Decorative Floating Tech Badge */}
              <div className="hidden sm:flex absolute -bottom-6 -left-6 items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 border border-cyan-500/30 backdrop-blur-xl shadow-2xl">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white">100% Screen-Safe</span>
                  <span className="text-[10px] text-slate-400 font-mono">Pedagogically Verified</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Quantitative Rigor Proof Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight tabular-nums">48+</span>
            <span className="text-xs text-slate-400 mt-0.5">Interactive Holo-Works</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono tracking-tight tabular-nums">0 to 15</span>
            <span className="text-xs text-slate-400 mt-0.5">Years Age Band Range</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-black text-purple-400 font-mono tracking-tight tabular-nums">2 Formats</span>
            <span className="text-xs text-slate-400 mt-0.5">Molecular Print & Digital</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight tabular-nums">8 Currencies</span>
            <span className="text-xs text-slate-400 mt-0.5">Live Indicative Rates</span>
          </div>
        </div>
      </section>

      {/* 3. The Interactive Age Synthesizer Section */}
      <section id="find" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEURAL AGE RADAR</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display text-balance">
            How Old is Your Young Explorer?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3">
            Slide through each stage from infancy to young adult. Curriculum and holographic tutorial scrolls adjust in real time.
          </p>
        </div>

        <AgeFinder />
      </section>

      {/* 4. Dual Format Architecture (Molecular Print vs Quantum Holo-Digital) */}
      <section id="formats" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>DUAL EMISSION ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display text-balance">
            Molecular Hardcover or Holo-Digital Scroll
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3">
            Every learning work is delivered in two distinct formats. Choose physical touch or instant digital teleportation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Printed Edition */}
          <div className="relative group rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-pink-500/40 p-6 sm:p-8 backdrop-blur-xl transition-all shadow-xl hover:shadow-[0_16px_40px_rgba(236,72,153,0.15)] flex flex-col">
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-950 mb-6 border border-slate-800 relative">
              <img 
                src={asset('/img/format-printed.svg')} 
                alt="Molecular printed hardcover book edition" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={imgFallback}
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 text-[10px] font-mono text-pink-300 border border-pink-500/30">
                PHYSICAL ARTIFACT
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-3 font-display">
              Molecular Archival Hardcover
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              A permanent, tactile physical volume designed for screen-free bedtimes, hands-on turning of heavy-gauge paper, and heirloom preservation on your shelf.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300 font-normal mb-8">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <span>Zero blue light emission for calming bedtime routines</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <span>Reinforced binding for curious little toddler fingers</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <span>Doorstep courier delivery with multi-country tracking</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setView('library');
              }}
              className="mt-auto w-full py-3 rounded-xl bg-slate-800/80 hover:bg-pink-600 text-white font-semibold text-xs font-mono transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Printed Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Digital Holo-Scroll (with Generated Image) */}
          <div className="relative group rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 p-6 sm:p-8 backdrop-blur-xl transition-all shadow-xl hover:shadow-[0_16px_40px_rgba(6,182,212,0.15)] flex flex-col">
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-950 mb-6 border border-slate-800 relative">
              <img 
                src={TABLET_IMG} 
                alt="Child reading futuristic interactive digital holographic learning tablet" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                INSTANT NEURAL CLOUD
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-3 font-display">
              Quantum Holo-Digital Scroll
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Instantaneous access across tablets, smartphones, and computers with interactive audio-visual guides, phonics playback, and lightweight portability.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300 font-normal mb-8">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Zero wait time: Instant teleportation to your reading vault</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Lower pricing and zero carbon transport impact</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Read seamlessly across family devices on any journey</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setView('library');
              }}
              className="mt-auto w-full py-3 rounded-xl bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-white font-semibold text-xs font-mono transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Digital eBooks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* 5. STEM Toys & Hands-On Quantum Learning Kits */}
      <section id="toys" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-cyan-950/40 border border-purple-500/20 backdrop-blur-2xl p-8 sm:p-12 overflow-hidden shadow-2xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 flex flex-col">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-purple-400 mb-2">
                <Bot className="w-3.5 h-3.5" />
                <span>HANDS-ON TACTILE LAB</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mb-4 text-balance">
                Stories are Even Better with Quantum Play.
              </h2>
              
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
                Explore programmable robotics kits, constellation blocks, and creative clay sets that turn theoretical concepts into tangible, hands-on discoveries.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setView('toys')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs font-mono transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  <span>Launch Tech Toys Vault</span>
                </button>

                <button
                  type="button"
                  onClick={() => setView('gift-finder')}
                  className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500/40 text-slate-300 text-xs font-mono transition-colors"
                >
                  Find Paired Book + Toy Gifts
                </button>
              </div>
            </div>

            {/* Right: Generated Robotics Image */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl">
                <img 
                  src={TOY_IMG} 
                  alt="Futuristic STEM robotics kit for children" 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute top-3 right-3 px-2 py-1 rounded bg-slate-950/80 text-[10px] font-mono text-purple-300 border border-purple-500/30">
                  STEM CERTIFIED
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Ask an Educator Terminal Trigger Modal */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-8 sm:p-10 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-white font-display">Need Curriculum Guidance?</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Our studio curriculum mentors will recommend the ideal tutorial sequence for your child's exact reading velocity.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAskModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 font-mono text-xs font-semibold transition-all whitespace-nowrap shrink-0"
          >
            Consult Studio Mentors
          </button>
        </div>
      </section>

      {/* Ask Modal */}
      {askModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-cyan-500/30 p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setAskModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white font-display mb-2">Consult Studio Mentors</h3>
            <p className="text-xs text-slate-400 mb-6 font-mono">
              Specify your explorer's age and interest. We will transmit tailored curriculum suggestions.
            </p>

            {askSubmitted ? (
              <div className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
                <CheckCircle2 className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">Transmission Received</h4>
                <p className="text-xs text-slate-400 mt-1">Our educator AI will analyze your telemetry and notify your vault.</p>
              </div>
            ) : (
              <form onSubmit={handleAskSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Explorer Age:</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    required
                    value={askAge}
                    onChange={(e) => setAskAge(e.target.value)}
                    placeholder="e.g. 7"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Learning Focus or Topic:</label>
                  <input
                    type="text"
                    required
                    value={askTopic}
                    onChange={(e) => setAskTopic(e.target.value)}
                    placeholder="e.g. Phonics, Space, Robotics"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold font-mono text-xs hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Query</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </main>
  );
};
