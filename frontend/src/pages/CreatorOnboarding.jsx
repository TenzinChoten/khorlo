import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Plus, Trash2, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Country, State, City } from 'country-state-city';

const CreatorOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  
  const [basicInfo, setBasicInfo] = useState({
    displayName: location.state?.displayName || '',
    age: '',
    gender: '',
    country: '',
    state: '',
    city: ''
  });

  const [locationCodes, setLocationCodes] = useState({
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
    // Reset state and city when country changes
    setBasicInfo(prev => ({ ...prev, state: '', city: '' }));
    setLocationCodes(prev => ({ ...prev, stateCode: '' }));
  }, [locationCodes.countryCode]);

  useEffect(() => {
    if (locationCodes.countryCode && locationCodes.stateCode) {
      setAvailableCities(City.getCitiesOfState(locationCodes.countryCode, locationCodes.stateCode));
    } else {
      setAvailableCities([]);
    }
    // Reset city when state changes
    setBasicInfo(prev => ({ ...prev, city: '' }));
  }, [locationCodes.stateCode]);

  const [socials, setSocials] = useState([
    { id: 1, platform: 'INSTAGRAM', username: '', followers: '', engagementRate: '' }
  ]);

  const [content, setContent] = useState({
    niches: [],
    formats: []
  });

  const availableNiches = ['Tech', 'Beauty', 'Fashion', 'Fitness', 'Gaming', 'Lifestyle', 'Travel', 'Food'];
  const availableFormats = ['Short-form Video', 'Long-form Video', 'Photography', 'Live Streams', 'Blog Posts'];

  const handleNext = (e) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, send all state to backend here
    navigate('/dashboard/influencer');
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
            <div style={{ width: `${((step - 1) / 2) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }}></div>
          </div>
          {[1, 2, 3].map(s => (
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
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {step === 1 && "Let brands know who you are."}
          {step === 2 && "Add your social accounts and statistics."}
          {step === 3 && "Tell us what you create and how you create it."}
        </p>

        <form onSubmit={step === 3 ? handleSubmit : handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '2px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <Upload size={24} style={{ marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '0.75rem' }}>Profile Photo</span>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Display Name</label>
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Age</label>
                  <input 
                    type="number" 
                    value={basicInfo.age}
                    onChange={(e) => setBasicInfo({...basicInfo, age: e.target.value})}
                    placeholder="25" 
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Gender</label>
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Country</label>
                  <select 
                    value={locationCodes.countryCode} 
                    onChange={(e) => {
                      const code = e.target.value;
                      const name = e.target.options[e.target.selectedIndex].text;
                      setLocationCodes(prev => ({ ...prev, countryCode: code }));
                      setBasicInfo(prev => ({ ...prev, country: name }));
                    }}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', appearance: 'none' }}
                  >
                    <option value="">Select Country...</option>
                    {Country.getAllCountries().map(country => (
                      <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>State/Region</label>
                  <select 
                    value={locationCodes.stateCode} 
                    onChange={(e) => {
                      const code = e.target.value;
                      const name = e.target.options[e.target.selectedIndex].text;
                      setLocationCodes(prev => ({ ...prev, stateCode: code }));
                      setBasicInfo(prev => ({ ...prev, state: name }));
                    }}
                    disabled={!locationCodes.countryCode || availableStates.length === 0}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', appearance: 'none', opacity: (!locationCodes.countryCode || availableStates.length === 0) ? 0.5 : 1 }}
                  >
                    <option value="">Select State...</option>
                    {availableStates.map(state => (
                      <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>City</label>
                  <select 
                    value={basicInfo.city} 
                    onChange={(e) => setBasicInfo({...basicInfo, city: e.target.value})}
                    disabled={!locationCodes.stateCode || availableCities.length === 0}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', appearance: 'none', opacity: (!locationCodes.stateCode || availableCities.length === 0) ? 0.5 : 1 }}
                  >
                    <option value="">Select City...</option>
                    {availableCities.map(city => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
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
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Platform</label>
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
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Username / Handle</label>
                      <input 
                        type="text" 
                        value={social.username}
                        onChange={(e) => updateSocial(social.id, 'username', e.target.value)}
                        placeholder="@username" 
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} 
                        required 
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Followers</label>
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

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            {step > 1 && (
              <button type="button" onClick={handleBack} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChevronLeft size={18} /> Back
              </button>
            )}
            
            <button type="submit" className="btn btn-primary btn-accent" style={{ flex: 1, padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {step < 3 ? (
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
