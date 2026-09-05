import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, Camera, PlayCircle, AtSign, Music, KeyRound, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchApi, getMediaUrl } from '../lib/api';
import { isPublicHttpUrl, sanitizePublicText, sanitizePublicUrl } from '../lib/publicUrl';
// [Reason] Location lists are async chunks; only fetch countries/states/cities when this form needs them
import { getAllCountries, findCountryByName, getStatesOfCountry, getCitiesOfState } from '../lib/locationData';
import SearchableDropdown from '../components/SearchableDropdown';
import ImageCropper from '../components/ImageCropper';
const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    oldPassword: '',
    password: '',
    bio: '',
    website: '',
    avatar: '',
    country: '',
    state: '',
    city: ''
  });

  const [locationCodes, setLocationCodes] = useState({
    countryCode: '',
    stateCode: ''
  });
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  // [Reason] Hold async city options so city.json is not imported with the page
  const [availableCities, setAvailableCities] = useState([]);

  const [socials, setSocials] = useState([]);
  const [content, setContent] = useState({ niches: [], formats: [] });

  const availableNiches = ['Tech', 'Beauty', 'Fashion', 'Fitness', 'Gaming', 'Lifestyle', 'Travel', 'Food'];
  // [Reason] Keep profile format options aligned with the product content-format list
  const availableFormats = ['Short-form Video', 'Long-form Video', 'Photo', 'Carousel', 'Story', 'Live Stream', 'Written Article', 'Audio / Podcast'];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (!user) return;
    const endpoint = user.role === 'BUSINESS' ? '/business/me' : '/influencer/me';
    
    fetchApi(endpoint)
      .then(async (res) => {
        const data = res.profile || {};
        const isBiz = user.role === 'BUSINESS';
        
        let cCode = '';
        let sCode = '';
        if (data.country) {
          const c = await findCountryByName(data.country);
          if (c) cCode = c.isoCode;
        }
        if (cCode && data.state) {
          const states = await getStatesOfCountry(cCode);
          const s = states.find(s => s.name === data.state);
          if (s) sCode = s.isoCode;
        }

        setLocationCodes({ countryCode: cCode, stateCode: sCode });

        setProfile({
          name: isBiz ? (data.companyName || user.name) : (data.displayName || user.name),
          email: data.user?.email || user.email || '',
          oldPassword: '',
          password: '',
          bio: isBiz ? (sanitizePublicText(data.companyDescription) || '') : (sanitizePublicText(data.bio) || ''),
          website: isBiz ? (sanitizePublicUrl(data.website) || '') : '',
          avatar: isBiz ? data.companyLogo : data.profilePhoto,
          country: data.country || '',
          state: data.state || '',
          city: data.city || ''
        });

        if (data.socialAccounts && data.socialAccounts.length > 0) {
          setSocials(data.socialAccounts);
        } else {
          setSocials([{ id: Date.now().toString(), platform: 'INSTAGRAM', username: '', followers: '', engagementRate: '' }]);
        }

        if (!isBiz) {
          setContent({
            niches: data.contentNiches?.map(n => n.contentNiche.name) || [],
            formats: data.contentFormats?.map(f => f.contentFormat.name) || []
          });
        }
      })
      .catch(err => setError('Failed to load profile data'))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    // [Reason] Country JSON is a separate async chunk loaded only on this location form
    getAllCountries().then((countries) => {
      if (!cancelled) setAvailableCountries(countries);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (locationCodes.countryCode) {
      getStatesOfCountry(locationCodes.countryCode).then((states) => {
        if (!cancelled) setAvailableStates(states);
      });
    } else {
      setAvailableStates([]);
    }
    return () => { cancelled = true; };
  }, [locationCodes.countryCode]);

  useEffect(() => {
    let cancelled = false;
    if (locationCodes.countryCode && locationCodes.stateCode) {
      // [Reason] City JSON is a separate async chunk; ignore stale results if the user changes state
      getCitiesOfState(locationCodes.countryCode, locationCodes.stateCode).then((cities) => {
        if (!cancelled) setAvailableCities(cities);
      });
    } else {
      setAvailableCities([]);
    }
    return () => { cancelled = true; };
  }, [locationCodes.countryCode, locationCodes.stateCode]);

  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setCropImageSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (val) => {
    const code = val ? JSON.parse(val).code : '';
    const name = val ? JSON.parse(val).name : '';
    setLocationCodes(prev => ({ ...prev, countryCode: code, stateCode: '' }));
    setProfile(prev => ({ ...prev, country: name, state: '', city: '' }));
  };

  const handleStateChange = (val) => {
    const code = val ? JSON.parse(val).code : '';
    const name = val ? JSON.parse(val).name : '';
    setLocationCodes(prev => ({ ...prev, stateCode: code }));
    setProfile(prev => ({ ...prev, state: name, city: '' }));
  };

  const handleCityChange = (val) => {
    setProfile(prev => ({ ...prev, city: val }));
  };

  const addSocial = () => {
    setSocials([...socials, { id: Date.now().toString(), platform: 'INSTAGRAM', username: '', followers: '', engagementRate: '' }]);
  };

  const removeSocial = (id) => {
    setSocials(socials.filter(s => s.id !== id));
  };

  const updateSocial = (id, field, value) => {
    setSocials(socials.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const toggleNiche = (niche) => {
    setContent(prev => ({
      ...prev,
      niches: prev.niches.includes(niche) 
        ? prev.niches.filter(n => n !== niche)
        : [...prev.niches, niche]
    }));
  };

  const toggleFormat = (format) => {
    setContent(prev => ({
      ...prev,
      formats: prev.formats.includes(format)
        ? prev.formats.filter(f => f !== format)
        : [...prev.formats, format]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const isBiz = user.role === 'BUSINESS';
      if (isBiz && profile.website.trim() && !isPublicHttpUrl(profile.website)) {
        setError('Website must be a public company URL, not a dashboard or database link.');
        setSaving(false);
        return;
      }
      
      let avatarUrl = profile.avatar;
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        const uploadRes = await fetchApi('/upload', { method: 'POST', body: formData });
        avatarUrl = uploadRes.url;
      }

      const endpoint = isBiz ? '/business/me' : '/influencer/me';
      
      const payload = isBiz ? {
        companyName: profile.name,
        companyDescription: profile.bio,
        companyLogo: avatarUrl,
        website: sanitizePublicUrl(profile.website),
        country: profile.country,
        state: profile.state,
        city: profile.city,
        userName: profile.name,
        email: profile.email,
        socialAccounts: socials.filter(s => s.username && s.username.trim() !== ''),
      } : {
        displayName: profile.name,
        profilePhoto: avatarUrl,
        bio: profile.bio,
        country: profile.country,
        state: profile.state,
        city: profile.city,
        userName: profile.name,
        email: profile.email,
        socialAccounts: socials.filter(s => s.username && s.username.trim() !== ''),
        contentNiches: content.niches,
        contentFormats: content.formats,
      };

      await fetchApi(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      navigate('/dashboard/profile');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      setSaving(false);
    }
  };

  if (!user || loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;
  }

  const isBusiness = user.role === 'BUSINESS';

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/dashboard/profile')} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Edit Profile</h1>
      </div>

      <div className="apple-panel" style={{ padding: '2rem' }}>
        {cropImageSrc && (
          <ImageCropper 
            imageSrc={cropImageSrc}
            onCropComplete={(file, url) => {
              setPhotoFile(file);
              setPhotoPreview(url);
              setCropImageSrc(null);
            }}
            onCancel={() => setCropImageSrc(null)}
          />
        )}
        {error && (
          <div style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', borderRadius: '8px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--apple-border)' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={photoPreview || getMediaUrl(profile.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'U')}&background=random&color=fff`} 
                alt="Profile" 
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} 
              />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Profile Picture</h3>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--apple-text-secondary)', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '100px', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)'; e.currentTarget.style.color = 'var(--apple-text-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'; e.currentTarget.style.color = 'var(--apple-text-secondary)'; }}>
                <Camera size={14} /> Change Photo
                <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                {isBusiness ? 'Company Name' : 'Display Name'}
              </label>
              <input 
                type="text" 
                name="name"
                value={profile.name}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                Email Address
              </label>
              <input 
                type="email" 
                name="email"
                value={profile.email}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none' }}
                required
              />
            </div>
          </div>


          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Country</label>
              <SearchableDropdown
                options={availableCountries.map(c => ({ value: JSON.stringify({ name: c.name, code: c.isoCode }), label: c.name }))}
                value={profile.country}
                onChange={handleCountryChange}
                placeholder="Select Country"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>State</label>
              <SearchableDropdown
                options={availableStates.map(s => ({ value: JSON.stringify({ name: s.name, code: s.isoCode }), label: s.name }))}
                value={profile.state}
                onChange={handleStateChange}
                placeholder="Select State"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>City</label>
              <SearchableDropdown
                options={availableCities.map(c => ({ value: c.name, label: c.name }))}
                value={profile.city}
                onChange={handleCityChange}
                placeholder="Select City"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              {isBusiness ? 'Company Description' : 'Bio'}
            </label>
            <textarea 
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows="4"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none', resize: 'vertical' }}
            ></textarea>
          </div>

          {isBusiness && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                Website URL
              </label>
              <input 
                // [Reason] Avoid browser autofill stuffing a Supabase dashboard URL into Website
                type="url" 
                name="companyWebsite"
                autoComplete="off"
                data-1p-ignore="true"
                value={profile.website}
                onChange={(e) => setProfile((prev) => ({ ...prev, website: e.target.value }))}
                placeholder="https://example.com"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none' }}
              />
            </div>
          )}

          {/* Social Accounts Section */}
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--apple-border)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Social Accounts</h3>
            {socials.map((social) => (
              <div key={social.id} style={{ background: 'var(--apple-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--apple-border)', marginBottom: '1rem', position: 'relative' }}>
                {socials.length > 1 && (
                  <button type="button" onClick={() => removeSocial(social.id)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--apple-text-secondary)' }}>Platform</label>
                    <select 
                      value={social.platform}
                      onChange={(e) => updateSocial(social.id, 'platform', e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none', appearance: 'none' }}
                    >
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="TIKTOK">TikTok</option>
                      <option value="YOUTUBE">YouTube</option>
                      <option value="X">X (Twitter)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--apple-text-secondary)' }}>Username / Handle</label>
                    <div style={{ position: 'relative' }}>
                      {social.platform === 'INSTAGRAM' && <Camera size={18} color="var(--apple-text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />}
                      {social.platform === 'TIKTOK' && <Music size={18} color="var(--apple-text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />}
                      {social.platform === 'YOUTUBE' && <PlayCircle size={18} color="var(--apple-text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />}
                      {social.platform === 'X' && <AtSign size={18} color="var(--apple-text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />}
                      
                      <input 
                        type="text" 
                        value={social.username}
                        onChange={(e) => updateSocial(social.id, 'username', e.target.value)}
                        placeholder="@username" 
                        style={{ width: '100%', padding: '0.75rem 2.75rem 0.75rem 2.75rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none' }} 
                        required 
                      />
                      {social.username && (
                        <a 
                          href={
                            social.platform === 'INSTAGRAM' ? `https://instagram.com/${social.username.replace('@', '')}` :
                            social.platform === 'TIKTOK' ? `https://tiktok.com/@${social.username.replace('@', '')}` :
                            social.platform === 'YOUTUBE' ? `https://youtube.com/@${social.username.replace('@', '')}` :
                            social.platform === 'X' ? `https://x.com/${social.username.replace('@', '')}` : '#'
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--apple-text-secondary)', transition: 'color 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--apple-text-primary)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--apple-text-secondary)'}
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--apple-text-secondary)' }}>Followers</label>
                    <input 
                      type="number" 
                      value={social.followers}
                      onChange={(e) => updateSocial(social.id, 'followers', e.target.value)}
                      placeholder="10000" 
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none' }} 
                      required 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--apple-text-secondary)' }}>Engagement Rate (%)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={social.engagementRate}
                      onChange={(e) => updateSocial(social.id, 'engagementRate', e.target.value)}
                      placeholder="5.2" 
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none' }} 
                    />
                  </div>
                </div>
              </div>
            ))}

            <button type="button" onClick={addSocial} className="btn btn-outline" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <Plus size={18} /> Add Another Account
            </button>
          </div>

          {/* Content Strategy (Influencer Only) */}
          {!isBusiness && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--apple-border)', paddingTop: '1.5rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Content Niches</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {availableNiches.map(niche => (
                    <div 
                      key={niche}
                      onClick={() => toggleNiche(niche)}
                      className={`choice-chip${content.niches.includes(niche) ? ' is-selected' : ''}`}
                    >
                      {niche}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Content Formats</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {availableFormats.map(format => (
                    <div 
                      key={format}
                      onClick={() => toggleFormat(format)}
                      className={`choice-chip${content.formats.includes(format) ? ' is-selected' : ''}`}
                    >
                      {format}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--apple-border)', paddingTop: '1.5rem' }}>
            <button 
              type="button" 
              onClick={() => navigate('/dashboard/profile/change-password')}
              className="btn btn-outline"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                borderColor: 'rgba(234, 179, 8, 0.4)',
                color: '#facc15',
                background: 'rgba(234, 179, 8, 0.08)',
                fontSize: '0.875rem'
              }}
            >
              <KeyRound size={16} /> Change Password
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary btn-accent" style={{ display: 'flex', gap: '0.5rem' }}>
              <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
