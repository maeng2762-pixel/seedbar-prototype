import { metricsService } from '../analytics/metricsService.js';

export function getMetricsController(_req, res) {
  return res.json(metricsService.snapshot());
}

function safeString(value, max = 2000, fallback = '') {
  if (value == null) return fallback;
  const normalized = typeof value === 'string' ? value : JSON.stringify(value);
  return normalized.slice(0, max);
}

function safeMeta(meta) {
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return {};
  const next = {};
  for (const [key, value] of Object.entries(meta)) {
    if (value == null) continue;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      next[key] = value;
      continue;
    }
    next[key] = safeString(value, 600, '');
  }
  return next;
}

export function postRuntimeErrorController(req, res) {
  const body = req.body || {};
  const category = safeString(body.category, 80, 'client_error');
  const severity = safeString(body.severity, 40, 'error');
  const page = safeString(body.page || body.route, 200, req.originalUrl || '');
  const action = safeString(body.lastAction || body.action, 240, '');
  const message = safeString(body.message || body.reason, 2000, 'Unknown runtime issue');
  const stack = safeString(body.stack, 6000, '');

  metricsService.inc(`runtime.${category}`);
  metricsService.track({
    type: 'runtime_error',
    category,
    severity,
    page,
    action,
    message,
    stack,
    userId: req.context?.userId || null,
    plan: req.context?.plan || 'free',
    userAgent: safeString(req.headers['user-agent'], 300, ''),
    meta: safeMeta(body.meta),
  });

  return res.status(202).json({
    ok: true,
    received: true,
  });
}
