import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(location.state?.role || 'brand');
  const [name, setName] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    localStorage.setItem('role', role);
    if (role === 'brand') {
      navigate('/onboarding/business', { state: { companyName: name } });
    } else {
      navigate('/onboarding/creator', { state: { displayName: name } });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 2rem' }}>
      <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '500px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Create an Account</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
          Join Khorlo as a Brand or Creator
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            type="button"
            onClick={() => setRole('brand')}
            className={`btn ${role === 'brand' ? 'btn-primary btn-accent' : 'btn-outline'}`}
            style={{ flex: 1, borderRadius: '8px' }}
          >
            I'm a Brand
          </button>
          <button 
            type="button"
            onClick={() => setRole('creator')}
            className={`btn ${role === 'creator' ? 'btn-primary btn-accent' : 'btn-outline'}`}
            style={{ flex: 1, borderRadius: '8px' }}
          >
            I'm a Creator
          </button>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              {role === 'brand' ? 'Company Name' : 'Full Name'}
            </label>
            <input 
              type="text" 
              placeholder={role === 'brand' ? "Acme Corp" : "Jane Doe"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                color: 'white', outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
            <input 
              type="email" 
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                color: 'white', outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                color: 'white', outline: 'none'
              }}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-accent" style={{ width: '100%', marginTop: '1rem' }}>
            Sign Up
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
