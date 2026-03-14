import { quotaService } from '../billing/quotaService.js';
import { getPlanPolicy } from '../config/plans.js';
import { metricsService } from '../analytics/metricsService.js';
import { generateStep1Draft, generateStep2Expansion, regenerateSection } from '../services/pipelineService.js';

export async function step1DraftController(req, res) {
  const { userId, plan } = req.context;
  const policy = getPlanPolicy(plan);
  const result = await generateStep1Draft(req.body || {}, req.context);
  quotaService.consume(userId, plan, 'generation', 1);
  metricsService.inc('pipeline.step1.calls');

  return res.json({
    ok: true,
    step: 1,
    policy,
    usage: quotaService.getUsage(userId, plan),
    result,
  });
}

export async function step2ExpandController(req, res) {
  const { userId, plan } = req.context;
  const policy = getPlanPolicy(plan);

  if ((req.body?.competitionMode || false) && !policy.canUseCompetitionMode) {
    return res.status(403).json({ error: 'Competition mode is available on Studio plan only.' });
  }

  const result = await generateStep2Expansion(req.body || {}, req.context, { allowExternalMusic: policy.canUseExternalMusic });
  quotaService.consume(userId, plan, 'expand', 1);
  metricsService.inc('pipeline.step2.calls');

  return res.json({
    ok: true,
    step: 2,
    policy,
    usage: quotaService.getUsage(userId, plan),
    result,
  });
}

export async function regenerateSectionController(req, res) {
  const { userId, plan } = req.context;
  const section = req.params.section;
  const allowed = ['concept', 'narrative', 'music', 'timing', 'stage'];
  if (!allowed.includes(section)) {
    return res.status(400).json({ error: 'Invalid section for regeneration.' });
  }

  const patch = await regenerateSection(req.body || {}, req.context, section);
  quotaService.consume(userId, plan, 'expand', 1);
  metricsService.inc(`pipeline.regen.${section}`);

  return res.json({ ok: true, section, patch, usage: quotaService.getUsage(userId, plan) });
}
