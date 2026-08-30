import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <span>built by tibetans. built for tibetans.</span>
      </div>
      
      <div className="footer-links">
        <Link to="/terms" className="nav-link">terms of service</Link>
        <Link to="/privacy" className="nav-link">privacy policy</Link>
        <Link to="/contact" className="nav-link">contact</Link>
      </div>
      
      <div className="footer-copyright">
        <span>&copy; {new Date().getFullYear()} khorlo inc.</span>
      </div>
    </footer>
  );
};

export default Footer;
