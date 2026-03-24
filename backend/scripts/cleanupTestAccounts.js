import '../db/database.js';
import { listUsers, deleteUserById, ensureUser } from '../models/userModel.js';

const users = listUsers();
const MASTER_TEST_ACCOUNT = 'studio@seedbar.dev';

for (const u of users) {
    // We clean up 'test', 'demo', or other seedbar domains that aren't the master one.
    if ((u.email.includes('test') || u.email.includes('demo') || u.email.includes('seedbar')) && u.email !== MASTER_TEST_ACCOUNT) {
        console.log(`Deleting unused test account: ${u.email}`);
        deleteUserById(u.id);
    }
}

// Ensures we always have one master studio test account.
const master = ensureUser(MASTER_TEST_ACCOUNT, 'studio', 'seedbar1234');
console.log(`Ensured master test account: ${master.email} [${master.plan}]`);
console.log('Test account cleanup complete.');
