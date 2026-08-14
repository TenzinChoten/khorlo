import React from 'react';
import { PLAN_FAMILIES, formatInr, matchPlan } from '../lib/plans';
import './PlanPricingGrid.css';

function priceLabel(family, billingCycle, plan) {
  const cycle = family.key === 'FREE' ? 'MONTHLY' : billingCycle;
  const variant = family.variants.find((item) => item.billingCycle === cycle) || family.variants[0];
  const amount = plan?.price ?? variant?.price ?? 0;
  if (family.key === 'FREE' || amount <= 0) {
    return { main: `${formatInr(0)}/month`, note: 'No card required to start' };
  }
  if (cycle === 'YEARLY') {
    const monthlyEquivalent = Math.round(amount / 12);
    return {
      main: `${formatInr(amount)}/year`,
      note: `${formatInr(monthlyEquivalent)}/month billed annually · save 20%`,
    };
  }
  return { main: `${formatInr(amount)}/month`, note: 'Cancel anytime' };
}

function compareValue(family, key) {
  const variant = family.variants[0];
  if (key === 'campaigns') return `${variant.campaignLimit} active`;
  if (key === 'messages') return `${variant.messageLimit.toLocaleString('en-IN')}/month`;
  if (key === 'search') return variant.advancedSearch ? 'Advanced' : 'Basic';
  if (key === 'featured') return variant.featuredCampaigns ? 'Included' : '—';
  if (key === 'support') return family.support;
  return '—';
}

const PlanPricingGrid = ({
  plans = [],
  billingCycle,
  onBillingCycleChange,
  onSelectPlan,
  currentPlanId,
  loadingPlanId,
  heading,
  intro,
}) => {
  const rows = [
    { key: 'campaigns', label: 'Active campaigns' },
    { key: 'messages', label: 'Creator messages' },
    { key: 'search', label: 'Discovery' },
    { key: 'featured', label: 'Featured campaigns' },
    { key: 'support', label: 'Support' },
  ];

  return (
    <div className="plan-pricing">
      {(heading || intro) && (
        <div className="plan-pricing__intro" style={{ marginBottom: '2rem' }}>
          {heading}
          {intro}
        </div>
      )}

      <div className="plan-pricing__toggle-wrap">
        <div className="plan-pricing__toggle" role="group" aria-label="Billing period">
          <button
            type="button"
            className="plan-pricing__toggle-btn"
            aria-pressed={billingCycle === 'MONTHLY'}
            onClick={() => onBillingCycleChange('MONTHLY')}
          >
            Monthly
          </button>
          <button
            type="button"
            className="plan-pricing__toggle-btn"
            aria-pressed={billingCycle === 'YEARLY'}
            onClick={() => onBillingCycleChange('YEARLY')}
          >
            Yearly
            <span className="plan-pricing__save">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="plan-pricing__grid">
        {PLAN_FAMILIES.map((family) => {
          const plan = matchPlan(plans, family, billingCycle);
          const price = priceLabel(family, billingCycle, plan);
          const isCurrent = plan && currentPlanId && plan.id === currentPlanId;
          const isLoading = plan && loadingPlanId === plan.id;
          const cardClass = [
            'plan-card',
            family.tier === 'free' ? 'plan-card--free' : '',
            family.recommended ? 'plan-card--featured' : '',
          ].filter(Boolean).join(' ');

          return (
            <article key={family.key} className={cardClass} aria-labelledby={`plan-${family.key}`}>
              <div className="plan-card__eyebrow">
                <span>{family.tier === 'free' ? 'Free to start' : 'Paid plan'}</span>
                {family.recommended && <span className="plan-card__badge">Most popular</span>}
              </div>
              <h3 id={`plan-${family.key}`} className="plan-card__name">{family.displayName}</h3>
              <div className="plan-card__price">{price.main}</div>
              <p className="plan-card__price-note">{price.note}</p>
              <p className="plan-card__pitch">{family.headline}</p>
              <ul className="plan-card__list">
                {family.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
              <button
                type="button"
                className={family.recommended ? 'btn btn-primary' : 'btn btn-outline'}
                disabled={Boolean(isLoading || isCurrent || (plans.length > 0 && !plan))}
                onClick={() => onSelectPlan(family, billingCycle, plan)}
              >
                {isCurrent ? 'Current plan' : isLoading ? 'Working…' : family.cta}
              </button>
            </article>
          );
        })}
      </div>

      <section className="plan-compare" aria-labelledby="plan-compare-title">
        <h3 id="plan-compare-title" className="plan-compare__title">Compare at a glance</h3>
        <div className="plan-compare__scroll">
          <table className="plan-compare__table">
            <thead>
              <tr>
                <th scope="col">What you get</th>
                {PLAN_FAMILIES.map((family) => (
                  <th key={family.key} scope="col" data-recommended={family.recommended ? 'true' : 'false'}>
                    {family.displayName}
                    {family.recommended ? ' · recommended' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <th scope="row">{row.label}</th>
                  {PLAN_FAMILIES.map((family) => (
                    <td key={family.key} data-recommended={family.recommended ? 'true' : 'false'}>
                      {compareValue(family, row.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default PlanPricingGrid;
