import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (e, hash) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/' + hash);
      // Use instant jump instead of smooth scroll when coming from another page
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) element.scrollIntoView({ behavior: 'auto' });
      }, 100);
    } else {
      const element = document.querySelector(hash);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogoClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar animate-fade-in">
      <Link to="/" onClick={handleLogoClick} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        <img src="/logo.png" alt="Khorlo Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
        <span className="nav-brand gradient-text" style={{ margin: 0, flex: 'none' }}>Khorlo</span>
      </Link>
      <div className="nav-links">
        <a href="#features" onClick={(e) => handleNav(e, '#features')} className="nav-link" style={{ cursor: 'pointer' }}>Features</a>
        <a href="#pricing" onClick={(e) => handleNav(e, '#pricing')} className="nav-link" style={{ cursor: 'pointer' }}>Pricing</a>
        <a href="#about" onClick={(e) => handleNav(e, '#about')} className="nav-link" style={{ cursor: 'pointer' }}>About</a>
      </div>
      <div className="nav-actions">
        <Link to="/login" className="btn btn-outline" style={{ marginRight: '1rem', textDecoration: 'none' }}>Log In</Link>
        <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Sign Up</Link>
      </div>
    </nav>
  );
};

export default Navbar;
