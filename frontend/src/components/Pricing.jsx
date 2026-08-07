import React, { useEffect, useRef } from 'react';

const Pricing = () => {
  const observerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            entry.target.style.opacity = '1';
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('.pricing-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" className="pricing">
      <h2 className="section-title">Plans for Every Brand</h2>
      
      <div className="pricing-grid">
        <div className="pricing-card glass-panel" style={{ opacity: 0 }}>
          <h3 className="bento-title">Starter</h3>
          <div className="price">$49<span>/mo</span></div>
          <p className="bento-desc">Perfect for small brands just getting started with influencer marketing.</p>
          
          <ul className="pricing-features">
            <li>Up to 3 Active Campaigns</li>
            <li>Basic Creator Search</li>
            <li>Standard Messaging (100 msgs)</li>
          </ul>
          
          <button className="btn btn-outline" style={{ marginTop: 'auto' }}>Get Started</button>
        </div>
        
        <div className="pricing-card glass-panel popular" style={{ opacity: 0 }}>
          <h3 className="bento-title">Growth</h3>
          <div className="price">$149<span>/mo</span></div>
          <p className="bento-desc">Ideal for scaling brands running multiple campaigns simultaneously.</p>
          
          <ul className="pricing-features">
            <li>Up to 15 Active Campaigns</li>
            <li>Advanced Creator Filter</li>
            <li>Unlimited Messaging</li>
            <li>Featured Campaigns</li>
          </ul>
          
          <button className="btn btn-primary btn-accent" style={{ marginTop: 'auto' }}>Get Started</button>
        </div>
        
        <div className="pricing-card glass-panel" style={{ opacity: 0 }}>
          <h3 className="bento-title">Enterprise</h3>
          <div className="price">$399<span>/mo</span></div>
          <p className="bento-desc">For large agencies and enterprise brands with high volume needs.</p>
          
          <ul className="pricing-features">
            <li>Unlimited Active Campaigns</li>
            <li>Premium Support</li>
            <li>Custom Integrations</li>
            <li>Dedicated Account Manager</li>
          </ul>
          
          <button className="btn btn-outline" style={{ marginTop: 'auto' }}>Contact Sales</button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
