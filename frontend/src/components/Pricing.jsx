import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const Pricing = () => {
  return (
    <section id="pricing" className="editorial-section">
      <div className="section-header">
        <h2 className="section-title">why<br/>it<br/>works.</h2>
      </div>
      
      <div className="editorial-grid">
        <div className="editorial-card">
          <h3>starter.</h3>
          <div className="price" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>$49/mo</div>
          <p>perfect for small brands just getting started with influencer marketing.</p>
          <ul style={{ listStyle: 'none', margin: '2rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 0.8, fontSize: '1.1rem' }}>
            <li>up to 3 active campaigns</li>
            <li>basic creator search</li>
            <li>standard messaging (100 msgs)</li>
          </ul>
          <button className="btn btn-outline" style={{ width: '100%' }}>
            get started <ArrowUpRight size={20} strokeWidth={3} style={{ marginLeft: '8px' }} />
          </button>
        </div>
        
        <div className="editorial-card" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--bg-color)', margin: 0 }}>growth.</h3>
            <span className="pill-badge" style={{ margin: 0, backgroundColor: '#c084fc', color: '#111' }}>most popular</span>
          </div>
          <div className="price" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>$149/mo</div>
          <p style={{ color: 'var(--bg-secondary)' }}>ideal for scaling brands running multiple campaigns simultaneously.</p>
          <ul style={{ listStyle: 'none', margin: '2rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 0.8, fontSize: '1.1rem' }}>
            <li>up to 15 active campaigns</li>
            <li>advanced creator filter</li>
            <li>unlimited messaging</li>
            <li>featured campaigns</li>
          </ul>
          <button className="btn btn-primary" style={{ width: '100%', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}>
            get started <ArrowUpRight size={20} strokeWidth={3} style={{ marginLeft: '8px' }} />
          </button>
        </div>
        
        <div className="editorial-card">
          <h3>enterprise.</h3>
          <div className="price" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>$399/mo</div>
          <p>for large agencies and enterprise brands with high volume needs.</p>
          <ul style={{ listStyle: 'none', margin: '2rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 0.8, fontSize: '1.1rem' }}>
            <li>unlimited active campaigns</li>
            <li>premium support</li>
            <li>custom integrations</li>
            <li>dedicated account manager</li>
          </ul>
          <button className="btn btn-outline" style={{ width: '100%' }}>
            contact sales <ArrowUpRight size={20} strokeWidth={3} style={{ marginLeft: '8px' }} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
