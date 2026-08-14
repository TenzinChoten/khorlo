export const POST_AUTH_REDIRECT_KEY = 'khorlo:postAuthRedirect';

export function getSafeInternalPath(value) {
  if (!value || typeof value !== 'string') return null;
  // [Reason] Only allow same-app paths so login cannot be used as an open redirect
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  return value;
}

export function rememberPostAuthRedirect(path) {
  const safe = getSafeInternalPath(path);
  if (safe) sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, safe);
}

export function consumePostAuthRedirect() {
  const stored = sessionStorage.getItem(POST_AUTH_REDIRECT_KEY);
  sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
  return getSafeInternalPath(stored);
}

export function resolvePostAuthDestination(user, requestedRedirect) {
  const redirect = getSafeInternalPath(requestedRedirect);
  if (redirect && user.onboardingComplete) return redirect;
  if (redirect && !user.onboardingComplete) {
    rememberPostAuthRedirect(redirect);
  }
  if (user.role === 'BUSINESS') {
    return user.onboardingComplete ? '/dashboard/business' : '/onboarding/business';
  }
  return user.onboardingComplete ? '/dashboard/influencer' : '/onboarding/creator';
}
