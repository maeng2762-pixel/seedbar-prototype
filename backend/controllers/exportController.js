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
    return res.status(403).json({ error: 'PDF export is available on paid plans.' });
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

import { generateExportPackage } from '../services/pipelineService.js';

export async function generateExportPackageController(req, res) {
  try {
    const { userId, plan } = req.context;
    
    // Optional check: Ensure plan allows this feature
    if (!featureAccessService.canAccess(plan, 'canExportPPT')) {
      return res.status(403).json({ error: 'Package generation is available on Studio plan.' });
    }
    
    const draftData = req.body?.draftData;
    const options = req.body?.options || {};
    
    if (!draftData) {
      return res.status(400).json({ error: 'Missing draft data.' });
    }

    const packageContent = await generateExportPackage(draftData, options, { userId, plan });
    
    // Ensure we also consume quota if necessary, currently leaving it to quotaGuard
    quotaService.consume(userId, plan, 'exportPackageGenerated', 1);

    return res.json({ ok: true, packageContent });
  } catch (error) {
    console.error('Package Generation Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate package content.' });
  }
}
