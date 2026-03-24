const admin = require('firebase-admin');

// Ensure you have correct credentials
const serviceAccountPath = './config/serviceAccountKey.json';
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function run() {
    try {
        console.log('Listing all users...');
        const listUsersResult = await admin.auth().listUsers(1000);
        
        let testUsersList = [];
        
        listUsersResult.users.forEach((userRecord) => {
            if ((userRecord.email && (userRecord.email.includes('test') || userRecord.email.includes('seedbar'))) || !userRecord.email) {
                testUsersList.push({
                   uid: userRecord.uid,
                   email: userRecord.email,
                   creationTime: userRecord.metadata.creationTime,
                   lastSignInTime: userRecord.metadata.lastSignInTime
                });
            }
        });
        
        console.log(`Found ${testUsersList.length} potential test users.`);
        console.log(JSON.stringify(testUsersList, null, 2));

        for (const user of testUsersList) {
            // we will not delete them yet, just output the info.
        }

        process.exit(0);
    } catch (e) {
        console.error('Error listing users:', e);
        process.exit(1);
    }
}

run();
