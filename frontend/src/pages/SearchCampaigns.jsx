import React, { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Clock, Camera, PlayCircle, AtSign, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchApi, getMediaUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';


const getPlatformIcon = (platform) => {
  const p = (platform || '').toLowerCase();
  if (p === 'instagram') return <Camera size={16} />;
  if (p === 'youtube') return <PlayCircle size={16} />;
  if (p === 'tiktok') return <Music size={16} />;
  return <AtSign size={16} />;
};

const SearchCampaigns = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'INFLUENCER') {
      fetchApi('/applications/me')
        .then(res => setMyApplications(res.applications || []))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchApi(`/campaigns${search ? `?search=${encodeURIComponent(search)}` : ''}`)
      .then(res => setCampaigns(res.campaigns || []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, [search]);

  const formatBudget = (camp) => {
    if (!camp.budget) return camp.compensationType === 'FREE_PRODUCT' ? 'Free Product' : 'Unpaid';
    return `${camp.currency || 'USD'} ${camp.budget.toLocaleString()}`;
  };

  const formatDeadline = (date) => {
    if (!date) return 'Open ended';
    const diff = Math.ceil((new Date(date) - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Closed';
    if (diff === 0) return 'Closes today';
    if (diff === 1) return '1 day left';
    if (diff < 7) return `${diff} days left`;
    return `${Math.ceil(diff / 7)} weeks left`;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Open Campaigns</h1>
      </div>

      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input
          type="text"
          placeholder="Search campaigns by keyword or brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '12px', outline: 'none' }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>No campaigns found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {campaigns.map(camp => {
            const logoImg = camp.images?.find(img => img.imageType === 'BRAND_LOGO')?.imageUrl || camp.business?.companyLogo;
            const logoSrc = logoImg ? getMediaUrl(logoImg) : `https://ui-avatars.com/api/?name=${encodeURIComponent(camp.business?.companyName || 'B')}&background=random&color=fff`;
            const platforms = camp.contentFormats?.map(cf => cf.contentFormat?.name) || [];
            const isClosed = camp.applicationDeadline && new Date() > new Date(camp.applicationDeadline);
            return (
              <div 
                key={camp.id} 
                className="glass-panel" 
                onClick={() => navigate(`/dashboard/campaign/${camp.id}`)}
                style={{ padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', cursor: 'pointer' }}
              >
                <img src={logoSrc} alt={camp.business?.companyName} style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover' }} />

                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>{camp.business?.companyName}</p>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{camp.title}</h3>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={16} /> {formatBudget(camp)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> {camp.city && camp.country ? `${camp.city}, ${camp.country}` : 'Global / Online'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> {formatDeadline(camp.applicationDeadline)}</div>
                  </div>
                  {platforms.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                      {platforms.map((platform, idx) => (
                        <span key={idx} title={platform} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'rgba(59,130,246,0.2)', color: 'var(--accent)', borderRadius: '50%', cursor: 'pointer' }}>
                          {getPlatformIcon(platform)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {user?.role === 'INFLUENCER' && (
                  <div>
                    {(() => {
                      const app = myApplications.find(a => a.campaignId === camp.id);
                      if (app) {
                        return (
                          <span style={{ padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                            Application {app.status}
                          </span>
                        );
                      }
                      if (isClosed) {
                        return (
                          <span style={{ padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                            Closed
                          </span>
                        );
                      }
                      return (
                        <button className="btn btn-primary" style={{ whiteSpace: 'nowrap', pointerEvents: 'none' }}>Apply Now</button>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchCampaigns;

