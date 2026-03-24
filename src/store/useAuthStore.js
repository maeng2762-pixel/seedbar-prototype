import { create } from 'zustand';
import {
  clearAuthStorage,
  getAccessToken,
  getAuthHeaders,
  getRefreshToken,
  getStoredUser,
  isLoggedIn,
  setAccessToken,
  setRefreshToken,
  setStoredUser,
} from '../lib/authClient';
import { setClientPlan } from '../lib/subscriptionContext';
import { apiUrl } from '../lib/apiClient';
import { reportRuntimeDiagnostic } from '../services/runtimeDiagnostics.js';

async function parseResponseJson(res, url) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const raw = await res.text();
    const preview = raw.slice(0, 120).replace(/\s+/g, ' ');
    throw new Error(`NON_JSON:${res.status}:${url}:${preview}`);
  }
  return res.json();
}

function applySessionPayload(data, set) {
  if (data?.accessToken) setAccessToken(data.accessToken);
  if (Object.prototype.hasOwnProperty.call(data || {}, 'refreshToken')) {
    setRefreshToken(data?.refreshToken || '');
  }
  if (data?.user) {
    setStoredUser(data.user);
    setClientPlan(data.user?.plan || 'free');
  }
  set({
    user: data?.user || null,
    token: data?.accessToken || getAccessToken(),
    error: null,
    loading: false,
    hydrated: true,
  });
}

const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  token: getAccessToken(),
  loading: false,
  hydrated: false,
  error: null,

  isAuthenticated: () => isLoggedIn() && Boolean(get().user),

  refreshSession: async ({ silent = true, reason = 'auth_refresh' } = {}) => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      reportRuntimeDiagnostic({
        category: 'missing_refresh_token',
        severity: 'warn',
        message: `Refresh token missing during ${reason}`,
        meta: { reason },
      });
      clearAuthStorage();
      set({ user: null, token: '', error: null, loading: false, hydrated: true });
      return null;
    }

    try {
      if (!silent) set({ loading: true, error: null });
      const url = apiUrl('/api/auth/refresh');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await parseResponseJson(res, url);
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || 'Session refresh failed.');
      }

      applySessionPayload(data, set);
      reportRuntimeDiagnostic({
        category: 'session_refreshed',
        severity: 'info',
        message: `Session refresh succeeded during ${reason}`,
        meta: { reason },
      });
      return data.user;
    } catch (error) {
      reportRuntimeDiagnostic({
        category: 'refresh_token_failed',
        severity: 'error',
        message: error?.message || 'Session refresh failed.',
        meta: { reason },
      });
      clearAuthStorage();
      set({
        user: null,
        token: '',
        error: silent ? null : (error.message || 'Session refresh failed.'),
        loading: false,
        hydrated: true,
      });
      return null;
    }
  },

  hydrate: async () => {
    set({ loading: true });
    const token = getAccessToken();
    const refreshToken = getRefreshToken();
    if (!token) {
      if (refreshToken) {
        const refreshedUser = await get().refreshSession({ silent: true, reason: 'hydrate_missing_access_token' });
        if (refreshedUser) return refreshedUser;
      }
      set({ token: '', user: null, loading: false, hydrated: true });
      return null;
    }

    try {
      const url = apiUrl('/api/auth/me');
      const res = await fetch(url, { headers: { ...getAuthHeaders() } });
      const data = await parseResponseJson(res, url);
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || 'Session expired.');
      }

      setStoredUser(data.user);
      setClientPlan(data.user?.plan || 'free');
      set({ user: data.user, token: getAccessToken(), error: null, loading: false, hydrated: true });
      return data.user;
    } catch (error) {
      if (refreshToken) {
        const refreshedUser = await get().refreshSession({ silent: true, reason: 'hydrate_after_me_failed' });
        if (refreshedUser) return refreshedUser;
      }
      reportRuntimeDiagnostic({
        category: 'expired_token',
        severity: 'warn',
        message: error?.message || 'Stored access token is no longer valid.',
        meta: { reason: 'hydrate' },
      });
      clearAuthStorage();
      set({ user: null, token: '', error: null, loading: false, hydrated: true });
      return null;
    }
  },

  signup: async ({ email, password }) => {
    set({ loading: true, error: null });
    try {
      const url = apiUrl('/api/auth/signup');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await parseResponseJson(res, url);
      if (!res.ok || !data.ok) throw new Error(data?.error || 'Signup failed.');

      applySessionPayload(data, set);
      return data.user;
    } catch (error) {
      set({ loading: false, error: error.message || 'Signup failed.' });
      throw error;
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true, error: null });
    try {
      const url = apiUrl('/api/auth/login');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await parseResponseJson(res, url);
      if (!res.ok || !data.ok) throw new Error(data?.error || 'Login failed.');

      applySessionPayload(data, set);
      return data.user;
    } catch (error) {
      set({ loading: false, error: error.message || 'Login failed.' });
      throw error;
    }
  },

  logout: async () => {
    try {
      await fetch(apiUrl('/api/auth/logout'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
    } catch {
      // ignore logout network errors on client-side cleanup
    }
    clearAuthStorage();
    set({ user: null, token: '', error: null });
  },

  deleteAccount: async () => {
    set({ loading: true, error: null });
    try {
      const url = apiUrl('/api/auth/account');
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      const data = await parseResponseJson(res, url);
      if (!res.ok || !data.ok) throw new Error(data?.error || 'Account deletion failed.');

      clearAuthStorage();
      set({ user: null, token: '', error: null, loading: false });
      return true;
    } catch (error) {
      set({ loading: false, error: error.message || 'Account deletion failed.' });
      throw error;
    }
  },

  syncUser: (user) => {
    if (!user) return;
    setStoredUser(user);
    setClientPlan(user?.plan || 'free');
    set((state) => ({ ...state, user }));
  },
}));

export default useAuthStore;
