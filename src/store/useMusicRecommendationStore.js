import { create } from 'zustand';
import { getPlanHeaders } from '../lib/subscriptionContext';
import { apiUrl } from '../lib/apiClient';

const initialRecommendations = {
  trend: [],
  balanced: [],
  counterpoint: [],
  discovery: [],
  soundtrack_atmosphere: [],
  soundtrack_climax: [],
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
    discovery: null,
    soundtrack_atmosphere: null,
    soundtrack_climax: null,
  },

  setRecommendations: (recommendations) => set({
    loading: false,
    error: null,
    recommendations: recommendations || initialRecommendations,
  }),

  reset: () => set({
    loading: false,
    error: null,
    cacheHit: false,
    fingerprint: null,
    competitionMode: false,
    recommendations: initialRecommendations,
    strategy: { trend: null, balanced: null, counterpoint: null, discovery: null, soundtrack_atmosphere: null, soundtrack_climax: null },
  }),

  fetchRecommendations: async ({ genre, mood, keywords, duration, competitionMode, tempo, emotionCurve, language }) => {
    set({ loading: true, error: null });
    try {
      const payload = JSON.stringify({ genre, mood, keywords, duration, competitionMode, tempo, emotionCurve, language });
      const commonInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getPlanHeaders(),
        },
        body: payload,
      };

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
        const first = await requestJson(apiUrl('/api/music/recommend'));
        response = first.response;
        data = first.data;
      } catch (_firstError) {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3001';
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
        strategy: data.strategy || { trend: null, balanced: null, counterpoint: null, discovery: null, soundtrack_atmosphere: null, soundtrack_climax: null },
      });
    } catch (error) {
      set({ loading: false, error: error.message || 'Music recommendation failed' });
    }
  },
}));

export default useMusicRecommendationStore;
