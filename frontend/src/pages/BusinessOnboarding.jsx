import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, ChevronRight, ChevronLeft, Check, Camera, PlayCircle, AtSign, Briefcase, Music, ExternalLink } from 'lucide-react';
// [Reason] Location lists are async chunks; only fetch countries/states/cities when this form needs them
import { getAllCountries, getStatesOfCountry, getCitiesOfState } from '../lib/locationData';
import SearchableDropdown from '../components/SearchableDropdown';
import { fetchApi } from '../lib/api';
import { isPublicHttpUrl, sanitizePublicText, sanitizePublicUrl } from '../lib/publicUrl';
import { useAuth } from '../context/AuthContext';
import ImageCropper from '../components/ImageCropper';
import { consumePostAuthRedirect } from '../lib/authRedirect';

const BusinessOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const storageKey = `businessOnboardingState_${user?.id || 'guest'}`;
  const [savedState] = useState(() => JSON.parse(localStorage.getItem(storageKey) || '{}'));

  const [step, setStep] = useState(savedState.step || 1);

  const [companyName, setCompanyName] = useState(savedState.companyName || location.state?.companyName || '');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(savedState.logoPreview || null);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [website, setWebsite] = useState(savedState.website || '');
  const [description, setDescription] = useState(savedState.description || '');
  const [country, setCountry] = useState(savedState.country || '');
  const [state, setState] = useState(savedState.state || '');
  const [city, setCity] = useState(savedState.city || '');
  
  const [locationCodes, setLocationCodes] = useState(savedState.locationCodes || { countryCode: '', stateCode: '' });
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  // Step 2 State
  const [socials, setSocials] = useState(savedState.socials || {
    instagram: '',
    tiktok: '',
    youtube: '',
    twitter: '',
    linkedin: ''
  });

  // Step 3 State
  const [referralSources, setReferralSources] = useState(savedState.referralSources || []);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    const stateToSave = {
      step, companyName, logoPreview, website, description, country, state, city, locationCodes, socials, referralSources
    };
    localStorage.setItem(storageKey, JSON.stringify(stateToSave));
  }, [step, companyName, logoPreview, website, description, country, state, city, locationCodes, socials, referralSources, storageKey]);
  const availableReferralSources = ['TikTok', 'Instagram', 'YouTube', 'X (Twitter)', 'LinkedIn', 'Google Search', 'Friend / Colleague', 'Podcast', 'Other'];

  const toggleReferralSource = (source) => {
    setReferralSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

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

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!companyName.trim() || !description.trim()) {
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
    if (referralSources.length === 0) {
      setShowErrors(true);
      return;
    }
    if (website.trim() && !isPublicHttpUrl(website)) {
      alert('Website must be a public company URL, not a dashboard or database link.');
      return;
    }
    try {
      let companyLogoUrl = null;
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        const uploadRes = await fetchApi('/upload', { method: 'POST', body: formData });
        companyLogoUrl = uploadRes.url;
      }

      const payload = {
        companyName,
        website: sanitizePublicUrl(website),
        companyDescription: sanitizePublicText(description),
        companyLogo: companyLogoUrl,
        country,
        state,
        city,
        socialAccounts: Object.entries(socials)
          .filter(([_, url]) => url.trim() !== '')
          .map(([platform, url]) => ({
            platform: platform.toUpperCase(),
            username: new URL(url).pathname.replace('/', '') || url,
            profileUrl: sanitizePublicUrl(url),
            followers: 0,
            engagementRate: 0
          })),
        heardAboutUs: referralSources.join(', ')
      };
      
      await fetchApi('/business/me', {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      localStorage.removeItem(storageKey);
      // [Reason] Return brands to the campaign they opened from a shared link after onboarding
      navigate(consumePostAuthRedirect() || '/dashboard/business');
    } catch (err) {
      console.error('Failed to save onboarding data:', err);
      alert('Failed to save onboarding data. Please try again.');
    }
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

        {cropImageSrc && (
          <ImageCropper 
            imageSrc={cropImageSrc}
            onCropComplete={(file, url) => {
              setLogoFile(file);
              setLogoPreview(url);
              setCropImageSrc(null);
            }}
            onCancel={() => setCropImageSrc(null)}
          />
        )}

        <form onSubmit={step === 3 ? handleSubmit : handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <label style={{ 
                  width: '120px', height: '120px', borderRadius: '50%', 
                  background: logoPreview ? `url(${logoPreview}) center/cover no-repeat` : 'rgba(255,255,255,0.05)', 
                  border: logoPreview ? 'none' : '2px dashed var(--glass-border)', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                  cursor: 'pointer', color: 'var(--text-secondary)', position: 'relative', overflow: 'hidden'
                }}>
                  {!logoPreview && (
                    <>
                      <Upload size={24} style={{ marginBottom: '0.5rem' }} />
                      <span style={{ fontSize: '0.75rem' }}>Upload Logo</span>
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
                      e.target.value = ''; // Reset so the same file can be selected again if needed
                    }} 
                    style={{ display: 'none' }} 
                  />
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Company Name <span style={{ color: showErrors && !companyName ? '#ffffff' : 'var(--text-secondary)', transition: 'all 0.3s' }}>*</span></label>
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
                  // [Reason] Avoid browser autofill stuffing a Supabase dashboard URL into Website
                  type="url" 
                  name="companyWebsite"
                  autoComplete="off"
                  data-1p-ignore="true"
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Company Description <span style={{ color: showErrors && !description ? '#ffffff' : 'var(--text-secondary)', transition: 'all 0.3s' }}>*</span></label>
                <textarea 
                  value={description}
                  required
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
                    options={availableCountries.map(c => ({ value: c.isoCode, label: c.name }))}
                    value={country}
                    onChange={(opt) => {
                      const name = opt ? (typeof opt === 'string' ? opt : opt.label) : '';
                      setCountry(name);
                      const countryObj = availableCountries.find(c => c.name === name);
                      setLocationCodes(prev => ({ ...prev, countryCode: countryObj ? countryObj.isoCode : '', stateCode: '' }));
                      setState('');
                      setCity('');
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
                      setCity('');
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
                      width: '100%', padding: '0.75rem 2.75rem 0.75rem 2.75rem', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                      color: 'white', outline: 'none'
                    }}
                  />
                  {socials.instagram && (
                    <a 
                      href={socials.instagram}
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
                      width: '100%', padding: '0.75rem 2.75rem 0.75rem 2.75rem', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                      color: 'white', outline: 'none'
                    }}
                  />
                  {socials.tiktok && (
                    <a 
                      href={socials.tiktok}
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
                      width: '100%', padding: '0.75rem 2.75rem 0.75rem 2.75rem', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                      color: 'white', outline: 'none'
                    }}
                  />
                  {socials.youtube && (
                    <a 
                      href={socials.youtube}
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
                      width: '100%', padding: '0.75rem 2.75rem 0.75rem 2.75rem', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                      color: 'white', outline: 'none'
                    }}
                  />
                  {socials.twitter && (
                    <a 
                      href={socials.twitter}
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
                      width: '100%', padding: '0.75rem 2.75rem 0.75rem 2.75rem', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                      color: 'white', outline: 'none'
                    }}
                  />
                  {socials.linkedin && (
                    <a 
                      href={socials.linkedin}
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
                      className={`choice-chip${referralSources.includes(source) ? ' is-selected' : ''}`}
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
