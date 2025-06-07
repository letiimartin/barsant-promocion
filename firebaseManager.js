// firebaseManager.js - Una herramienta para todas las operaciones Firebase
// Reemplaza tu importDataFirebase.js actual

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ========================
// CONFIGURACIÓN
// ========================
let db = null;

function initializeFirebase() {
  if (db) return db;
  
  try {
    const serviceAccount = require('./firebase-credentials.json');
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    
    db = admin.firestore();
    return db;
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error.message);
    process.exit(1);
  }
}

// ========================
// FUNCIONES DE IMPORTACIÓN INICIAL (tu código actual)
// ========================
const collections = {
  'viviendas.json': 'viviendas',
  'cocheras.json': 'cocheras', 
  'trasteros.json': 'trasteros',
};

async function uploadJsonToFirestore(filename, collectionName) {
  const filePath = path.join(__dirname, 'data', filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Archivo no encontrado: ${filePath}`);
    return;
  }
  
  const rawData = fs.readFileSync(filePath);
  const data = JSON.parse(rawData);
  const batch = db.batch();
  let count = 0;

  for (const item of data) {
    const docId = item.id || item.ID || item.codigo || undefined;
    const docRef = docId ? db.collection(collectionName).doc(docId) : db.collection(collectionName).doc();

    batch.set(docRef, item);
    count++;
    
    // Ejecutar batch cada 500 docs (límite de Firestore)
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`  💾 Guardados ${count} documentos...`);
    }
  }
  
  // Ejecutar batch final
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`✅ Subidos ${count} documentos a '${collectionName}'`);
}

async function importarDatosIniciales(coleccionesEspecificas = null) {
  console.log('📥 IMPORTANDO DATOS INICIALES');
  console.log('==============================');
  
  // Si se especifican colecciones, solo importar esas
  const coleccionesAImportar = coleccionesEspecificas 
    ? Object.fromEntries(
        Object.entries(collections).filter(([filename, collection]) => 
          coleccionesEspecificas.includes(collection)
        )
      )
    : collections;
  
  for (const [filename, collection] of Object.entries(coleccionesAImportar)) {
    console.log(`📁 Procesando ${filename} → ${collection}`);
    await uploadJsonToFirestore(filename, collection);
  }
  
  console.log('\n✅ Importación completada');
}

// ========================
// FUNCIONES PARA CREAR COLECCIONES NUEVAS
// ========================

// Clasificadores
function clasificarCochera(superficie) {
  if (superficie < 13) return 'pequeña';
  if (superficie < 15) return 'mediana';
  return 'grande';
}

function clasificarTrastero(superficie) {
  if (superficie < 3) return 'muy_pequeño';
  if (superficie < 5) return 'pequeño';
  if (superficie < 10) return 'mediano';
  return 'grande';
}

function determinarTipoVivienda(vivienda) {
  if (vivienda.terraza && vivienda.terraza > 0) return 'exterior';
  if (vivienda.bloque === 'D' || vivienda.bloque === 'E') return 'interior';
  return 'exterior';
}

function determinarOrientacion(vivienda) {
  if (vivienda.bloque === 'A' && vivienda.letra === 'A') return 'sur-oeste';
  if (vivienda.bloque === 'A' && vivienda.letra === 'B') return 'norte';
  if (vivienda.bloque === 'C') return 'sur';
  if (vivienda.bloque === 'D') return 'patio-interior';
  if (vivienda.bloque === 'E') return 'patio-interior';
  return 'por-determinar';
}

async function aplicarMigracionTamañosYPares() {
  console.log('🔄 APLICANDO MIGRACIÓN: TAMAÑOS Y PARES');
  console.log('=======================================');
  
  // Pares fijos cochera-trastero
  const paresFijos = {
    "C32": "T12", "C33": "T14", "C34": "T15", "C36": "T17",
    "C38": "T20", "C39": "T22", "C40": "T23", "C41": "T24", 
    "C42": "T25", "C11": "T2", "C12": "T3", "C13": "T4",
    "C14": "T5", "C15": "T6", "C17": "T7", "C18": "T8",
    "C19": "T9", "C20": "T10", "C21": "T11"
  };

  // Actualizar cocheras
  console.log('🚗 Actualizando cocheras...');
  const cocherasSnap = await db.collection('cocheras').get();
  const cocherasBatch = db.batch();
  
  cocherasSnap.forEach(doc => {
    const cochera = doc.data();
    const trasteroAsignado = paresFijos[doc.id] || null;
    
    const updates = {
      tamaño: clasificarCochera(cochera.sup_util),
      trastero_asignado: trasteroAsignado,
      tipo_asignacion: trasteroAsignado ? 'par_fijo' : 'individual',
      estado: cochera.estado || 'disponible',
      planta: -1,
      fecha_actualizacion: admin.firestore.FieldValue.serverTimestamp()
    };
    
    cocherasBatch.update(doc.ref, updates);
  });
  
  await cocherasBatch.commit();
  console.log(`✅ ${cocherasSnap.size} cocheras actualizadas`);

  // Actualizar trasteros
  console.log('📦 Actualizando trasteros...');
  const trasterosSnap = await db.collection('trasteros').get();
  const trasterosBatch = db.batch();
  
  trasterosSnap.forEach(doc => {
    const trastero = doc.data();
    const cocheraAsignada = Object.keys(paresFijos).find(
      cochera => paresFijos[cochera] === doc.id
    ) || null;
    
    const updates = {
      tamaño: clasificarTrastero(trastero.sup_util),
      cochera_asignada: cocheraAsignada,
      tipo_asignacion: cocheraAsignada ? 'par_fijo' : 'individual',
      estado: trastero.estado || 'disponible',
      planta: -1,
      fecha_actualizacion: admin.firestore.FieldValue.serverTimestamp()
    };
    
    trasterosBatch.update(doc.ref, updates);
  });
  
  await trasterosBatch.commit();
  console.log(`✅ ${trasterosSnap.size} trasteros actualizados`);

  // Preparar viviendas
  console.log('🏠 Preparando viviendas...');
  const viviendasSnap = await db.collection('viviendas').get();
  const viviendasBatch = db.batch();
  
  viviendasSnap.forEach(doc => {
    const vivienda = doc.data();
    
    const updates = {
      estado: vivienda.estado || 'disponible',
      tipo_vivienda: vivienda.tipo_vivienda || determinarTipoVivienda(vivienda),
      orientacion: vivienda.orientacion || determinarOrientacion(vivienda),
      cochera_asignada: vivienda.cochera_asignada || null,
      trastero_asignado: vivienda.trastero_asignado || null,
      cliente_id: vivienda.cliente_id || null,
      reserva_id: vivienda.reserva_id || null,
      fecha_actualizacion: admin.firestore.FieldValue.serverTimestamp()
    };
    
    viviendasBatch.update(doc.ref, updates);
  });
  
  await viviendasBatch.commit();
  console.log(`✅ ${viviendasSnap.size} viviendas preparadas`);
  
  console.log('\n✅ Migración completada');
}

// ========================
// FUNCIONES DE CONSULTA Y ESTADÍSTICAS
// ========================
async function mostrarEstadisticas() {
  console.log('📊 ESTADÍSTICAS DE FIREBASE');
  console.log('============================');
  
  try {
    // Contar documentos
    const cocheras = await db.collection('cocheras').count().get();
    const trasteros = await db.collection('trasteros').count().get();
    const viviendas = await db.collection('viviendas').count().get();
    
    console.log('📋 TOTALES:');
    console.log(`  Cocheras: ${cocheras.data().count}`);
    console.log(`  Trasteros: ${trasteros.data().count}`);
    console.log(`  Viviendas: ${viviendas.data().count}`);
    
    // Estadísticas detalladas si existen los campos
    const cocherasData = await db.collection('cocheras').limit(5).get();
    if (!cocherasData.empty && cocherasData.docs[0].data().tamaño) {
      await mostrarEstadisticasDetalladas();
    } else {
      console.log('\n💡 Ejecuta la migración para ver estadísticas detalladas');
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error.message);
  }
}

async function mostrarEstadisticasDetalladas() {
  // Estadísticas cocheras
  const cocheras = await db.collection('cocheras').get();
  const statsCocheras = { pequeña: 0, mediana: 0, grande: 0, pares: 0, individuales: 0 };
  
  cocheras.forEach(doc => {
    const data = doc.data();
    if (data.tamaño) statsCocheras[data.tamaño]++;
    if (data.tipo_asignacion === 'par_fijo') statsCocheras.pares++;
    if (data.tipo_asignacion === 'individual') statsCocheras.individuales++;
  });
  
  // Estadísticas trasteros
  const trasteros = await db.collection('trasteros').get();
  const statsTrasteros = { muy_pequeño: 0, pequeño: 0, mediano: 0, grande: 0, pares: 0, individuales: 0 };
  
  trasteros.forEach(doc => {
    const data = doc.data();
    if (data.tamaño) statsTrasteros[data.tamaño]++;
    if (data.tipo_asignacion === 'par_fijo') statsTrasteros.pares++;
    if (data.tipo_asignacion === 'individual') statsTrasteros.individuales++;
  });
  
  console.log('\n🚗 COCHERAS POR TAMAÑO:');
  console.log(`  Pequeñas: ${statsCocheras.pequeña} | Medianas: ${statsCocheras.mediana} | Grandes: ${statsCocheras.grande}`);
  console.log(`  En pares: ${statsCocheras.pares} | Individuales: ${statsCocheras.individuales}`);
  
  console.log('\n📦 TRASTEROS POR TAMAÑO:');
  console.log(`  Muy pequeños: ${statsTrasteros.muy_pequeño} | Pequeños: ${statsTrasteros.pequeño}`);
  console.log(`  Medianos: ${statsTrasteros.mediano} | Grandes: ${statsTrasteros.grande}`);
  console.log(`  En pares: ${statsTrasteros.pares} | Individuales: ${statsTrasteros.individuales}`);
}

async function validarDatos() {
  console.log('🔍 VALIDANDO DATOS');
  console.log('==================');
  
  try {
    // Validar cocheras
    const cocheras = await db.collection('cocheras').limit(3).get();
    console.log('📋 Muestra cocheras:');
    cocheras.forEach(doc => {
      const data = doc.data();
      console.log(`  ${doc.id}: ${data.sup_util}m² ${data.tamaño ? `(${data.tamaño})` : ''}`);
    });
    
    // Validar trasteros
    const trasteros = await db.collection('trasteros').limit(3).get();
    console.log('\n📋 Muestra trasteros:');
    trasteros.forEach(doc => {
      const data = doc.data();
      console.log(`  ${doc.id}: ${data.sup_util}m² ${data.tamaño ? `(${data.tamaño})` : ''}`);
    });
    
    // Validar viviendas
    const viviendas = await db.collection('viviendas').limit(3).get();
    console.log('\n📋 Muestra viviendas:');
    viviendas.forEach(doc => {
      const data = doc.data();
      console.log(`  ${doc.id}: Bloque ${data.bloque} ${data.tipo_vivienda ? `(${data.tipo_vivienda})` : ''}`);
    });
    
    console.log('\n✅ Validación completada');
    
  } catch (error) {
    console.error('❌ Error en validación:', error.message);
  }
}

// ========================
// FUNCIONES DE EXPORTACIÓN (Firebase → JSON local)
// ========================
async function exportarColeccion(collectionName) {
  console.log(`📤 Exportando ${collectionName} desde Firebase...`);
  
  const snapshot = await db.collection(collectionName).get();
  const data = [];
  
  snapshot.forEach(doc => {
    data.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  // Guardar en archivo JSON local
  const outputPath = path.join(__dirname, 'data', `${collectionName}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
  
  console.log(`✅ ${data.length} documentos exportados a ${outputPath}`);
  return data.length;
}

async function exportarTodasLasColecciones() {
  console.log('📤 EXPORTANDO TODAS LAS COLECCIONES');
  console.log('===================================');
  
  // Asegurar que existe la carpeta data
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
    console.log('📁 Carpeta data/ creada');
  }
  
  const colecciones = ['viviendas', 'cocheras', 'trasteros', 'clientes', 'reservas', 'asignaciones'];
  let totalExportados = 0;
  
  for (const coleccion of colecciones) {
    try {
      const count = await exportarColeccion(coleccion);
      totalExportados += count;
    } catch (error) {
      console.log(`⚠️  ${coleccion}: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Exportación completada: ${totalExportados} documentos totales`);
  console.log('💡 Tus JSONs locales ahora están actualizados con Firebase');
}
async function crearColeccionesNuevas() {
  console.log('🆕 CREANDO COLECCIONES NUEVAS');
  console.log('==============================');
  
  // Crear colección CLIENTES con documento ejemplo
  console.log('👥 Creando colección clientes...');
  const clienteEjemplo = {
    nombre: "Cliente",
    apellidos: "Ejemplo Demo",
    email: "ejemplo@demo.com", 
    telefono: "+34123456789",
    dni: "12345678A",
    direccion: "Calle Ejemplo 123",
    ciudad: "Granada",
    codigo_postal: "18001",
    fecha_nacimiento: "1985-03-15",
    profesion: "Ingeniero",
    estado_civil: "soltero",
    nacionalidad: "española",
    comentarios: "Cliente de ejemplo para testing",
    
    // Metadatos
    fecha_registro: admin.firestore.FieldValue.serverTimestamp(),
    ultima_actividad: admin.firestore.FieldValue.serverTimestamp(),
    origen: "web",
    consentimiento_datos: true,
    newsletter: true,
    estado: "activo",
    
    // Contacto adicional (opcional)
    contacto_emergencia: {
      nombre: "María García",
      telefono: "+34987654321", 
      relacion: "hermana"
    },
    
    // Campo para marcar como ejemplo
    _ejemplo: true,
    _descripcion: "Documento de ejemplo - eliminar en producción"
  };
  
  await db.collection('clientes').doc('CLI_EJEMPLO').set(clienteEjemplo);
  console.log('✅ Colección clientes creada con documento ejemplo');
  
  // Crear colección RESERVAS con documento ejemplo
  console.log('📋 Creando colección reservas...');
  const reservaEjemplo = {
    vivienda_id: "V1",
    cliente_id: "CLI_EJEMPLO", 
    cochera_id: "C1",
    trastero_id: "T1",
    
    // Datos de reserva
    fecha_reserva: admin.firestore.FieldValue.serverTimestamp(),
    importe_reserva: 6000,
    estado: "pendiente_pago", // "pendiente_pago" | "pagada" | "firmada" | "completada" | "cancelada"
    metodo_pago: "transferencia",
    
    // Documentación
    justificante_pago: null,
    contrato_url: null,
    fecha_firma_contrato: null,
    firmado_docusign: false,
    
    // Precios en el momento de reserva
    precio_vivienda: 274620.0,
    precio_cochera: 34350,
    precio_trastero: 16960,
    precio_total: 325930.0,
    
    // Seguimiento
    pasos_completados: ["datos_personales"], // Array de pasos
    comentarios_internos: "Reserva de ejemplo para testing",
    agente_comercial: "Sistema Demo",
    
    // Fechas importantes
    fecha_limite_pago: new Date(Date.now() + 3*24*60*60*1000), // 3 días
    fecha_limite_firma: new Date(Date.now() + 5*24*60*60*1000), // 5 días  
    fecha_vencimiento: new Date(Date.now() + 30*24*60*60*1000), // 30 días
    
    // Campo para marcar como ejemplo
    _ejemplo: true,
    _descripcion: "Documento de ejemplo - eliminar en producción"
  };
  
  await db.collection('reservas').doc('RES_EJEMPLO').set(reservaEjemplo);
  console.log('✅ Colección reservas creada con documento ejemplo');
  
  // Crear colección ASIGNACIONES (histórico) con documento ejemplo
  console.log('📊 Creando colección asignaciones...');
  const asignacionEjemplo = {
    vivienda_id: "V1",
    cochera_id: "C1", 
    trastero_id: "T1",
    tipo: "automatica", // "automatica" | "manual" | "preferencia_cliente"
    fecha_asignacion: admin.firestore.FieldValue.serverTimestamp(),
    criterio: "proximidad", // "proximidad" | "tamaño" | "precio" | "preferencia"
    estado: "activa", // "activa" | "modificada" | "cancelada"
    creado_por: "sistema", // "sistema" | "admin" | "agente_comercial"
    observaciones: "Asignación automática por proximidad geográfica",
    
    // Campo para marcar como ejemplo
    _ejemplo: true,
    _descripcion: "Documento de ejemplo - eliminar en producción"
  };
  
  await db.collection('asignaciones').doc('ASG_EJEMPLO').set(asignacionEjemplo);
  console.log('✅ Colección asignaciones creada con documento ejemplo');
  
  console.log('\n✅ Colecciones nuevas creadas correctamente');
  console.log('💡 Los documentos ejemplo tienen _ejemplo: true para fácil identificación');
}

async function limpiarDocumentosEjemplo() {
  console.log('🧹 LIMPIANDO DOCUMENTOS DE EJEMPLO');
  console.log('===================================');
  
  const colecciones = ['clientes', 'reservas', 'asignaciones'];
  let eliminados = 0;
  
  for (const coleccion of colecciones) {
    const snapshot = await db.collection(coleccion).where('_ejemplo', '==', true).get();
    
    if (!snapshot.empty) {
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        eliminados++;
      });
      await batch.commit();
      console.log(`✅ ${snapshot.size} documentos ejemplo eliminados de ${coleccion}`);
    }
  }
  
  if (eliminados === 0) {
    console.log('ℹ️  No se encontraron documentos de ejemplo');
  } else {
    console.log(`\n✅ Total eliminados: ${eliminados} documentos ejemplo`);
  }
}
async function limpiarColeccion(collectionName) {
  console.log(`🗑️  Limpiando colección: ${collectionName}`);
  
  const snapshot = await db.collection(collectionName).get();
  const batch = db.batch();
  
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`✅ ${snapshot.size} documentos eliminados de ${collectionName}`);
}

function mostrarAyuda() {
  console.log('📖 FIREBASE MANAGER - Manual de uso');
  console.log('=====================================');
  console.log('');
  console.log('COMANDOS DISPONIBLES:');
  console.log('  node firebaseManager.js import          # Importar TODAS las colecciones locales → Firebase');
  console.log('  node firebaseManager.js import <col1> <col2># Importar colecciones específicas');
  console.log('  node firebaseManager.js export          # Exportar Firebase → datos locales');  
  console.log('  node firebaseManager.js export <colección># Exportar una colección específica');
  console.log('  node firebaseManager.js create          # Crear colecciones nuevas (clientes, reservas)');
  console.log('  node firebaseManager.js migrate         # Aplicar migración (tamaños y pares)');
  console.log('  node firebaseManager.js stats           # Mostrar estadísticas');
  console.log('  node firebaseManager.js validate        # Validar datos');
  console.log('  node firebaseManager.js clean <colección># Limpiar una colección');
  console.log('  node firebaseManager.js clean-examples  # Eliminar documentos de ejemplo');
  console.log('  node firebaseManager.js help            # Mostrar esta ayuda');
  console.log('');
  console.log('EJEMPLOS:');
  console.log('  node firebaseManager.js import clientes reservas # Solo subir clientes y reservas');
  console.log('  node firebaseManager.js export          # Bajar todo Firebase a JSONs locales');
  console.log('  node firebaseManager.js export viviendas# Bajar solo viviendas actualizadas');
  console.log('  node firebaseManager.js migrate         # Añadir campos nuevos');
  console.log('');
  console.log('FLUJO RECOMENDADO (tu situación actual):');
  console.log('  1. Crear JSONs: clientes.json, reservas.json, asignaciones.json en /data');
  console.log('  2. import clientes reservas asignaciones → Subir SOLO colecciones nuevas');  
  console.log('  3. export  → Bajar TODO actualizado (incluyendo cocheras/trasteros con campos nuevos)');
  console.log('  4. stats   → Verificar resultados');
  console.log('  5. clean-examples → Limpiar documentos ejemplo (producción)');
}

// ========================
// FUNCIÓN PRINCIPAL
// ========================
async function main() {
  const args = process.argv.slice(2);
  const comando = args[0];
  
  // Inicializar Firebase
  initializeFirebase();
  console.log('✓ Conectado a Firebase\n');
  
  switch (comando) {
    case 'import':
      const coleccionesImport = args.slice(1); // Obtener colecciones específicas
      if (coleccionesImport.length > 0) {
        console.log(`📥 Importando solo: ${coleccionesImport.join(', ')}`);
        await importarDatosIniciales(coleccionesImport);
      } else {
        await importarDatosIniciales();
      }
      break;
      
    case 'migrate':
      await aplicarMigracionTamañosYPares();
      break;
      
    case 'stats':
      await mostrarEstadisticas();
      break;
      
    case 'validate':
      await validarDatos();
      break;
      
    case 'clean':
      const coleccion = args[1];
      if (!coleccion) {
        console.log('❌ Especifica la colección a limpiar');
        console.log('Ejemplo: node firebaseManager.js clean cocheras');
        return;
      }
      await limpiarColeccion(coleccion);
      break;
      
    case 'create':
      await crearColeccionesNuevas();
      break;
      
    case 'clean-examples':
      await limpiarDocumentosEjemplo();
      break;
      
    case 'export':
      const coleccionExport = args[1];
      if (coleccionExport) {
        await exportarColeccion(coleccionExport);
      } else {
        await exportarTodasLasColecciones();
      }
      break;
      
    case 'help':
    case '--help':
    case '-h':
      mostrarAyuda();
      break;
      
    default:
      console.log('❌ Comando no reconocido');
      mostrarAyuda();
      break;
  }
}

// Ejecutar
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = {
  initializeFirebase,
  importarDatosIniciales,
  crearColeccionesNuevas,
  aplicarMigracionTamañosYPares,
  mostrarEstadisticas,
  validarDatos,
  limpiarDocumentosEjemplo
};