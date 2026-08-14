const BLOCKED_HOSTS = [
  /(^|\.)supabase\.com$/i,
  /(^|\.)supabase\.co$/i,
  /^localhost$/i,
  /^127\.0\.0\.1$/,
  /^0\.0\.0\.0$/,
];

function looksLikeInfraLeak(value) {
  return (
    /postgresql:\/\//i.test(value) ||
    /postgres:\/\//i.test(value) ||
    /DATABASE_URL/i.test(value) ||
    /schema=public/i.test(value) ||
    /supabase\.com\/dashboard/i.test(value) ||
    /\/dashboard\/project\//i.test(value)
  );
}

// [Reason] Never show DB consoles or connection strings as a company website or bio
export function isPublicHttpUrl(value) {
  if (!value) return false;
  const trimmed = String(value).trim();
  if (!trimmed || looksLikeInfraLeak(trimmed)) return false;
  if (/^(javascript|data|file|postgresql|postgres|mongodb|mysql|redis):/i.test(trimmed)) {
    return false;
  }

  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (BLOCKED_HOSTS.some((pattern) => pattern.test(url.hostname))) return false;
    return true;
  } catch {
    return false;
  }
}

export function sanitizePublicUrl(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return isPublicHttpUrl(withScheme) ? withScheme : null;
}

export function sanitizePublicText(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed || looksLikeInfraLeak(trimmed)) return null;
  return trimmed;
}

export function displayWebsiteHost(value) {
  const url = sanitizePublicUrl(value);
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
