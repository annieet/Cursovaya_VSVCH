const API_PREFIX = '/api';

export function getStoredToken() {
  return localStorage.getItem('salon_kastom_token');
}

export function setStoredToken(token) {
  if (token) localStorage.setItem('salon_kastom_token', token);
  else localStorage.removeItem('salon_kastom_token');
}

export async function api(path, options = {}) {
  const headers = { ...options.headers };
  const body = options.body;
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    headers['Content-Type'] = 'application/json';
  }
  const token = getStoredToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_PREFIX}${path}`, {
    ...options,
    headers,
    body:
      body && typeof body === 'object' && !(body instanceof FormData)
        ? JSON.stringify(body)
        : body,
  });

  if (res.status === 204) return null;
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.error || res.statusText;
    throw new Error(msg);
  }
  return data;
}
