import { db } from '../db/database.js';
import { normalizePlan } from '../config/plans.js';

function nowIso() {
  return new Date().toISOString();
}

function mapBillingProfile(row) {
  if (!row) return null;
  return {
    userId: row.user_id,
    provider: row.provider,
    platform: row.platform,
    plan: normalizePlan(row.plan),
    productId: row.product_id,
    entitlementId: row.entitlement_id,
    status: row.status,
    expiresAt: row.expires_at,
    receiptId: row.receipt_id,
    lastVerifiedAt: row.last_verified_at,
    rawPayload: row.raw_payload ? JSON.parse(row.raw_payload) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getBillingProfileByUserId(userId) {
  const row = db.prepare('SELECT * FROM billing_profiles WHERE user_id = ?').get(String(userId));
  return mapBillingProfile(row);
}

export function upsertBillingProfile(userId, profile = {}) {
  const existing = getBillingProfileByUserId(userId);
  const timestamp = nowIso();
  const payload = {
    userId: String(userId),
    provider: String(profile.provider || existing?.provider || 'web'),
    platform: profile.platform || existing?.platform || null,
    plan: normalizePlan(profile.plan || existing?.plan || 'free'),
    productId: profile.productId || existing?.productId || null,
    entitlementId: profile.entitlementId || existing?.entitlementId || null,
    status: String(profile.status || existing?.status || 'inactive'),
    expiresAt: profile.expiresAt || existing?.expiresAt || null,
    receiptId: profile.receiptId || existing?.receiptId || null,
    lastVerifiedAt: profile.lastVerifiedAt || timestamp,
    rawPayload: JSON.stringify(profile.rawPayload || existing?.rawPayload || null),
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  };

  db.prepare(`
    INSERT INTO billing_profiles (
      user_id, provider, platform, plan, product_id, entitlement_id, status,
      expires_at, receipt_id, last_verified_at, raw_payload, created_at, updated_at
    ) VALUES (
      @userId, @provider, @platform, @plan, @productId, @entitlementId, @status,
      @expiresAt, @receiptId, @lastVerifiedAt, @rawPayload, @createdAt, @updatedAt
    )
    ON CONFLICT(user_id) DO UPDATE SET
      provider = excluded.provider,
      platform = excluded.platform,
      plan = excluded.plan,
      product_id = excluded.product_id,
      entitlement_id = excluded.entitlement_id,
      status = excluded.status,
      expires_at = excluded.expires_at,
      receipt_id = excluded.receipt_id,
      last_verified_at = excluded.last_verified_at,
      raw_payload = excluded.raw_payload,
      updated_at = excluded.updated_at
  `).run(payload);

  return getBillingProfileByUserId(userId);
}
