import React from 'react';
import { Eye, Briefcase, Award, TrendingUp } from 'lucide-react';

const InfluencerDashboard = () => {
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Creator Hub</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track your performance and applications</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--accent)' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Active Partnerships</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>4</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
            <Award size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Pending Applications</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>7</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: '#f59e0b' }}>
            <Eye size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Profile Views</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>342</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: '#8b5cf6' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Est. Earnings (Month)</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>$1,850</p>
          </div>
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>My Campaigns</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {['TechNova', 'GlowCosmetics'].map((brand, index) => (
            <div key={brand} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <img src={`https://ui-avatars.com/api/?name=${brand}&background=random&color=fff`} alt={brand} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: '1.1rem' }}>{brand} Summer Campaign</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{brand} • Paid Collaboration</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>$500</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Due in 5 days</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfluencerDashboard;
