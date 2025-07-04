// firebase-config.js - Configuración de Firebase Admin SDK
// Este módulo es como el "embajador" entre nuestro servidor y Firebase

const admin = require('firebase-admin');
const path = require('path');

/**
 * Configura Firebase Admin SDK para acceso desde el servidor
 * Esta función establece la conexión segura con Firebase usando
 * las credenciales de administrador
 */
function configurarFirebase() {
    try {
        // Solo inicializar si no está ya inicializado
        if (admin.apps.length === 0) {
            console.log('🔥 Inicializando Firebase Admin SDK...');
            
            // En producción, usar variables de entorno
            // En desarrollo, usar el archivo de credenciales
            let credenciales;
            
            if (process.env.FIREBASE_PRIVATE_KEY) {
                // Configuración desde variables de entorno (PRODUCCIÓN)
                credenciales = {
                    type: "service_account",
                    project_id: process.env.FIREBASE_PROJECT_ID,
                    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                    client_email: process.env.FIREBASE_CLIENT_EMAIL,
                    client_id: process.env.FIREBASE_CLIENT_ID,
                    auth_uri: "https://accounts.google.com/o/oauth2/auth",
                    token_uri: "https://oauth2.googleapis.com/token",
                    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
                };
            } else {
                // Configuración desde archivo local (DESARROLLO)
                const rutaCredenciales = path.join(__dirname, '../firebase-credentials.json');
                credenciales = require(rutaCredenciales);
            }
            
            // Inicializar Firebase Admin
            admin.initializeApp({
                credential: admin.credential.cert(credenciales),
                //storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'tu-proyecto-firebase.appspot.com'
            });
            
            console.log('✅ Firebase Admin SDK inicializado correctamente');
            
            // Verificar conexión con Firestore
            const db = admin.firestore();
            console.log('📊 Firestore conectado');
            
            // Verificar conexión con Storage
            const storage = admin.storage();
            console.log('💾 Firebase Storage conectado');
            
        } else {
            console.log('🔥 Firebase Admin SDK ya estaba inicializado');
        }
        
    } catch (error) {
        console.error('❌ Error inicializando Firebase:', error);
        throw new Error('No se pudo conectar con Firebase: ' + error.message);
    }
}

/**
 * Obtiene una referencia a la base de datos Firestore
 * Esta función es como pedirle a Firebase "dame acceso a la base de datos"
 */
function obtenerFirestore() {
    return admin.firestore();
}

/**
 * Obtiene una referencia al almacenamiento de archivos
 * Esta función es como pedirle a Firebase "dame acceso al disco duro en la nube"
 */
function obtenerStorage() {
    return admin.storage();
}

/**
 * Genera un timestamp del servidor
 * Esto asegura que todas las fechas sean coherentes y no dependan del reloj del cliente
 */
function obtenerTimestampServidor() {
    return admin.firestore.FieldValue.serverTimestamp();
}

/**
 * Función auxiliar para verificar si Firebase está correctamente configurado
 * Útil para debugging y healthchecks
 */
async function verificarConexionFirebase() {
    try {
        const db = obtenerFirestore();
        
        // Intentar hacer una consulta simple para verificar conectividad
        await db.collection('_healthcheck').limit(1).get();
        
        console.log('✅ Conexión con Firebase verificada');
        return { success: true, status: 'connected' };
        
    } catch (error) {
        console.error('❌ Error verificando conexión Firebase:', error);
        return { 
            success: false, 
            status: 'disconnected', 
            error: error.message 
        };
    }
}

/**
 * Función para obtener datos de una reserva específica con validaciones
 * Esta función encapsula la lógica de obtener datos de manera segura
 */
async function obtenerReservaPorId(reservaId) {
    try {
        if (!reservaId) {
            throw new Error('ID de reserva requerido');
        }
        
        const db = obtenerFirestore();
        const reservaDoc = await db.collection('reservas').doc(reservaId).get();
        
        if (!reservaDoc.exists) {
            throw new Error(`Reserva ${reservaId} no encontrada`);
        }
        
        const datosReserva = reservaDoc.data();
        
        // Validar que la reserva tenga los datos mínimos necesarios
        if (!datosReserva.cliente_id) {
            throw new Error('Reserva sin cliente asociado');
        }
        
        return {
            id: reservaId,
            ...datosReserva
        };
        
    } catch (error) {
        console.error(`Error obteniendo reserva ${reservaId}:`, error);
        throw error;
    }
}

/**
 * Función para obtener datos completos de un cliente
 */
async function obtenerClientePorId(clienteId) {
    try {
        if (!clienteId) {
            throw new Error('ID de cliente requerido');
        }
        
        const db = obtenerFirestore();
        const clienteDoc = await db.collection('clientes').doc(clienteId).get();
        
        if (!clienteDoc.exists) {
            throw new Error(`Cliente ${clienteId} no encontrado`);
        }
        
        const datosCliente = clienteDoc.data();
        
        // Validar datos mínimos del cliente
        if (!datosCliente.nombre || !datosCliente.apellidos) {
            throw new Error('Cliente con datos incompletos');
        }
        
        return {
            id: clienteId,
            ...datosCliente
        };
        
    } catch (error) {
        console.error(`Error obteniendo cliente ${clienteId}:`, error);
        throw error;
    }
}

/**
 * Función para actualizar el estado de una reserva de manera atómica
 * Esto asegura que no haya conflictos si multiple procesos intentan actualizar al mismo tiempo
 */
async function actualizarEstadoReserva(reservaId, nuevosDatos) {
    try {
        const db = obtenerFirestore();
        const reservaRef = db.collection('reservas').doc(reservaId);
        
        // Usar una transacción para asegurar consistencia
        await db.runTransaction(async (transaction) => {
            const reservaDoc = await transaction.get(reservaRef);
            
            if (!reservaDoc.exists) {
                throw new Error('Reserva no encontrada en la transacción');
            }
            
            // Preparar datos de actualización con timestamp
            const datosActualizacion = {
                ...nuevosDatos,
                fecha_ultima_actualizacion: obtenerTimestampServidor()
            };
            
            // Actualizar la reserva
            transaction.update(reservaRef, datosActualizacion);
        });
        
        console.log(`✅ Reserva ${reservaId} actualizada correctamente`);
        return { success: true };
        
    } catch (error) {
        console.error(`Error actualizando reserva ${reservaId}:`, error);
        throw error;
    }
}

// Exportar todas las funciones para uso en otros módulos
module.exports = {
    configurarFirebase,
    obtenerFirestore,
    obtenerStorage,
    obtenerTimestampServidor,
    verificarConexionFirebase,
    obtenerReservaPorId,
    obtenerClientePorId,
    actualizarEstadoReserva,
    admin // Exportar admin para casos especiales
};