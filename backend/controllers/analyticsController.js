import { metricsService } from '../analytics/metricsService.js';

export function getMetricsController(_req, res) {
  return res.json(metricsService.snapshot());
}
