import { getPlanPolicy } from '../config/plans.js';

class FeatureAccessService {
  getPolicy(plan) {
    return getPlanPolicy(plan);
  }

  canAccess(plan, capability) {
    const policy = this.getPolicy(plan);
    return Boolean(policy?.[capability]);
  }
}

export const featureAccessService = new FeatureAccessService();
