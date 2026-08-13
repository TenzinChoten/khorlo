import React, { useState, useEffect } from 'react';
import { Edit3, Link as LinkIcon, MapPin, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi, getMediaUrl } from '../lib/api';
import AddPortfolioModal from '../components/AddPortfolioModal';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState(undefined);

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
        <Link 
          to="/dashboard/profile/edit" 
          className="btn btn-outline" 
          style={{ padding: '0.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
          title="Edit Profile"
        >
          <Edit3 size={18} />
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
              {!isBusiness && (
                <button
                  type="button"
                  onClick={() => setEditingPortfolioItem(null)}
                  className="btn btn-outline"
                  title="Add portfolio item"
                  style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={18} />
                </button>
              )}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingPortfolioItem(null)}
                  style={{
                    height: '180px',
                    background: 'transparent',
                    borderRadius: '12px',
                    border: '1px dashed var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={28} />
                  <span style={{ fontSize: '0.8rem' }}>Add work</span>
                </button>
                {(profile.portfolioItems || []).map(item => (
                  <div key={item.id} style={{ minHeight: '180px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setEditingPortfolioItem(item)}
                      title="Edit portfolio item"
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        zIndex: 1,
                        padding: '0.35rem',
                        borderRadius: '50%',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(0,0,0,0.55)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                      }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <a href={item.url || undefined} target={item.url ? '_blank' : undefined} rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flex: 1 }}>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {editingPortfolioItem !== undefined && (
        <AddPortfolioModal
          item={editingPortfolioItem}
          onClose={() => setEditingPortfolioItem(undefined)}
          onSaved={(updatedProfile) => {
            setProfileData(updatedProfile);
            setEditingPortfolioItem(undefined);
          }}
        />
      )}
    </div>
  );
};

export default Profile;
