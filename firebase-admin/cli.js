#!/usr/bin/env node

const { Command } = require('commander');
const { initializeFirebase } = require('./firebaseService');
const { importCollection } = require('./importer');
const { exportCollection } = require('./exporter');
const { updatePlanos } = require('./updatePlanos');
const path = require('path');

const program = new Command();
program.version('1.0.0');

program
  .command('import <file> <collection>')
  .description('Importa un archivo JSON a Firestore')
  .action(async (file, collection) => {
    const db = initializeFirebase();
    const filePath = path.join(__dirname, '..', 'data', file);
    await importCollection(db, filePath, collection);
  });

program
  .command('export <collection> <outputFile>')
  .description('Exporta una colección de Firestore a un archivo JSON')
  .action(async (collection, outputFile) => {
    const db = initializeFirebase();
    const outputPath = path.join(__dirname, '..', 'data', outputFile);
    await exportCollection(db, collection, outputPath);
  });

  // update-planos
  program
  .command('update-planos')
  .description('Añade enlaces de planos PDF a la colección datos_web')
  .option('-c, --collection <name>', 'nombre de la colección', 'datos_web')
  .action(async (options) => {
    console.log('🔥 Iniciando actualización de planos...');
    
    try {
      const db = initializeFirebase();
      await updatePlanos(db, options.collection); // ✅ Llamar a tu función
    } catch (error) {
      console.error('❌ Error en comando update-planos:', error.message);
      process.exit(1);
    }
  });


program.parse(process.argv);
