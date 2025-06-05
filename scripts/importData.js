const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY
} = process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error('Missing Firebase credentials.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

const db = admin.firestore();

async function importCollection(fileName, collectionName) {
  const filePath = path.join(__dirname, '..', 'data', fileName);
  const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const batch = db.batch();
  items.forEach(item => {
    const docRef = db.collection(collectionName).doc();
    batch.set(docRef, item);
  });
  await batch.commit();
  console.log(`Imported ${items.length} items into ${collectionName}`);
}

async function run() {
  await importCollection('viviendas.json', 'viviendas');
  await importCollection('cocheras.json', 'cocheras');
  await importCollection('trasteros.json', 'trasteros');
  console.log('Import completed');
}

run().catch(err => {
  console.error('Error importing data:', err);
  process.exit(1);
});
