import catalog from '../data/khorlo-plans.json';

// [Reason] One catalog drives landing, billing, and seeded Plan rows so prices stay aligned
export const PLAN_FAMILIES = catalog.families;

export function formatInr(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

export function familyByKey(key) {
  return PLAN_FAMILIES.find((family) => family.key === key) || null;
}

export function matchPlan(plans, family, billingCycle) {
  if (!family) return null;
  const cycle = family.key === 'FREE' ? 'MONTHLY' : billingCycle;
  const variant = family.variants.find((item) => item.billingCycle === cycle) || family.variants[0];
  if (!variant) return null;
  return (plans || []).find((plan) => plan.name === variant.name) || null;
}

export function familyForPlan(plan) {
  if (!plan) return null;
  return PLAN_FAMILIES.find((family) => family.variants.some((variant) => variant.name === plan.name)) || null;
}

export function billingPath(familyKey, billingCycle) {
  const params = new URLSearchParams({
    plan: familyKey,
    cycle: familyKey === 'FREE' ? 'MONTHLY' : billingCycle,
  });
  return `/dashboard/billing?${params.toString()}`;
}
