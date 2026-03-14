const TOKEN_KEY = 'seedbar_access_token';
const USER_KEY = 'seedbar_user';

function safeWindow() {
  return typeof window !== 'undefined' ? window : null;
}

export function getAccessToken() {
  const w = safeWindow();
  return w?.localStorage.getItem(TOKEN_KEY) || '';
}

export function setAccessToken(token) {
  const w = safeWindow();
  if (!w) return;
  if (!token) {
    w.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  w.localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser() {
  const w = safeWindow();
  if (!w) return null;
  const raw = w.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  const w = safeWindow();
  if (!w) return;
  if (!user) {
    w.localStorage.removeItem(USER_KEY);
    return;
  }
  w.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthStorage() {
  const w = safeWindow();
  if (!w) return;
  w.localStorage.removeItem(TOKEN_KEY);
  w.localStorage.removeItem(USER_KEY);
}

export function isLoggedIn() {
  return Boolean(getAccessToken());
}

export function getAuthHeaders() {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
