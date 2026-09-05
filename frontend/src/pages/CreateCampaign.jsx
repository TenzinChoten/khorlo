import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ChevronRight, ChevronLeft, Check, Image as ImageIcon, X, Edit2 } from 'lucide-react';
import { fetchApi, getMediaUrl } from '../lib/api';
import ImageCropper from '../components/ImageCropper';
// [Reason] Location lists are async chunks; only fetch countries/states/cities when this form needs them
import { getAllCountries, getStatesOfCountry, getCitiesOfState } from '../lib/locationData';
import SearchableDropdown from '../components/SearchableDropdown';



const CreateCampaign = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [planBlocked, setPlanBlocked] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingLogo, setIsFetchingLogo] = useState(true);
  const bannerInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const [cropperData, setCropperData] = useState({ imageSrc: null, type: null, aspect: 1, cropShape: 'rect', filename: 'image.jpg' });
  const [locationCodes, setLocationCodes] = useState({ countryCode: '', stateCode: '' });
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  // [Reason] Hold async city options so city.json is not imported with the page
  const [availableCities, setAvailableCities] = useState([]);
  
  const [campaign, setCampaign] = useState({
    title: '',
    description: '',
    status: 'OPEN',
    deadline: '',
    locationType: 'ONLINE',
    compensationType: 'PAID',
    budget: '',
    currency: 'USD',
    creatorSlots: 1,
    contentDeadline: '',
    country: '',
    state: '',
    city: '',
    address: '',
    niches: [],
    formats: [],
    formatQuantities: {},
    bannerUrl: '',
    logoUrl: ''
  });

  const availableNiches = ['Tech', 'Beauty', 'Fashion', 'Fitness', 'Gaming', 'Lifestyle', 'Travel', 'Food'];

  // [Reason] Keep campaign format options aligned with the product content-format list
  const availableFormats = ['Short-form Video', 'Long-form Video', 'Photo', 'Carousel', 'Story', 'Live Stream', 'Written Article', 'Audio / Podcast'];

  useEffect(() => {
    // [Reason] Offline/hybrid campaigns are the only create-campaign path that needs country data
    if (campaign.locationType !== 'OFFLINE' && campaign.locationType !== 'HYBRID') return undefined;
    let cancelled = false;
    getAllCountries().then((countries) => {
      if (!cancelled) setAvailableCountries(countries);
    });
    return () => { cancelled = true; };
  }, [campaign.locationType]);

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

  useEffect(() => {
    // [Reason] Expired Free (or over-limit) plans should fail before the user fills the form
    fetchApi('/subscriptions/me')
      .then((res) => {
        const sub = res.subscription;
        if (!sub) return;
        const expired = sub.status === 'EXPIRED' || new Date(sub.expiresAt).getTime() <= Date.now();
        if (expired && !(sub.plan?.price > 0 && sub.status === 'ACTIVE')) {
          setPlanBlocked(true);
          setError('Your Free plan has expired. Upgrade or start a plan again to post a campaign.');
        }
      })
      .catch(() => {});

    // [Reason] Pre-fill the brand logo from the business profile if it exists
    fetchApi('/business/me')
      .then((res) => {
        if (res.profile && res.profile.companyLogo) {
          setCampaign(prev => {
            if (!prev.logoUrl) {
              return { ...prev, logoUrl: res.profile.companyLogo };
            }
            return prev;
          });
        }
      })
      .catch(() => {})
      .finally(() => setIsFetchingLogo(false));
  }, []);

  const handleCountryChange = (val) => {
    if (!val) {
      setLocationCodes({ countryCode: '', stateCode: '' });
      setCampaign(prev => ({ ...prev, country: '', state: '', city: '' }));
      return;
    }
    const { name, code } = JSON.parse(val.value || val);
    setLocationCodes({ countryCode: code, stateCode: '' });
    setCampaign(prev => ({ ...prev, country: name, state: '', city: '' }));
  };

  const handleStateChange = (val) => {
    if (!val) {
      setLocationCodes(prev => ({ ...prev, stateCode: '' }));
      setCampaign(prev => ({ ...prev, state: '', city: '' }));
      return;
    }
    const { name, code } = JSON.parse(val.value || val);
    setLocationCodes(prev => ({ ...prev, stateCode: code }));
    setCampaign(prev => ({ ...prev, state: name, city: '' }));
  };

  const handleCityChange = (val) => {
    setCampaign(prev => ({ ...prev, city: val ? (val.value || val.label || val) : '' }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!campaign.logoUrl || !campaign.title.trim() || !campaign.description.trim() || !campaign.status || !campaign.deadline || !campaign.contentDeadline || !campaign.locationType) {
        setError('Please fill out all required fields.');
        return;
      }
    } else if (step === 2) {
      if (!campaign.compensationType || !campaign.creatorSlots) {
        setError('Please fill out all required fields.');
        return;
      }
      if ((campaign.compensationType === 'PAID' || campaign.compensationType === 'PAID_PLUS_PRODUCT') && (!campaign.budget || !campaign.currency)) {
        setError('Please provide the budget and currency.');
        return;
      }
    }
    setError(null);
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (campaign.niches.length === 0 || campaign.formats.length === 0) {
      setError('Please select required niches and formats.');
      return;
    }
    if (planBlocked) {
      setError('Your Free plan has expired. Upgrade or start a plan again to post a campaign.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await fetchApi('/campaigns', {
        method: 'POST',
        body: JSON.stringify(campaign),
      });
      navigate('/dashboard/business');
    } catch (err) {
      console.error('Failed to create campaign:', err);
      setError(err.message || 'Failed to create campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Instead of uploading immediately, load it for cropping
    const imageSrc = URL.createObjectURL(file);
    if (type === 'banner') {
      setCropperData({ imageSrc, type, aspect: 16 / 9, cropShape: 'rect', filename: 'banner.jpg' });
    } else {
      setCropperData({ imageSrc, type, aspect: 1, cropShape: 'rect', filename: 'logo.jpg' });
    }
    
    // Reset file input
    if (e.target) e.target.value = null;
  };

  const handleCropComplete = async (croppedFile, croppedUrl) => {
    const type = cropperData.type;
    setCropperData({ imageSrc: null, type: null, aspect: 1, cropShape: 'rect', filename: 'image.jpg' });
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', croppedFile);
      
      const res = await fetchApi('/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (type === 'banner') {
        setCampaign(prev => ({ ...prev, bannerUrl: res.url }));
      } else {
        setCampaign(prev => ({ ...prev, logoUrl: res.url }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload cropped image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };


  const toggleNiche = (niche) => {
    setCampaign(prev => ({
      ...prev,
      niches: prev.niches.includes(niche) 
        ? prev.niches.filter(n => n !== niche)
        : [...prev.niches, niche]
    }));
  };

  const toggleFormat = (format) => {
    setCampaign(prev => {
      const isSelected = prev.formats.includes(format);
      const newFormats = isSelected ? prev.formats.filter(f => f !== format) : [...prev.formats, format];
      const newQuantities = { ...prev.formatQuantities };
      if (!isSelected && !newQuantities[format]) {
        newQuantities[format] = 1;
      }
      return { ...prev, formats: newFormats, formatQuantities: newQuantities };
    });
  };

  const updateFormatQuantity = (format, quantity) => {
    setCampaign(prev => ({
      ...prev,
      formatQuantities: { ...prev.formatQuantities, [format]: quantity === '' ? '' : parseInt(quantity) }
    }));
  };

  const startChangingQuantity = (e, format, delta) => {
    e.stopPropagation();
    e.preventDefault();
    setCampaign(prev => ({
      ...prev,
      formatQuantities: { ...prev.formatQuantities, [format]: Math.max(1, (prev.formatQuantities[format] || 1) + delta) }
    }));
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setCampaign(prev => ({
          ...prev,
          formatQuantities: { ...prev.formatQuantities, [format]: Math.max(1, (prev.formatQuantities[format] || 1) + delta) }
        }));
      }, 150);
    }, 400);
  };

  const stopChangingQuantity = (e) => {
    if (e) e.stopPropagation();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };


  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: '2rem', minHeight: 'calc(100vh - 80px)' }}>
      <button 
        type="button"
        onClick={() => navigate('/dashboard/business')}
        style={{ position: 'absolute', top: '1rem', right: '2rem', background: 'var(--apple-border)', border: 'none', color: 'var(--apple-text-secondary)', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10 }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--apple-text-primary)'; e.currentTarget.style.background = 'var(--apple-surface)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--apple-text-secondary)'; e.currentTarget.style.background = 'var(--apple-border)'; }}
        title="Close"
      >
        <X size={24} />
      </button>
      {cropperData.imageSrc && (
        <ImageCropper
          imageSrc={cropperData.imageSrc}
          aspect={cropperData.aspect}
          cropShape={cropperData.cropShape}
          filename={cropperData.filename}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropperData({ imageSrc: null, type: null, aspect: 1, cropShape: 'rect', filename: 'image.jpg' })}
        />
      )}
      
      <div className="apple-panel animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '800px', height: 'fit-content' }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative', maxWidth: '400px', margin: '0 auto 3rem' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'var(--apple-surface)', zIndex: 0, transform: 'translateY(-50%)' }}>
            <div style={{ width: `${((step - 1) / 2) * 100}%`, height: '100%', background: 'var(--apple-accent)', transition: 'width 0.3s ease' }}></div>
          </div>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              background: step >= s ? 'var(--apple-accent)' : 'var(--apple-surface)',
              border: `2px solid ${step >= s ? 'var(--apple-accent)' : 'var(--apple-border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600, color: step >= s ? 'white' : 'var(--apple-text-secondary)',
              zIndex: 1, transition: 'all 0.3s ease'
            }}>
              {step > s ? <Check size={16} /> : s}
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {step === 1 && "Campaign Details"}
            {step === 2 && "Compensation"}
            {step === 3 && "Targeting & Formats"}
          </h2>
          <p style={{ color: 'var(--apple-text-secondary)' }}>
            {step === 1 && "Set the foundational details for your new campaign."}
            {step === 2 && "Determine the budget and how creators will be compensated."}
            {step === 3 && "Specify the niches and content formats you are looking for."}
          </p>
        </div>

        {error && (
          <div role="alert" style={{ marginBottom: '2rem', padding: '1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '2px solid #ef4444', color: '#dc2626', fontWeight: 600 }}>
            {error}
            {planBlocked && (
              <button
                type="button"
                className="btn btn-outline"
                style={{ marginTop: '0.75rem' }}
                onClick={() => navigate('/dashboard/billing')}
              >
                View plans
              </button>
            )}
          </div>
        )}

        <form onSubmit={step === 3 ? handleSubmit : handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 20 }}>
              
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Campaign Banner</label>
                  <div style={{ position: 'relative', width: '100%', height: '150px' }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} ref={bannerInputRef} onChange={(e) => handleFileUpload(e, 'banner')} />
                    <div 
                      onClick={() => bannerInputRef.current?.click()}
                      style={{ width: '100%', height: '100%', borderRadius: '12px', background: campaign.bannerUrl ? `url(${getMediaUrl(campaign.bannerUrl)}) center/cover` : 'var(--apple-surface)', border: campaign.bannerUrl ? '1px solid var(--apple-border)' : '2px dashed var(--apple-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--apple-text-secondary)' }}
                    >
                      {!campaign.bannerUrl && (
                        <>
                          <ImageIcon size={32} style={{ marginBottom: '0.5rem' }} />
                          <span style={{ fontSize: '0.875rem' }}>{isUploading ? 'Uploading...' : 'Upload Banner'}</span>
                        </>
                      )}
                    </div>
                    {campaign.bannerUrl && (
                      <button type="button" onClick={(e) => { e.preventDefault(); bannerInputRef.current?.click(); }} style={{ position: 'absolute', top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--apple-surface)', color: 'var(--apple-text-primary)', border: '1px solid var(--apple-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 10, transition: 'transform 0.2s' }} title="Change Banner" onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                        <Edit2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Brand Logo <span style={{ color: error && !campaign.logoUrl ? '#ef4444' : 'var(--apple-text-secondary)', transition: 'all 0.3s' }}>*</span></label>
                  <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} ref={logoInputRef} onChange={(e) => handleFileUpload(e, 'logo')} />
                    {isFetchingLogo ? (
                      <div style={{ width: '100%', height: '100%', borderRadius: '12px', background: 'var(--apple-surface)', border: '2px dashed var(--apple-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--apple-text-secondary)', opacity: 0.6 }}>
                        <span style={{ fontSize: '0.875rem' }}>Loading...</span>
                      </div>
                    ) : (
                      <div 
                        onClick={() => logoInputRef.current?.click()}
                        style={{ width: '100%', height: '100%', borderRadius: '12px', background: campaign.logoUrl ? `url(${getMediaUrl(campaign.logoUrl)}) center/cover` : 'var(--apple-surface)', border: campaign.logoUrl ? '1px solid var(--apple-border)' : '2px dashed var(--apple-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--apple-text-secondary)', transition: 'background 0.3s ease' }}
                      >
                        {!campaign.logoUrl && (
                          <>
                            <Upload size={24} style={{ marginBottom: '0.5rem' }} />
                            <span style={{ fontSize: '0.875rem' }}>{isUploading ? 'Uploading...' : 'Update Logo'}</span>
                          </>
                        )}
                      </div>
                    )}
                    {campaign.logoUrl && !isFetchingLogo && (
                      <button type="button" onClick={(e) => { e.preventDefault(); logoInputRef.current?.click(); }} style={{ position: 'absolute', top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--apple-surface)', color: 'var(--apple-text-primary)', border: '1px solid var(--apple-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 10, transition: 'transform 0.2s' }} title="Change Brand Logo" onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                        <Edit2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Campaign Title <span style={{ color: error && !campaign.title ? '#ef4444' : 'var(--apple-text-secondary)', transition: 'all 0.3s' }}>*</span></label>
                  <input 
                    type="text" 
                    value={campaign.title}
                    onChange={(e) => setCampaign({...campaign, title: e.target.value})}
                    placeholder="e.g. Summer Tech Essentials Launch"
                    required
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Product Name (Optional)</label>
                  <input 
                    type="text" 
                    value={campaign.productName}
                    onChange={(e) => setCampaign({...campaign, productName: e.target.value})}
                    placeholder="e.g. Smart Home Hub V2"
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Campaign Description <span style={{ color: error && !campaign.description ? '#ef4444' : 'var(--apple-text-secondary)', transition: 'all 0.3s' }}>*</span></label>
                <textarea 
                  value={campaign.description}
                  onChange={(e) => setCampaign({...campaign, description: e.target.value})}
                  placeholder="Describe the campaign goals and requirements..."
                  rows="4"
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none', resize: 'vertical' }}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Status <span style={{ color: error && !campaign.status ? '#ef4444' : 'var(--apple-text-secondary)', transition: 'all 0.3s' }}>*</span></label>
                  <select 
                    value={campaign.status}
                    onChange={(e) => setCampaign({...campaign, status: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none', appearance: 'none' }}
                  >
                    <option value="OPEN">Open</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Application Deadline <span style={{ color: error && !campaign.deadline ? '#ef4444' : 'var(--apple-text-secondary)', transition: 'all 0.3s' }}>*</span></label>
                  <input 
                    type="date" 
                    value={campaign.deadline}
                    required
                    onChange={(e) => {
                      const newDeadline = e.target.value;
                      setCampaign(prev => {
                        let newContentDeadline = prev.contentDeadline;
                        if (newContentDeadline && newDeadline > newContentDeadline) {
                          newContentDeadline = '';
                        }
                        return { ...prev, deadline: newDeadline, contentDeadline: newContentDeadline };
                      });
                    }}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Content Deadline <span style={{ color: error && !campaign.contentDeadline ? '#ef4444' : 'var(--apple-text-secondary)', transition: 'all 0.3s' }}>*</span></label>
                  <input 
                    type="date" 
                    min={campaign.deadline}
                    value={campaign.contentDeadline}
                    required
                    onChange={(e) => setCampaign({...campaign, contentDeadline: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Location Type <span style={{ color: error && !campaign.locationType ? '#ef4444' : 'var(--apple-text-secondary)', transition: 'all 0.3s' }}>*</span></label>
                <select 
                  value={campaign.locationType}
                  onChange={(e) => setCampaign({...campaign, locationType: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none', appearance: 'none' }}
                >
                  <option value="ONLINE">Online (Remote)</option>
                  <option value="OFFLINE">Offline (In-Person)</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>

              {(campaign.locationType === 'OFFLINE' || campaign.locationType === 'HYBRID') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', position: 'relative', zIndex: 10 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Country</label>
                    <SearchableDropdown
                      options={availableCountries.map(c => ({ value: JSON.stringify({ name: c.name, code: c.isoCode }), label: c.name }))}
                      value={campaign.country}
                      onChange={handleCountryChange}
                      placeholder="Select Country"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>State / Region</label>
                    <SearchableDropdown
                      options={availableStates.map(s => ({ value: JSON.stringify({ name: s.name, code: s.isoCode }), label: s.name }))}
                      value={campaign.state}
                      onChange={handleStateChange}
                      placeholder="Select State"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>City</label>
                    <SearchableDropdown
                      options={availableCities.map(c => ({ value: c.name, label: c.name }))}
                      value={campaign.city}
                      onChange={handleCityChange}
                      placeholder="Select City"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Address</label>
                    <input type="text" value={campaign.address} onChange={(e) => setCampaign({...campaign, address: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none' }} placeholder="Street address" />
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 2: Compensation */}
          {step === 2 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Compensation Type <span style={{ color: error && !campaign.compensationType ? '#ef4444' : 'var(--apple-text-secondary)', transition: 'all 0.3s' }}>*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  {['PAID', 'FREE_PRODUCT', 'PAID_PLUS_PRODUCT'].map(type => (
                    <div 
                      key={type}
                      onClick={() => setCampaign({...campaign, compensationType: type})}
                      style={{ 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        textAlign: 'center',
                        background: campaign.compensationType === type ? 'var(--apple-accent)' : 'var(--apple-bg)',
                        border: `1px solid ${campaign.compensationType === type ? 'var(--apple-accent)' : 'var(--apple-border)'}`,
                        color: campaign.compensationType === type ? '#ffffff' : 'var(--apple-text-primary)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {type === 'PAID' ? 'Paid' : type === 'FREE_PRODUCT' ? 'Free Product' : 'Paid + Product'}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Number of Creators Needed <span style={{ color: error && !campaign.creatorSlots ? '#ef4444' : 'var(--apple-text-secondary)', transition: 'all 0.3s' }}>*</span></label>
                  <input 
                    type="number" 
                    min="1"
                    value={campaign.creatorSlots === '' ? '' : campaign.creatorSlots}
                    required
                    onChange={(e) => setCampaign({...campaign, creatorSlots: e.target.value === '' ? '' : parseInt(e.target.value)})}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none' }}
                  />
                </div>
                {(campaign.compensationType === 'PAID' || campaign.compensationType === 'PAID_PLUS_PRODUCT') && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Budget & Currency <span style={{ color: error && (!campaign.budget || !campaign.currency) ? '#ef4444' : 'var(--apple-text-secondary)', transition: 'all 0.3s' }}>*</span></label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select 
                        value={campaign.currency}
                        onChange={(e) => setCampaign({...campaign, currency: e.target.value})}
                        style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none', appearance: 'none' }}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                        <option value="CAD">CAD</option>
                      </select>
                      <input 
                        type="text" 
                        value={campaign.budget}
                        required
                        onChange={(e) => setCampaign({...campaign, budget: e.target.value})}
                        placeholder="e.g. 500 - 1,500"
                        style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--apple-bg)', border: '1px solid var(--apple-border)', color: 'var(--apple-text-primary)', outline: 'none' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Targeting */}
          {step === 3 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Required Niches <span style={{ color: error && campaign.niches.length === 0 ? '#ef4444' : 'var(--apple-text-secondary)', fontSize: '0.875rem' }}>*</span></h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {availableNiches.map(niche => (
                    <div 
                      key={niche}
                      onClick={() => toggleNiche(niche)}
                      className={`choice-chip${campaign.niches.includes(niche) ? ' is-selected' : ''}`}
                    >
                      {niche}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Required Formats <span style={{ color: error && campaign.formats.length === 0 ? '#ef4444' : 'var(--apple-text-secondary)', fontSize: '0.875rem' }}>*</span></h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {availableFormats.map(format => (
                    <div key={format} onClick={() => !campaign.formats.includes(format) && toggleFormat(format)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '999px', background: campaign.formats.includes(format) ? 'var(--apple-bg)' : 'var(--apple-surface)', border: `1px solid ${campaign.formats.includes(format) ? 'var(--apple-accent)' : 'var(--apple-border)'}`, transition: 'all 0.2s ease', cursor: campaign.formats.includes(format) ? 'default' : 'pointer' }}>
                      <div 
                        onClick={(e) => { if (campaign.formats.includes(format)) { e.stopPropagation(); toggleFormat(format); } }}
                        // [Reason] Unselected format labels were white on a light chip and disappeared
                        style={{ cursor: 'pointer', color: 'var(--apple-text-primary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        {campaign.formats.includes(format) && <Check size={14} />} {format}
                      </div>
                      
                      {campaign.formats.includes(format) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.75rem', marginLeft: '0.25rem', borderLeft: '1px solid var(--apple-border)' }}>
                          <button 
                            type="button"
                            onMouseDown={(e) => startChangingQuantity(e, format, -1)}
                            onMouseUp={stopChangingQuantity}
                            onMouseLeave={stopChangingQuantity}
                            onTouchStart={(e) => startChangingQuantity(e, format, -1)}
                            onTouchEnd={stopChangingQuantity}
                            style={{ background: 'var(--apple-surface)', border: 'none', color: 'var(--apple-text-primary)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
                          >-</button>
                          <span style={{ color: 'var(--apple-text-primary)', fontSize: '0.875rem', fontWeight: 600, minWidth: '1.2rem', textAlign: 'center' }}>
                            {campaign.formatQuantities[format] || 1}
                          </span>
                          <button 
                            type="button"
                            onMouseDown={(e) => startChangingQuantity(e, format, 1)}
                            onMouseUp={stopChangingQuantity}
                            onMouseLeave={stopChangingQuantity}
                            onTouchStart={(e) => startChangingQuantity(e, format, 1)}
                            onTouchEnd={stopChangingQuantity}
                            style={{ background: 'var(--apple-surface)', border: 'none', color: 'var(--apple-text-primary)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
                          >+</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', position: 'relative', zIndex: 10 }}>
            {step > 1 && (
              <button type="button" onClick={handleBack} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChevronLeft size={18} /> Back
              </button>
            )}
            
            <button type="submit" disabled={isSubmitting || planBlocked} className="btn btn-primary btn-accent" style={{ flex: 1, padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isSubmitting || planBlocked ? 0.7 : 1, cursor: isSubmitting || planBlocked ? 'not-allowed' : 'pointer' }}>
              {step < 3 ? (
                <>Next <ChevronRight size={18} /></>
              ) : isSubmitting ? (
                "Publishing..."
              ) : (
                "Publish Campaign"
              )}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
