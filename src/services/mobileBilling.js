const MOBILE_PRODUCTS = {
  pro: {
    ios: 'seedbar_studio_monthly',
    android: 'seedbar_studio_monthly',
  },
  studio: {
    ios: 'seedbar_team_monthly',
    android: 'seedbar_team_monthly',
  },
};

function safeWindow() {
  return typeof window !== 'undefined' ? window : null;
}

function getBridge() {
  const win = safeWindow();
  return win?.Capacitor?.Plugins?.SeedbarBilling || win?.SeedbarMobileBilling || null;
}

export async function getMobileBillingStatus() {
  const bridge = getBridge();
  if (!bridge) {
    return { available: false, platform: 'web' };
  }

  if (typeof bridge.getStatus === 'function') {
    const status = await bridge.getStatus();
    return { available: true, ...status };
  }

  return { available: true, platform: 'unknown' };
}

export async function purchaseMobilePlan(plan) {
  const bridge = getBridge();
  if (!bridge || typeof bridge.purchaseSubscription !== 'function') {
    throw new Error('Native mobile billing is not available in this build.');
  }

  const status = await getMobileBillingStatus();
  const platform = status?.platform === 'android' ? 'android' : 'ios';
  const productId = MOBILE_PRODUCTS[plan]?.[platform];
  if (!productId) {
    throw new Error('Missing product mapping for this plan.');
  }

  return bridge.purchaseSubscription({ productId, plan, platform });
}

export async function restoreMobilePurchases() {
  const bridge = getBridge();
  if (!bridge || typeof bridge.restorePurchases !== 'function') {
    throw new Error('Restore purchases is only available in the mobile app build.');
  }

  return bridge.restorePurchases();
}
