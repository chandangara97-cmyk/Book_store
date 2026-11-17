import { asset } from '../utils/images';
import React from 'react';

export const Footer: React.FC = () => (
  <footer className="footer kb-love-footer">
    <div className="kb-love-inner">
      <img src={asset('/img/kiddie-bloom-logo-sm.png')} alt="Kiddie Bloom logo" width="56" height="56" />
      <p className="kb-love-kicker">Little hands · Big dreams</p>
      <h2>Every page you print is a tiny step towards a big adventure.</h2>
      <p className="kb-love-msg">Thank you for letting Kiddie Bloom be a part of your child's learning journey. May these pages bring curiosity, colour and a lot of giggles into your home — today and every day.</p>
      <p className="kb-love-sign">With love, Team Kiddie Bloom 🌼</p>
      <div className="kb-love-bottom"><span>READ · PLAY · GROW</span><span>&copy; {new Date().getFullYear()} Kiddie Bloom. All rights reserved.</span></div>
    </div>
  </footer>
);
