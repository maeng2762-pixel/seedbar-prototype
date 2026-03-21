import { create } from 'zustand';
import { apiUrl } from '../lib/apiClient';
import { getAuthHeaders } from '../lib/authClient';
import { setClientPlan } from '../lib/subscriptionContext';
import useAuthStore from './useAuthStore';
import { getMobileBillingStatus, purchaseMobilePlan, restoreMobilePurchases } from '../services/mobileBilling';

async function parseResponseJson(res, url) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const raw = await res.text();
    const preview = raw.slice(0, 120).replace(/\s+/g, ' ');
    throw new Error(`NON_JSON:${res.status}:${url}:${preview}`);
  }
  return res.json();
}

const useBillingStore = create((set, get) => ({
  profile: null,
  nativeStatus: { available: false, platform: 'web' },
  loading: false,
  error: null,

  refreshNativeStatus: async () => {
    const status = await getMobileBillingStatus();
    set({ nativeStatus: status });
    return status;
  },

  refreshProfile: async () => {
    set({ loading: true, error: null });
    try {
      const url = apiUrl('/api/billing/me');
      const res = await fetch(url, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      const data = await parseResponseJson(res, url);
      if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to load billing profile.');
      if (data?.user?.plan) {
        setClientPlan(data.user.plan);
        useAuthStore.getState().syncUser?.(data.user);
      }
      set({ loading: false, profile: data.billingProfile || null });
      return data;
    } catch (error) {
      set({ loading: false, error: error.message || 'Failed to load billing profile.' });
      throw error;
    }
  },

  syncEntitlement: async (payload) => {
    const url = apiUrl('/api/billing/mobile/sync');
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await parseResponseJson(res, url);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to sync entitlement.');
    if (data?.user?.plan) {
      setClientPlan(data.user.plan);
      useAuthStore.getState().syncUser?.(data.user);
    }
    set({ profile: data.billingProfile || null });
    return data;
  },

  purchasePlan: async (plan) => {
    set({ loading: true, error: null });
    try {
      const nativeStatus = await get().refreshNativeStatus();
      if (!nativeStatus.available) {
        throw new Error('Native mobile billing is not available in this build.');
      }

      const purchase = await purchaseMobilePlan(plan);
      const syncResult = await get().syncEntitlement({
        provider: purchase?.provider || 'mobile_sdk',
        platform: purchase?.platform || nativeStatus.platform || 'ios',
        plan,
        status: purchase?.status || 'active',
        productId: purchase?.productId || null,
        entitlementId: purchase?.entitlementId || null,
        receiptId: purchase?.receiptId || null,
        expiresAt: purchase?.expiresAt || null,
        raw: purchase,
      });
      set({ loading: false, profile: syncResult.billingProfile || null });
      return syncResult;
    } catch (error) {
      set({ loading: false, error: error.message || 'Purchase failed.' });
      throw error;
    }
  },

  restorePurchases: async () => {
    set({ loading: true, error: null });
    try {
      const nativeStatus = await get().refreshNativeStatus();
      if (!nativeStatus.available) {
        throw new Error('Restore purchases is only available in the mobile build.');
      }

      const restored = await restoreMobilePurchases();
      const syncResult = await get().syncEntitlement({
        provider: restored?.provider || 'mobile_sdk',
        platform: restored?.platform || nativeStatus.platform || 'ios',
        plan: restored?.plan || 'free',
        status: restored?.status || 'inactive',
        productId: restored?.productId || null,
        entitlementId: restored?.entitlementId || null,
        receiptId: restored?.receiptId || null,
        expiresAt: restored?.expiresAt || null,
        raw: restored,
      });

      const restoreUrl = apiUrl('/api/billing/mobile/restore');
      await fetch(restoreUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({}),
      });

      set({ loading: false, profile: syncResult.billingProfile || null });
      return syncResult;
    } catch (error) {
      set({ loading: false, error: error.message || 'Restore failed.' });
      throw error;
    }
  },
}));

export default useBillingStore;
