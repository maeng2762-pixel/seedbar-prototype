import { renderExportBundle } from '../services/exportRenderer.js';
import { metricsService } from '../analytics/metricsService.js';

class ExportQueue {
  constructor() {
    this.jobs = new Map();
    this.queue = [];
    this.processing = false;
  }

  createJob(payload) {
    const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const job = {
      id,
      status: 'queued',
      createdAt: new Date().toISOString(),
      payload,
      result: null,
      error: null,
      attempts: 0,
    };
    this.jobs.set(id, job);
    this.queue.push(id);
    this._tick();
    return job;
  }

  getJob(id) {
    return this.jobs.get(id) || null;
  }

  retryJob(id) {
    const job = this.jobs.get(id);
    if (!job) return null;
    if (job.status !== 'failed') return job;
    job.status = 'queued';
    job.error = null;
    this.queue.push(id);
    this._tick();
    return job;
  }

  async _tick() {
    if (this.processing) return;
    const nextId = this.queue.shift();
    if (!nextId) return;

    const job = this.jobs.get(nextId);
    if (!job) return;

    this.processing = true;
    job.status = 'processing';
    job.attempts += 1;

    const started = Date.now();
    try {
      const rendered = await renderExportBundle(job.payload);
      job.status = 'done';
      job.result = {
        filename: rendered.filename,
      };
      metricsService.inc('export.done');
      metricsService.track({ type: 'export_job', id: job.id, ms: Date.now() - started, status: 'done' });
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      metricsService.inc('export.failed');
      metricsService.track({ type: 'export_job', id: job.id, ms: Date.now() - started, status: 'failed', error: error.message });
    } finally {
      this.processing = false;
      setTimeout(() => this._tick(), 10);
    }
  }
}

export const exportQueue = new ExportQueue();
