import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div style={{ fontWeight: 600, fontSize: '0.875rem', flex: 1 }} className="gradient-text">
        Build by Tibetan, Build for Tibetan
      </div>
      
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        <a href="#" className="nav-link">Terms of Service</a>
        <a href="#" className="nav-link">Privacy Policy</a>
        <a href="#" className="nav-link">Contact</a>
      </div>
      
      <div style={{ fontSize: '0.875rem', flex: 1, textAlign: 'right' }}>
        &copy; {new Date().getFullYear()} Khorlo Inc.
      </div>
    </footer>
  );
};

export default Footer;
