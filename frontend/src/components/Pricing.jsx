import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../lib/api';
import { billingPath } from '../lib/plans';
import PlanPricingGrid from './PlanPricingGrid';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState('MONTHLY');

  useEffect(() => {
    fetchApi('/plans')
      .then((res) => setPlans(res.plans || []))
      .catch(() => setPlans([]));
  }, []);

  const goToPlan = (family, cycle) => {
    const path = billingPath(family.key, cycle);
    // [Reason] Paid and free CTAs reuse Billing so Razorpay secrets never enter this page
    if (user?.role === 'BUSINESS') {
      navigate(path);
      return;
    }
    navigate(`/register?redirect=${encodeURIComponent(path)}`, { state: { role: 'brand' } });
  };

  return (
    <section id="pricing" className="editorial-section plan-pricing-section">
      <div className="section-header">
        <h2 className="section-title">plans that<br/>get campaigns<br/>live.</h2>
        <p className="section-intro">
          Start free, then upgrade when you need more campaigns, faster discovery, and featured placement.
        </p>
      </div>

      <PlanPricingGrid
        plans={plans}
        billingCycle={billingCycle}
        onBillingCycleChange={setBillingCycle}
        onSelectPlan={goToPlan}
      />
    </section>
  );
};

export default Pricing;
