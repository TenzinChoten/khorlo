import React, { useState, useEffect } from 'react';
import { Edit3, Link as LinkIcon, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi, getMediaUrl } from '../lib/api';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const endpoint = user.role === 'BUSINESS' ? '/business/me' : '/influencer/me';
    fetchApi(endpoint)
      .then(res => setProfileData(res.profile))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading profile...</div>;
  }

  const isBusiness = user.role === 'BUSINESS';
  const profile = profileData || {};

  const displayName = isBusiness ? (profile.companyName || user.name) : (profile.displayName || user.name);
  const rawAvatarUrl = isBusiness ? profile.companyLogo : profile.profilePhoto;
  const avatarUrl = getMediaUrl(rawAvatarUrl);
  const bio = isBusiness ? profile.companyDescription : profile.bio;
  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'Global';

  // Social stats for influencers
  const socialAccounts = profile.socialAccounts || [];
  const totalFollowers = socialAccounts.reduce((sum, a) => sum + (a.followers || 0), 0);
  const avgEngagement = socialAccounts.length
    ? (socialAccounts.reduce((sum, a) => sum + (a.engagementRate || 0), 0) / socialAccounts.length).toFixed(1)
    : '0.0';
  const formatFollowers = (n) => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(0) + 'K' : n.toString();

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'U')}&background=random&color=fff`;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Profile</h1>
        <Link to="/dashboard/profile/edit" className="btn btn-primary btn-accent" style={{ display: 'flex', gap: '0.5rem', textDecoration: 'none' }}>
          <Edit3 size={18} /> Edit Profile
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Profile Card */}
        <div className="glass-panel" style={{ overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ padding: '2rem 2rem 0', textAlign: 'center' }}>
            <img src={avatarUrl || defaultAvatar} alt="Profile" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--background)', margin: '0 auto 1rem', display: 'block' }} />

            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>{displayName || 'No name set'}</h2>
            {!isBusiness && profile.bio && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>{bio}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <MapPin size={16} /> {location}
            </div>

            {isBusiness && profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', textDecoration: 'none' }}>
                <LinkIcon size={14} /> {profile.website}
              </a>
            )}

            {isBusiness && bio && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, padding: '1rem', borderTop: '1px solid var(--glass-border)', textAlign: 'left' }}>{bio}</p>
            )}

            {!isBusiness && socialAccounts.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', flexWrap: 'wrap' }}>
                {socialAccounts.map(acc => (
                  <a key={acc.id} href={acc.profileUrl || '#'} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s ease' }}
                    onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                  >
                    {acc.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div style={{ paddingBottom: '1rem' }} />
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {!isBusiness && (
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
          )}

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>{isBusiness ? 'Recent Campaigns' : 'Portfolio'}</h3>
            </div>

            {isBusiness ? (
              (profile.campaigns || []).length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>No campaigns yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {profile.campaigns.map(c => (
                    <div key={c.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 500 }}>{c.title}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.status}</span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              (profile.portfolioItems || []).length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
                  No portfolio items yet. Edit your profile to add some!
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                  {profile.portfolioItems.map(item => (
                    <a key={item.id} href={item.url || '#'} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ height: '160px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
                            <LinkIcon size={24} color="var(--text-secondary)" />
                          </div>
                        )}
                        <div style={{ padding: '0.5rem 0.75rem' }}>
                          <p style={{ fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
