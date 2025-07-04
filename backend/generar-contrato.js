// generar-contrato.js - Generador con layout completo corregido

const PDFDocument = require('pdfkit');
const moment = require('moment');

moment.locale('es');

/**
 * Función principal para generar un contrato en PDF con layout completo
 */
async function generarContratoPDF(datosCompletos) {
    try {
        console.log('📝 Iniciando generación de contrato PDF con layout completo...');
        
        validarDatosCompletos(datosCompletos);
        const datosContrato = procesarDatosParaContrato(datosCompletos);
        
        // Crear documento con márgenes optimizados
        const doc = new PDFDocument({
            size: 'A4',
            margins: {
                top: 40,
                bottom: 40,
                left: 50,
                right: 50
            },
            info: {
                Title: `Contrato de Reserva - ${datosContrato.cliente.nombreCompleto}`,
                Author: 'Barsant Promociones Inmobiliarias',
                Subject: 'Contrato de Reserva de Vivienda',
                Creator: 'Sistema de Gestión Barsant',
                Producer: 'Barsant Contract Generator v2.0'
            }
        });
        
        // Calcular ancho disponible una vez
        const anchoDisponible = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        
        // Generar contenido con ancho completo
        await generarContenidoContrato(doc, datosContrato, anchoDisponible);
        
        const pdfBuffer = await finalizarPDF(doc);
        
        console.log('✅ Contrato PDF generado exitosamente con layout completo');
        return pdfBuffer;
        
    } catch (error) {
        console.error('❌ Error generando contrato PDF:', error);
        throw new Error(`Error en generación de PDF: ${error.message}`);
    }
}

/**
 * Valida datos completos
 */
function validarDatosCompletos(datosCompletos) {
    const errores = [];
    
    if (!datosCompletos.reserva) {
        errores.push('Datos de reserva faltantes');
    } else {
        if (!datosCompletos.reserva.precio_total) errores.push('Precio total faltante');
        if (!datosCompletos.reserva.vivienda_nombre) errores.push('Nombre de vivienda faltante');
    }
    
    if (!datosCompletos.cliente) {
        errores.push('Datos de cliente faltantes');
    } else {
        if (!datosCompletos.cliente.nombre) errores.push('Nombre del cliente faltante');
        if (!datosCompletos.cliente.apellidos) errores.push('Apellidos del cliente faltantes');
        if (!datosCompletos.cliente.dni) errores.push('DNI del cliente faltante');
        if (!datosCompletos.cliente.direccion) errores.push('Dirección del cliente faltante');
    }
    
    if (errores.length > 0) {
        throw new Error(`Datos incompletos para generar contrato: ${errores.join(', ')}`);
    }
}

/**
 * Procesa datos para el contrato
 */
function procesarDatosParaContrato(datosCompletos) {
    const { reserva, cliente, vivienda } = datosCompletos;
    
    const promotora = {
        nombre: 'Barsant Promociones Inmobiliarias, S.L.',
        cif: 'B12345678',
        direccion: 'Calle Empresarial, 123, 18001 Granada',
        representante: {
            nombre: 'Juan Carlos García Martínez',
            dni: '12345678Z'
        },
        emailDPD: 'protecciondatos@barsant.com'
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
        anexos: determinarAnexos(reserva),
        refCatastral: 'Por asignar',
        numeroVivienda: extraerNumeroVivienda(reserva.vivienda_nombre),
        planta: extraerPlanta(reserva.vivienda_nombre),
        puerta: extraerPuerta(reserva.vivienda_nombre)
    };
    
    const economia = {
        precioTotal: reserva.precio_total || 0,
        importeReserva: 6000,
        porcentajeReserva: 2,
        iva: 10,
        precioConIva: Math.round((reserva.precio_total || 0) * 1.10),
        formaPago: 'transferencia bancaria',
        referenciaPago: 'Por confirmar'
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
            version: '2.0'
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

function extraerNumeroVivienda(nombreVivienda) {
    if (!nombreVivienda) return 'N/A';
    const match = nombreVivienda.match(/Bloque ([A-Z])/);
    return match ? match[1] : 'N/A';
}

function extraerPlanta(nombreVivienda) {
    if (!nombreVivienda) return 'N/A';
    const match = nombreVivienda.match(/(Primero|Segundo|Tercero|Cuarto)/);
    return match ? match[1] : 'N/A';
}

function extraerPuerta(nombreVivienda) {
    if (!nombreVivienda) return 'N/A';
    const match = nombreVivienda.match(/- ([A-Z])$/);
    return match ? match[1] : 'N/A';
}

function calcularFechasContrato() {
    const hoy = moment();
    return {
        hoy: hoy.format('DD [de] MMMM [de] YYYY'),
        ciudad: 'Granada',
        limiteArras: moment().add(15, 'days').format('DD [de] MMMM [de] YYYY'),
        limiteEscritura: moment().add(6, 'months').format('DD [de] MMMM [de] YYYY'),
        fechaDIA: moment().format('DD/MM/YYYY')
    };
}

function generarNumeroContrato(reservaId) {
    const año = new Date().getFullYear();
    const mes = String(new Date().getMonth() + 1).padStart(2, '0');
    const id = reservaId.slice(-6).toUpperCase();
    return `CONT-${año}${mes}-${id}`;
}

/**
 * Genera el contenido completo del contrato con ancho completo
 */
async function generarContenidoContrato(doc, datos, anchoDisponible) {
    // Encabezado
    generarEncabezado(doc, datos, anchoDisponible);
    
    // Título principal - CENTRADO
    doc.moveDown(2);
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text('CONTRATO PRIVADO DE RESERVA DE VIVIENDA', 
             doc.page.margins.left, 
             doc.y, 
             { width: anchoDisponible, align: 'center' });
    
    doc.moveDown(1);
    doc.fontSize(12)
       .font('Helvetica')
       .text(`En ${datos.fechas.ciudad}, a ${datos.fechas.hoy}`, 
             doc.page.margins.left, 
             doc.y, 
             { width: anchoDisponible, align: 'center' });
    
    // Secciones principales
    doc.moveDown(2);
    generarSeccionReunidos(doc, datos, anchoDisponible);
    
    doc.moveDown(1.5);
    generarSeccionManifiestan(doc, datos, anchoDisponible);
    
    doc.moveDown(1.5);
    generarClausulasCompletas(doc, datos, anchoDisponible);
    
    doc.moveDown(2);
    generarSeccionFirmas(doc, datos, anchoDisponible);
    
    // Nueva página para anexos
    doc.addPage();
    generarAnexosCompletos(doc, datos, anchoDisponible);
}

/**
 * Genera encabezado con ancho completo
 */
function generarEncabezado(doc, datos, anchoDisponible) {
    // Información empresa - izquierda
    doc.fontSize(10)
       .font('Helvetica')
       .text(datos.promotora.nombre, doc.page.margins.left, 50, { width: anchoDisponible * 0.6 })
       .text(`CIF: ${datos.promotora.cif}`, { width: anchoDisponible * 0.6 })
       .text(datos.promotora.direccion, { width: anchoDisponible * 0.6 });
    
    // Información contrato - derecha
    const xDerecha = doc.page.margins.left + (anchoDisponible * 0.6);
    doc.fontSize(8)
       .text(`Contrato Nº: ${datos.metadatos.numeroContrato}`, xDerecha, 50, 
             { width: anchoDisponible * 0.4, align: 'right' })
       .text(`Fecha: ${moment(datos.metadatos.fechaGeneracion).format('DD/MM/YYYY HH:mm')}`, 
             xDerecha, doc.y, 
             { width: anchoDisponible * 0.4, align: 'right' });
}

/**
 * Genera sección REUNIDOS con ancho completo
 */
function generarSeccionReunidos(doc, datos, anchoDisponible) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('REUNIDOS', doc.page.margins.left, doc.y, { width: anchoDisponible });
    
    doc.moveDown(0.5);
    doc.fontSize(11)
       .font('Helvetica');
    
    // Párrafo promotora - justificado, ancho completo
    const textoPromotora = `De una parte, la mercantil ${datos.promotora.nombre}, con CIF ${datos.promotora.cif}, domicilio social en ${datos.promotora.direccion}, representada por ${datos.promotora.representante.nombre}, con DNI ${datos.promotora.representante.dni}, en adelante, la PROMOTORA.`;
    
    doc.text(textoPromotora, 
             doc.page.margins.left, 
             doc.y, 
             { width: anchoDisponible, align: 'justify' });
    
    doc.moveDown(0.5);
    
    // Párrafo comprador - justificado, ancho completo
    const textoComprador = `Y de otra parte, D./Dª ${datos.cliente.nombreCompleto}, mayor de edad, con DNI/NIE ${datos.cliente.dni}, domicilio a efectos de notificaciones en ${datos.cliente.direccion}, en adelante, el COMPRADOR.`;
    
    doc.text(textoComprador, 
             doc.page.margins.left, 
             doc.y, 
             { width: anchoDisponible, align: 'justify' });
    
    doc.moveDown(0.5);
    doc.text('Ambas partes se reconocen recíprocamente capacidad legal suficiente y, a tal efecto,', 
             doc.page.margins.left, 
             doc.y, 
             { width: anchoDisponible, align: 'justify' });
}

/**
 * Genera sección MANIFIESTAN con ancho completo
 */
function generarSeccionManifiestan(doc, datos, anchoDisponible) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('MANIFIESTAN', doc.page.margins.left, doc.y, { width: anchoDisponible });
    
    doc.moveDown(0.5);
    doc.fontSize(11)
       .font('Helvetica');
    
    // Punto I - justificado, ancho completo
    const puntoI = `I. Que la PROMOTORA es propietaria/promotora del conjunto residencial denominado "${datos.promocion.nombre}" sito en ${datos.promocion.ubicacion}, compuesto por ${datos.promocion.numeroViviendas} viviendas, garajes y trasteros, y que ostenta plena disponibilidad para su venta.`;
    
    doc.text(puntoI, 
             doc.page.margins.left, 
             doc.y, 
             { width: anchoDisponible, align: 'justify' });
    
    doc.moveDown(0.5);
    
    // Punto II - justificado, ancho completo
    const puntoII = `II. Que el COMPRADOR está interesado en adquirir la vivienda identificada como ${datos.vivienda.referencia} situada en ${datos.vivienda.direccion}, con una superficie construida de ${datos.vivienda.superficieConstruida} m² y útil de ${datos.vivienda.superficieUtil} m², con anejo/s ${datos.vivienda.anexos}.`;
    
    doc.text(puntoII, 
             doc.page.margins.left, 
             doc.y, 
             { width: anchoDisponible, align: 'justify' });
    
    doc.moveDown(0.5);
    
    // Punto III - justificado, ancho completo
    const puntoIII = `III. Que, a tal efecto, las partes desean formalizar el presente Contrato de Reserva, que se regirá por las siguientes:`;
    
    doc.text(puntoIII, 
             doc.page.margins.left, 
             doc.y, 
             { width: anchoDisponible, align: 'justify' });
}

/**
 * Genera cláusulas completas con ancho completo
 */
function generarClausulasCompletas(doc, datos, anchoDisponible) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('CLÁUSULAS', doc.page.margins.left, doc.y, { width: anchoDisponible, align: 'center' });
    
    const clausulas = [
        {
            numero: '1.',
            titulo: 'Objeto',
            contenido: 'La PROMOTORA se compromete a reservar a favor del COMPRADOR la vivienda descrita en el expositivo II, quedando la misma fuera de comercialización durante el plazo pactado, y el COMPRADOR se obliga a satisfacer la cantidad fijada en la cláusula 3ª en concepto de señal.'
        },
        {
            numero: '2.',
            titulo: 'Precio de venta',
            contenido: `El precio total de la compraventa de la vivienda (impuestos no incluidos) asciende a ${formatearPrecio(datos.economia.precioTotal)} €.`
        },
        {
            numero: '3.',
            titulo: 'Importe y forma de la señal',
            contenido: `3.1. El COMPRADOR entrega en este acto ${formatearPrecio(datos.economia.importeReserva)} €, cuantía equivalente al 2 % del precio total de la vivienda más el Impuesto sobre el Valor Añadido (IVA) vigente del 10 %, mediante ${datos.economia.formaPago} (referencia de transacción ${datos.economia.referenciaPago}) en concepto de señal y garantía.\n3.2. Dicha cantidad se imputará al precio total en el momento de la firma del contrato privado de compraventa/contrato de arras.`
        },
        {
            numero: '4.',
            titulo: 'Plazos',
            contenido: `4.1. Las partes se obligan a formalizar contrato privado de arras a más tardar el ${datos.fechas.limiteArras}.\n4.2. La escritura pública de compraventa ante notario tendrá lugar antes del ${datos.fechas.limiteEscritura}, salvo prórroga acordada por escrito.`
        },
        {
            numero: '5.',
            titulo: 'Documentación entregada',
            contenido: 'La PROMOTORA hace entrega en este acto al COMPRADOR de:\n• Documento Informativo Abreviado (D.I.A.) actualizado.\n• Plano/s de la vivienda y anejos.\n• Memoria de calidades.\nEl COMPRADOR declara haberlos recibido, comprendido y aceptado.'
        },
        {
            numero: '6.',
            titulo: 'Desistimiento y penalizaciones',
            contenido: '6.1. Si el COMPRADOR desiste sin causa justificada, perderá la señal entregada.\n6.2. Si la PROMOTORA incumple su obligación de vender la vivienda reservada, devolverá al COMPRADOR el doble de la señal, de conformidad con el art. 1454 del Código Civil.'
        },
        {
            numero: '7.',
            titulo: 'Gastos e impuestos',
            contenido: 'Serán de cuenta del COMPRADOR los impuestos (IVA/ITP), gastos de notaría, registro y gestoría de la compraventa. La PROMOTORA asumirá los gastos de cancelación de cargas existentes y plusvalía municipal.'
        },
        {
            numero: '8.',
            titulo: 'Protección de datos',
            contenido: `En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018, los datos facilitados se incorporan a un fichero titularidad de la PROMOTORA con la finalidad de gestionar la relación contractual. El COMPRADOR podrá ejercitar sus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad mediante escrito a ${datos.promotora.emailDPD}.`
        },
        {
            numero: '9.',
            titulo: 'Legislación aplicable y fuero',
            contenido: `El presente contrato se regirá por la legislación española. Para cualquier divergencia, las partes se someten a los Juzgados y Tribunales de ${datos.fechas.ciudad}, renunciando a su propio fuero si fuera distinto.`
        },
        {
            numero: '10.',
            titulo: 'Integridad del contrato',
            contenido: 'Cualquier modificación deberá realizarse por escrito y firmada por ambas partes.'
        }
    ];
    
    clausulas.forEach(clausula => {
        doc.moveDown(0.8);
        
        // Título de cláusula - negrita
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text(`${clausula.numero} ${clausula.titulo}`, 
                 doc.page.margins.left, 
                 doc.y, 
                 { width: anchoDisponible });
        
        doc.moveDown(0.3);
        
        // Contenido - justificado, ancho completo
        doc.font('Helvetica')
           .text(clausula.contenido, 
                 doc.page.margins.left, 
                 doc.y, 
                 { width: anchoDisponible, align: 'justify' });
    });
}

/**
 * Genera sección de firmas con ancho completo
 */
function generarSeccionFirmas(doc, datos, anchoDisponible) {
    doc.moveDown(2);
    
    // Texto previo a firmas - justificado, ancho completo
    doc.fontSize(11)
       .font('Helvetica')
       .text('Y en prueba de conformidad, firman electrónicamente el presente contrato en duplicado ejemplar y a un solo efecto, en el lugar y fecha indicados al encabezamiento.', 
             doc.page.margins.left, 
             doc.y, 
             { width: anchoDisponible, align: 'justify' });
    
    doc.moveDown(3);
    
    // Título firmas - centrado
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('FIRMAS ELECTRÓNICAS', 
             doc.page.margins.left, 
             doc.y, 
             { width: anchoDisponible, align: 'center' });
    
    doc.moveDown(2);
    
    // Espacios para firmas - distribuidos por igual
    const mitadAncho = anchoDisponible / 2;
    const yFirma = doc.y;
    
    // Firma promotora - mitad izquierda
    doc.fontSize(11)
       .font('Helvetica')
       .text('PROMOTORA:', doc.page.margins.left, yFirma, { width: mitadAncho })
       .moveDown(2)
       .text('_'.repeat(30), doc.page.margins.left, doc.y, { width: mitadAncho })
       .moveDown(0.5)
       .fontSize(9)
       .text(datos.promotora.representante.nombre, doc.page.margins.left, doc.y, { width: mitadAncho })
       .text(datos.promotora.nombre, doc.page.margins.left, doc.y, { width: mitadAncho });
    
    // Firma comprador - mitad derecha
    const xDerecha = doc.page.margins.left + mitadAncho;
    doc.fontSize(11)
       .text('COMPRADOR:', xDerecha, yFirma, { width: mitadAncho })
       .moveDown(2)
       .text('_'.repeat(30), xDerecha, yFirma + 30, { width: mitadAncho })
       .moveDown(0.5)
       .fontSize(9)
       .text(datos.cliente.nombreCompleto, xDerecha, yFirma + 60, { width: mitadAncho })
       .text(`DNI: ${datos.cliente.dni}`, xDerecha, yFirma + 75, { width: mitadAncho });
}

/**
 * Genera anexos completos con ancho completo
 */
function generarAnexosCompletos(doc, datos, anchoDisponible) {
    // ANEXO I
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('ANEXO I – DATOS IDENTIFICATIVOS DE LA VIVIENDA', 
             doc.page.margins.left, 
             doc.y, 
             { width: anchoDisponible, align: 'center' });
    
    doc.moveDown(1);
    doc.fontSize(11)
       .font('Helvetica');
    
    const datosVivienda = [
        ['Referencia catastral:', datos.vivienda.refCatastral],
        ['Vivienda nº:', datos.vivienda.numeroVivienda],
        ['Planta:', datos.vivienda.planta],
        ['Puerta:', datos.vivienda.puerta],
        ['Superficie construida:', `${datos.vivienda.superficieConstruida} m²`],
        ['Superficie útil:', `${datos.vivienda.superficieUtil} m²`],
        ['Anexos:', datos.vivienda.anexos]
    ];
    
    datosVivienda.forEach(([etiqueta, valor]) => {
        const textoLinea = `• ${etiqueta} ${valor}`;
        doc.text(textoLinea, 
                 doc.page.margins.left, 
                 doc.y, 
                 { width: anchoDisponible })
           .moveDown(0.3);
    });
    
    // ANEXO II
    doc.moveDown(2);
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('ANEXO II – DOCUMENTACIÓN ENTREGADA', 
             doc.page.margins.left, 
             doc.y, 
             { width: anchoDisponible, align: 'center' });
    
    doc.moveDown(1);
    doc.fontSize(11)
       .font('Helvetica');
    
    const documentacion = [
        `Documento Informativo Abreviado – última actualización ${datos.fechas.fechaDIA}`,
        'Plano de vivienda firmado',
        'Plano de ubicación en el conjunto residencial',
        'Memoria de calidades'
    ];
    
    documentacion.forEach((doc_item, index) => {
        doc.text(`${index + 1}. ${doc_item}`, 
                 doc.page.margins.left, 
                 doc.y, 
                 { width: anchoDisponible })
           .moveDown(0.3);
    });
    
    doc.moveDown(1);
    doc.text('Fin del documento.', 
             doc.page.margins.left, 
             doc.y, 
             { width: anchoDisponible, align: 'center' });
}

/**
 * Finaliza el PDF y lo convierte en buffer
 */
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

/**
 * Función auxiliar para formatear precios
 */
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(precio);
}

module.exports = {
    generarContratoPDF
};