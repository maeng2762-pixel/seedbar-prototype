import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import pipelineRoutes from './routes/pipelineRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import planRoutes from './routes/planRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import musicRoutes from './routes/musicRoutes.js';
import choreographyRoutes from './routes/choreographyRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { requestContext, requireAuth } from './middleware/requestContext.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '30mb' }));
  app.use(requestContext);

  app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'seedbar-backend' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/pipeline', requireAuth, pipelineRoutes);
  app.use('/api/export', requireAuth, exportRoutes);
  app.use('/api/plans', requireAuth, planRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/music', requireAuth, musicRoutes);
  app.use('/api/choreography', requireAuth, choreographyRoutes);

  app.use('/api/download/:filename', (req, res) => {
    const filePath = path.join(process.cwd(), 'temp_exports', req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found.' });
    res.download(filePath, req.params.filename);
  });

  // Backward compatibility alias (legacy clients): create async export job instead of sync export.
  app.post('/api/export-legacy', (req, res) => {
    req.url = '/api/export/jobs';
    app.handle(req, res);
  });

  // Keep API responses JSON-only for client robustness.
  app.use('/api', (_req, res) => {
    return res.status(404).json({ ok: false, error: 'API route not found.' });
  });

  // Serve frontend build and support refresh on nested routes.
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get(/^(?!\/api).*/, (_req, res) => {
      return res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}
