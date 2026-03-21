import { getBillingOverview, restoreBillingState, syncMobileEntitlement } from '../services/mobileBillingService.js';

export function getBillingProfileController(req, res) {
  const { userId } = req.context;
  return res.json({
    ok: true,
    ...getBillingOverview(userId),
  });
}

export function syncMobileEntitlementController(req, res) {
  const { userId } = req.context;
  const { plan, provider, platform, status } = req.body || {};

  if (!plan || !provider || !status) {
    return res.status(400).json({
      ok: false,
      error: 'plan, provider, and status are required to sync mobile entitlement.',
    });
  }

  const result = syncMobileEntitlement(userId, {
    ...req.body,
    plan,
    provider,
    platform,
    status,
  });

  return res.json({
    ok: true,
    ...result,
  });
}

export function restoreBillingController(req, res) {
  const { userId } = req.context;
  return res.json({
    ok: true,
    ...restoreBillingState(userId),
  });
}
