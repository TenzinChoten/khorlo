import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, DollarSign, Target, MapPin, Share2, X, MessageSquare } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApi, getMediaUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const [existingApplication, setExistingApplication] = useState(null);
  const [campaignApplications, setCampaignApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    fetchApi(`/campaigns/${id}`)
      .then(res => setCampaign(res.campaign))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    
    if (user.role === 'INFLUENCER') {
      fetchApi('/applications/me')
        .then(res => {
          const app = res.applications.find(a => a.campaignId === id);
          if (app) setExistingApplication(app);
        })
        .catch(() => {});
    } else if (user.role === 'BUSINESS' && campaign) {
      setLoadingApps(true);
      fetchApi(`/applications/campaign/${id}`)
        .then(res => setCampaignApplications(res.applications))
        .catch(() => {})
        .finally(() => setLoadingApps(false));
    }
  }, [id, user, campaign]);

  const updateApplicationStatus = async (appId, status) => {
    try {
      await fetchApi(`/applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      setCampaignApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    } catch (err) {
      alert(err.message || 'Failed to update application status');
    }
  };

  const handleApply = async () => {
    setApplying(true);
    setApplyError(null);
    try {
      const payload = { campaignId: id };
      if (coverLetter.trim()) {
        payload.coverLetter = coverLetter.trim();
      }
      const res = await fetchApi('/applications', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setExistingApplication(res.application);
      setApplySuccess(true);
      setTimeout(() => {
        setShowApplyModal(false);
        setApplySuccess(false);
        setCoverLetter('');
      }, 2000);
    } catch (err) {
      setApplyError(err.message);
    } finally {
      setApplying(false);
    }
  };

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

  const isDeadlinePassed = campaign?.applicationDeadline && new Date() > new Date(campaign.applicationDeadline);
  const creatorSlots = campaign.creatorSlots || 1;
  const acceptedCount = campaign.acceptedCount ?? campaignApplications.filter(a => a.status === 'ACCEPTED').length;
  const slotsFilled = acceptedCount >= creatorSlots;
  const isClosed = isDeadlinePassed || slotsFilled;
  const displayStatus = isClosed && campaign?.status === 'OPEN' ? 'CLOSED' : campaign?.status || 'DRAFT';

  return (
    <div className="animate-fade-in">
      {showApplyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setShowApplyModal(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Apply to Campaign</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{campaign.title} by {campaign.business?.companyName}</p>
            
            {applySuccess ? (
              <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                Application submitted successfully!
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Cover Letter (Optional)</label>
                  <textarea 
                    placeholder="Tell the brand why you are a great fit..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={5}
                    style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '12px', outline: 'none', resize: 'vertical' }}
                  ></textarea>
                </div>
                
                {applyError && (
                  <div style={{ background: 'rgba(255,59,48,0.1)', color: '#ff3b30', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                    {applyError}
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowApplyModal(false)} className="btn btn-outline">Cancel</button>
                  <button onClick={handleApply} disabled={applying} className="btn btn-primary btn-accent">
                    {applying ? 'Applying...' : 'Submit Application'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
        <ArrowLeft size={16} /> Back
      </button>

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
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{campaign.title}</h1>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.875rem' }}>
                <span style={{ padding: '4px 12px', borderRadius: '20px', background: displayStatus === 'OPEN' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 255, 255, 0.1)', color: displayStatus === 'OPEN' ? '#34c759' : 'var(--text-secondary)' }}>
                  {displayStatus}
                </span>
                {campaign.productName && (
                  <span style={{ color: 'var(--text-secondary)' }}>Product: <strong style={{ color: 'white' }}>{campaign.productName}</strong></span>
                )}
              </div>
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
                <li key={i}>{f.quantity || 1}x {f.contentFormat?.name}</li>
              ))}
              {campaign.contentFormats?.length === 0 && (
                <li>No specific format requirements</li>
              )}
            </ul>
          </div>

          {campaign.images?.filter(img => img.imageType === 'MOOD_BOARD' || img.imageType === 'REFERENCE').length > 0 && (
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Mood Board &amp; References</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {campaign.images.filter(img => img.imageType === 'MOOD_BOARD' || img.imageType === 'REFERENCE').map(img => (
                  <img key={img.id} src={getMediaUrl(img.imageUrl)} alt="Mood board" style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', objectFit: 'cover' }} />
                ))}
              </div>
            </div>
          )}

          {user?.role === 'BUSINESS' && (
            <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                Applications
                <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-secondary)', marginLeft: '0.75rem' }}>
                  {acceptedCount} / {creatorSlots} slots filled
                </span>
              </h2>
              {loadingApps ? (
                <div style={{ color: 'var(--text-secondary)' }}>Loading applications...</div>
              ) : campaignApplications.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)' }}>No applications yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {campaignApplications.map(app => (
                    <div key={app.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* [Reason] Creator photos are stored as /uploads paths and must be loaded from the API host */}
                        <img src={getMediaUrl(app.influencer?.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.influencer?.displayName || 'Creator')}&background=random&color=fff`} alt={app.influencer?.displayName} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <h3 style={{ fontWeight: 600 }}>{app.influencer?.displayName}</h3>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                            {app.influencer?.contentNiches?.length > 0 && (
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                {/* [Reason] API returns flattened niche DTOs ({ id, name }), not nested contentNiche */}
                                {app.influencer.contentNiches.map(n => n.name).join(' • ')}
                              </span>
                            )}
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>•</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                              Applied {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: app.status === 'ACCEPTED' ? 'rgba(16,185,129,0.2)' : app.status === 'REJECTED' ? 'rgba(255,59,48,0.2)' : 'rgba(245,158,11,0.2)', color: app.status === 'ACCEPTED' ? '#10b981' : app.status === 'REJECTED' ? '#ff3b30' : '#fcd34d' }}>
                          {app.status}
                        </span>
                        <button 
                          onClick={() => navigate(`/dashboard/application/${app.id}`)}
                          className="btn btn-outline" 
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                          View Application
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '2rem' }}>
            {!user ? (
              <button onClick={() => navigate('/login')} className="btn btn-primary btn-accent" style={{ width: '100%', marginBottom: '1rem' }}>Login to Apply</button>
            ) : user.role === 'INFLUENCER' ? (
              existingApplication ? (
                <>
                  <button disabled className="btn" style={{ width: '100%', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}>
                    Application {existingApplication.status}
                  </button>
                  {existingApplication.status === 'ACCEPTED' && (
                    <button
                      onClick={() => navigate(existingApplication.conversationId
                        ? `/dashboard/messages?conversationId=${existingApplication.conversationId}`
                        : '/dashboard/messages')}
                      className="btn btn-primary"
                      style={{ width: '100%', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <MessageSquare size={18} /> Message Brand
                    </button>
                  )}
                </>
              ) : isClosed ? (
                <button disabled className="btn" style={{ width: '100%', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}>
                  {slotsFilled ? 'All Creator Slots Filled' : 'Applications Closed'}
                </button>
              ) : (
                <button onClick={() => setShowApplyModal(true)} className="btn btn-primary btn-accent" style={{ width: '100%', marginBottom: '1rem' }}>Apply Now</button>
              )
            ) : null}
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
                  <div style={{ fontWeight: 600 }}>
                    {campaign.locationType === 'ONLINE' ? 'Online (Remote)' : (
                      <>
                        {[campaign.city, campaign.state, campaign.country].filter(Boolean).join(', ') || 'Global'}
                        {campaign.address && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{campaign.address}</div>}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--accent)' }}><Calendar size={20} /></div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Application Deadline</div>
                  <div style={{ fontWeight: 600 }}>{campaign.applicationDeadline ? new Date(campaign.applicationDeadline).toLocaleDateString() : 'Open ended'}</div>
                </div>
              </div>

              {campaign.contentDeadline && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ color: 'var(--accent)' }}><Calendar size={20} /></div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Content Deadline</div>
                    <div style={{ fontWeight: 600 }}>{new Date(campaign.contentDeadline).toLocaleDateString()}</div>
                  </div>
                </div>
              )}

              {campaign.creatorSlots && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ color: 'var(--accent)' }}><Target size={20} /></div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Creator Slots</div>
                    <div style={{ fontWeight: 600 }}>{acceptedCount} / {creatorSlots} filled</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
