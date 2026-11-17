import React from 'react';
import { asset } from '../utils/images';
import { useStore } from '../context/StoreContext';
import { UserRound, Sparkles, Sun, Moon, LayoutDashboard } from 'lucide-react';

export const Header: React.FC = () => {
  const { setView, user, theme, toggleTheme } = useStore();
  const go = (v: string) => { setView(v); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return <>
    <div className="kb-announcement"><Sparkles size={14}/> Little joys, big discoveries <span>·</span> Thoughtful learning for every age</div>
    <header className="header kb-header">
      <div className="kb-header-main">
        <button className="kb-brand" onClick={() => go('home')} aria-label="Kiddie Bloom home">
          <img src={asset('/img/kiddie-bloom-logo-sm.png')} alt="" width="52" height="52" />
          <span><strong>Kiddie Bloom</strong><small>READ · PLAY · GROW</small></span>
        </button>
        <div className="kb-header-actions">
          <button className="kb-action" aria-label="My account" title={user ? 'My account' : 'Sign in'} onClick={() => go('auth')}><UserRound size={19}/></button>
          <button className="kb-action kb-theme-action" aria-label="Toggle theme" onClick={toggleTheme}>{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button>
          {user?.isAdmin && <button className="kb-admin-shortcut" onClick={() => go('admin')}><LayoutDashboard size={16}/> Admin</button>}
        </div>
      </div>
    </header>
  </>;
};
