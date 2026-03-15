export function apiUrl(path = '') {
  const cleanPath = String(path || '').startsWith('/') ? String(path) : `/${String(path || '')}`;
  const base = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
  if (!base) return cleanPath;
  return `${base}${cleanPath}`;
}
