import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-background-glow"></div>
      
      <h1 className="hero-title animate-fade-in delay-100">
        Empowering <span className="gradient-text">Creators</span>. <br />
        Elevating <span className="gradient-text">Brands</span>.
      </h1>
      
      <p className="hero-subtitle animate-fade-in delay-200">
        The ultimate platform to manage campaigns, discover talent, and scale your influencer marketing effortlessly.
      </p>
      
      <div className="hero-cta animate-fade-in delay-300">
        <button onClick={() => navigate('/register', { state: { role: 'creator' } })} className="btn btn-primary btn-accent">I'm a Creator</button>
        <button onClick={() => navigate('/register', { state: { role: 'brand' } })} className="btn btn-outline">I'm a Brand</button>
      </div>
    </section>
  );
};

export default Hero;
