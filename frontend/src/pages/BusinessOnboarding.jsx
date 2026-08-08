import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { Country, State, City } from 'country-state-city';

const BusinessOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [companyName, setCompanyName] = useState(location.state?.companyName || '');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  
  const [locationCodes, setLocationCodes] = useState({ countryCode: '', stateCode: '' });
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard/business');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 2rem', minHeight: 'calc(100vh - 80px)' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '600px', height: 'fit-content' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Set up your Brand Profile</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Tell creators more about your business to attract the best talent.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
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
              <select 
                value={locationCodes.countryCode} 
                onChange={(e) => {
                  const code = e.target.value;
                  const name = e.target.options[e.target.selectedIndex].text;
                  setLocationCodes(prev => ({ ...prev, countryCode: code }));
                  setCountry(name);
                }}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', appearance: 'none' }}
              >
                <option value="">Select Country...</option>
                {Country.getAllCountries().map(c => (
                  <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
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
                  setState(name);
                }}
                disabled={!locationCodes.countryCode || availableStates.length === 0}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', appearance: 'none', opacity: (!locationCodes.countryCode || availableStates.length === 0) ? 0.5 : 1 }}
              >
                <option value="">Select State...</option>
                {availableStates.map(s => (
                  <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>City</label>
              <select 
                value={city} 
                onChange={(e) => setCity(e.target.value)}
                disabled={!locationCodes.stateCode || availableCities.length === 0}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', appearance: 'none', opacity: (!locationCodes.stateCode || availableCities.length === 0) ? 0.5 : 1 }}
              >
                <option value="">Select City...</option>
                {availableCities.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-accent" style={{ width: '100%', marginTop: '1rem' }}>
            Complete Setup
          </button>
        </form>
      </div>
    </div>
  );
};

export default BusinessOnboarding;
