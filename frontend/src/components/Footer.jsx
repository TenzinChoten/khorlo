import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div style={{ marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.25rem' }} className="gradient-text">
        Khorlo
      </div>
      <p style={{ maxWidth: '400px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
        Connecting exceptional brands with authentic creators. Elevate your influencer marketing today.
      </p>
      
      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '2rem' }}>
        <a href="#" className="nav-link">Terms of Service</a>
        <a href="#" className="nav-link">Privacy Policy</a>
        <a href="#" className="nav-link">Contact</a>
      </div>
      
      <p style={{ fontSize: '0.875rem' }}>
        &copy; {new Date().getFullYear()} Khorlo Inc. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
