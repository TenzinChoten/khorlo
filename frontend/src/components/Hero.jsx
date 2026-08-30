import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="editorial-sphere sphere-1"></div>
      <div className="editorial-sphere sphere-2"></div>

      <div className="hero-content">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <h1 className="hero-title" style={{ textAlign: 'left', marginBottom: 0 }}>
            <span className="word-reveal delay-100" style={{ display: 'inline-block' }}>khorlo</span><br/>
            <span className="word-reveal delay-200" style={{ display: 'inline' }}>
              network.
              <span className="pill-badge" style={{ verticalAlign: 'text-bottom', marginLeft: '0.5rem', marginBottom: '0.5rem' }}>v1.0 live now</span>
            </span>
          </h1>
        </div>
        
        <div className="hero-description animate-fade-in delay-400">
          <p className="hero-subtitle">
            empowering the next generation of independent creators to turn their genuine passions into something real. built by tibetans, built for tibetans.
          </p>
          
          <div className="hero-cta">
            <button onClick={() => navigate('/register', { state: { role: 'creator' } })} className="btn btn-primary">
              join as creator <ArrowUpRight size={24} strokeWidth={3} style={{ marginLeft: '8px' }} />
            </button>
            <button onClick={() => navigate('/register', { state: { role: 'brand' } })} className="btn btn-outline">
              join as brand <ArrowUpRight size={24} strokeWidth={3} style={{ marginLeft: '8px' }} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
