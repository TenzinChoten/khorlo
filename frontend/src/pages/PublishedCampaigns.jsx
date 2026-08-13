import React, { useState, useEffect } from 'react';
import { Target, DollarSign, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchApi, getMediaUrl } from '../lib/api';

function campaignThumbnail(campaign) {
  const images = campaign.images || [];
  const preferred =
    images.find((img) => img.imageType === 'BRAND_LOGO') ||
    images.find((img) => img.imageType === 'PRODUCT') ||
    images.find((img) => img.imageType === 'OTHER') ||
    images[0];
  const url = preferred?.imageUrl || campaign.business?.companyLogo;
  if (url) return getMediaUrl(url);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(campaign.title || 'Campaign')}&background=random&color=fff`;
}

const PublishedCampaigns = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({ activeCampaigns: 0, draftCampaigns: 0, completedCampaigns: 0 });
  const [filter, setFilter] = useState('OPEN');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApi('/dashboard/business')
      .then((res) => {
        setCampaigns(res.dashboard?.campaigns || []);
        setStats(res.dashboard?.stats || {});
      })
      .catch((err) => setError(err.message || 'Failed to load campaigns'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = campaigns.filter((camp) => {
    if (filter === 'OPEN') return camp.status === 'OPEN';
    if (filter === 'DRAFT') return camp.status === 'DRAFT';
    if (filter === 'COMPLETED') return camp.status === 'COMPLETED' || camp.status === 'CLOSED';
    return true;
  });

  const formatBudget = (camp) => {
    if (!camp.budget) return camp.compensationType === 'FREE_PRODUCT' ? 'Free Product' : 'Unpaid';
    return `${camp.currency || 'USD'} ${camp.budget.toLocaleString()}`;
  };

  const formatPlatforms = (camp) => {
    const names = camp.contentFormats?.map((f) => f.contentFormat?.name).filter(Boolean) || [];
    return names.length ? names.join(', ') : 'Various';
  };

  const tabStyle = (active) => ({
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? 'white' : 'inherit',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    border: active ? 'none' : undefined,
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Published Campaigns</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your active and drafted campaigns</p>
        </div>
        <button onClick={() => navigate('/dashboard/business/campaigns/new')} className="btn btn-primary btn-accent">+ New Campaign</button>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn" style={tabStyle(filter === 'OPEN')} onClick={() => setFilter('OPEN')}>
              Active ({stats.activeCampaigns ?? 0})
            </button>
            <button className="btn btn-outline" style={tabStyle(filter === 'DRAFT')} onClick={() => setFilter('DRAFT')}>
              Drafts ({stats.draftCampaigns ?? 0})
            </button>
            <button className="btn btn-outline" style={tabStyle(filter === 'COMPLETED')} onClick={() => setFilter('COMPLETED')}>
              Completed ({stats.completedCampaigns ?? 0})
            </button>
          </div>
        </div>

        {loading && <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading campaigns...</p>}
        {error && <p style={{ color: '#ff3b30', textAlign: 'center' }}>{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
            No campaigns in this category yet.
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filtered.map((campaign) => (
            <div
              key={campaign.id}
              onClick={() => navigate(`/dashboard/campaign/${campaign.id}`)}
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.5rem', transition: 'all 0.2s ease', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={campaignThumbnail(campaign)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={campaign.title} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{campaign.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Posted {new Date(campaign.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span style={{ padding: '0.25rem 0.75rem', background: campaign.status === 'OPEN' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)', color: campaign.status === 'OPEN' ? '#10b981' : 'var(--text-secondary)', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {campaign.status}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Target size={14} /> {formatPlatforms(campaign)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><DollarSign size={14} /> {formatBudget(campaign)}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <Users size={16} color="var(--accent)" />
                  <span><strong style={{ color: 'white' }}>{campaign._count?.applications || 0}</strong> Applicants</span>
                </div>
                <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>Manage</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublishedCampaigns;
