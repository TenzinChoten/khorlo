import React, { useEffect, useRef } from 'react';
import { PenTool, Search, MessageSquare, BarChart2 } from 'lucide-react';

const Features = () => {
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

    const cards = document.querySelectorAll('.bento-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="features">
      <h2 className="section-title">Everything you need</h2>
      
      <div className="bento-grid">
        <div className="bento-card glass-panel" style={{ opacity: 0 }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <PenTool size={24} strokeWidth={1.5} style={{ transform: 'rotate(-90deg)' }} />
          </div>
          <h3 className="bento-title">Campaign Management</h3>
          <p className="bento-desc">
            Post campaigns seamlessly. Set compensation types from Paid to Free Product, and manage budgets efficiently.
          </p>
        </div>
        
        <div className="bento-card glass-panel" style={{ opacity: 0 }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <Search size={24} strokeWidth={1.5} />
          </div>
          <h3 className="bento-title">Creator Discovery</h3>
          <p className="bento-desc">
            Filter by niches, platforms (Instagram, TikTok, YouTube), and engagement rate to find your perfect match.
          </p>
        </div>
        
        <div className="bento-card glass-panel" style={{ opacity: 0 }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <MessageSquare size={24} strokeWidth={1.5} />
          </div>
          <h3 className="bento-title">Seamless Communication</h3>
          <p className="bento-desc">
            Built-in messaging and application tracking keeps all your influencer interactions in one organized place.
          </p>
        </div>
        
        <div className="bento-card glass-panel" style={{ opacity: 0 }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <BarChart2 size={24} strokeWidth={1.5} />
          </div>
          <h3 className="bento-title">Analytics & Insights</h3>
          <p className="bento-desc">
            Track performance, engagement rates, and ROI to make data-driven marketing decisions.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
