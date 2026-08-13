import React from 'react';
import { CreditCard } from 'lucide-react';

const Billing = () => {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Billing & Subscription</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your plans and payment methods</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No active subscription</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Subscription details will appear here once a plan is purchased.
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Payment Method</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <p style={{ fontWeight: 500 }}>No payment method on file</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Add a card when you subscribe.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
