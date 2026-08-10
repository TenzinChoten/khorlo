const API_BASE = 'http://localhost:3000/api';

export async function fetchApi(path, options = {}) {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
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
  if (url.startsWith('/uploads')) {
    return `http://localhost:3000${url}`;
  }
  return url;
}
