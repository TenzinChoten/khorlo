import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchApi, getMediaUrl } from '../lib/api';

const formatFollowers = (n) => {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return n.toString();
};

const SearchInfluencers = () => {
  const navigate = useNavigate();
  const [influencers, setInfluencers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchApi(`/influencers${search ? `?search=${encodeURIComponent(search)}` : ''}`)
      .then(res => setInfluencers(res.influencers || []))
      .catch(() => setInfluencers([]))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="animate-fade-in">
      {/* [Reason] Keep the creator filter in the header top-right so the grid can use the full width */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Discover Creators</h1>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Name or handle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '280px', maxWidth: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', background: 'var(--apple-surface)', border: '1px solid var(--apple-border)', borderRadius: '12px', boxShadow: 'var(--apple-shadow)', color: 'var(--apple-text-primary)', outline: 'none', fontSize: '0.9rem', transition: 'box-shadow 0.2s' }}
            onFocus={(e) => e.target.style.boxShadow = 'var(--apple-shadow-hover)'}
            onBlur={(e) => e.target.style.boxShadow = 'var(--apple-shadow)'}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading creators...</div>
      ) : influencers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>No creators found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {influencers.map((inf) => {
            // [Reason] Uploaded photos are /uploads paths on the API host, not the Vite origin
            const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(inf.displayName || 'U')}&background=random&color=fff`;
            const avatarSrc = getMediaUrl(inf.profilePhoto) || fallbackAvatar;
            const niches = inf.contentNiches?.map(n => n.contentNiche?.name).filter(Boolean) || [];
            return (
              <div key={inf.id} className="apple-card-hover" style={{ padding: '2rem', textAlign: 'center' }}>
                <img
                  src={avatarSrc}
                  alt={inf.displayName}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem' }}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackAvatar; }}
                />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>{inf.displayName}</h3>
                {niches.length > 0 && (
                  <p style={{ color: 'var(--accent)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{niches.slice(0, 2).join(' · ')}</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{formatFollowers(inf.totalFollowers)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Followers</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{inf.avgEngagement?.toFixed(1)}%</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Engagement</div>
                  </div>
                </div>
                {/* [Reason] The button had no handler, so brands could not open a creator profile */}
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '0.875rem', padding: '0.5rem' }}
                  onClick={() => navigate(`/dashboard/influencers/${inf.id}`)}
                >
                  View Profile
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchInfluencers;
