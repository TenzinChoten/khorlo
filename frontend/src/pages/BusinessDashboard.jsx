import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Target, Activity } from 'lucide-react';
import { fetchApi } from '../lib/api';

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApi('/dashboard/business')
      .then(res => setData(res.dashboard))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading dashboard...</div>;
  if (error) return <div style={{ padding: '4rem', textAlign: 'center', color: '#ff3b30' }}>{error}</div>;

  const stats = data?.stats || {};
  const applications = data?.recentApplications || [];
  const campaigns = data?.recentCampaigns || [];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Dashboard</h1>
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
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.activeCampaigns ?? 0}</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Applications</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.totalApplications ?? 0}</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: '#8b5cf6' }}>
            <Activity size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Pending Review</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{applications.filter(a => a.status === 'PENDING').length}</p>
          </div>
        </div>
      </div>

      {/* Your Campaigns */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Your Campaigns</h2>
        {campaigns.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
            No campaigns yet. Create one to get started!
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Title</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Applications</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Date Created</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(camp => (
                  <tr key={camp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 0', fontWeight: 500 }}>{camp.title}</td>
                    <td style={{ padding: '1rem 0' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: camp.status === 'OPEN' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)',
                        color: camp.status === 'OPEN' ? '#10b981' : 'var(--text-secondary)',
                        borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600
                      }}>
                        {camp.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0' }}>{camp._count?.applications || 0}</td>
                    <td style={{ padding: '1rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(camp.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Applications */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Applications</h2>
        {applications.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
            No applications yet. Create a campaign to start receiving applications!
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Creator</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Campaign</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '1rem 0', fontWeight: 500 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => {
                const influencerName = app.influencer?.user?.name || app.influencer?.displayName || 'Creator';
                const avatarSrc = app.influencer?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencerName)}&background=random&color=fff`;
                return (
                  <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src={avatarSrc} alt={influencerName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 500 }}>{influencerName}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0' }}>{app.campaign?.title}</td>
                    <td style={{ padding: '1rem 0' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: app.status === 'ACCEPTED' ? 'rgba(16,185,129,0.2)' : app.status === 'REJECTED' ? 'rgba(255,59,48,0.2)' : 'rgba(245,158,11,0.2)',
                        color: app.status === 'ACCEPTED' ? '#10b981' : app.status === 'REJECTED' ? '#ff3b30' : '#fcd34d',
                        borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600
                      }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboard;
