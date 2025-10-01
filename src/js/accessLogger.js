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
        const resp = await fetch('/src/firebase/firebase-client-config.json');
        if (!resp.ok) {
            throw new Error(`Configuración no encontrada: ${resp.status}`);
        }
        
        const config = await resp.json();
        
        if (!config.apiKey || !config.projectId) {
            throw new Error('Configuración Firebase incompleta');
        }
        
        const app = initializeApp(config, 'access-logger');
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
 */
export async function saveAccessLog(accessData) {
    try {
        if (!db) {
            await initializeFirebaseForAccessLog();
        }
        
        const logData = {
            name: accessData.name || '',
            email: accessData.email || '',
            phone: accessData.phone || '',
            company: accessData.company || '',
            userType: accessData.userType || '',
            accountName: accessData.accountName || '',
            timestamp: serverTimestamp(),
            date: new Date().toISOString(),
            userAgent: navigator.userAgent || '',
            language: navigator.language || '',
            referrer: document.referrer || 'direct',
            source: 'web_login',
            version: '1.0'
        };
        
        const docRef = await addDoc(collection(db, 'access_logs'), logData);
        console.log('✅ Registro guardado en Firebase con ID:', docRef.id);
        return docRef.id;
        
    } catch (error) {
        console.error('❌ Error guardando registro:', error);
        throw new Error(`Error al guardar registro: ${error.message}`);
    }
}

/**
 * Envía notificación por email usando EmailJS desde el navegador
 */
export async function sendAccessNotification(accessData) {
    try {
        // Si es administrador, no enviar email
        if (accessData.accountName === 'Administrador') {
            console.log('ℹ️ Admin login - no se envía email');
            return { success: true, skipped: true };
        }

        // Verificar que EmailJS esté disponible
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS no está cargado');
        }

        // Obtener configuración desde función serverless
        console.log('📧 Obteniendo configuración de EmailJS...');
        const configResponse = await fetch('/.netlify/functions/get-email-config');
        
        if (!configResponse.ok) {
            throw new Error('No se pudo obtener la configuración de email');
        }
        
        const config = await configResponse.json();
        
        // Formatear fecha y hora
        const now = new Date();
        const formattedDate = now.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const formattedTime = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Determinar email destinatario
        let recipientEmail;
        if (accessData.accountName === 'Grupo Torres') {
            recipientEmail = 'leticia.martin.cabrera@hotmail.es';
        } else if (accessData.accountName === 'Ivercasa') {
            recipientEmail = 'letiimartin12@gmail.com';
        } else {
            throw new Error(`Cuenta no reconocida: ${accessData.accountName}`);
        }
        
        // Preparar parámetros (EmailJS maneja correctamente UTF-8 desde el navegador)
        const templateParams = {
            to_email: recipientEmail,
            user_name: accessData.name,
            user_email: accessData.email,
            user_phone: accessData.phone,
            access_date: formattedDate,
            access_time: formattedTime
        };
        
        console.log(`📤 Enviando email a ${recipientEmail}...`);
        
        // Enviar email usando EmailJS desde el navegador
        const response = await emailjs.send(
            config.serviceId,
            config.templateId,
            templateParams,
            config.publicKey
        );
        
        console.log('✅ Email enviado correctamente:', response);
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        console.warn('⚠️ El acceso se registró en Firebase pero el email falló');
        // No lanzar error para no bloquear el acceso
        return { success: false, error: error.message };
    }
}

/**
 * Función principal que combina guardado en Firebase y envío de email
 */
export async function logUserAccess(userData, accountInfo) {
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
        await sendAccessNotification(accessData);
        
        return { success: true, logId };
        
    } catch (error) {
        console.error('Error en logUserAccess:', error);
        throw error;
    }
}

export { initializeFirebaseForAccessLog };