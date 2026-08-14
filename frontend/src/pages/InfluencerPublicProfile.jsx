import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Link as LinkIcon, MapPin } from 'lucide-react';
import { fetchApi, getMediaUrl } from '../lib/api';

const formatFollowers = (n) => {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return n.toString();
};

const InfluencerPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // [Reason] Brands open this from Discover Creators; load the public profile by id, not /influencer/me
    setLoading(true);
    setError(null);
    fetchApi(`/influencer/${id}`)
      .then((res) => setProfile(res.profile))
      .catch((err) => setError(err.message || 'Creator profile not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading profile...</div>;
  }

  if (error || !profile) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: '#ff3b30' }}>{error || 'Creator profile not found'}</div>;
  }

  const displayName = profile.displayName || 'Creator';
  const avatarUrl = getMediaUrl(profile.profilePhoto);
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff`;
  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'Global';
  const socialAccounts = profile.socialAccounts || [];
  const totalFollowers = socialAccounts.reduce((sum, a) => sum + (a.followers || 0), 0);
  const avgEngagement = socialAccounts.length
    ? (socialAccounts.reduce((sum, a) => sum + (a.engagementRate || 0), 0) / socialAccounts.length).toFixed(1)
    : '0.0';
  const niches = profile.contentNiches || [];
  const formats = profile.contentFormats || [];

  return (
    <div className="animate-fade-in">
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Creator Profile</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ padding: '2rem 2rem 0', textAlign: 'center' }}>
            <img src={avatarUrl || defaultAvatar} alt={displayName} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--background)', margin: '0 auto 1rem', display: 'block' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>{displayName}</h2>
            {profile.bio && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>{profile.bio}</p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <MapPin size={16} /> {location}
            </div>
            {niches.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {niches.map((n) => (
                  <span key={n.id} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.75rem' }}>
                    {n.name}
                  </span>
                ))}
              </div>
            )}
            {socialAccounts.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', flexWrap: 'wrap' }}>
                {socialAccounts.map((acc) => (
                  <a
                    key={acc.id}
                    href={acc.profileUrl || undefined}
                    target={acc.profileUrl ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}
                  >
                    {acc.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div style={{ paddingBottom: '1rem' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Social Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Followers</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{formatFollowers(totalFollowers)}</div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Avg. Engagement</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{avgEngagement}%</div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Accounts</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{socialAccounts.length}</div>
              </div>
            </div>
          </div>

          {formats.length > 0 && (
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Formats</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {formats.map((f) => (
                  <span key={f.id} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.75rem' }}>
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Portfolio</h3>
            {(profile.portfolioItems || []).length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>This creator hasn&apos;t added portfolio items yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                {(profile.portfolioItems || []).map((item) => (
                  <a
                    key={item.id}
                    href={item.url || undefined}
                    target={item.url ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'inherit', minHeight: '180px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}
                  >
                    {item.thumbnail ? (
                      <img src={getMediaUrl(item.thumbnail)} alt={item.title} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
                        <LinkIcon size={24} color="var(--text-secondary)" />
                      </div>
                    )}
                    <div style={{ padding: '0.5rem 0.75rem' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                      {item.description && (
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerPublicProfile;
