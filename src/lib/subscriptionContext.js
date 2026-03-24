import { getAuthHeaders, getStoredUser, setStoredUser } from './authClient';

const PLAN_KEY = 'seedbar_plan';

function safeWindow() {
  return typeof window !== 'undefined' ? window : null;
}

export function getClientPlan() {
  const user = getStoredUser();
  if (user?.plan) return String(user.plan).toLowerCase();

  const w = safeWindow();
  const plan = (w?.localStorage.getItem(PLAN_KEY) || 'free').toLowerCase();
  
  if (plan.includes('team') || plan.includes('starter') || plan.includes('enterprise')) return 'team';
  if (plan.includes('pro') || plan.includes('studio') || plan.includes('premium')) return 'studio';

  return 'free';
}

export function setClientPlan(plan) {
  const w = safeWindow();
  if (!w) return;
  const normalized = String(plan || 'free').toLowerCase();
  w.localStorage.setItem(PLAN_KEY, normalized);

  const user = getStoredUser();
  if (user) {
    setStoredUser({ ...user, plan: normalized });
  }
}

export function getClientUserId() {
  const user = getStoredUser();
  return user?.id || null;
}

export function getPlanHeaders() {
  return {
    ...getAuthHeaders(),
  };
}
