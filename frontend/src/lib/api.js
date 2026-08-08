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
    const err = new Error(data.error || 'Request failed');
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
