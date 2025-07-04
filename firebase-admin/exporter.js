const fs = require('fs');
const path = require('path');

async function exportCollection(db, collectionName, outputPath) {
  const snapshot = await db.collection(collectionName).get();
  const data = [];

  snapshot.forEach(doc => {
    data.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Exportados ${data.length} documentos de '${collectionName}' a '${outputPath}'.`);
}

module.exports = { exportCollection };
