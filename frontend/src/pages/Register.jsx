import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
  color: 'white', outline: 'none'
};

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const [role, setRole] = useState(location.state?.role || 'brand');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const apiRole = role === 'brand' ? 'BUSINESS' : 'INFLUENCER';
      const computedName = email.split('@')[0] || 'User';
      await register({ name: computedName, email, password, role: apiRole });
      if (role === 'brand') {
        navigate('/onboarding/business');
      } else {
        navigate('/onboarding/creator');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
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
          <button type="button" onClick={() => setRole('brand')} className={`btn ${role === 'brand' ? 'btn-primary btn-accent' : 'btn-outline'}`} style={{ flex: 1, borderRadius: '8px' }}>
            I'm a Brand
          </button>
          <button type="button" onClick={() => setRole('creator')} className={`btn ${role === 'creator' ? 'btn-primary btn-accent' : 'btn-outline'}`} style={{ flex: 1, borderRadius: '8px' }}>
            I'm a Creator
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', borderRadius: '8px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-accent" style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Creating account...' : 'Sign Up'}
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
