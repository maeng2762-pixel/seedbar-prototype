import { createApp } from './backend/app.js';
import fs from 'fs';
import path from 'path';
import { ensureUser } from './backend/models/userModel.js';

function loadDotEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv();

function validateEnv() {
  const missing = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    missing.push('JWT_SECRET(min 16 chars)');
  }
  if (!process.env.DATABASE_PATH) {
    process.env.DATABASE_PATH = './backend/db/seedbar.sqlite';
  }
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

validateEnv();

function bootstrapReviewAccounts() {
  const reviewAccounts = [
    { email: 'studio@seedbar.dev', plan: 'studio', password: 'seedbar1234' },
    { email: 'expert@seedbar.dev', plan: 'studio', password: 'seedbar1234' },
  ];

  for (const account of reviewAccounts) {
    ensureUser(account.email, account.plan, account.password);
  }
}

bootstrapReviewAccounts();

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '0.0.0.0';
const app = createApp();

app.listen(PORT, HOST, () => {
  console.log(`[SEEDBAR BACKEND] running on http://${HOST}:${PORT}`);
});
