import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSafeInternalPath, resolvePostAuthDestination } from '../lib/authRedirect';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();
  const redirect = getSafeInternalPath(searchParams.get('redirect'));
  const registerHref = redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // [Reason] Apply Now can land here while a session already exists; send them back to the campaign
    if (!authLoading && user) {
      navigate(resolvePostAuthDestination(user, redirect), { replace: true });
    }
  }, [authLoading, user, redirect, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      // [Reason] Shared campaign Apply Now must land back on the same campaign after login
      navigate(resolvePostAuthDestination(user, redirect));
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 2rem' }}>
      <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
          Sign in to continue to Khorlo
        </p>

        {error && (
          <div style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', borderRadius: '8px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '1rem', borderRadius: '0', background: '#ffffff', border: '2px solid var(--text-primary)', color: 'var(--text-primary)', outline: 'none', fontWeight: 500 }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '1rem', borderRadius: '0', background: '#ffffff', border: '2px solid var(--text-primary)', color: 'var(--text-primary)', outline: 'none', fontWeight: 500 }}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-accent" style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Don't have an account? <Link to={registerHref} style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
