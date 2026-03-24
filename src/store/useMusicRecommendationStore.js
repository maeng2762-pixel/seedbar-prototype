import { create } from 'zustand';
import { getUserFacingApiMessage, requestJsonWithSession } from '../lib/sessionRequest.js';
import { reportRuntimeDiagnostic } from '../services/runtimeDiagnostics.js';

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
      const payload = {
        genre,
        mood,
        keywords,
        duration,
        competitionMode,
        tempo,
        emotionCurve,
        language,
      };
      const { data } = await requestJsonWithSession('/api/music/recommend', {
        method: 'POST',
        body: payload,
      }, {
        featureKey: 'music_recommendation',
        timeoutMs: 45000,
      });

      if (!data?.ok) {
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
      reportRuntimeDiagnostic({
        category: 'music_recommendation_failed',
        severity: 'warn',
        message: error?.message || 'Music recommendation failed.',
        meta: {
          genre: genre || '',
          mood: mood || '',
          language: language || 'EN',
        },
      });
      set({
        loading: false,
        error: getUserFacingApiMessage(error, {
          isKr: language === 'KR',
          messages: language === 'KR' ? {
            auth: '로그인 세션이 만료되었습니다. 다시 로그인 후 음악 추천을 이용해 주세요.',
            authRetryFailed: '세션 자동 복구에 실패했습니다. 다시 로그인 후 음악 추천을 이용해 주세요.',
            plan: '음악 추천 권한을 확인할 수 없습니다.',
            config: '음악 추천 엔진 설정을 확인하는 중입니다. 잠시 후 다시 시도해 주세요.',
            timeout: '음악 추천 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.',
            network: '서버 연결이 불안정합니다. 잠시 후 다시 시도해 주세요.',
            server: '음악 추천 서버에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
          } : {
            auth: 'Your login session expired. Please log in again to use music recommendations.',
            authRetryFailed: 'Automatic session recovery failed. Please log in again to use music recommendations.',
            plan: 'We could not verify permission for music recommendations on this plan.',
            config: 'The music recommendation service is being checked right now. Please try again shortly.',
            timeout: 'Music recommendation is taking longer than expected. Please try again shortly.',
            network: 'The server connection is unstable. Please try again shortly.',
            server: 'The music recommendation service hit an issue. Please try again later.',
          },
        }),
      });
    }
  },
}));

export default useMusicRecommendationStore;
