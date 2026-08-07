import React, { useEffect } from 'react';
import { Users, Globe, Shield } from 'lucide-react';

const About = () => {
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

    const cards = document.querySelectorAll('.about-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 className="section-title">About Khorlo</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.125rem', lineHeight: 1.8 }}>
          We built Khorlo to bridge the gap between innovative brands and authentic creators. Our mission is to make influencer marketing transparent, efficient, and scalable for everyone.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="about-card glass-panel" style={{ padding: '2.5rem', textAlign: 'center', opacity: 0 }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Users size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Community First</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            We prioritize building long-term relationships over one-off transactions. Our community is vetted for authenticity.
          </p>
        </div>

        <div className="about-card glass-panel" style={{ padding: '2.5rem', textAlign: 'center', opacity: 0 }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Globe size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Global Reach</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Connect with creators and audiences across the globe. No borders, just pure content and engagement.
          </p>
        </div>

        <div className="about-card glass-panel" style={{ padding: '2.5rem', textAlign: 'center', opacity: 0 }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Shield size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Secure & Transparent</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            From payments to contracts, everything is handled securely within the platform. Total peace of mind.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
