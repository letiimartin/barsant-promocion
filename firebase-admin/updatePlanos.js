// updatePlanos.js
// Función para añadir enlaces de planos a Firebase

// Función para convertir planta número a texto
function convertirPlantaATexto(planta) {
  const mapa = {
    1: 'Primero',
    2: 'Segundo', 
    3: 'Tercero',
    4: 'Cuarto'
  };
  return mapa[planta] || `Planta${planta}`;
}

// Función para generar URL del plano
function generarUrlPlano(bloque, planta, letra) {
  const plantaTexto = convertirPlantaATexto(planta);
  const fileName = `plano-${bloque}-${plantaTexto}-${letra}.pdf`;
  return `https://firebasestorage.googleapis.com/v0/b/ventanilla-barsant.firebasestorage.app/o/${encodeURIComponent(fileName)}?alt=media`;
}

// ✅ FUNCIÓN PRINCIPAL EXPORTABLE
async function updatePlanos(db, collectionName = 'datos_web') {
  try {
    console.log(`🔍 Procesando colección: ${collectionName}`);
    
    // Obtener documentos existentes
    const snapshot = await db.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log(`❌ No se encontraron documentos en la colección ${collectionName}`);
      return { success: false, message: 'Colección vacía' };
    }
    
    console.log(`📄 Encontrados ${snapshot.size} documentos en ${collectionName}`);
    
    let actualizadas = 0;
    let omitidas = 0;
    let errores = 0;
    
    // Procesar cada documento
    for (const doc of snapshot.docs) {
      const documentoId = doc.id;
      const datos = doc.data();
      
      try {
        // Verificar que tiene los datos necesarios
        if (datos.bloque && datos.planta && datos.letra) {
          const urlPlano = generarUrlPlano(datos.bloque, datos.planta, datos.letra);
          
          // Actualizar documento
          await db.collection(collectionName).doc(documentoId).update({
            link_plano: urlPlano,
            fecha_actualizacion_plano: new Date()
          });
          
          console.log(`✅ ${documentoId} -> link_plano añadido`);
          actualizadas++;
          
        } else {
          console.log(`⚠️  ${documentoId} omitido (faltan datos: bloque=${datos.bloque}, planta=${datos.planta}, letra=${datos.letra})`);
          omitidas++;
        }
        
      } catch (error) {
        console.error(`❌ Error actualizando ${documentoId}:`, error.message);
        errores++;
      }
    }
    
    // Mostrar resumen
    console.log('\n🎉 Proceso completado');
    console.log(`✅ Documentos actualizados: ${actualizadas}`);
    console.log(`⚠️  Documentos omitidos: ${omitidas}`);
    console.log(`❌ Errores: ${errores}`);
    
    if (omitidas > 0) {
      console.log('\n💡 Los documentos omitidos no tienen bloque, planta o letra definidos');
    }
    
    if (actualizadas > 0) {
      console.log('\n🔗 Ejemplos de URLs generadas:');
      console.log('   A_CUARTO_A -> https://firebasestorage.googleapis.com/.../plano-A-Cuarto-A.pdf');
      console.log('   B_SEGUNDO_B -> https://firebasestorage.googleapis.com/.../plano-B-Segundo-B.pdf');
    }
    
    return { 
      success: true, 
      actualizadas, 
      omitidas, 
      errores 
    };
    
  } catch (error) {
    console.error('💥 Error general en updatePlanos:', error);
    throw error;
  }
}

// ✅ FUNCIÓN STANDALONE (si quieres ejecutar el archivo directamente)
async function ejecutarStandalone() {
  const admin = require('firebase-admin');
  
  // Solo inicializar si no está ya inicializado
  if (admin.apps.length === 0) {
    const { initializeFirebase } = require('./firebaseService');
    const db = initializeFirebase();
    await updatePlanos(db);
  } else {
    const db = admin.firestore();
    await updatePlanos(db);
  }
}

// ✅ EXPORTAR PARA USO EN CLI
module.exports = {
  updatePlanos,
  convertirPlantaATexto,
  generarUrlPlano
};

// ✅ EJECUTAR SI SE LLAMA DIRECTAMENTE
if (require.main === module) {
  ejecutarStandalone().catch(console.error);
}