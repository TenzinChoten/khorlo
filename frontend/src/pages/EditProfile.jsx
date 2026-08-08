import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, ArrowLeft } from 'lucide-react';

const EditProfile = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'brand';
  
  // Default data in case localStorage is empty
  const defaultProfile = {
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
  };

  const [profile, setProfile] = useState(defaultProfile);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In the future, this is where the API call to the backend will go
    navigate('/dashboard/profile');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/dashboard/profile')} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Edit {role === 'brand' ? 'Company Profile' : 'Profile'}</h1>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <div style={{ position: 'relative' }}>
              <img src="https://i.pravatar.cc/300?img=5" alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
              <button type="button" style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--accent)', color: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={16} />
              </button>
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Profile Picture</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Recommended size: 400x400px. Maximum file size: 2MB.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
              <input 
                type="text" 
                name="name"
                value={profile.name}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Username / Handle</label>
              <input 
                type="text" 
                name="handle"
                value={profile.handle}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Location</label>
            <input 
              type="text" 
              name="location"
              value={profile.location}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Bio</label>
            <textarea 
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows="4"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', resize: 'vertical' }}
            ></textarea>
          </div>

          <h3 style={{ fontSize: '1.25rem', marginTop: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Social Links</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Instagram</label>
              <input 
                type="url" 
                name="instagram"
                value={profile.instagram}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>YouTube</label>
              <input 
                type="url" 
                name="youtube"
                value={profile.youtube}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>X (Twitter)</label>
              <input 
                type="url" 
                name="twitter"
                value={profile.twitter}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary btn-accent" style={{ display: 'flex', gap: '0.5rem' }}>
              <Save size={18} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
