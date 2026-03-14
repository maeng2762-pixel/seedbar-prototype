import '../db/database.js';
import { ensureUser } from '../models/userModel.js';

const accounts = [
  { email: 'free@seedbar.dev', password: 'seedbar1234', plan: 'free' },
  { email: 'pro@seedbar.dev', password: 'seedbar1234', plan: 'pro' },
  { email: 'expert@seedbar.dev', password: 'seedbar1234', plan: 'studio' },
];

for (const acc of accounts) {
  const user = ensureUser(acc.email, acc.plan, acc.password);
  console.log(`[seed] ${user.email} -> ${user.plan}`);
}

console.log('[seed] done');
