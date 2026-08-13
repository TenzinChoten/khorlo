import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const CheckoutSuccess = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 2rem', minHeight: 'calc(100vh - 80px)', alignItems: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '4rem', width: '100%', maxWidth: '500px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
          <CheckCircle size={40} />
        </div>
        
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 700 }}>Payment Successful!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.125rem', lineHeight: 1.6 }}>
          Thank you for your subscription. Your account has been updated.
        </p>

        <button onClick={() => navigate('/dashboard/business')} className="btn btn-primary btn-accent" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
