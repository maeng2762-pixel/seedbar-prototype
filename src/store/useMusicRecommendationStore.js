import { create } from 'zustand';
import { getPlanHeaders } from '../lib/subscriptionContext';

const initialRecommendations = {
  trend: [],
  balanced: [],
  counterpoint: [],
};

const useMusicRecommendationStore = create((set) => ({
  loading: false,
  error: null,
  cacheHit: false,
  fingerprint: null,
  competitionMode: false,
  recommendations: initialRecommendations,
  strategy: {
    trend: null,
    balanced: null,
    counterpoint: null,
  },

  reset: () => set({
    loading: false,
    error: null,
    cacheHit: false,
    fingerprint: null,
    competitionMode: false,
    recommendations: initialRecommendations,
    strategy: { trend: null, balanced: null, counterpoint: null },
  }),

  fetchRecommendations: async ({ genre, mood, keywords, duration, competitionMode }) => {
    set({ loading: true, error: null });
    try {
      const payload = JSON.stringify({ genre, mood, keywords, duration, competitionMode });
      const commonInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getPlanHeaders(),
        },
        body: payload,
      };

      async function checkHealth(base = '') {
        const response = await fetch(`${base}/api/music/health`, {
          headers: {
            ...getPlanHeaders(),
          },
        });
        if (!response.ok) return false;
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) return false;
        const data = await response.json();
        return Boolean(data?.ok);
      }

      async function requestJson(url) {
        const response = await fetch(url, commonInit);
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const raw = await response.text();
          const hint = raw.slice(0, 80).replace(/\s+/g, ' ');
          throw new Error(`NON_JSON:${response.status}:${url}:${hint}`);
        }
        const data = await response.json();
        return { response, data };
      }

      let response;
      let data;
      try {
        const localHealthy = await checkHealth('');
        if (!localHealthy) throw new Error('LOCAL_PROXY_UNAVAILABLE');
        const first = await requestJson('/api/music/recommend');
        response = first.response;
        data = first.data;
      } catch (firstError) {
        // Fallback: when proxy is not active (preview/static hosting), call backend directly.
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3001';
        const directHealthy = await checkHealth(apiBase);
        if (!directHealthy) {
          throw new Error('Backend server is not running on 127.0.0.1:3001. Start backend first.');
        }
        const second = await requestJson(`${apiBase}/api/music/recommend`);
        response = second.response;
        data = second.data;
      }

      if (!response.ok || !data.ok) {
        throw new Error(data?.error || 'Music recommendation failed');
      }

      set({
        loading: false,
        error: null,
        cacheHit: Boolean(data.cacheHit),
        fingerprint: data.fingerprint,
        competitionMode: Boolean(data.competitionMode),
        recommendations: data.recommendations || initialRecommendations,
        strategy: data.strategy || { trend: null, balanced: null, counterpoint: null },
      });
    } catch (error) {
      set({ loading: false, error: error.message || 'Music recommendation failed' });
    }
  },
}));

export default useMusicRecommendationStore;
