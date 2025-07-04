const admin = require('firebase-admin');

let db = null;

function initializeFirebase() {
  if (db) return db;

  const serviceAccount = require('../firebase-credentials.json');

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  db = admin.firestore();
  return db;
}

module.exports = { initializeFirebase };
