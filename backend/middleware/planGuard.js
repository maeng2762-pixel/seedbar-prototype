import { featureAccessService } from '../billing/featureAccessService.js';

export function requirePlanCapability(capability, message) {
  return (req, res, next) => {
    if (!featureAccessService.canAccess(req.context.plan, capability)) {
      return res.status(403).json({
        error: message || `Current plan does not allow: ${capability}`,
        plan: req.context.plan,
      });
    }
    next();
  };
}
