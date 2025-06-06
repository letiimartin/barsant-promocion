const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccount = require('./firebase-credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Mapeo de archivos a colecciones
const collections = {
  'viviendas.json': 'viviendas',
  'cocheras.json': 'cocheras',
  'trasteros.json': 'trasteros',
};

async function uploadJsonToFirestore(filename, collectionName) {
  const filePath = path.join(__dirname, 'data', filename);
  const rawData = fs.readFileSync(filePath);
  const data = JSON.parse(rawData);

  for (const item of data) {
    const docId = item.id || item.ID || item.codigo || undefined;
    const docRef = docId ? db.collection(collectionName).doc(docId) : db.collection(collectionName).doc();

    try {
      await docRef.set(item);
      console.log(`Subido a '${collectionName}': ${docId || '(auto-id)'}`);
    } catch (err) {
      console.error(`Error en '${collectionName}' (${docId}):`, err);
    }
  }
}

async function main() {
  for (const [filename, collection] of Object.entries(collections)) {
    console.log(`\n--- Subiendo datos desde ${filename} a la colección ${collection} ---`);
    await uploadJsonToFirestore(filename, collection);
  }

  console.log('\nTodos los datos han sido subidos correctamente.');
}

main();
