const adminApp = require('firebase-admin');
const serviceAccount = require('./firebase-credentials.json');

if (!adminApp.apps.length) {
    adminApp.initializeApp({
        credential: adminApp.credential.cert(serviceAccount)
    });
}

const db = adminApp.firestore();

async function checkData() {
    try {
        const snapshot = await db.collection('datos_web').limit(1).get();
        if (snapshot.empty) {
            console.log('No matching documents.');
            process.exit(0);
        }

        snapshot.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
