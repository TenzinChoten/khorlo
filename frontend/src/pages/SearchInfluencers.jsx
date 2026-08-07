import React from 'react';
import { Filter, Search } from 'lucide-react';

const SearchInfluencers = () => {
  const influencers = [
    { name: 'Jane Doe', handle: '@janedoe', followers: '1.2M', niche: 'Fashion', rate: '5.2%' },
    { name: 'John Smith', handle: '@johntech', followers: '850K', niche: 'Tech', rate: '6.8%' },
    { name: 'Sarah Lee', handle: '@sarahbakes', followers: '420K', niche: 'Food', rate: '8.4%' },
    { name: 'Mike Johnson', handle: '@mikefitness', followers: '2.1M', niche: 'Fitness', rate: '4.1%' },
    { name: 'Emma Wilson', handle: '@emmatravels', followers: '950K', niche: 'Travel', rate: '7.2%' },
    { name: 'David Chen', handle: '@davidgaming', followers: '3.4M', niche: 'Gaming', rate: '6.5%' },
  ];

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
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Niche</label>
            <select style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}>
              <option>All Niches</option>
              <option>Fashion</option>
              <option>Tech</option>
              <option>Food</option>
              <option>Travel</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Min Followers</label>
            <input type="range" min="0" max="100" style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>0</span>
              <span>10M+</span>
            </div>
          </div>
          
          <button className="btn btn-outline" style={{ width: '100%', fontSize: '0.875rem', padding: '0.5rem' }}>Apply Filters</button>
        </div>

        {/* Results Grid */}
        <div style={{ flex: 1 }}>
          <div style={{ position: 'relative', marginBottom: '2rem' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search by name or handle..." 
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '12px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {influencers.map((inf, i) => (
              <div key={i} className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <img src={`https://i.pravatar.cc/150?img=${(i + 1) * 10}`} alt="avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>{inf.name}</h3>
                <p style={{ color: 'var(--accent)', fontSize: '0.875rem', marginBottom: '1rem' }}>{inf.handle}</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{inf.followers}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Followers</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{inf.rate}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Engagement</div>
                  </div>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.875rem', padding: '0.5rem' }}>View Profile</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchInfluencers;
