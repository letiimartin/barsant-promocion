// src/js/accessLogger.js
// Sistema de registro de accesos de usuarios

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

let db = null;
let firebaseInitialized = false;

/**
 * Inicializa Firebase usando la configuración existente del proyecto
 */
async function initializeFirebaseForAccessLog() {
    if (firebaseInitialized) return db;
    
    try {
        // Cargar configuración desde el archivo existente
        const resp = await fetch('/src/firebase/firebase-client-config.json');
        if (!resp.ok) {
            throw new Error(`Configuración no encontrada: ${resp.status}`);
        }
        
        const config = await resp.json();
        
        if (!config.apiKey || !config.projectId) {
            throw new Error('Configuración Firebase incompleta');
        }
        
        // Inicializar Firebase
        const app = initializeApp(config, 'access-logger'); // Usar nombre único para evitar conflictos
        db = getFirestore(app);
        
        firebaseInitialized = true;
        console.log('✅ Firebase inicializado para access logger');
        return db;
        
    } catch (err) {
        console.error('❌ Error inicializando Firebase para access logger:', err);
        throw new Error(`No se pudo conectar a Firebase: ${err.message}`);
    }
}

/**
 * Guarda el registro de acceso en Firestore
 * @param {Object} accessData - Datos del acceso
 * @returns {Promise<string>} - ID del documento creado
 */
export async function saveAccessLog(accessData) {
    try {
        if (!db) {
            await initializeFirebaseForAccessLog();
        }
        
        // Preparar datos para guardar
        const logData = {
            // Datos del usuario
            name: accessData.name || '',
            email: accessData.email || '',
            phone: accessData.phone || '',
            
            // Datos de la cuenta utilizada
            company: accessData.company || '',
            userType: accessData.userType || '',
            accountName: accessData.accountName || '',
            
            // Timestamps
            timestamp: serverTimestamp(), // Timestamp del servidor
            date: new Date().toISOString(), // Fecha ISO del cliente
            
            // Información adicional
            userAgent: navigator.userAgent || '',
            language: navigator.language || '',
            referrer: document.referrer || 'direct',
            
            // Metadata
            source: 'web_login',
            version: '1.0'
        };
        
        // Guardar en la colección access_logs
        const docRef = await addDoc(collection(db, 'access_logs'), logData);
        
        console.log('✅ Registro de acceso guardado con ID:', docRef.id);
        return docRef.id;
        
    } catch (error) {
        console.error('❌ Error guardando registro de acceso:', error);
        throw new Error(`Error al guardar registro: ${error.message}`);
    }
}

/**
 * Envía notificación por email usando EmailJS
 * @param {Object} accessData - Datos del acceso
 * @param {string} emailConfig - Configuración de EmailJS
 */
export async function sendAccessNotification(accessData) {
    try {
        // Llamar a la función serverless (que tiene los emails en variables de entorno)
        const response = await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessData })
        });
        
        if (!response.ok) {
            throw new Error('Error sending email');
        }
        
        console.log('✅ Email enviado correctamente');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        console.warn('⚠️ El acceso se registró pero el email falló');
    }
}

/**
 * Función principal que combina guardado en Firebase y envío de email
 * @param {Object} userData - Datos del usuario
 * @param {Object} accountInfo - Información de la cuenta
 * @param {Object} emailConfig - Configuración de EmailJS
 */
export async function logUserAccess(userData, accountInfo, emailConfig) {
    const accessData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        company: accountInfo.company,
        userType: accountInfo.type,
        accountName: accountInfo.name
    };
    
    try {
        // 1. Guardar en Firebase
        const logId = await saveAccessLog(accessData);
        console.log('📝 Acceso registrado con ID:', logId);
        
        // 2. Enviar email (no bloqueante)
        if (emailConfig) {
            await sendAccessNotification(accessData, emailConfig);
        }
        
        return { success: true, logId };
        
    } catch (error) {
        console.error('Error en logUserAccess:', error);
        throw error;
    }
}

// Exportar también la función de inicialización por si se necesita
export { initializeFirebaseForAccessLog };