import React from 'react';
import { Search, MapPin, DollarSign, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const SearchCampaigns = () => {
  const campaigns = [
    { id: 1, brand: 'TechNova', title: 'Smart Home Hub Launch', type: 'Paid', budget: '$500 - $1000', platform: 'YouTube', deadline: '3 days left' },
    { id: 2, brand: 'FreshEats', title: 'Vegan Meal Kit Review', type: 'Free Product', budget: 'Product Value: $150', platform: 'Instagram', deadline: '1 week left' },
    { id: 3, brand: 'GlowCosmetics', title: 'Summer Skincare Routine', type: 'Paid', budget: '$300 - $600', platform: 'TikTok', deadline: '5 days left' },
    { id: 4, brand: 'FitLife', title: '30-Day Fitness Challenge', type: 'Paid & Product', budget: '$200 + Gear', platform: 'Instagram', deadline: '2 weeks left' },
  ];

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
          style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '12px', outline: 'none' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {campaigns.map(camp => (
          <div key={camp.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <img src={`https://ui-avatars.com/api/?name=${camp.brand}&background=random&color=fff`} alt={camp.brand} style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover' }} />
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <p style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>{camp.brand}</p>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{camp.title}</h3>
                </div>
                <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent)', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {camp.platform}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={16} /> {camp.budget}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> Global / Online</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> {camp.deadline}</div>
              </div>
            </div>

            <div>
              <Link to={`/dashboard/campaign/${camp.id}`} className="btn btn-primary">View Details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchCampaigns;
