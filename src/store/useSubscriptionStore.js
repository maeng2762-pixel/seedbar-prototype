import { create } from 'zustand';
import { getClientPlan, getClientUserId, getPlanHeaders, setClientPlan } from '../lib/subscriptionContext';
import { apiUrl } from '../lib/apiClient';

const initial = {
  currentPlan: getClientPlan(),
  userId: getClientUserId(),
  policy: null,
  usage: null,
  allPlans: null,
  loading: false,
  error: null,
};

async function parseResponseJson(res, url) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const raw = await res.text();
    const preview = raw.slice(0, 120).replace(/\s+/g, ' ');
    throw new Error(`NON_JSON:${res.status}:${url}:${preview}`);
  }
  return res.json();
}

const useSubscriptionStore = create((set, get) => ({
  ...initial,

  setPlan: async (plan) => {
    setClientPlan(plan);
    set({ currentPlan: getClientPlan() });
    await get().refreshCapabilities();
  },

  refreshCapabilities: async () => {
    set({ loading: true, error: null });
    try {
      const url = apiUrl('/api/plans/capabilities');
      const res = await fetch(url, {
        headers: {
          ...getPlanHeaders(),
        },
      });
      const data = await parseResponseJson(res, url);
      if (!res.ok) throw new Error(data?.error || 'Failed to load plan capabilities.');
      set({
        loading: false,
        error: null,
        currentPlan: data.currentPlan || getClientPlan(),
        policy: data.policy || null,
        usage: data.usage || null,
        allPlans: data.allPlans || null,
      });
      return data;
    } catch (error) {
      set({ loading: false, error: error.message || 'Failed to load plan.' });
      return null;
    }
  },

  consumeGeneration: async () => {
    const url = apiUrl('/api/plans/consume-generation');
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getPlanHeaders(),
      },
      body: JSON.stringify({}),
    });

    const data = await parseResponseJson(res, url);
    if (!res.ok || !data.ok) {
      const message = data?.error || 'Generation limit check failed.';
      throw new Error(message);
    }

    set({ usage: data.usage || null, currentPlan: data.plan || getClientPlan() });
    return data;
  },

  getUsageLabel: (language = 'EN') => {
    const { currentPlan, usage } = get();
    const isKr = language === 'KR';

    if (currentPlan === 'studio') return isKr ? '스튜디오 플랜' : 'Studio Plan';
    if (currentPlan === 'pro') return isKr ? '무제한 생성' : 'Unlimited';

    const remaining = usage?.remainingGenerations ?? 0;
    const limit = usage?.generationLimit ?? 3;
    return isKr ? `무료 생성: ${remaining}/${limit}` : `Free: ${remaining}/${limit}`;
  },
}));

export default useSubscriptionStore;
