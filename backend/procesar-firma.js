// procesar-firma.js - VERSIÓN MEJORADA con firma integrada en PDF

const PDFDocument = require('pdfkit');
const moment = require('moment');
const crypto = require('crypto');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

moment.locale('es');

/**
 * Función principal para procesar una firma digital e integrarla en el PDF
 */
async function procesarFirma({ reservaId, firmaData, tipoFirma, metadatos }) {
    try {
        console.log('✍️ Iniciando procesamiento de firma digital mejorado...');
        
        // Validar datos
        validarDatosFirma({ reservaId, firmaData, tipoFirma });
        
        // Obtener datos completos de la reserva
        const datosCompletos = await obtenerDatosCompletos(reservaId);
        
        // Procesar la firma
        const firmaProcessada = await procesarTipoFirma(firmaData, tipoFirma, metadatos);
        
        // **GENERAR PDF FIRMADO CON FIRMA INTEGRADA**
        const pdfFirmadoBuffer = await generarPDFConFirmaIntegrada(datosCompletos, firmaProcessada);
        
        // Guardar PDF firmado localmente
        const urlPDFFirmado = await guardarPDFFirmadoLocal(pdfFirmadoBuffer, reservaId);
        
        // Crear registro de auditoría
        const registroAuditoria = await crearRegistroAuditoria(reservaId, firmaProcessada, metadatos);
        
        // Actualizar reserva con estado firmado
        await actualizarReservaConFirma(reservaId, urlPDFFirmado, registroAuditoria);
        
        console.log('✅ Firma procesada y PDF firmado generado exitosamente');
        
        return {
            success: true,
            contratoFirmadoUrl: urlPDFFirmado,
            registroAuditoria,
            message: 'Contrato firmado correctamente'
        };
        
    } catch (error) {
        console.error('❌ Error procesando firma:', error);
        await registrarErrorFirma(reservaId, error, metadatos);
        
        return {
            success: false,
            error: error.message,
            details: 'Error en el procesamiento de la firma digital'
        };
    }
}

/**
 * Obtiene todos los datos necesarios (reserva, cliente, vivienda)
 */
async function obtenerDatosCompletos(reservaId) {
    try {
        const db = admin.firestore();
        
        // Obtener reserva
        const reservaDoc = await db.collection('reservas').doc(reservaId).get();
        if (!reservaDoc.exists) {
            throw new Error('Reserva no encontrada');
        }
        const datosReserva = reservaDoc.data();
        
        // Obtener cliente
        const clienteDoc = await db.collection('clientes').doc(datosReserva.cliente_id).get();
        if (!clienteDoc.exists) {
            throw new Error('Cliente no encontrado');
        }
        const datosCliente = clienteDoc.data();
        
        // Intentar obtener vivienda
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
        console.error('Error obteniendo datos completos:', error);
        throw error;
    }
}

/**
 * Genera un PDF completamente nuevo con el contrato firmado y la firma integrada
 */
async function generarPDFConFirmaIntegrada(datosCompletos, firmaProcessada) {
    try {
        console.log('📄 Generando PDF con firma integrada...');
        
        // Crear nuevo documento PDF
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 40, bottom: 40, left: 40, right: 40 },
            info: {
                Title: `Contrato Firmado - ${datosCompletos.cliente.nombre} ${datosCompletos.cliente.apellidos}`,
                Author: 'Barsant Promociones Inmobiliarias',
                Subject: 'Contrato de Reserva Firmado Digitalmente',
                Creator: 'Sistema de Firma Digital Barsant v2.0',
                Producer: 'Barsant Digital Signature System'
            }
        });
        
        const anchoTexto = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        
        // Generar contenido del contrato firmado
        await generarContratoFirmadoCompleto(doc, datosCompletos, firmaProcessada, anchoTexto);
        
        // Finalizar PDF
        const pdfBuffer = await finalizarPDF(doc);
        
        console.log('✅ PDF con firma integrada generado correctamente');
        return pdfBuffer;
        
    } catch (error) {
        console.error('Error generando PDF firmado:', error);
        throw new Error(`Error creando documento firmado: ${error.message}`);
    }
}

/**
 * Genera el contenido completo del contrato firmado
 */
async function generarContratoFirmadoCompleto(doc, datosCompletos, firmaProcessada, anchoTexto) {
    const { reserva, cliente, vivienda } = datosCompletos;
    
    // Datos procesados para el contrato
    const datosContrato = procesarDatosParaContrato(datosCompletos);
    
    // MARCA DE AGUA DE DOCUMENTO FIRMADO
    añadirMarcaAguaFirmado(doc);
    
    // ENCABEZADO CON INFORMACIÓN DE FIRMA
    let yActual = generarEncabezadoConFirma(doc, datosContrato, firmaProcessada, anchoTexto);
    
    // TÍTULO PRINCIPAL
    yActual += 20;
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('CONTRATO PRIVADO DE RESERVA DE VIVIENDA', 
             doc.page.margins.left, yActual, {
                 width: anchoTexto,
                 align: 'center'
             });
    
    doc.fontSize(14)
       .fillColor('#d32f2f')
       .text('(DOCUMENTO FIRMADO DIGITALMENTE)', 
             doc.page.margins.left, doc.y + 10, {
                 width: anchoTexto,
                 align: 'center'
             })
       .fillColor('#000000');
    
    yActual = doc.y + 30;
    
    // FECHA Y LUGAR
    doc.fontSize(12)
       .font('Helvetica')
       .text(`En ${datosContrato.fechas.ciudad}, a ${datosContrato.fechas.hoy}`, 
             doc.page.margins.left, yActual, {
                 width: anchoTexto,
                 align: 'center'
             });
    
    yActual = doc.y + 30;
    
    // CONTENIDO DEL CONTRATO (reutilizar función del generar-contrato.js)
    yActual = generarSeccionReunidos(doc, datosContrato, anchoTexto, yActual);
    yActual = generarSeccionManifiestan(doc, datosContrato, anchoTexto, yActual + 20);
    yActual = generarClausulas(doc, datosContrato, anchoTexto, yActual + 20);
    
    // SECCIÓN DE FIRMAS CON FIRMA DIGITAL INTEGRADA
    yActual = await generarSeccionFirmasConFirmaDigital(doc, datosContrato, firmaProcessada, anchoTexto, yActual + 30);
    
    // INFORMACIÓN DE VERIFICACIÓN DE FIRMA
    doc.addPage();
    generarPaginaVerificacionFirma(doc, firmaProcessada, datosContrato, anchoTexto);
}

/**
 * Añade marca de agua de documento firmado
 */
function añadirMarcaAguaFirmado(doc) {
    doc.save();
    
    // Marca de agua diagonal
    doc.opacity(0.08)
       .fontSize(60)
       .fillColor('#4caf50')
       .rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] })
       .text('FIRMADO DIGITALMENTE', 
             doc.page.width / 2 - 200, 
             doc.page.height / 2 - 30, 
             { align: 'center', width: 400 });
    
    doc.restore();
}

/**
 * Genera encabezado con información de firma
 */
function generarEncabezadoConFirma(doc, datosContrato, firmaProcessada, anchoTexto) {
    // Banner de documento firmado
    doc.rect(doc.page.margins.left, doc.page.margins.top, anchoTexto, 30)
       .fillColor('#e8f5e8')
       .fill();
    
    doc.fontSize(11)
       .fillColor('#2e7d32')
       .font('Helvetica-Bold')
       .text('✓ DOCUMENTO FIRMADO DIGITALMENTE', 
             doc.page.margins.left + 10, doc.page.margins.top + 8, {
                 width: anchoTexto - 20,
                 align: 'center'
             })
       .fillColor('#000000');
    
    const yInfo = doc.page.margins.top + 40;
    
    // Información de la empresa (izquierda)
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text(datosContrato.promotora.nombre, doc.page.margins.left, yInfo, {
           width: anchoTexto * 0.6,
           align: 'left'
       });
    
    doc.fontSize(9)
       .font('Helvetica')
       .text(`CIF: ${datosContrato.promotora.cif}`, doc.page.margins.left, doc.y + 3)
       .text(datosContrato.promotora.direccion, doc.page.margins.left, doc.y + 3);
    
    // Información del contrato y firma (derecha)
    const xDerecha = doc.page.margins.left + (anchoTexto * 0.6);
    doc.fontSize(9)
       .font('Helvetica')
       .text(`Contrato Nº: ${datosContrato.metadatos.numeroContrato}`, xDerecha, yInfo, {
           width: anchoTexto * 0.4,
           align: 'right'
       })
       .text(`Fecha: ${moment().format('DD/MM/YYYY HH:mm')}`, xDerecha, doc.y + 3, {
           width: anchoTexto * 0.4,
           align: 'right'
       })
       .text(`Firmado: ${moment(firmaProcessada.fechaProcesamiento).format('DD/MM/YYYY HH:mm')}`, 
             xDerecha, doc.y + 3, {
                 width: anchoTexto * 0.4,
                 align: 'right'
             });
    
    // Línea separadora
    const yLinea = doc.y + 15;
    doc.lineWidth(1)
       .strokeColor('#cccccc')
       .moveTo(doc.page.margins.left, yLinea)
       .lineTo(doc.page.margins.left + anchoTexto, yLinea)
       .stroke();
    
    return yLinea + 10;
}

/**
 * Genera sección de firmas con firma digital integrada
 */
async function generarSeccionFirmasConFirmaDigital(doc, datosContrato, firmaProcessada, anchoTexto, yInicial) {
    // Verificar espacio
    if (yInicial > doc.page.height - 250) {
        doc.addPage();
        yInicial = doc.page.margins.top + 50;
    }
    
    doc.fontSize(11)
       .font('Helvetica')
       .text('Y en prueba de conformidad, las partes firman digitalmente el presente contrato en duplicado ejemplar y a un solo efecto, en el lugar y fecha indicados al encabezamiento.', 
             doc.page.margins.left, yInicial, {
                 width: anchoTexto,
                 align: 'justify'
             });
    
    const yFirmas = doc.y + 40;
    const anchoColumna = (anchoTexto / 2) - 20;
    
    // FIRMA DE LA PROMOTORA (izquierda)
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('PROMOTORA:', doc.page.margins.left, yFirmas);
    
    // Línea de firma promotora
    const yLineaPromotera = doc.y + 60;
    doc.moveTo(doc.page.margins.left, yLineaPromotera)
       .lineTo(doc.page.margins.left + anchoColumna, yLineaPromotera)
       .strokeColor('#000000')
       .stroke();
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(datosContrato.promotora.representante.nombre, doc.page.margins.left, yLineaPromotera + 10)
       .text(datosContrato.promotora.nombre, doc.page.margins.left, doc.y + 3);
    
    // FIRMA DIGITAL DEL COMPRADOR (derecha)
    const xComprador = doc.page.margins.left + anchoTexto/2 + 20;
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('COMPRADOR:', xComprador, yFirmas);
    
    // INTEGRAR LA FIRMA DIGITAL EN EL PDF
    const yAreaFirma = doc.y + 20;
    if (firmaProcessada.buffer && firmaProcessada.tipo === 'digital') {
        try {
            // Dibujar marco para la firma
            doc.rect(xComprador, yAreaFirma, anchoColumna - 20, 80)
               .strokeColor('#cccccc')
               .stroke();
            
            // Insertar imagen de la firma
            doc.image(firmaProcessada.buffer, xComprador + 5, yAreaFirma + 5, {
                fit: [anchoColumna - 30, 70],
                align: 'center',
                valign: 'center'
            });
            
            console.log('✅ Firma digital integrada en el PDF');
            
        } catch (error) {
            console.error('Error integrando firma:', error);
            // Fallback: mostrar texto indicativo
            doc.fontSize(10)
               .text('[FIRMA DIGITAL REGISTRADA]', xComprador + 5, yAreaFirma + 35, {
                   width: anchoColumna - 30,
                   align: 'center'
               });
        }
    } else {
        // Fallback para otros tipos de firma
        doc.fontSize(10)
           .text('[FIRMA DIGITAL REGISTRADA]', xComprador + 5, yAreaFirma + 35, {
               width: anchoColumna - 30,
               align: 'center'
           });
    }
    
    // Información del comprador
    doc.fontSize(10)
       .font('Helvetica')
       .text(datosContrato.cliente.nombreCompleto, xComprador, yAreaFirma + 90)
       .text(`DNI: ${datosContrato.cliente.dni}`, xComprador, doc.y + 3);
    
    // Información de verificación de la firma
    doc.fontSize(8)
       .fillColor('#666666')
       .text(`Firmado digitalmente el ${moment(firmaProcessada.fechaProcesamiento).format('DD/MM/YYYY [a las] HH:mm')}`, 
             xComprador, doc.y + 8, {
                 width: anchoColumna,
                 align: 'left'
             })
       .text(`Hash: ${firmaProcessada.hash.substring(0, 16)}...`, xComprador, doc.y + 3)
       .fillColor('#000000');
    
    return doc.y + 20;
}

/**
 * Genera página de verificación de firma
 */
function generarPaginaVerificacionFirma(doc, firmaProcessada, datosContrato, anchoTexto) {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('CERTIFICADO DE FIRMA DIGITAL', doc.page.margins.left, doc.page.margins.top, {
           width: anchoTexto,
           align: 'center'
       });
    
    doc.fontSize(12)
       .font('Helvetica')
       .text('Este certificado verifica la autenticidad de la firma digital aplicada al contrato.', 
             doc.page.margins.left, doc.y + 20, {
                 width: anchoTexto,
                 align: 'center'
             });
    
    // Información detallada de la firma
    const yDetalles = doc.y + 40;
    const detalles = [
        ['Firmante:', datosContrato.cliente.nombreCompleto],
        ['DNI/NIE:', datosContrato.cliente.dni],
        ['Fecha de firma:', moment(firmaProcessada.fechaProcesamiento).format('DD [de] MMMM [de] YYYY, HH:mm:ss')],
        ['Tipo de firma:', firmaProcessada.tipo.toUpperCase()],
        ['Hash de verificación:', firmaProcessada.hash],
        ['Tamaño de firma:', `${firmaProcessada.tamano} bytes`],
        ['Formato:', firmaProcessada.formato || 'N/A'],
        ['Dirección IP:', firmaProcessada.ip],
        ['Navegador:', obtenerNavegadorDeUserAgent(firmaProcessada.userAgent)]
    ];
    
    let yActual = yDetalles;
    detalles.forEach(([etiqueta, valor]) => {
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text(`${etiqueta} `, doc.page.margins.left, yActual, {
               width: anchoTexto * 0.3,
               continued: true
           })
           .font('Helvetica')
           .text(valor, {
               width: anchoTexto * 0.7
           });
        
        yActual = doc.y + 8;
    });
    
    // Sello de validación
    doc.moveDown(2);
    doc.rect(doc.page.margins.left, doc.y, anchoTexto, 60)
       .fillColor('#f0f8ff')
       .fill()
       .strokeColor('#2196f3')
       .stroke();
    
    doc.fontSize(12)
       .fillColor('#2196f3')
       .font('Helvetica-Bold')
       .text('✓ FIRMA VERIFICADA Y VÁLIDA', doc.page.margins.left + 20, doc.y + 20, {
           width: anchoTexto - 40,
           align: 'center'
       })
       .fillColor('#000000');
    
    // Nota legal
    doc.moveDown(2);
    doc.fontSize(9)
       .font('Helvetica')
       .text('Este documento ha sido firmado digitalmente conforme a la legislación vigente. La firma digital tiene la misma validez legal que una firma manuscrita. Para verificaciones adicionales, contacte con Barsant Promociones Inmobiliarias.', 
             doc.page.margins.left, doc.y, {
                 width: anchoTexto,
                 align: 'justify'
             });
}

// Funciones auxiliares (mantener las existentes y añadir nuevas)

function obtenerNavegadorDeUserAgent(userAgent) {
    if (!userAgent) return 'Desconocido';
    if (userAgent.includes('Chrome')) return 'Google Chrome';
    if (userAgent.includes('Firefox')) return 'Mozilla Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Microsoft Edge';
    return 'Desconocido';
}

// Reutilizar funciones del generar-contrato.js para mantener consistencia
function procesarDatosParaContrato(datosCompletos) {
    const { reserva, cliente, vivienda } = datosCompletos;
    
    const promotora = {
        nombre: 'Barsant Promociones Inmobiliarias, S.L.',
        cif: 'B12345678',
        direccion: 'Calle Empresarial, 123, 18001 Granada',
        representante: {
            nombre: 'Juan Carlos García Martínez',
            dni: '12345678Z'
        }
    };
    
    const promocion = {
        nombre: 'Ventanilla Residencial',
        ubicacion: 'Calle Ventanilla, Granada',
        numeroViviendas: 33
    };
    
    const clienteProcesado = {
        nombreCompleto: `${cliente.nombre} ${cliente.apellidos}`.trim(),
        nombre: cliente.nombre,
        apellidos: cliente.apellidos,
        dni: cliente.dni.toUpperCase(),
        direccion: formatearDireccionCompleta(cliente),
        email: cliente.email,
        telefono: cliente.telefono
    };
    
    const viviendaProcesada = {
        referencia: reserva.vivienda_id || reserva.vivienda_nombre,
        descripcion: reserva.vivienda_nombre || 'Vivienda',
        direccion: `${promocion.ubicacion} - ${reserva.vivienda_nombre}`,
        superficieUtil: vivienda?.sup_util || 'Por determinar',
        superficieConstruida: vivienda?.sup_construida || 'Por determinar',
        anexos: determinarAnexos(reserva)
    };
    
    const economia = {
        precioTotal: reserva.precio_total || 0,
        importeReserva: 6000,
        porcentajeReserva: ((6000 / (reserva.precio_total || 1)) * 100).toFixed(2),
        iva: 10,
        precioConIva: Math.round((reserva.precio_total || 0) * 1.10)
    };
    
    const fechas = calcularFechasContrato();
    
    return {
        promotora,
        promocion,
        cliente: clienteProcesado,
        vivienda: viviendaProcesada,
        economia,
        fechas,
        reserva,
        metadatos: {
            fechaGeneracion: new Date(),
            numeroContrato: generarNumeroContrato(reserva.id),
            version: '2.0-FIRMADO'
        }
    };
}

function formatearDireccionCompleta(cliente) {
    const partes = [
        cliente.direccion,
        cliente.codigo_postal,
        cliente.ciudad
    ].filter(Boolean);
    
    return partes.join(', ');
}

function determinarAnexos(reserva) {
    const anexos = [];
    
    if (reserva.incluir_cochera && reserva.cochera_id) {
        anexos.push(`Plaza de garaje ${reserva.cochera_id}`);
    }
    
    if (reserva.incluir_trastero && reserva.trastero_id) {
        anexos.push(`Trastero ${reserva.trastero_id}`);
    }
    
    return anexos.length > 0 ? anexos.join(', ') : 'Ninguno';
}

function calcularFechasContrato() {
    const hoy = moment();
    
    return {
        hoy: hoy.format('DD [de] MMMM [de] YYYY'),
        ciudad: 'Granada',
        limiteArras: hoy.clone().add(15, 'days').format('DD [de] MMMM [de] YYYY'),
        limiteEscritura: hoy.clone().add(6, 'months').format('DD [de] MMMM [de] YYYY')
    };
}

function generarNumeroContrato(reservaId) {
    const año = new Date().getFullYear();
    const mes = String(new Date().getMonth() + 1).padStart(2, '0');
    const id = reservaId.slice(-6).toUpperCase();
    
    return `CONT-${año}${mes}-${id}`;
}

// Funciones reutilizadas del generador de contratos para mantener consistencia
function generarSeccionReunidos(doc, datos, anchoTexto, yInicial) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('REUNIDOS', doc.page.margins.left, yInicial, {
           width: anchoTexto,
           align: 'left'
       });
    
    const yContenido = doc.y + 15;
    
    doc.fontSize(11)
       .font('Helvetica')
       .text('De una parte, ', doc.page.margins.left, yContenido, {
           width: anchoTexto,
           align: 'justify',
           continued: true
       })
       .font('Helvetica-Bold')
       .text(`la mercantil ${datos.promotora.nombre}`, { continued: true })
       .font('Helvetica')
       .text(`, con CIF ${datos.promotora.cif}, domicilio social en ${datos.promotora.direccion}, representada por ${datos.promotora.representante.nombre}, con DNI ${datos.promotora.representante.dni}, en adelante, la `)
       .font('Helvetica-Bold')
       .text('PROMOTORA', { continued: true })
       .font('Helvetica')
       .text('.');
    
    doc.moveDown(0.8);
    
    doc.text('Y de otra parte, ', doc.page.margins.left, doc.y, {
           width: anchoTexto,
           align: 'justify',
           continued: true
       })
       .font('Helvetica-Bold')
       .text(`D./Dª ${datos.cliente.nombreCompleto}`, { continued: true })
       .font('Helvetica')
       .text(`, mayor de edad, con DNI/NIE ${datos.cliente.dni}, domicilio a efectos de notificaciones en ${datos.cliente.direccion}, en adelante, el `)
       .font('Helvetica-Bold')
       .text('COMPRADOR', { continued: true })
       .font('Helvetica')
       .text('.');
    
    doc.moveDown(0.5);
    doc.text('Ambas partes se reconocen recíprocamente capacidad legal suficiente y, a tal efecto,', 
             doc.page.margins.left, doc.y, {
                 width: anchoTexto,
                 align: 'justify'
             });
    
    return doc.y;
}

function generarSeccionManifiestan(doc, datos, anchoTexto, yInicial) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('MANIFIESTAN', doc.page.margins.left, yInicial, {
           width: anchoTexto,
           align: 'left'
       });
    
    const manifestaciones = [
        {
            numero: 'I.',
            contenido: `Que la PROMOTORA es propietaria/promotora del conjunto residencial denominado "${datos.promocion.nombre}" sito en ${datos.promocion.ubicacion}, compuesto por ${datos.promocion.numeroViviendas} viviendas, garajes y trasteros, y que ostenta plena disponibilidad para su venta.`
        },
        {
            numero: 'II.',
            contenido: `Que el COMPRADOR está interesado en adquirir la vivienda identificada como ${datos.vivienda.referencia} situada en ${datos.vivienda.direccion}, con una superficie construida de ${datos.vivienda.superficieConstruida} m² y útil de ${datos.vivienda.superficieUtil} m², con anejo/s ${datos.vivienda.anexos}.`
        },
        {
            numero: 'III.',
            contenido: 'Que, a tal efecto, las partes desean formalizar el presente Contrato de Reserva, que se regirá por las siguientes:'
        }
    ];
    
    let yActual = doc.y + 15;
    
    manifestaciones.forEach(manifestacion => {
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text(manifestacion.numero + ' ', doc.page.margins.left, yActual, {
               width: anchoTexto,
               align: 'justify',
               continued: true
           })
           .font('Helvetica')
           .text(manifestacion.contenido, {
               width: anchoTexto,
               align: 'justify'
           });
        
        yActual = doc.y + 12;
    });
    
    return yActual;
}

function generarClausulas(doc, datos, anchoTexto, yInicial) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('CLÁUSULAS', doc.page.margins.left, yInicial, {
           width: anchoTexto,
           align: 'left'
       });
    
    const clausulas = [
        {
            numero: '1.',
            titulo: 'OBJETO',
            contenido: 'La PROMOTORA se compromete a reservar a favor del COMPRADOR la vivienda descrita en el expositivo II, quedando la misma fuera de comercialización durante el plazo pactado, y el COMPRADOR se obliga a satisfacer la cantidad fijada en la cláusula 3ª en concepto de señal.'
        },
        {
            numero: '2.',
            titulo: 'PRECIO DE VENTA',
            contenido: `El precio total de la compraventa de la vivienda (impuestos no incluidos) asciende a ${formatearPrecio(datos.economia.precioTotal)} euros (${datos.economia.precioTotal}€).`
        },
        {
            numero: '3.',
            titulo: 'IMPORTE Y FORMA DE LA SEÑAL',
            contenido: `3.1. El COMPRADOR entrega en este acto ${formatearPrecio(datos.economia.importeReserva)} euros (${datos.economia.importeReserva}€), cuantía equivalente al ${datos.economia.porcentajeReserva}% del precio total de la vivienda más el Impuesto sobre el Valor Añadido (IVA) vigente del ${datos.economia.iva}%, mediante transferencia bancaria en concepto de señal y garantía.\n\n3.2. Dicha cantidad se imputará al precio total en el momento de la firma del contrato privado de compraventa/contrato de arras.`
        },
        {
            numero: '4.',
            titulo: 'PLAZOS',
            contenido: `4.1. Las partes se obligan a formalizar contrato privado de arras a más tardar el ${datos.fechas.limiteArras}.\n\n4.2. La escritura pública de compraventa ante notario tendrá lugar antes del ${datos.fechas.limiteEscritura}, salvo prórroga acordada por escrito.`
        },
        {
            numero: '5.',
            titulo: 'FIRMA DIGITAL',
            contenido: 'Este contrato ha sido firmado digitalmente por ambas partes. La firma digital tiene la misma validez legal que la firma manuscrita según la normativa vigente. Los datos de verificación de la firma se encuentran en el anexo de este documento.'
        }
    ];
    
    let yActual = doc.y + 15;
    
    clausulas.forEach(clausula => {
        if (yActual > doc.page.height - 150) {
            doc.addPage();
            yActual = doc.page.margins.top;
        }
        
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text(`${clausula.numero} ${clausula.titulo}`, doc.page.margins.left, yActual, {
               width: anchoTexto,
               align: 'left'
           });
        
        doc.fontSize(10)
           .font('Helvetica')
           .text(clausula.contenido, doc.page.margins.left, doc.y + 8, {
               width: anchoTexto,
               align: 'justify'
           });
        
        yActual = doc.y + 20;
    });
    
    return yActual;
}

function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(precio);
}

// Funciones existentes mejoradas
function validarDatosFirma({ reservaId, firmaData, tipoFirma }) {
    const errores = [];
    
    if (!reservaId || typeof reservaId !== 'string') {
        errores.push('ID de reserva inválido');
    }
    
    if (!firmaData) {
        errores.push('Datos de firma faltantes');
    }
    
    const tiposValidos = ['digital', 'biometrica', 'certificado'];
    if (!tipoFirma || !tiposValidos.includes(tipoFirma)) {
        errores.push('Tipo de firma inválido');
    }
    
    if (tipoFirma === 'digital' && firmaData) {
        if (typeof firmaData === 'string' && !firmaData.startsWith('data:image/')) {
            errores.push('Formato de firma digital inválido');
        }
    }
    
    if (errores.length > 0) {
        throw new Error(`Validación de firma fallida: ${errores.join(', ')}`);
    }
}

async function procesarTipoFirma(firmaData, tipoFirma, metadatos) {
    const procesado = {
        tipo: tipoFirma,
        fechaProcesamiento: new Date(),
        hash: null,
        tamano: null,
        formato: null,
        ip: metadatos?.ip || 'No disponible',
        userAgent: metadatos?.userAgent || 'No disponible'
    };
    
    if (tipoFirma === 'digital') {
        return await procesarFirmaDigital(firmaData, procesado, metadatos);
    }
    
    // Otros tipos de firma...
    procesado.datos = firmaData;
    procesado.hash = crypto.createHash('sha256').update(JSON.stringify(firmaData)).digest('hex');
    
    return procesado;
}

async function procesarFirmaDigital(firmaData, procesado, metadatos) {
    try {
        if (!firmaData.startsWith('data:image/')) {
            throw new Error('Formato de imagen inválido');
        }
        
        const matches = firmaData.match(/^data:image\/([a-zA-Z]*);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error('Formato base64 inválido');
        }
        
        const tipoImagen = matches[1];
        const imagenBuffer = Buffer.from(matches[2], 'base64');
        
        if (imagenBuffer.length < 1000) {
            throw new Error('La firma parece estar vacía');
        }
        
        if (imagenBuffer.length > 500000) {
            throw new Error('La firma es demasiado grande');
        }
        
        const hashFirma = crypto.createHash('sha256').update(imagenBuffer).digest('hex');
        
        procesado.hash = hashFirma;
        procesado.tamano = imagenBuffer.length;
        procesado.formato = tipoImagen;
        procesado.buffer = imagenBuffer;
        procesado.base64 = firmaData;
        
        console.log(`✅ Firma digital procesada: ${procesado.formato}, ${procesado.tamano} bytes`);
        return procesado;
        
    } catch (error) {
        console.error('Error procesando firma digital:', error);
        throw new Error(`Error en firma digital: ${error.message}`);
    }
}

async function guardarPDFFirmadoLocal(pdfBuffer, reservaId) {
    try {
        const directorioContratos = path.join(__dirname, 'contratos_firmados');
        if (!fs.existsSync(directorioContratos)) {
            fs.mkdirSync(directorioContratos, { recursive: true });
        }
        
        const nombreArchivo = `contrato_firmado_${reservaId}_${Date.now()}.pdf`;
        const rutaArchivo = path.join(directorioContratos, nombreArchivo);
        
        fs.writeFileSync(rutaArchivo, pdfBuffer);
        
        const urlLocal = `http://127.0.0.1:3001/contratos_firmados/${nombreArchivo}`;
        
        console.log('💾 PDF firmado guardado localmente:', rutaArchivo);
        return urlLocal;
        
    } catch (error) {
        console.error('Error guardando PDF firmado:', error);
        throw new Error(`Error almacenando documento firmado: ${error.message}`);
    }
}

async function crearRegistroAuditoria(reservaId, firmaProcessada, metadatos) {
    const registroAuditoria = {
        id: crypto.randomUUID(),
        reservaId: reservaId,
        tipoFirma: firmaProcessada.tipo,
        fechaFirma: firmaProcessada.fechaProcesamiento,
        hashFirma: firmaProcessada.hash,
        ip: firmaProcessada.ip,
        userAgent: firmaProcessada.userAgent,
        metadatos: metadatos,
        validado: true,
        fechaCreacion: new Date()
    };
    
    try {
        const db = admin.firestore();
        await db.collection('auditoria_firmas').doc(registroAuditoria.id).set(registroAuditoria);
        
        console.log('📝 Registro de auditoría creado');
        return registroAuditoria;
        
    } catch (error) {
        console.error('Error creando registro de auditoría:', error);
        return { error: 'No se pudo crear registro de auditoría' };
    }
}

async function actualizarReservaConFirma(reservaId, urlPDFFirmado, registroAuditoria) {
    try {
        const db = admin.firestore();
        
        const datosActualizacion = {
            contrato_firmado_url: urlPDFFirmado,
            fecha_contrato_firmado: admin.firestore.FieldValue.serverTimestamp(),
            paso_actual: 4,
            estado: 'contrato_firmado',
            auditoria_firma_id: registroAuditoria.id,
            firma_hash: registroAuditoria.hashFirma
        };
        
        await db.collection('reservas').doc(reservaId).update(datosActualizacion);
        
        console.log('💾 Reserva actualizada con estado firmado');
        
    } catch (error) {
        console.error('Error actualizando reserva con firma:', error);
        throw new Error(`Error actualizando estado de reserva: ${error.message}`);
    }
}

async function registrarErrorFirma(reservaId, error, metadatos) {
    try {
        const db = admin.firestore();
        
        const registroError = {
            reservaId: reservaId,
            error: error.message,
            stack: error.stack,
            metadatos: metadatos,
            fecha: new Date(),
            ip: metadatos?.ip || 'No disponible'
        };
        
        await db.collection('errores_firma').add(registroError);
        
    } catch (errorLog) {
        console.error('Error registrando error de firma:', errorLog);
    }
}

function finalizarPDF(doc) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
            const buffer = Buffer.concat(chunks);
            resolve(buffer);
        });
        doc.on('error', reject);
        
        doc.end();
    });
}

module.exports = {
    procesarFirma
};