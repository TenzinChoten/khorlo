import React from 'react';

const Features = () => {
  return (
    <section id="features" className="editorial-section">
      <div className="section-header">
        <h2 className="section-title" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.9 }}>platform<br/>that provides.</h2>
      </div>
      
      <div className="editorial-grid">
        <div className="editorial-card">
          <h3>campaigns.</h3>
          <p>post campaigns seamlessly. set compensation types from paid to free product, and manage budgets efficiently.</p>
        </div>
        
        <div className="editorial-card">
          <h3>opportunities.</h3>
          <p>filter by niches, platforms (instagram, tiktok, youtube), and engagement rate to find your perfect match.</p>
        </div>
        
        <div className="editorial-card">
          <h3>curated connections.</h3>
          <p>built-in messaging and application tracking keeps all your influencer interactions in one organized place.</p>
        </div>
        
        <div className="editorial-card">
          <h3>profits & growth.</h3>
          <p>track performance, engagement rates, and ROI to make data-driven marketing decisions.</p>
        </div>
      </div>
    </section>
  );
};

export default Features;
