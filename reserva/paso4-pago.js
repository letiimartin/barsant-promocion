// paso4-pago.js - Script para el paso 4: Pago

// Importar servicios de Firebase
import { actualizarProgresoReserva, actualizarReserva } from './firebase-client-service.js';

let configuracionCompleta = null;
let archivoSubido = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 Inicializando Paso 4: Pago');
    
    cargarDatosCompletos();
    mostrarResumenPago();
    configurarEventListeners();
    configurarUploadArchivo();
    configurarFormularioTarjeta();
});

/**
 * Carga todos los datos de los pasos anteriores
 */
function cargarDatosCompletos() {
    try {
        configuracionCompleta = JSON.parse(sessionStorage.getItem('reserva_configuracion'));
        
        if (!configuracionCompleta || !configuracionCompleta.datos_confirmados || !configuracionCompleta.reserva_id) {
            console.error('Datos no confirmados o reserva no encontrada. Redirigiendo...');
            window.location.href = 'index.html';
            return;
        }
        
        console.log('Configuración completa cargada:', configuracionCompleta);
        
    } catch (error) {
        console.error('Error cargando configuración:', error);
        window.location.href = 'index.html';
    }
}

/**
 * Muestra el resumen del pago
 */
function mostrarResumenPago() {
    const { vivienda_nombre, precio_total, datos_personales } = configuracionCompleta;
    
    // Resumen de vivienda
    document.getElementById('vivienda-resumen').textContent = vivienda_nombre || 'Vivienda no especificada';
    
    // Cliente
    const nombreCompleto = `${datos_personales.nombre || ''} ${datos_personales.apellidos || ''}`.trim();
    document.getElementById('cliente-resumen').textContent = nombreCompleto;
    
    // Precio total
    document.getElementById('precio-total-vivienda').textContent = formatearPrecio(precio_total || 0);
    
    // Actualizar concepto de transferencia
    const concepto = `Reserva ${vivienda_nombre} - ${nombreCompleto}`;
    document.getElementById('transfer-concept').textContent = concepto;
    document.getElementById('copy-concept').setAttribute('data-copy', concepto);
}

/**
 * Configura los event listeners principales
 */
function configurarEventListeners() {
    // Botón volver
    document.getElementById('btn-volver').addEventListener('click', function() {
        window.location.href = 'paso35-contrato.html';
    });

    // Métodos de pago
    const metodoPago = document.getElementsByName('payment-method');
    metodoPago.forEach(radio => {
        radio.addEventListener('change', function() {
            cambiarMetodoPago(this.value);
        });
    });

    // Botones de copiar
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const texto = this.getAttribute('data-copy');
            copiarAlPortapapeles(texto);
        });
    });

    // Botón finalizar
    document.getElementById('btn-finalizar').addEventListener('click', function() {
        finalizarReserva();
    });

    // Modal de éxito
    document.getElementById('btn-ir-inicio').addEventListener('click', function() {
        window.location.href = '../index.html';
    });

    // Validar estado inicial
    validarEstadoFormulario();
}

/**
 * Cambia entre métodos de pago
 */
function cambiarMetodoPago(metodo) {
    const transferForm = document.getElementById('transfer-form');
    const cardForm = document.getElementById('card-form');
    
    if (metodo === 'transfer') {
        transferForm.style.display = 'block';
        cardForm.style.display = 'none';
    } else {
        transferForm.style.display = 'none';
        cardForm.style.display = 'block';
    }
    
    validarEstadoFormulario();
}

/**
 * Configura la funcionalidad de upload de archivos
 */
function configurarUploadArchivo() {
    const uploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('file-input');
    const filePreview = document.getElementById('file-preview');
    const fileName = document.getElementById('file-name');
    const removeFile = document.getElementById('remove-file');

    // Click en área de upload
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            procesarArchivo(files[0]);
        }
    });

    // Selección de archivo
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            procesarArchivo(this.files[0]);
        }
    });

    // Remover archivo
    removeFile.addEventListener('click', function(e) {
        e.stopPropagation();
        removerArchivo();
    });
}

/**
 * Procesa el archivo subido
 */
function procesarArchivo(archivo) {
    // Validar tipo
    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!tiposPermitidos.includes(archivo.type)) {
        mostrarNotificacion('Tipo de archivo no permitido. Use PDF, JPG o PNG.', 'error');
        return;
    }

    // Validar tamaño (5MB)
    const tamañoMaximo = 5 * 1024 * 1024;
    if (archivo.size > tamañoMaximo) {
        mostrarNotificacion('El archivo es demasiado grande. Máximo 5MB.', 'error');
        return;
    }

    // Mostrar preview
    archivoSubido = archivo;
    document.getElementById('file-name').textContent = archivo.name;
    document.querySelector('.upload-content').style.display = 'none';
    document.getElementById('file-preview').style.display = 'flex';
    
    validarEstadoFormulario();
    mostrarNotificacion('Archivo subido correctamente', 'success');
}

/**
 * Remueve el archivo subido
 */
function removerArchivo() {
    archivoSubido = null;
    document.getElementById('file-input').value = '';
    document.querySelector('.upload-content').style.display = 'flex';
    document.getElementById('file-preview').style.display = 'none';
    
    validarEstadoFormulario();
}

/**
 * Configura el formulario de tarjeta
 */
function configurarFormularioTarjeta() {
    const cardNumber = document.getElementById('card-number');
    const cardExpiry = document.getElementById('card-expiry');
    const cardCvv = document.getElementById('card-cvv');
    const cardName = document.getElementById('card-name');

    // Formatear número de tarjeta
    cardNumber.addEventListener('input', function() {
        let valor = this.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let valorFormateado = valor.match(/.{1,4}/g)?.join(' ') || '';
        this.value = valorFormateado;
        validarEstadoFormulario();
    });

    // Formatear fecha de caducidad
    cardExpiry.addEventListener('input', function() {
        let valor = this.value.replace(/\D/g, '');
        if (valor.length >= 2) {
            valor = valor.substring(0, 2) + '/' + valor.substring(2, 4);
        }
        this.value = valor;
        validarEstadoFormulario();
    });

    // Validar CVV
    cardCvv.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        validarEstadoFormulario();
    });

    // Validar nombre
    cardName.addEventListener('input', function() {
        validarEstadoFormulario();
    });
}

/**
 * Valida el estado del formulario y habilita/deshabilita el botón
 */
function validarEstadoFormulario() {
    const metodoSeleccionado = document.querySelector('input[name="payment-method"]:checked').value;
    const btnFinalizar = document.getElementById('btn-finalizar');
    let esValido = false;

    if (metodoSeleccionado === 'transfer') {
        // Para transferencia, necesita archivo subido
        esValido = archivoSubido !== null;
    } else {
        // Para tarjeta, validar campos
        const cardNumber = document.getElementById('card-number').value;
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCvv = document.getElementById('card-cvv').value;
        const cardName = document.getElementById('card-name').value;

        esValido = cardNumber.length >= 19 && 
                  cardExpiry.length === 5 && 
                  cardCvv.length === 3 && 
                  cardName.trim().length > 0;
    }

    btnFinalizar.disabled = !esValido;
    if (esValido) {
        btnFinalizar.classList.remove('disabled');
    } else {
        btnFinalizar.classList.add('disabled');
    }
}

/**
 * Finaliza la reserva
 */
async function finalizarReserva() {
    const metodoSeleccionado = document.querySelector('input[name="payment-method"]:checked').value;
    
    try {
        // Mostrar loading
        const btnFinalizar = document.getElementById('btn-finalizar');
        const textoOriginal = btnFinalizar.innerHTML;
        btnFinalizar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        btnFinalizar.disabled = true;

        // Actualizar estado en Firebase
        console.log('Finalizando reserva en Firebase...');
        
        const datosFinalizacion = {
            estado: metodoSeleccionado === 'transfer' ? 'pendiente_confirmacion_pago' : 'pagada',
            metodo_pago: metodoSeleccionado,
            fecha_pago_solicitado: new Date().toISOString(),
            importe_pagado: 6000
        };

        if (metodoSeleccionado === 'transfer' && archivoSubido) {
            datosFinalizacion.archivo_justificante_nombre = archivoSubido.name;
            datosFinalizacion.archivo_justificante_size = archivoSubido.size;
            datosFinalizacion.archivo_justificante_type = archivoSubido.type;
            // En un entorno real, aquí subirías el archivo a Firebase Storage
        }

        // Actualizar progreso y estado de la reserva
        await actualizarProgresoReserva(configuracionCompleta.reserva_id, 4, datosFinalizacion);

        // Simular procesamiento adicional
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Guardar estado final en sessionStorage
        configuracionCompleta.paso_completado = 4;
        configuracionCompleta.fecha_finalizacion = new Date().toISOString();
        configuracionCompleta.metodo_pago = metodoSeleccionado;
        configuracionCompleta.estado = 'reserva_completada';
        configuracionCompleta.reserva_finalizada = true;

        if (metodoSeleccionado === 'transfer') {
            configuracionCompleta.archivo_justificante = archivoSubido.name;
        }

        sessionStorage.setItem('reserva_configuracion', JSON.stringify(configuracionCompleta));

        console.log('Reserva finalizada exitosamente en Firebase');

        // Mostrar modal de éxito
        document.getElementById('success-modal').style.display = 'flex';

        // Limpiar datos sensibles después de un tiempo
        setTimeout(() => {
            // Mantener solo información básica para futuras referencias
            const datosBasicos = {
                reserva_id: configuracionCompleta.reserva_id,
                cliente_id: configuracionCompleta.cliente_id,
                vivienda_nombre: configuracionCompleta.vivienda_nombre,
                estado: 'completada'
            };
            sessionStorage.setItem('ultima_reserva', JSON.stringify(datosBasicos));
            sessionStorage.removeItem('reserva_configuracion');
        }, 10000);

    } catch (error) {
        console.error('Error finalizando reserva:', error);
        
        // Mostrar error específico
        let mensajeError = 'Error al procesar la reserva. ';
        if (error.message.includes('Firebase')) {
            mensajeError += 'Problema de conexión con la base de datos.';
        } else if (error.message.includes('archivo')) {
            mensajeError += 'Problema con el archivo subido.';
        } else {
            mensajeError += 'Inténtelo de nuevo.';
        }
        
        mostrarNotificacion(mensajeError, 'error');
        
        // Restaurar botón
        btnFinalizar.innerHTML = textoOriginal;
        btnFinalizar.disabled = false;
    }
}

/**
 * Simula el envío de la reserva al servidor
 */
async function simularEnvioReserva(metodoPago) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simular éxito (95% de las veces)
            if (Math.random() > 0.05) {
                console.log('Reserva enviada correctamente:', {
                    configuracion: configuracionCompleta,
                    metodo_pago: metodoPago,
                    archivo: archivoSubido?.name
                });
                resolve();
            } else {
                reject(new Error('Error simulado del servidor'));
            }
        }, 2000);
    });
}

// ================================
// FUNCIONES DE UTILIDAD
// ================================

function formatearPrecio(precio) {
    return `€${precio.toLocaleString('es-ES')}`;
}

function copiarAlPortapapeles(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        mostrarNotificacion('Copiado al portapapeles', 'success');
    }).catch(() => {
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = texto;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        mostrarNotificacion('Copiado al portapapeles', 'success');
    });
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notification ${tipo}`;
    notificacion.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${mensaje}</span>
    `;
    
    // Añadir al DOM
    document.body.appendChild(notificacion);
    
    // Mostrar con animación
    setTimeout(() => notificacion.classList.add('show'), 100);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}