import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ChevronRight, ChevronLeft, Check, Image as ImageIcon } from 'lucide-react';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [campaign, setCampaign] = useState({
    title: '',
    description: '',
    status: 'ACTIVE',
    deadline: '',
    locationType: 'ONLINE',
    compensationType: 'PAID',
    budget: '',
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
    // In a real app, send data to backend
    navigate('/dashboard/business');
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
    setCampaign(prev => ({
      ...prev,
      formats: prev.formats.includes(format)
        ? prev.formats.filter(f => f !== format)
        : [...prev.formats, format]
    }));
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', minHeight: 'calc(100vh - 80px)' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '800px', height: 'fit-content' }}>
        
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

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {step === 1 && "Campaign Details"}
            {step === 2 && "Compensation"}
            {step === 3 && "Targeting & Formats"}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {step === 1 && "Set the foundational details for your new campaign."}
            {step === 2 && "Determine the budget and how creators will be compensated."}
            {step === 3 && "Specify the niches and content formats you are looking for."}
          </p>
        </div>

        <form onSubmit={step === 3 ? handleSubmit : handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Campaign Banner</label>
                  <div style={{ width: '100%', height: '150px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '2px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <ImageIcon size={32} style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.875rem' }}>Upload Banner</span>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Brand Logo</label>
                  <div style={{ width: '150px', height: '150px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '2px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <Upload size={24} style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.875rem' }}>Update Logo</span>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Campaign Title</label>
                <input 
                  type="text" 
                  value={campaign.title}
                  onChange={(e) => setCampaign({...campaign, title: e.target.value})}
                  placeholder="e.g. Summer Tech Essentials Launch"
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Campaign Description</label>
                <textarea 
                  value={campaign.description}
                  onChange={(e) => setCampaign({...campaign, description: e.target.value})}
                  placeholder="Describe the campaign goals and requirements..."
                  rows="4"
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', resize: 'vertical' }}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Status</label>
                  <select 
                    value={campaign.status}
                    onChange={(e) => setCampaign({...campaign, status: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', appearance: 'none' }}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Application Deadline</label>
                  <input 
                    type="date" 
                    value={campaign.deadline}
                    onChange={(e) => setCampaign({...campaign, deadline: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Location Type</label>
                  <select 
                    value={campaign.locationType}
                    onChange={(e) => setCampaign({...campaign, locationType: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', appearance: 'none' }}
                  >
                    <option value="ONLINE">Online (Remote)</option>
                    <option value="OFFLINE">Offline (In-Person)</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Compensation */}
          {step === 2 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Compensation Type</label>
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
                        background: campaign.compensationType === type ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${campaign.compensationType === type ? 'var(--accent)' : 'var(--glass-border)'}`,
                        color: 'white',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {type === 'PAID' ? 'Paid' : type === 'FREE_PRODUCT' ? 'Free Product' : 'Paid + Product'}
                    </div>
                  ))}
                </div>
              </div>

              {(campaign.compensationType === 'PAID' || campaign.compensationType === 'PAID_PLUS_PRODUCT') && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Budget / Compensation Range ($)</label>
                  <input 
                    type="text" 
                    value={campaign.budget}
                    onChange={(e) => setCampaign({...campaign, budget: e.target.value})}
                    placeholder="e.g. $500 - $1,500"
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Targeting */}
          {step === 3 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Required Niches</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {availableNiches.map(niche => (
                    <div 
                      key={niche}
                      onClick={() => toggleNiche(niche)}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        borderRadius: '999px', 
                        cursor: 'pointer',
                        background: campaign.niches.includes(niche) ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${campaign.niches.includes(niche) ? 'var(--accent)' : 'var(--glass-border)'}`,
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
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Required Formats</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {availableFormats.map(format => (
                    <div 
                      key={format}
                      onClick={() => toggleFormat(format)}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        borderRadius: '999px', 
                        cursor: 'pointer',
                        background: campaign.formats.includes(format) ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${campaign.formats.includes(format) ? 'var(--accent)' : 'var(--glass-border)'}`,
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
