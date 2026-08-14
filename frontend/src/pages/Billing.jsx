import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { fetchApi } from '../lib/api';
import { startRazorpayCheckout } from '../lib/razorpayCheckout';
import { useAuth } from '../context/AuthContext';
import { familyByKey, matchPlan } from '../lib/plans';
import PlanPricingGrid from '../components/PlanPricingGrid';

const Billing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState('');
  const [payingPlanId, setPayingPlanId] = useState(null);
  const [billingCycle, setBillingCycle] = useState(
    searchParams.get('cycle') === 'YEARLY' ? 'YEARLY' : 'MONTHLY'
  );
  const autoStarted = useRef(false);

  const loadSubscription = () =>
    fetchApi('/subscriptions/me')
      .then((res) => setSubscription(res.subscription || null))
      .catch(() => setSubscription(null));

  useEffect(() => {
    fetchApi('/plans')
      .then((res) => setPlans(res.plans || []))
      .catch(() => setPlans([]));
    loadSubscription();
  }, []);

  const startFreePlan = async (plan) => {
    setError('');
    setPayingPlanId(plan.id);
    try {
      // [Reason] Free activation uses the existing subscription API and never opens Razorpay
      await fetchApi('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ planId: plan.id }),
      });
      await loadSubscription();
      navigate('/checkout/success');
    } catch (err) {
      setError(err.message || 'Could not start the free plan');
    } finally {
      setPayingPlanId(null);
    }
  };

  const payForPlan = async (plan) => {
    setError('');
    setPayingPlanId(plan.id);
    try {
      await startRazorpayCheckout({
        planId: plan.id,
        name: 'Khorlo',
        description: `${plan.name} plan`,
        prefill: { email: user?.email, name: user?.name },
      });
      navigate('/checkout/success');
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setPayingPlanId(null);
    }
  };

  const handleSelectPlan = async (family, cycle, plan) => {
    if (!plan) {
      setError('This plan is not available yet. Please try again in a moment.');
      return;
    }
    if (user?.role !== 'BUSINESS') {
      setError('Billing is available for brand accounts.');
      return;
    }
    if (plan.price <= 0) {
      await startFreePlan(plan);
      return;
    }
    await payForPlan(plan);
  };

  useEffect(() => {
    if (autoStarted.current || !plans.length || user?.role !== 'BUSINESS') return;
    const requested = searchParams.get('plan');
    const family = familyByKey(requested);
    if (!family) return;
    const plan = matchPlan(plans, family, billingCycle);
    if (!plan) return;
    if (subscription && ['ACTIVE', 'PENDING'].includes(subscription.status)) return;
    autoStarted.current = true;
    handleSelectPlan(family, billingCycle, plan);
  }, [plans, subscription, user, searchParams, billingCycle]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Billing & Subscription</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Start free, or upgrade with Razorpay. We never store card or bank details.
        </p>
      </div>

      {error && (
        <div className="glass-panel" role="alert" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', color: '#f87171' }}>
          {error}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        {subscription ? (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              {subscription.plan?.name || 'Current plan'}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Status: {subscription.status}
              {subscription.expiresAt ? ` · Renews or ends ${new Date(subscription.expiresAt).toLocaleDateString('en-IN')}` : ''}
            </p>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Free plan</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Brands start on Free by default. Upgrade anytime to unlock more campaigns and discovery.
            </p>
          </div>
        )}
      </div>

      <PlanPricingGrid
        plans={plans}
        billingCycle={billingCycle}
        onBillingCycleChange={setBillingCycle}
        onSelectPlan={handleSelectPlan}
        currentPlanId={subscription?.status === 'ACTIVE' || subscription?.status === 'PENDING' ? subscription.planId : null}
        loadingPlanId={payingPlanId}
      />

      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Payment Method</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <p style={{ fontWeight: 500 }}>Razorpay Checkout</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Paid plans open the existing Razorpay modal. Card numbers and bank details stay with Razorpay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
