import { exportQueue } from '../queue/exportQueue.js';
import { quotaService } from '../billing/quotaService.js';
import { featureAccessService } from '../billing/featureAccessService.js';

export function createExportJobController(req, res) {
  const { userId, plan } = req.context;
  const format = String(req.body?.format || 'pdf').toLowerCase();
  const requiresPpt = format.includes('ppt');
  const requiresPdf = format.includes('pdf');

  if (requiresPpt && !featureAccessService.canAccess(plan, 'canExportPPT')) {
    return res.status(403).json({ error: 'PPT export is available on Studio plan.' });
  }
  if (requiresPdf && !featureAccessService.canAccess(plan, 'canExportPDF')) {
    return res.status(403).json({ error: 'PDF export is available on Pro/Studio plans.' });
  }

  const job = exportQueue.createJob({
    draftData: req.body?.draftData,
    language: req.body?.language || 'EN',
    format,
    userId,
    plan,
  });
  quotaService.consume(userId, plan, 'export', 1);
  return res.status(202).json({ ok: true, jobId: job.id, status: job.status });
}

export function getExportJobController(req, res) {
  const job = exportQueue.getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  return res.json({
    id: job.id,
    status: job.status,
    result: job.result,
    error: job.error,
    attempts: job.attempts,
  });
}

export function retryExportJobController(req, res) {
  const job = exportQueue.retryJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  return res.json({ ok: true, id: job.id, status: job.status, attempts: job.attempts });
}
