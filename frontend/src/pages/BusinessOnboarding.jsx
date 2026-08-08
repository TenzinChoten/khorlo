import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, ChevronRight, ChevronLeft, Check, Camera, PlayCircle, AtSign, Briefcase, Music } from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import SearchableDropdown from '../components/SearchableDropdown';

const BusinessOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);

  // Step 1 State
  const [companyName, setCompanyName] = useState(location.state?.companyName || '');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  
  const [locationCodes, setLocationCodes] = useState({ countryCode: '', stateCode: '' });
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  // Step 2 State
  const [socials, setSocials] = useState({
    instagram: '',
    tiktok: '',
    youtube: '',
    twitter: '',
    linkedin: ''
  });

  // Step 3 State
  const [referralSources, setReferralSources] = useState([]);
  const availableReferralSources = ['TikTok', 'Instagram', 'YouTube', 'X (Twitter)', 'LinkedIn', 'Google Search', 'Friend / Colleague', 'Podcast', 'Other'];

  const toggleReferralSource = (source) => {
    setReferralSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  useEffect(() => {
    if (locationCodes.countryCode) {
      setAvailableStates(State.getStatesOfCountry(locationCodes.countryCode));
    } else {
      setAvailableStates([]);
    }
    setState('');
    setCity('');
    setLocationCodes(prev => ({ ...prev, stateCode: '' }));
  }, [locationCodes.countryCode]);

  useEffect(() => {
    if (locationCodes.countryCode && locationCodes.stateCode) {
      setAvailableCities(City.getCitiesOfState(locationCodes.countryCode, locationCodes.stateCode));
    } else {
      setAvailableCities([]);
    }
    setCity('');
  }, [locationCodes.stateCode]);

  const handleNext = (e) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard/business');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 2rem', minHeight: 'calc(100vh - 80px)' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '600px', height: 'fit-content' }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative', maxWidth: '400px', margin: '0 auto 3rem' }}>
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

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {step === 1 && 'Set up your Brand Profile'}
            {step === 2 && 'Connect Social Accounts'}
            {step === 3 && 'How did you hear about us?'}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {step === 1 && 'Tell creators more about your business to attract the best talent.'}
            {step === 2 && 'Add your social media links so creators can explore your brand.'}
            {step === 3 && 'Help us understand where our users are coming from.'}
          </p>
        </div>

        <form onSubmit={step === 3 ? handleSubmit : handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '2px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <Upload size={24} style={{ marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '0.75rem' }}>Upload Logo</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Company Name</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corp"
                  required
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                    color: 'white', outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Website URL</label>
                <input 
                  type="url" 
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                    color: 'white', outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Company Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does your company do?"
                  rows="4"
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                    color: 'white', outline: 'none', resize: 'vertical'
                  }}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Country</label>
                  <SearchableDropdown
                    options={Country.getAllCountries().map(c => ({ value: c.isoCode, label: c.name }))}
                    value={country}
                    onChange={(opt) => {
                      const name = opt ? (typeof opt === 'string' ? opt : opt.label) : '';
                      setCountry(name);
                      const countryObj = Country.getAllCountries().find(c => c.name === name);
                      setLocationCodes(prev => ({ ...prev, countryCode: countryObj ? countryObj.isoCode : '' }));
                    }}
                    placeholder="Select Country..."
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>State/Region</label>
                  <SearchableDropdown
                    options={availableStates.map(s => ({ value: s.isoCode, label: s.name }))}
                    value={state}
                    onChange={(opt) => {
                      const name = opt ? (typeof opt === 'string' ? opt : opt.label) : '';
                      setState(name);
                      const stateObj = availableStates.find(s => s.name === name);
                      setLocationCodes(prev => ({ ...prev, stateCode: stateObj ? stateObj.isoCode : '' }));
                    }}
                    placeholder="Select State..."
                    disabled={!locationCodes.countryCode || availableStates.length === 0}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>City</label>
                  <SearchableDropdown
                    options={availableCities.map(c => ({ value: c.name, label: c.name }))}
                    value={city}
                    onChange={(opt) => {
                      const name = opt ? (typeof opt === 'string' ? opt : opt.label) : '';
                      setCity(name);
                    }}
                    placeholder="Select City..."
                    disabled={!locationCodes.stateCode || availableCities.length === 0}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Social Links */}
          {step === 2 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Instagram Profile</label>
                <div style={{ position: 'relative' }}>
                  <Camera size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="url" 
                    value={socials.instagram}
                    onChange={(e) => setSocials({...socials, instagram: e.target.value})}
                    placeholder="https://instagram.com/yourbrand"
                    style={{
                      width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                      color: 'white', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>TikTok Profile</label>
                <div style={{ position: 'relative' }}>
                  <Music size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="url" 
                    value={socials.tiktok}
                    onChange={(e) => setSocials({...socials, tiktok: e.target.value})}
                    placeholder="https://tiktok.com/@yourbrand"
                    style={{
                      width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                      color: 'white', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>YouTube Channel</label>
                <div style={{ position: 'relative' }}>
                  <PlayCircle size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="url" 
                    value={socials.youtube}
                    onChange={(e) => setSocials({...socials, youtube: e.target.value})}
                    placeholder="https://youtube.com/@yourbrand"
                    style={{
                      width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                      color: 'white', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>X (Twitter) Profile</label>
                <div style={{ position: 'relative' }}>
                  <AtSign size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="url" 
                    value={socials.twitter}
                    onChange={(e) => setSocials({...socials, twitter: e.target.value})}
                    placeholder="https://twitter.com/yourbrand"
                    style={{
                      width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                      color: 'white', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>LinkedIn Company Page</label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="url" 
                    value={socials.linkedin}
                    onChange={(e) => setSocials({...socials, linkedin: e.target.value})}
                    placeholder="https://linkedin.com/company/yourbrand"
                    style={{
                      width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                      color: 'white', outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Referral */}
          {step === 3 && (
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

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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

export default BusinessOnboarding;
