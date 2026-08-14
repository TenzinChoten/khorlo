import React from 'react';

const Footer = () => {
  return (
    <footer className="footer" style={{ borderTop: '2px solid var(--text-primary)', padding: '2rem 4rem', backgroundColor: 'var(--bg-color)', display: 'flex' }}>
      <div className="footer-brand" style={{ fontWeight: 700, fontSize: '1rem', flex: 1, textTransform: 'lowercase' }} >
        <span>built by tibetans. built for tibetans.</span>
      </div>
      
      <div className="footer-links" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', flex: 1, justifyContent: 'center', fontWeight: 600, textTransform: 'lowercase' }}>
        <a href="#" className="nav-link" style={{ color: 'var(--text-primary)' }}>terms of service</a>
        <a href="#" className="nav-link" style={{ color: 'var(--text-primary)' }}>privacy policy</a>
        <a href="#" className="nav-link" style={{ color: 'var(--text-primary)' }}>contact</a>
      </div>
      
      <div className="footer-copyright" style={{ fontWeight: 700, fontSize: '1rem', flex: 1, textAlign: 'right', textTransform: 'lowercase' }}>
        <span>&copy; {new Date().getFullYear()} khorlo inc.</span>
      </div>
    </footer>
  );
};

export default Footer;
