import { quotaService } from '../billing/quotaService.js';

export function quotaGuard(resource, message) {
  return (req, res, next) => {
    const { userId, plan } = req.context;
    if (!quotaService.canConsume(userId, plan, resource)) {
      const isGeneration = resource === 'generation' || resource === 'draft';
      return res.status(429).json({
        error: message || (isGeneration
          ? 'You have reached the monthly limit. Upgrade to Pro for unlimited choreography generation.'
          : `Monthly quota exceeded for ${resource}`),
        resource,
        plan,
        usage: quotaService.getUsage(userId, plan),
      });
    }
    next();
  };
}
