import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Target, Activity, DollarSign } from 'lucide-react';

const BusinessDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Brand Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back to Khorlo</p>
        </div>
        <button onClick={() => navigate('/dashboard/business/campaigns/new')} className="btn btn-primary btn-accent">+ New Campaign</button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--accent)' }}>
            <Target size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Active Campaigns</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>12</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Applications</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>148</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: '#f59e0b' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Budget Spent</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>$4,200</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: '#8b5cf6' }}>
            <Activity size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Avg. Engagement</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>4.8%</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Applications</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', textAlign: 'left' }}>
              <th style={{ padding: '1rem 0', fontWeight: 500 }}>Creator</th>
              <th style={{ padding: '1rem 0', fontWeight: 500 }}>Campaign</th>
              <th style={{ padding: '1rem 0', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '1rem 0', fontWeight: 500 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map(item => (
              <tr key={item} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={`https://i.pravatar.cc/150?u=${item}`} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>Alex Chen</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>@alexcreates</div>
                  </div>
                </td>
                <td style={{ padding: '1rem 0' }}>Summer Collection Launch</td>
                <td style={{ padding: '1rem 0' }}>
                  <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                    Pending
                  </span>
                </td>
                <td style={{ padding: '1rem 0' }}>
                  <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BusinessDashboard;
