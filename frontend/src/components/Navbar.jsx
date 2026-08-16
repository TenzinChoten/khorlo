import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowUpRight, MessageSquare, LogIn } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (e, hash) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/' + hash);
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) element.scrollIntoView({ behavior: 'auto' });
      }, 100);
    } else {
      const element = document.querySelector(hash);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // [Reason] Keep the current public campaign in the auth return path when signing in from this page
  const campaignMatch = location.pathname.match(/^\/campaigns\/[^/]+$/);
  const authQuery = campaignMatch ? `?redirect=${encodeURIComponent(location.pathname)}` : '';

  const handleLogoClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar" style={{ padding: '1rem 4rem', backgroundColor: 'var(--bg-color)' }}>
      <Link to="/" onClick={handleLogoClick} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        <img src="/logo.png" alt="Khorlo Logo" style={{ width: '48px', height: '48px', objectFit: 'contain', filter: 'brightness(0)' }} />
        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.04em', textTransform: 'lowercase', color: 'var(--text-primary)', lineHeight: 1 }}>khorlo<br/>network</span>
      </Link>
      
      <div className="nav-links" style={{ gap: '3rem', fontSize: '1.1rem', fontWeight: 600, textTransform: 'lowercase' }}>
        <a href="#features" onClick={(e) => handleNav(e, '#features')} className="nav-link" style={{ cursor: 'pointer', color: 'var(--text-primary)' }}>features</a>
        <a href="#pricing" onClick={(e) => handleNav(e, '#pricing')} className="nav-link" style={{ cursor: 'pointer', color: 'var(--text-primary)' }}>pricing</a>
        <a href="#about" onClick={(e) => handleNav(e, '#about')} className="nav-link" style={{ cursor: 'pointer', color: 'var(--text-primary)' }}>who we are</a>
      </div>
      
      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/faq" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.75rem', textDecoration: 'none', padding: '0.4rem 0.8rem', fontSize: '0.85rem', border: 'none' }}>
          <MessageSquare size={14} strokeWidth={2.5} />
          faqs
        </Link>
        {/* [Reason] Preserve post-auth campaign return while keeping the pulled navbar styles */}
        <Link to={`/login${authQuery}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.75rem', textDecoration: 'none', padding: '0.4rem 0.8rem', fontSize: '0.85rem', border: 'none' }}>
          <LogIn size={14} strokeWidth={2.5} />
          log in
        </Link>
        <Link to={`/register${authQuery}`} className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
          sign up <ArrowUpRight size={14} strokeWidth={3} style={{ marginLeft: '4px' }} />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
