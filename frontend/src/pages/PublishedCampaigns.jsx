import React from 'react';
import { Target, DollarSign, Users, LayoutList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PublishedCampaigns = () => {
  const navigate = useNavigate();

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
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn" style={{ background: 'var(--accent)', color: 'white', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Active (2)</button>
            <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Drafts (0)</button>
            <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Completed (4)</button>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {[
            { id: 1, title: 'Summer Tech Essentials', posted: '2 days ago', status: 'ACTIVE', applicants: 45, budget: '$500 - $1.5k', platform: 'YouTube, TikTok' },
            { id: 2, title: 'Smart Home Hub Launch', posted: '1 week ago', status: 'ACTIVE', applicants: 128, budget: '$1,000 - $2.5k', platform: 'Instagram' }
          ].map(campaign => (
            <div key={campaign.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.5rem', transition: 'all 0.2s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={`https://ui-avatars.com/api/?name=${campaign.title}&background=random&color=fff`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="campaign" />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{campaign.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Posted {campaign.posted}</p>
                  </div>
                </div>
                <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>Active</span>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Target size={14} /> {campaign.platform}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><DollarSign size={14} /> {campaign.budget}</div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <Users size={16} color="var(--accent)" />
                  <span><strong style={{ color: 'white' }}>{campaign.applicants}</strong> Applicants</span>
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
