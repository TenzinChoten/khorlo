import React from 'react';
import { CreditCard, CheckCircle } from 'lucide-react';

const Billing = () => {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Billing & Subscription</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your plans and payment methods</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--glass-border)', paddingBottom: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Growth Plan</h2>
              <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                ACTIVE
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>$149 / month. Renews on Nov 15, 2026.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button className="btn btn-primary btn-accent" style={{ marginBottom: '0.5rem', display: 'block', width: '100%' }}>Change Plan</button>
            <button style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.875rem', cursor: 'pointer' }}>Cancel Subscription</button>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Plan Features</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle size={16} color="var(--accent)" /> Up to 15 Active Campaigns</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle size={16} color="var(--accent)" /> Advanced Creator Filter</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle size={16} color="var(--accent)" /> Unlimited Messaging</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle size={16} color="var(--accent)" /> Featured Campaigns</li>
          </ul>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Payment Method</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <CreditCard size={24} />
            </div>
            <div>
              <p style={{ fontWeight: 500 }}>Visa ending in 4242</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Expires 12/28</p>
            </div>
          </div>
          <button className="btn btn-outline" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>Update</button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
