// src/js/firebaseHistorial.js
// Gestión de historial de cambios en Firebase

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, addDoc, doc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

let db = null;
let firebaseInitialized = false;

// ========================================
// INICIALIZACIÓN DE FIREBASE
// ========================================
async function initializeFirebase() {
    if (firebaseInitialized) return db;
    
    try {
        const resp = await fetch('/src/firebase/firebase-client-config.json');
        if (!resp.ok) {
            throw new Error(`Configuración no encontrada: ${resp.status}`);
        }
        
        const config = await resp.json();
        
        if (!config.apiKey || !config.projectId) {
            throw new Error('Configuración Firebase incompleta');
        }
        
        const app = initializeApp(config, 'historial-logger');
        db = getFirestore(app);
        
        firebaseInitialized = true;
        console.log('Firebase historial inicializado');
        return db;
        
    } catch (err) {
        console.error('Error inicializando Firebase historial:', err);
        throw new Error(`No se pudo conectar a Firebase: ${err.message}`);
    }
}

// ========================================
// REGISTRAR CAMBIO DE ESTADO
// ========================================
export async function registrarCambioEstado(viviendaId, estadoAnterior, estadoNuevo, usuarioId) {
  try {
    if (!db) {
      await initializeFirebase();
    }
    
    const registroData = {
      vivienda_id: viviendaId,
      estado_anterior: estadoAnterior,
      estado_nuevo: estadoNuevo,
      usuario_id: usuarioId,
      timestamp: serverTimestamp(),
      fecha_iso: new Date().toISOString(),
      tipo_cambio: estadoAnterior === 'Disponible' ? 'disponible_a_reservado' : 'reservado_a_disponible',
      source: 'web_admin',
      version: '1.0'
    };
    
    const docRef = await addDoc(collection(db, 'historial_cambios_estado'), registroData);
    
    console.log('Cambio registrado con ID:', docRef.id);
    return docRef.id;
    
  } catch (error) {
    console.error('Error al registrar cambio:', error);
    throw new Error(`Error al registrar en historial: ${error.message}`);
  }
}

// ========================================
// ACTUALIZAR ESTADO DE VIVIENDA
// ========================================
export async function actualizarEstadoVivienda(viviendaId, nuevoEstado, usuarioId) {
  try {
    if (!db) {
      await initializeFirebase();
    }
    
    const viviendaRef = doc(db, "datos_web", viviendaId);
    await updateDoc(viviendaRef, {
      estado: nuevoEstado,
      fecha_actualizacion: new Date().toISOString(),
      ultimo_usuario_modificacion: usuarioId
    });
    
    console.log(`Estado actualizado: ${viviendaId} -> ${nuevoEstado}`);
    return true;
    
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    throw new Error(`Error al actualizar vivienda: ${error.message}`);
  }
}