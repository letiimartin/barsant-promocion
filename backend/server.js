// server.js - Servidor principal para gestión de contratos
// Este servidor maneja la generación de PDFs y el proceso de firma digital

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const admin = require('firebase-admin');
const path = require('path');

// Importar nuestros módulos personalizados
const { generarContratoPDF } = require('./generar-contrato');
const { procesarFirma } = require('./procesar-firma');
const { configurarFirebase } = require('./firebase-config');

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3001;

// Configurar middleware básico
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://127.0.0.1:38099', 'http://localhost:8000', 'http://127.0.0.1:8000'], 
    credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' })); // Aumentamos el límite para las firmas
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
// Servir PDFs firmados
app.use('/contratos', express.static(path.join(__dirname, 'contratos_locales')));
app.use('/contratos_firmados', express.static(path.join(__dirname, 'contratos_firmados')));
// Configurar multer para manejar archivos
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB límite
    }
});

// Inicializar Firebase Admin SDK
configurarFirebase();

// ================================
// RUTA PRINCIPAL PARA GENERAR CONTRATO
// ================================

/**
 * POST /api/generar-contrato
 * Esta ruta es como el "botón de imprenta" que toma los datos del cliente
 * y genera un PDF personalizado del contrato
 */
app.post('/api/generar-contrato', async (req, res) => {
    try {
        console.log('📄 Iniciando generación de contrato...');
        
        const { reservaId } = req.body;
        
        if (!reservaId) {
            return res.status(400).json({
                success: false,
                error: 'ID de reserva requerido'
            });
        }

        // Obtener datos completos de la reserva desde Firebase
        console.log('🔍 Obteniendo datos de la reserva:', reservaId);
        const datosCompletos = await obtenerDatosReserva(reservaId);
        
        if (!datosCompletos) {
            return res.status(404).json({
                success: false,
                error: 'Reserva no encontrada'
            });
        }

        // Generar el PDF del contrato
        console.log('🏗️ Generando PDF del contrato...');
        const pdfBuffer = await generarContratoPDF(datosCompletos);
        
        // Subir el PDF a Firebase Storage
        console.log('☁️ Subiendo PDF a Firebase Storage...');
        const urlContrato = await subirPDFAFirebase(pdfBuffer, reservaId);
        
        // Actualizar la reserva con la URL del contrato
        console.log('💾 Actualizando reserva en Firebase...');
        await actualizarReservaConContrato(reservaId, urlContrato);
        
        console.log('✅ Contrato generado exitosamente');
        
        res.json({
            success: true,
            contratoUrl: urlContrato,
            message: 'Contrato generado correctamente'
        });

    } catch (error) {
        console.error('❌ Error generando contrato:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            details: error.message
        });
    }
});

// ================================
// RUTA PARA PROCESAR FIRMA DIGITAL
// ================================

/**
 * POST /api/procesar-firma
 * Esta ruta es como el "notario digital" que toma la firma del cliente
 * y la integra en el contrato final
 */
app.post('/api/procesar-firma', upload.single('firma'), async (req, res) => {
    try {
        console.log('✍️ Iniciando proceso de firma...');
        
        const { reservaId, tipoFirma, metadatos, firmaBase64 } = req.body; // ← Añadir firmaBase64
        const firmaData = req.file || firmaBase64; // ← Cambiar esta línea
        
        if (!reservaId || !firmaData) {
            return res.status(400).json({
                success: false,
                error: 'Datos de firma incompletos'
            });
        }

        // Procesar la firma y generar el PDF final
        console.log('🖊️ Procesando firma digital...');
        const resultado = await procesarFirma({
            reservaId,
            firmaData,
            tipoFirma: tipoFirma || 'digital',
            metadatos: metadatos ? JSON.parse(metadatos) : {}
        });

        if (resultado.success) {
            console.log('✅ Firma procesada exitosamente');
            res.json(resultado);
        } else {
            throw new Error(resultado.error);
        }

    } catch (error) {
        console.error('❌ Error procesando firma:', error);
        res.status(500).json({
            success: false,
            error: 'Error procesando la firma',
            details: error.message
        });
    }
});
// ================================
// RUTA PARA VERIFICAR ESTADO DEL CONTRATO
// ================================

/**
 * GET /api/estado-contrato/:reservaId
 * Esta ruta permite consultar el estado actual del contrato
 */
app.get('/api/estado-contrato/:reservaId', async (req, res) => {
    try {
        const { reservaId } = req.params;
        
        console.log('📋 Consultando estado del contrato:', reservaId);
        
        // Obtener datos de la reserva
        const db = admin.firestore();
        const reservaDoc = await db.collection('reservas').doc(reservaId).get();
        
        if (!reservaDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Reserva no encontrada'
            });
        }
        
        const datosReserva = reservaDoc.data();
        
        res.json({
            success: true,
            estado: {
                contratoGenerado: !!datosReserva.contrato_url,
                contratoFirmado: !!datosReserva.contrato_firmado_url,
                fechaGeneracion: datosReserva.fecha_contrato_generado,
                fechaFirma: datosReserva.fecha_contrato_firmado,
                contratoUrl: datosReserva.contrato_url,
                contratoFirmadoUrl: datosReserva.contrato_firmado_url
            }
        });

    } catch (error) {
        console.error('❌ Error consultando estado:', error);
        res.status(500).json({
            success: false,
            error: 'Error consultando el estado del contrato'
        });
    }
});

// ================================
// FUNCIONES AUXILIARES
// ================================

/**
 * Obtiene todos los datos necesarios para generar el contrato
 * Esto incluye datos del cliente, vivienda, y configuración
 */
async function obtenerDatosReserva(reservaId) {
    try {
        const db = admin.firestore();
        
        // Obtener datos de la reserva
        const reservaDoc = await db.collection('reservas').doc(reservaId).get();
        if (!reservaDoc.exists) {
            throw new Error('Reserva no encontrada');
        }
        
        const datosReserva = reservaDoc.data();
        
        // Obtener datos del cliente
        const clienteDoc = await db.collection('clientes').doc(datosReserva.cliente_id).get();
        if (!clienteDoc.exists) {
            throw new Error('Cliente no encontrado');
        }
        
        const datosCliente = clienteDoc.data();
        
        // Obtener datos de la vivienda si es necesario
        let datosVivienda = null;
        if (datosReserva.vivienda_id) {
            const viviendaDoc = await db.collection('viviendas').doc(datosReserva.vivienda_id).get();
            if (viviendaDoc.exists) {
                datosVivienda = viviendaDoc.data();
            }
        }
        
        return {
            reserva: { id: reservaId, ...datosReserva },
            cliente: { id: datosReserva.cliente_id, ...datosCliente },
            vivienda: datosVivienda ? { id: datosReserva.vivienda_id, ...datosVivienda } : null
        };
        
    } catch (error) {
        console.error('Error obteniendo datos de reserva:', error);
        throw error;
    }
}

/**
 * Sube el PDF generado a Firebase Storage
 
async function subirPDFAFirebase(pdfBuffer, reservaId) {
    try {
        const bucket = admin.storage().bucket();
        const nombreArchivo = `contratos/${reservaId}/contrato_${Date.now()}.pdf`;
        const archivo = bucket.file(nombreArchivo);
        
        // Subir el archivo
        await archivo.save(pdfBuffer, {
            metadata: {
                contentType: 'application/pdf',
                metadata: {
                    reservaId: reservaId,
                    tipoDocumento: 'contrato_inicial',
                    fechaGeneracion: new Date().toISOString()
                }
            }
        });
        
        // Hacer el archivo público (temporal para desarrollo)
        await archivo.makePublic();
        
        // Obtener la URL pública
        const urls = await archivo.getSignedUrl({
            action: 'read',
            expires: '01-01-2030' // URL válida por muchos años
        });
        
        return urls[0];
        
    } catch (error) {
        console.error('Error subiendo PDF a Firebase:', error);
        throw error;
    }
}

*/
// CAMBIAR la función subirPDFAFirebase por esta:
async function subirPDFAFirebase(pdfBuffer, reservaId) {
    try {
        const fs = require('fs');
        const path = require('path');
        
        // Crear directorio para contratos locales
        const directorioContratos = path.join(__dirname, 'contratos_locales');
        if (!fs.existsSync(directorioContratos)) {
            fs.mkdirSync(directorioContratos, { recursive: true });
        }
        
        // Guardar PDF localmente
        const nombreArchivo = `contrato_${reservaId}_${Date.now()}.pdf`;
        const rutaArchivo = path.join(directorioContratos, nombreArchivo);
        
        fs.writeFileSync(rutaArchivo, pdfBuffer);
        
        // Devolver URL local (será servida por la ruta /contratos)
        const urlLocal = `http://127.0.0.1:3001/contratos/${nombreArchivo}`;
        
        console.log('💾 PDF guardado localmente:', rutaArchivo);
        return urlLocal;
        
    } catch (error) {
        console.error('Error guardando PDF localmente:', error);
        throw new Error(`Error almacenando documento: ${error.message}`);
    }
}

/**
 * Actualiza la reserva con la URL del contrato generado
 */
async function actualizarReservaConContrato(reservaId, contratoUrl) {
    try {
        const db = admin.firestore();
        
        await db.collection('reservas').doc(reservaId).update({
            contrato_url: contratoUrl,
            fecha_contrato_generado: admin.firestore.FieldValue.serverTimestamp(),
            paso_actual: 3.5, // Nuevo paso intermedio
            estado: 'contrato_generado'
        });
        
    } catch (error) {
        console.error('Error actualizando reserva:', error);
        throw error;
    }
}

// ================================
// MANEJO DE ERRORES Y SERVIDOR
// ================================

// Middleware de manejo de errores
app.use((error, req, res, next) => {
    console.error('Error no manejado:', error);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
});

// Ruta de healthcheck
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Barsant Contract Service'
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor de contratos ejecutándose en puerto ${PORT}`);
    console.log(`📄 Generador de PDFs listo`);
    console.log(`✍️ Procesador de firmas listo`);
    console.log(`🔥 Firebase conectado`);
});

module.exports = app;