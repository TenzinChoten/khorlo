import React, { useState, useEffect } from 'react';
import { Filter, Search } from 'lucide-react';
import { fetchApi } from '../lib/api';

const formatFollowers = (n) => {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return n.toString();
};

const SearchInfluencers = () => {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Discover Creators</h1>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Filters Sidebar */}
        <div className="glass-panel" style={{ width: '250px', padding: '1.5rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>
            <Filter size={18} /> Filters
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Search</label>
            <input
              type="text"
              placeholder="Name or handle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', outline: 'none' }}
            />
          </div>
        </div>

        {/* Results Grid */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading creators...</div>
          ) : influencers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>No creators found.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {influencers.map((inf) => {
                const avatarSrc = inf.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(inf.displayName || 'U')}&background=random&color=fff`;
                const niches = inf.contentNiches?.map(n => n.contentNiche?.name).filter(Boolean) || [];
                return (
                  <div key={inf.id} className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <img src={avatarSrc} alt={inf.displayName} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem' }} />
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
                    <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.875rem', padding: '0.5rem' }}>View Profile</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchInfluencers;
