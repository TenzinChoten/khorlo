import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Plus, Trash2, ChevronRight, ChevronLeft, Check, Camera, PlayCircle, AtSign, Music, ExternalLink } from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import SearchableDropdown from '../components/SearchableDropdown';
import { fetchApi } from '../lib/api';
import ImageCropper from '../components/ImageCropper';

const CreatorOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const savedState = JSON.parse(localStorage.getItem('creatorOnboardingState') || '{}');

  const [step, setStep] = useState(savedState.step || 1);
  
  const [basicInfo, setBasicInfo] = useState(savedState.basicInfo || {
    displayName: location.state?.name || '',
    age: '',
    gender: '',
    country: '',
    state: '',
    city: '',
    ethnicity: '',
    previousBrands: ''
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(savedState.photoPreview || null);
  const [cropImageSrc, setCropImageSrc] = useState(null);

  const [locationCodes, setLocationCodes] = useState(savedState.locationCodes || {
    countryCode: '',
    stateCode: ''
  });

  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  useEffect(() => {
    if (locationCodes.countryCode) {
      setAvailableStates(State.getStatesOfCountry(locationCodes.countryCode));
    } else {
      setAvailableStates([]);
    }
  }, [locationCodes.countryCode]);

  useEffect(() => {
    if (locationCodes.countryCode && locationCodes.stateCode) {
      setAvailableCities(City.getCitiesOfState(locationCodes.countryCode, locationCodes.stateCode));
    } else {
      setAvailableCities([]);
    }
  }, [locationCodes.countryCode, locationCodes.stateCode]);

  const [socials, setSocials] = useState(savedState.socials || [
    { id: 1, platform: 'INSTAGRAM', username: '', followers: '', engagementRate: '' }
  ]);

  const [content, setContent] = useState(savedState.content || {
    niches: [],
    formats: []
  });

  const availableNiches = ['Tech', 'Beauty', 'Fashion', 'Fitness', 'Gaming', 'Lifestyle', 'Travel', 'Food'];
  const availableFormats = ['Short-form Video', 'Long-form Video', 'Photography', 'Live Streams', 'Blog Posts'];

  // Step 4 State
  const [referralSources, setReferralSources] = useState(savedState.referralSources || []);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    const stateToSave = {
      step, basicInfo, photoPreview, locationCodes, socials, content, referralSources
    };
    localStorage.setItem('creatorOnboardingState', JSON.stringify(stateToSave));
  }, [step, basicInfo, photoPreview, locationCodes, socials, content, referralSources]);
  
  const availableReferralSources = ['TikTok', 'Instagram', 'YouTube', 'X (Twitter)', 'LinkedIn', 'Google Search', 'Friend / Colleague', 'Podcast', 'Other'];

  const toggleReferralSource = (source) => {
    setReferralSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      const isStateRequired = availableStates.length > 0;
      const isCityRequired = availableCities.length > 0;
      if (!basicInfo.displayName || !basicInfo.age || !basicInfo.gender || !basicInfo.country || 
          (isStateRequired && !basicInfo.state) || 
          (isCityRequired && !basicInfo.city)) {
        setShowErrors(true);
        return;
      }
    } else if (step === 2) {
      const hasInvalidSocial = socials.some(s => !s.platform || !s.username || !s.followers);
      if (hasInvalidSocial) {
        setShowErrors(true);
        return;
      }
    }
    setShowErrors(false);
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let profilePhotoUrl = null;
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        const uploadRes = await fetchApi('/upload', { method: 'POST', body: formData });
        profilePhotoUrl = uploadRes.url;
      }

      const payload = {
        displayName: basicInfo.displayName,
        profilePhoto: profilePhotoUrl,
        age: basicInfo.age ? parseInt(basicInfo.age) : null,
        gender: basicInfo.gender || null,
        country: basicInfo.country,
        state: basicInfo.state,
        city: basicInfo.city,
        ethnicity: basicInfo.ethnicity || null,
        previousBrands: basicInfo.previousBrands || null,
        socialAccounts: socials.filter(s => s.username.trim() !== ''),
        contentNiches: content.niches,
        contentFormats: content.formats,
        heardAboutUs: referralSources.join(', ')
      };
      
      await fetchApi('/influencer/me', {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      localStorage.removeItem('creatorOnboardingState');
      navigate('/dashboard/influencer');
    } catch (err) {
      console.error('Failed to save onboarding data:', err);
      alert('Failed to save onboarding data. Please try again.');
    }
  };

  const addSocial = () => {
    setSocials([...socials, { id: Date.now(), platform: 'INSTAGRAM', username: '', followers: '', engagementRate: '' }]);
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

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 2rem', minHeight: 'calc(100vh - 80px)' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '700px', height: 'fit-content' }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0, transform: 'translateY(-50%)' }}>
            <div style={{ width: `${((step - 1) / 3) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }}></div>
          </div>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              background: step >= s ? 'var(--accent)' : 'var(--background)',
              border: `2px solid ${step >= s ? 'var(--accent)' : 'rgba(255,255,255,0.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600, color: step >= s ? 'white' : 'var(--text-secondary)',
              zIndex: 1, transition: 'all 0.3s ease'
            }}>
              {step > s ? <Check size={16} /> : s}
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          {step === 1 && "Basic Information"}
          {step === 2 && "Social Presence"}
          {step === 3 && "Content Strategy"}
          {step === 4 && "How did you hear about us?"}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {step === 1 && "Let brands know who you are."}
          {step === 2 && "Add your social accounts and statistics."}
          {step === 3 && "Tell us what you create and how you create it."}
          {step === 4 && "Help us understand where our users are coming from."}
        </p>

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

        <form onSubmit={step === 4 ? handleSubmit : handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <label style={{ 
                  width: '120px', height: '120px', borderRadius: '50%', 
                  background: photoPreview ? `url(${photoPreview}) center/cover no-repeat` : 'rgba(255,255,255,0.05)', 
                  border: photoPreview ? 'none' : '2px dashed var(--glass-border)', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                  cursor: 'pointer', color: 'var(--text-secondary)', position: 'relative', overflow: 'hidden'
                }}>
                  {!photoPreview && (
                    <>
                      <Upload size={24} style={{ marginBottom: '0.5rem' }} />
                      <span style={{ fontSize: '0.75rem' }}>Profile Photo</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setCropImageSrc(URL.createObjectURL(file));
                      }
                      e.target.value = ''; // Reset
                    }} 
                    style={{ display: 'none' }} 
                  />
                </label>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Display Name <span style={{ color: showErrors && !basicInfo.displayName ? '#ffffff' : 'var(--text-secondary)', transition: 'all 0.3s' }}>*</span></label>
                <input 
                  type="text" 
                  value={basicInfo.displayName}
                  onChange={(e) => setBasicInfo({...basicInfo, displayName: e.target.value})}
                  placeholder="Jane Doe"
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Age <span style={{ color: showErrors && !basicInfo.age ? '#ffffff' : 'var(--text-secondary)', transition: 'all 0.3s' }}>*</span></label>
                  <input 
                    type="number" 
                    value={basicInfo.age}
                    onChange={(e) => setBasicInfo({...basicInfo, age: e.target.value})}
                    placeholder="25" 
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Gender <span style={{ color: showErrors && !basicInfo.gender ? '#ffffff' : 'var(--text-secondary)', transition: 'all 0.3s' }}>*</span></label>
                  <select 
                    value={basicInfo.gender}
                    onChange={(e) => setBasicInfo({...basicInfo, gender: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', appearance: 'none' }}
                  >
                    <option value="">Select...</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="NON_BINARY">Non-Binary</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Country <span style={{ color: showErrors && !basicInfo.country ? '#ffffff' : 'var(--text-secondary)', transition: 'all 0.3s' }}>*</span></label>
                  <SearchableDropdown
                    options={Country.getAllCountries().map(c => ({ value: c.isoCode, label: c.name }))}
                    value={basicInfo.country}
                    onChange={(opt) => {
                      const name = opt ? (typeof opt === 'string' ? opt : opt.label) : '';
                      setBasicInfo(prev => ({ ...prev, country: name, state: '', city: '' }));
                      const countryObj = Country.getAllCountries().find(c => c.name === name);
                      setLocationCodes(prev => ({ ...prev, countryCode: countryObj ? countryObj.isoCode : '', stateCode: '' }));
                    }}
                    placeholder="Select Country..."
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>State/Region {availableStates.length > 0 && <span style={{ color: showErrors && !basicInfo.state ? '#ffffff' : 'var(--text-secondary)', transition: 'all 0.3s' }}>*</span>}</label>
                  <SearchableDropdown
                    options={availableStates.map(s => ({ value: s.isoCode, label: s.name }))}
                    value={basicInfo.state}
                    onChange={(opt) => {
                      const name = opt ? (typeof opt === 'string' ? opt : opt.label) : '';
                      setBasicInfo(prev => ({ ...prev, state: name, city: '' }));
                      const stateObj = availableStates.find(s => s.name === name);
                      setLocationCodes(prev => ({ ...prev, stateCode: stateObj ? stateObj.isoCode : '' }));
                    }}
                    placeholder="Select State..."
                    disabled={!locationCodes.countryCode || availableStates.length === 0}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>City {availableCities.length > 0 && <span style={{ color: showErrors && !basicInfo.city ? '#ffffff' : 'var(--text-secondary)', transition: 'all 0.3s' }}>*</span>}</label>
                  <SearchableDropdown
                    options={availableCities.map(c => ({ value: c.name, label: c.name }))}
                    value={basicInfo.city}
                    onChange={(opt) => {
                      const name = opt ? (typeof opt === 'string' ? opt : opt.label) : '';
                      setBasicInfo(prev => ({ ...prev, city: name }));
                    }}
                    placeholder="Select City..."
                    disabled={!locationCodes.stateCode || availableCities.length === 0}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Ethnicity (Optional)
                  </label>
                  <select 
                    value={basicInfo.ethnicity} 
                    onChange={(e) => setBasicInfo({...basicInfo, ethnicity: e.target.value})} 
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', appearance: 'none' }}
                  >
                    <option value="" style={{ color: 'black' }}>Select Ethnicity...</option>
                    <option value="Asian" style={{ color: 'black' }}>Asian</option>
                    <option value="Black/African Descent" style={{ color: 'black' }}>Black/African Descent</option>
                    <option value="Hispanic/Latino" style={{ color: 'black' }}>Hispanic/Latino</option>
                    <option value="Middle Eastern" style={{ color: 'black' }}>Middle Eastern</option>
                    <option value="Native American/Indigenous" style={{ color: 'black' }}>Native American/Indigenous</option>
                    <option value="Pacific Islander" style={{ color: 'black' }}>Pacific Islander</option>
                    <option value="White/Caucasian" style={{ color: 'black' }}>White/Caucasian</option>
                    <option value="Mixed/Multiple Ethnicities" style={{ color: 'black' }}>Mixed/Multiple Ethnicities</option>
                    <option value="Prefer not to say" style={{ color: 'black' }}>Prefer not to say</option>
                    <option value="Other" style={{ color: 'black' }}>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Previous Brands Worked With (Optional)
                  </label>
                  <input 
                    type="text" 
                    value={basicInfo.previousBrands} 
                    onChange={(e) => setBasicInfo({...basicInfo, previousBrands: e.target.value})} 
                    placeholder="e.g. Nike, Sephora, Samsung" 
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} 
                  />
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: Socials */}
          {step === 2 && (
            <div className="animate-fade-in">
              {socials.map((social, index) => (
                <div key={social.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem', position: 'relative' }}>
                  {socials.length > 1 && (
                    <button type="button" onClick={() => removeSocial(social.id)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Platform <span style={{ color: showErrors && !social.platform ? '#ffffff' : 'var(--text-secondary)', transition: 'all 0.3s' }}>*</span></label>
                      <select 
                        value={social.platform}
                        onChange={(e) => updateSocial(social.id, 'platform', e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', appearance: 'none' }}
                      >
                        <option value="INSTAGRAM">Instagram</option>
                        <option value="TIKTOK">TikTok</option>
                        <option value="YOUTUBE">YouTube</option>
                        <option value="X">X (Twitter)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Username / Handle <span style={{ color: showErrors && !social.username ? '#ffffff' : 'var(--text-secondary)', transition: 'all 0.3s' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        {social.platform === 'INSTAGRAM' && <Camera size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />}
                        {social.platform === 'TIKTOK' && <Music size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />}
                        {social.platform === 'YOUTUBE' && <PlayCircle size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />}
                        {social.platform === 'X' && <AtSign size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />}
                        
                        <input 
                          type="text" 
                          value={social.username}
                          onChange={(e) => updateSocial(social.id, 'username', e.target.value)}
                          placeholder="@username" 
                          style={{ width: '100%', padding: '0.75rem 2.75rem 0.75rem 2.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} 
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
                            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Followers <span style={{ color: showErrors && !social.followers ? '#ffffff' : 'var(--text-secondary)', transition: 'all 0.3s' }}>*</span></label>
                      <input 
                        type="number" 
                        value={social.followers}
                        onChange={(e) => updateSocial(social.id, 'followers', e.target.value)}
                        placeholder="10000" 
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} 
                        required 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Engagement Rate (%)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={social.engagementRate}
                        onChange={(e) => updateSocial(social.id, 'engagementRate', e.target.value)}
                        placeholder="5.2" 
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} 
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" onClick={addSocial} className="btn btn-outline" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Plus size={18} /> Add Another Account
              </button>
            </div>
          )}

          {/* STEP 3: Content Strategy */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Content Niches</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {availableNiches.map(niche => (
                    <div 
                      key={niche}
                      onClick={() => toggleNiche(niche)}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        borderRadius: '999px', 
                        cursor: 'pointer',
                        background: content.niches.includes(niche) ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${content.niches.includes(niche) ? 'var(--accent)' : 'var(--glass-border)'}`,
                        color: 'white',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease'
                      }}
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
                      style={{ 
                        padding: '0.5rem 1rem', 
                        borderRadius: '999px', 
                        cursor: 'pointer',
                        background: content.formats.includes(format) ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${content.formats.includes(format) ? 'var(--accent)' : 'var(--glass-border)'}`,
                        color: 'white',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {format}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Referral */}
          {step === 4 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Where did you hear about Khorlo? (Select all that apply)</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {availableReferralSources.map(source => (
                    <div 
                      key={source}
                      onClick={() => toggleReferralSource(source)}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        borderRadius: '999px', 
                        cursor: 'pointer',
                        background: referralSources.includes(source) ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${referralSources.includes(source) ? 'var(--accent)' : 'var(--glass-border)'}`,
                        color: 'white',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {source}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            {step > 1 && (
              <button type="button" onClick={handleBack} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChevronLeft size={18} /> Back
              </button>
            )}
            
            <button type="submit" className="btn btn-primary btn-accent" style={{ flex: 1, padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {step < 4 ? (
                <>Next <ChevronRight size={18} /></>
              ) : (
                "Complete Setup"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatorOnboarding;
