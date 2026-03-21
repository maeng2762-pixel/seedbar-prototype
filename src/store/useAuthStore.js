import { create } from 'zustand';
import {
  clearAuthStorage,
  getAccessToken,
  getAuthHeaders,
  getStoredUser,
  isLoggedIn,
  setAccessToken,
  setStoredUser,
} from '../lib/authClient';
import { setClientPlan } from '../lib/subscriptionContext';
import { apiUrl } from '../lib/apiClient';

async function parseResponseJson(res, url) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const raw = await res.text();
    const preview = raw.slice(0, 120).replace(/\s+/g, ' ');
    throw new Error(`NON_JSON:${res.status}:${url}:${preview}`);
  }
  return res.json();
}

const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  token: getAccessToken(),
  loading: false,
  hydrated: false,
  error: null,

  isAuthenticated: () => isLoggedIn() && Boolean(get().user),

  hydrate: async () => {
    set({ loading: true });
    const token = getAccessToken();
    const user = getStoredUser();
    if (!token || !user) {
      set({ token: '', user: null, loading: false, hydrated: true });
      return null;
    }

    try {
      const url = apiUrl('/api/auth/me');
      const res = await fetch(url, { headers: { ...getAuthHeaders() } });
      const data = await parseResponseJson(res, url);
      if (!res.ok || !data.ok) throw new Error(data?.error || 'Session expired.');

      setStoredUser(data.user);
      setClientPlan(data.user?.plan || 'free');
      set({ user: data.user, token, error: null, loading: false, hydrated: true });
      return data.user;
    } catch (_error) {
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

      setAccessToken(data.accessToken);
      setStoredUser(data.user);
      setClientPlan(data.user?.plan || 'free');
      set({ loading: false, user: data.user, token: data.accessToken });
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

      setAccessToken(data.accessToken);
      setStoredUser(data.user);
      setClientPlan(data.user?.plan || 'free');
      set({ loading: false, user: data.user, token: data.accessToken });
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
