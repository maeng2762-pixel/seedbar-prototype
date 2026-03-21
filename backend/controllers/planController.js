import { getPlanPolicy, PLAN_POLICIES } from '../config/plans.js';
import { quotaService } from '../billing/quotaService.js';

export function getPlanCapabilitiesController(req, res) {
  const plan = req.context.plan;
  return res.json({
    currentPlan: plan,
    policy: getPlanPolicy(plan),
    usage: quotaService.getUsage(req.context.userId, plan),
    allPlans: PLAN_POLICIES,
  });
}

export function consumeGenerationController(req, res) {
  const { userId, plan } = req.context;
  if (!quotaService.canConsume(userId, plan, 'generation')) {
    return res.status(429).json({
      ok: false,
      error: 'You have reached the monthly limit. Upgrade to a paid plan for unlimited choreography generation.',
      usage: quotaService.getUsage(userId, plan),
      plan,
    });
  }

  quotaService.consume(userId, plan, 'generation', 1);
  return res.json({
    ok: true,
    usage: quotaService.getUsage(userId, plan),
    plan,
  });
}
