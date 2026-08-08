import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, DollarSign, Target, MapPin, Share2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { fetchApi, getMediaUrl } from '../lib/api';

const CampaignDetail = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApi(`/campaigns/${id}`)
      .then(res => setCampaign(res.campaign))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading campaign...</div>;
  if (error || !campaign) return <div style={{ padding: '4rem', textAlign: 'center', color: '#ff3b30' }}>{error || 'Campaign not found'}</div>;

  const logoImg = campaign.images?.find(img => img.imageType === 'BRAND_LOGO')?.imageUrl || campaign.business?.companyLogo;
  const logoSrc = logoImg ? getMediaUrl(logoImg) : `https://ui-avatars.com/api/?name=${encodeURIComponent(campaign.business?.companyName || 'Brand')}&background=random&color=fff`;
  
  const bannerImg = campaign.images?.find(img => img.imageType === 'OTHER' || img.imageType === 'PRODUCT')?.imageUrl;
  const bannerSrc = bannerImg ? getMediaUrl(bannerImg) : null;
  
  const formatBudget = (camp) => {
    if (!camp.budget) return camp.compensationType === 'FREE_PRODUCT' ? 'Free Product' : 'Unpaid';
    return `${camp.currency || 'USD'} ${camp.budget.toLocaleString()}`;
  };


  return (
    <div className="animate-fade-in">
      <Link to="/dashboard/search-campaigns" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2rem', textDecoration: 'none', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Campaigns
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          {bannerSrc && (
            <div style={{ width: '100%', height: '250px', borderRadius: '16px', marginBottom: '2rem', overflow: 'hidden' }}>
              <img src={bannerSrc} alt="Campaign Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <img src={logoSrc} alt={campaign.business?.companyName} style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover' }} />
            <div>
              <p style={{ color: 'var(--accent)', fontWeight: 500, marginBottom: '0.25rem' }}>{campaign.business?.companyName}</p>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>{campaign.title}</h1>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>About the Campaign</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>
              {campaign.description}
            </p>

            
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Requirements</h3>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: 1.8 }}>
              {campaign.contentFormats?.map((f, i) => (
                <li key={i}>{f.contentFormat?.name}</li>
              ))}
              {campaign.contentFormats?.length === 0 && (
                <li>No specific format requirements</li>
              )}
            </ul>
          </div>

          {campaign.images?.filter(img => img.imageType === 'MOOD_BOARD' || img.imageType === 'REFERENCE').length > 0 && (
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Mood Board & References</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {campaign.images.filter(img => img.imageType === 'MOOD_BOARD' || img.imageType === 'REFERENCE').map(img => (
                  <img key={img.id} src={getMediaUrl(img.imageUrl)} alt="Mood board" style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', objectFit: 'cover' }} />
                ))}
              </div>
            </div>
          )}

        </div>

        <div>
          <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '2rem' }}>
            <button className="btn btn-primary btn-accent" style={{ width: '100%', marginBottom: '1rem' }}>Apply Now</button>
            <button className="btn btn-outline" style={{ width: '100%', display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
              <Share2 size={18} /> Share Campaign
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--accent)' }}><DollarSign size={20} /></div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Compensation</div>
                  <div style={{ fontWeight: 600 }}>{formatBudget(campaign)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--accent)' }}><Target size={20} /></div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Niches</div>
                  <div style={{ fontWeight: 600 }}>{campaign.contentNiches?.map(n => n.contentNiche?.name).join(', ') || 'Any'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--accent)' }}><MapPin size={20} /></div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Location</div>
                  <div style={{ fontWeight: 600 }}>{campaign.locationType === 'ONLINE' ? 'Online (Remote)' : `${campaign.city || ''}, ${campaign.country || ''}`.trim().replace(/^,|,$/g, '') || 'Global'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--accent)' }}><Calendar size={20} /></div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Application Deadline</div>
                  <div style={{ fontWeight: 600 }}>{campaign.applicationDeadline ? new Date(campaign.applicationDeadline).toLocaleDateString() : 'Open ended'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
