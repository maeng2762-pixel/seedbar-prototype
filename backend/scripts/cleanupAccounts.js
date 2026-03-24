import '../db/database.js';
import { db } from '../db/database.js';
import { ensureUser } from '../models/userModel.js';

console.log('--- Cleaning up Test Accounts ---');

// 1. Delete all users except studio@seedbar.dev
const retainEmail = 'studio@seedbar.dev';

// Delete associated data as well. Wait, SQLite foreign keys might be ON and cascade,
// or we can just delete from users and it's fine.
const deleteStmt = db.prepare('DELETE FROM users WHERE email != ?');
const info = deleteStmt.run(retainEmail);

console.log(`Deleted ${info.changes} unnecessary test accounts.`);

// 2. Ensure the Studio plan test account exists with the correct plan and password
const user = ensureUser(retainEmail, 'studio', 'seedbar1234');
console.log(`Ensured 1 Test Account: ${user.email} -> ${user.plan}`);

console.log('--- Cleanup Finished ---');
