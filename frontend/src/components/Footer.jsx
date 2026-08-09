import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-brand" style={{ fontWeight: 600, fontSize: '0.875rem', flex: 1 }} >
        <span className="gradient-text">Build by Tibetan, Build for Tibetan</span>
      </div>
      
      <div className="footer-links" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        <a href="#" className="nav-link">Terms of Service</a>
        <a href="#" className="nav-link">Privacy Policy</a>
        <a href="#" className="nav-link">Contact</a>
      </div>
      
      <div className="footer-copyright" style={{ fontWeight: 600, fontSize: '0.875rem', flex: 1 }}>
        <span className="gradient-text">&copy; {new Date().getFullYear()} Khorlo Inc.</span>
      </div>
    </footer>
  );
};

export default Footer;
