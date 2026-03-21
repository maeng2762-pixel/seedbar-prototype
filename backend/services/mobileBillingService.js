import { normalizePlan } from '../config/plans.js';
import { getUserById, setUserPlan } from '../models/userModel.js';
import { getBillingProfileByUserId, upsertBillingProfile } from '../models/billingProfileModel.js';

const ACTIVE_STATUSES = new Set(['active', 'trialing', 'grace_period']);

export function getBillingOverview(userId) {
  const user = getUserById(userId);
  const billingProfile = getBillingProfileByUserId(userId);
  return {
    user,
    billingProfile,
    mobileBillingReady: true,
  };
}

export function syncMobileEntitlement(userId, payload = {}) {
  const normalizedStatus = String(payload.status || 'inactive').toLowerCase();
  const activePlan = ACTIVE_STATUSES.has(normalizedStatus)
    ? normalizePlan(payload.plan || 'free')
    : 'free';

  const billingProfile = upsertBillingProfile(userId, {
    provider: payload.provider || 'mobile_sdk',
    platform: payload.platform || null,
    plan: activePlan,
    productId: payload.productId || null,
    entitlementId: payload.entitlementId || null,
    status: normalizedStatus,
    expiresAt: payload.expiresAt || null,
    receiptId: payload.receiptId || null,
    lastVerifiedAt: new Date().toISOString(),
    rawPayload: payload.raw || payload,
  });

  const user = setUserPlan(userId, activePlan);
  return { user, billingProfile };
}

export function restoreBillingState(userId) {
  const user = getUserById(userId);
  const billingProfile = getBillingProfileByUserId(userId);
  return {
    user,
    billingProfile,
    requiresNativeRestore: !billingProfile || !ACTIVE_STATUSES.has(String(billingProfile.status || '').toLowerCase()),
  };
}
