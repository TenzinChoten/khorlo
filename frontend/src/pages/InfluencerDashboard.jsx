import React, { useState, useEffect } from 'react';
import { Eye, Briefcase, Award, TrendingUp } from 'lucide-react';
import { fetchApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const InfluencerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawing, setWithdrawing] = useState(null);

  useEffect(() => {
    fetchApi('/dashboard/influencer')
      .then(res => setData(res.dashboard))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading dashboard...</div>;
  if (error) return <div style={{ padding: '4rem', textAlign: 'center', color: '#ff3b30' }}>{error}</div>;

  const handleWithdraw = async (e, appId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    setWithdrawing(appId);
    try {
      await fetchApi(`/applications/${appId}`, { method: 'DELETE' });
      setData(prev => ({
        ...prev,
        recentApplications: prev.recentApplications.filter(a => a.id !== appId)
      }));
    } catch (err) {
      alert(err.message || 'Failed to withdraw application');
    } finally {
      setWithdrawing(null);
    }
  };

  const stats = data?.stats || {};
  const applications = data?.recentApplications || [];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Dashboard</h1>
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
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.activePartnerships ?? 0}</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
            <Award size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Pending Applications</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.pendingApplications ?? 0}</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: '#f59e0b' }}>
            <Eye size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Applications</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{applications.length}</p>
          </div>
        </div>
      </div>

      {/* Applications */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>My Applications</h2>
        {applications.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
            No applications yet. Browse open campaigns to get started!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applications.map((app) => {
              const brand = app.campaign?.business;
              const logoSrc = brand?.companyLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(brand?.companyName || 'B')}&background=random&color=fff`;
              return (
                <div 
                  key={app.id} 
                  onClick={() => app.campaignId && navigate(`/dashboard/campaign/${app.campaignId}`)}
                  style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'} 
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <img src={logoSrc} alt={brand?.companyName} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                    <div>
                      <h3 style={{ fontWeight: 600, fontSize: '1.1rem' }}>{app.campaign?.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{brand?.companyName}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: app.status === 'ACCEPTED' ? 'rgba(16,185,129,0.2)' : app.status === 'REJECTED' ? 'rgba(255,59,48,0.2)' : 'rgba(245,158,11,0.2)',
                      color: app.status === 'ACCEPTED' ? '#10b981' : app.status === 'REJECTED' ? '#ff3b30' : '#fcd34d',
                    }}>
                      {app.status}
                    </div>
                    {app.status === 'PENDING' && (
                      <button 
                        onClick={(e) => handleWithdraw(e, app.id)}
                        disabled={withdrawing === app.id}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-secondary)', borderRadius: '4px', cursor: withdrawing === app.id ? 'not-allowed' : 'pointer' }}
                      >
                        {withdrawing === app.id ? 'Withdrawing...' : 'Withdraw'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluencerDashboard;
