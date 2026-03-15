export function apiUrl(path = '') {
  const cleanPath = String(path || '').startsWith('/') ? String(path) : `/${String(path || '')}`;
  const base = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
  const isLocalHost = typeof window !== 'undefined'
    ? ['localhost', '127.0.0.1'].includes(window.location.hostname)
    : false;
  if (!base && !isLocalHost) {
    throw new Error('Missing VITE_API_BASE_URL for deployed frontend.');
  }
  if (!base) return cleanPath;
  return `${base}${cleanPath}`;
}
