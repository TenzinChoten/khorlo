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
    <nav className="navbar">
      <Link to="/" onClick={handleLogoClick} className="nav-brand-link">
        <img src="/logo.png" alt="Khorlo Logo" className="nav-logo-img" />
        <span className="nav-logo-text">khorlo<br/>network</span>
      </Link>
      
      <div className="nav-links">
        <a href="#features" onClick={(e) => handleNav(e, '#features')} className="nav-link">features</a>
        <a href="#pricing" onClick={(e) => handleNav(e, '#pricing')} className="nav-link">pricing</a>
        <a href="#about" onClick={(e) => handleNav(e, '#about')} className="nav-link">who we are</a>
      </div>
      
      <div className="nav-actions">
        <Link to="/faq" className="btn btn-outline nav-btn">
          <MessageSquare size={14} strokeWidth={2.5} />
          <span className="nav-btn-text">faqs</span>
        </Link>
        {/* [Reason] Preserve post-auth campaign return while keeping the pulled navbar styles */}
        <Link to={`/login${authQuery}`} className="btn btn-outline nav-btn">
          <LogIn size={14} strokeWidth={2.5} />
          <span className="nav-btn-text">log in</span>
        </Link>
        <Link to={`/register${authQuery}`} className="btn btn-primary nav-btn">
          <span className="nav-btn-text">sign up</span> <ArrowUpRight size={14} strokeWidth={3} className="nav-btn-icon" />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
