import React, { useEffect } from 'react';
import { Infinity, Aperture, Anchor } from 'lucide-react';

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
          A society grows when they help each other. And at Khorlo we connect businesses, brands, communities with creators, innovators and people. We give you the platform to grow and connect.<p>Built by Tibetans, Built for Tibetans.</p>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '2rem' }}>
        <div className="about-card glass-panel" style={{ padding: '2.5rem', textAlign: 'center', opacity: 0 }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Infinity size={32} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Community First</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Upcoming creators to turn their passions into realities and for the brands and communities, their ideas to be felt and seen by all the people.
          </p>
        </div>

        <div className="about-card glass-panel" style={{ padding: '2.5rem', textAlign: 'center', opacity: 0 }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Aperture size={32} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Shared Values</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Connect with each other through similar niches, with shared enthusiasm and goal. Grow with the same motivation and purpose.
          </p>
        </div>

        <div className="about-card glass-panel" style={{ padding: '2.5rem', textAlign: 'center', opacity: 0 }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Anchor size={32} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Secure & Transparent</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            From payments to contracts, everything is handled securely. We keep in mind for the society to thrive, trust is the must.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
