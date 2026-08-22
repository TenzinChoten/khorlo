import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApi, getMediaUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, MapPin, ExternalLink, Calendar, 
  MessageSquare, Camera, PlayCircle, Briefcase, AtSign, Globe, Image as ImageIcon
} from 'lucide-react';

const PlatformIcon = ({ platform }) => {
  switch (platform) {
    case 'INSTAGRAM': return <Camera size={18} />;
    case 'YOUTUBE': return <PlayCircle size={18} />;
    case 'LINKEDIN': return <Briefcase size={18} />;
    case 'X': return <AtSign size={18} />;
    case 'FACEBOOK': return <Globe size={18} />;
    default: return <ExternalLink size={18} />;
  }
};

const ApplicationReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [application, setApplication] = useState(null);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [decisionLoading, setDecisionLoading] = useState(false);

  useEffect(() => {
    fetchApi(`/applications/${id}`)
      .then(res => {
        setApplication(res.application);
        setAcceptedCount(res.acceptedCount || 0);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDecision = async (status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this application?`)) return;
    
    setDecisionLoading(true);
    try {
      const res = await fetchApi(`/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      setApplication(prev => ({
        ...prev,
        status: res.application.status,
        conversationId: res.application.conversationId ?? prev.conversationId,
      }));
      if (status === 'ACCEPTED') {
        setAcceptedCount(prev => prev + 1);
      }
    } catch (err) {
      alert(err.message || `Failed to ${status.toLowerCase()} application`);
    } finally {
      setDecisionLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading application details...</div>;
  if (error || !application) return <div style={{ padding: '4rem', textAlign: 'center', color: '#ff3b30' }}>{error || 'Application not found'}</div>;

  const inf = application.influencer;
  const camp = application.campaign;

  // [Reason] Guard against incomplete API payloads so missing relations don't blank the page
  if (!inf || !camp) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: '#ff3b30' }}>Application details are incomplete.</div>;
  }
  
  const profileImg = inf.profilePhoto 
    ? getMediaUrl(inf.profilePhoto) 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(inf.displayName || 'Creator')}&background=random&color=fff`;

  const formatLocation = () => {
    const parts = [inf.city, inf.state, inf.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return { bg: 'rgba(16,185,129,0.1)', text: '#10b981' };
      case 'REJECTED': return { bg: 'rgba(255,59,48,0.1)', text: '#ff3b30' };
      case 'WITHDRAWN': return { bg: 'rgba(255,255,255,0.05)', text: 'var(--text-secondary)' };
      default: return { bg: 'rgba(245,158,11,0.1)', text: '#fcd34d' };
    }
  };

  const statusStyle = getStatusColor(application.status);
  const creatorSlots = camp.creatorSlots || 1;
  const slotsFilled = acceptedCount >= creatorSlots;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <ArrowLeft size={16} /> Back to Applications
      </button>

      {/* Header Section */}
      <div className="apple-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <img src={profileImg} alt={inf.displayName} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{inf.displayName}</h1>
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--apple-text-secondary)', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> {formatLocation()}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} /> Applied {new Date(application.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <span style={{ padding: '6px 16px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, background: statusStyle.bg, color: statusStyle.text }}>
              {application.status} Application
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Cover Letter */}
          <div className="apple-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Why they're a good fit</h2>
            {application.coverLetter ? (
              <p style={{ color: 'var(--apple-text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: '1rem' }}>
                {application.coverLetter}
              </p>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--apple-bg)', borderRadius: '12px', color: 'var(--apple-text-secondary)' }}>
                No cover letter provided.
              </div>
            )}
          </div>

          {/* Portfolio */}
          <div className="apple-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Portfolio</h2>
            {inf.portfolioItems?.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {inf.portfolioItems.map(item => (
                  <div key={item.id} style={{ background: 'var(--apple-bg)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--apple-border)' }}>
                    {item.thumbnail ? (
                      <img src={getMediaUrl(item.thumbnail)} alt={item.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--apple-bg)', color: 'var(--apple-text-secondary)' }}>
                        <ImageIcon size={32} />
                      </div>
                    )}
                    <div style={{ padding: '1rem' }}>
                      <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }} className="truncate">{item.title}</h3>
                      {item.description && <p style={{ color: 'var(--apple-text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem' }} className="line-clamp-2">{item.description}</p>}
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--apple-accent)', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          View external <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--apple-bg)', borderRadius: '12px', color: 'var(--apple-text-secondary)' }}>
                This creator hasn't added portfolio items yet.
              </div>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Decision Area */}
          <div className="apple-panel" style={{ padding: '2rem', position: 'sticky', top: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>Application Decision</h2>
            <p style={{ color: 'var(--apple-text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              {acceptedCount} of {creatorSlots} creator slot{creatorSlots === 1 ? '' : 's'} filled
            </p>
            
            {application.status === 'PENDING' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {slotsFilled && (
                  <p style={{ color: '#fcd34d', fontSize: '0.8rem' }}>
                    All creator slots are filled. You can still reject this application.
                  </p>
                )}
                <button 
                  onClick={() => handleDecision('ACCEPTED')} 
                  disabled={decisionLoading || slotsFilled}
                  className="btn btn-primary btn-accent" 
                  style={{ width: '100%', opacity: slotsFilled ? 0.5 : 1, cursor: slotsFilled ? 'not-allowed' : 'pointer' }}
                >
                  {decisionLoading ? 'Processing...' : 'Accept Application'}
                </button>
                <button 
                  onClick={() => handleDecision('REJECTED')} 
                  disabled={decisionLoading}
                  className="btn btn-outline" 
                  style={{ width: '100%', borderColor: '#ff3b30', color: '#ff3b30' }}
                >
                  Reject Application
                </button>
              </div>
            ) : application.status === 'ACCEPTED' ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                  ✓ Accepted
                </div>
                <button 
                  // [Reason] Open the conversation created on acceptance rather than a generic inbox
                  onClick={() => navigate(application.conversationId
                    ? `/dashboard/messages?conversationId=${application.conversationId}`
                    : '/dashboard/messages')} 
                  className="btn btn-primary" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <MessageSquare size={18} /> Message Influencer
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: statusStyle.text, fontWeight: 600 }}>
                {application.status === 'REJECTED' ? 'Application Rejected' : 'Application Withdrawn'}
              </div>
            )}
          </div>

          {/* Snapshot Area */}
          <div className="apple-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>Creator Profile</h2>
            
            {inf.bio && (
              <p style={{ color: 'var(--apple-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {inf.bio}
              </p>
            )}

            {inf.contentNiches?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Niches</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {/* [Reason] API returns flattened { id, name } niches, not nested contentNiche objects */}
                  {inf.contentNiches.map(n => (
                    <span key={n.id} style={{ padding: '4px 10px', background: 'var(--apple-bg)', borderRadius: '6px', fontSize: '0.75rem' }}>
                      {n.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {inf.contentFormats?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Formats</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {/* [Reason] API returns flattened { id, name } formats, not nested contentFormat objects */}
                  {inf.contentFormats.map(f => (
                    <span key={f.id} style={{ padding: '4px 10px', background: 'var(--apple-bg)', borderRadius: '6px', fontSize: '0.75rem' }}>
                      {f.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Social Accounts */}
          {inf.socialAccounts?.length > 0 && (
            <div className="apple-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Social Presence</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {inf.socialAccounts.map(social => (
                  <div key={social.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--apple-bg)', borderRadius: '8px', border: '1px solid var(--apple-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ color: 'var(--apple-accent)' }}>
                        <PlatformIcon platform={social.platform} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{social.platform}</div>
                        <div style={{ color: 'var(--apple-text-secondary)', fontSize: '0.75rem' }}>@{social.username}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{(social.followers || 0).toLocaleString()}</div>
                      <div style={{ color: 'var(--apple-text-secondary)', fontSize: '0.75rem' }}>Followers</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campaign Context */}
          <div className="apple-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>Campaign Context</h2>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ color: 'var(--apple-text-secondary)', fontSize: '0.75rem' }}>Applied to</div>
              <div style={{ fontWeight: 600 }}>{camp.title}</div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ color: 'var(--apple-text-secondary)', fontSize: '0.75rem' }}>Compensation</div>
              <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                {camp.compensationType === 'FREE_PRODUCT' ? 'Free Product' : `${camp.currency || 'USD'} ${(camp.budget || 0).toLocaleString()}`}
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--apple-text-secondary)', fontSize: '0.75rem' }}>Creator slots</div>
              <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                {acceptedCount} / {creatorSlots} filled
              </div>
            </div>
            
            <button 
              onClick={() => navigate(`/dashboard/campaign/${camp.id}`)}
              className="btn btn-outline" 
              style={{ width: '100%', fontSize: '0.875rem' }}
            >
              View Campaign Details
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ApplicationReview;
