import React, { useState, useEffect } from 'react';
import { Camera, Edit3, Link as LinkIcon, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const role = localStorage.getItem('role') || 'brand';
  const [profile, setProfile] = useState({
    name: 'Sarah Jenkins',
    handle: '@sarahjenkins',
    location: 'Los Angeles, CA',
    bio: 'Tech enthusiast and lifestyle creator. Helping brands tell their story through high-quality video production and authentic reviews.',
    instagram: 'https://instagram.com/sarahjenkins',
    youtube: 'https://youtube.com/@sarahjenkins',
    twitter: 'https://twitter.com/sarahjenkins',
    followers: '1.2M',
    engagement: '5.4%',
    reach: '3.8M'
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>{role === 'brand' ? 'Company Profile' : 'My Profile'}</h1>
        <Link to="/dashboard/profile/edit" className="btn btn-primary btn-accent" style={{ display: 'flex', gap: '0.5rem', textDecoration: 'none' }}>
          <Edit3 size={18} /> Edit {role === 'brand' ? 'Company Profile' : 'Profile'}
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Profile Card */}
        <div className="glass-panel" style={{ overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ height: '200px', backgroundImage: 'url(https://picsum.photos/1200/400?blur)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
          <div style={{ padding: '0 2rem 2rem', textAlign: 'center' }}>
            <img src="https://i.pravatar.cc/300?img=5" alt="Profile" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--background)', margin: '-60px auto 1rem' }} />
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>{profile.name}</h2>
            <p style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{profile.handle}</p>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <MapPin size={16} /> {profile.location}
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              {profile.bio}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
              {profile.instagram && <a href={profile.instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.target.style.color = 'var(--accent)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Instagram</a>}
              {profile.youtube && <a href={profile.youtube} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.target.style.color = 'var(--accent)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>YouTube</a>}
              {profile.twitter && <a href={profile.twitter} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.target.style.color = 'var(--accent)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>X (Twitter)</a>}
            </div>
          </div>
        </div>

        {/* Portfolio & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Social Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Followers</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{profile.followers}</div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Avg. Engagement</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{profile.engagement}</div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Monthly Reach</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{profile.reach}</div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Portfolio</h3>
              <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem' }}>
                <LinkIcon size={16} /> Add Link
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div style={{ height: '180px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Sony A7IV Review Video
              </div>
              <div style={{ height: '180px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Smart Desk Setup Tour
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
