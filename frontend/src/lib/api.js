// [Reason] Normalize the public API origin so env values never produce /api/api or missing slashes
function getApiOrigin() {
  const raw = (import.meta.env.VITE_API_URL || 'http://localhost:3000').trim();
  return raw.replace(/\/+$/, '').replace(/\/api$/i, '');
}

export const API_ORIGIN = getApiOrigin();
export const API_BASE = `${API_ORIGIN}/api`;

export async function fetchApi(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  // [Reason] Paths are always /resource; join against /api without a double slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  const res = await fetch(`${API_BASE}${normalizedPath}`, {
    ...options,
    // [Reason] Cross-origin session cookies (Vercel → Render) are omitted unless credentials are included
    credentials: 'include',
    headers: isFormData ? undefined : {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMessage = typeof data.error === 'object' && data.error !== null 
      ? data.error.message || 'Request failed'
      : data.error || 'Request failed';
    const err = new Error(errorMessage);
    err.status = res.status;
    throw err;
  }

  return data;
}

export function getMediaUrl(url) {
  if (!url) return null;

  // [Reason] Absolute URLs include new Supabase Storage links; relative /uploads stay on the API host
  if (/^(https?:|data:|blob:)/i.test(url)) {
    try {
      const parsed = new URL(url);
      // [Reason] Rewrite leftover localhost upload URLs so production never loads local media
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return `${API_ORIGIN}${parsed.pathname}${parsed.search}`;
      }
    } catch {
      return url;
    }
    return url;
  }

  const path = url.startsWith('/') ? url : `/${url}`;
  if (path.startsWith('/uploads')) {
    return `${API_ORIGIN}${path}`;
  }
  return url;
}
