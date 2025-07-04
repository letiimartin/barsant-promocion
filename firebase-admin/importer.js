const fs = require('fs');
const path = require('path');

async function importCollection(db, filePath, collectionName) {
  if (!fs.existsSync(filePath)) {
    console.error(`Archivo no encontrado: ${filePath}`);
    return;
  }

  const rawData = fs.readFileSync(filePath);
  const data = JSON.parse(rawData);

  const batch = db.batch();
  let count = 0;

  for (const item of data) {
    const docRef = item.id
      ? db.collection(collectionName).doc(item.id)
      : db.collection(collectionName).doc();

    batch.set(docRef, item);
    count++;

    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Subidos ${count} documentos hasta ahora.`);
    }
  }

  if (count % 500 !== 0) {
    await batch.commit();
  }

  console.log(`Importación completada: ${count} documentos en '${collectionName}'.`);
}

module.exports = { importCollection };
