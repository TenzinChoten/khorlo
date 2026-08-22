import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const data = await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      setStatus('success');
      setMessage(data.message || 'If your email is registered, you will receive a reset link. Please check your spam folder.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 2rem' }}>
      <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Reset Password</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(52,199,89,0.1)', color: '#34c759', borderRadius: '8px', fontSize: '0.9rem' }}>
              {message}
            </div>
            <Link to="/login" className="btn btn-primary btn-accent" style={{ display: 'inline-block', width: '100%', textDecoration: 'none' }}>
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {status === 'error' && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', borderRadius: '8px', fontSize: '0.875rem' }}>
                {message}
              </div>
            )}
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <button type="submit" disabled={status === 'loading'} className="btn btn-primary btn-accent" style={{ width: '100%', marginTop: '1rem' }}>
              {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {status !== 'success' && (
          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Remember your password? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
