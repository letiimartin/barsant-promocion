// paso35-contrato-fixed.js - Controlador corregido para la firma digital de contratos

// ================================
// IMPORTACIONES Y CONFIGURACIÓN
// ================================
import { actualizarProgresoReserva } from './firebase-client-service.js';

// Variables globales
let configuracionReserva = null;
let contratoGenerado = false;
let firmaCapturada = false;
let datosFirma = null;
let contratoFirmadoUrl = null;
let canvas = null;
let contexto = null;
let firmando = false;

// Configuración del backend
const BACKEND_URL = 'http://127.0.0.1:3001';

// ================================
// INICIALIZACIÓN
// ================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 Inicializando paso 35: Contrato y Firma');
    
    try {
        cargarConfiguracion();
        inicializarCanvas();
        configurarEventListeners();
        
        // Iniciar proceso de generación de contrato
        generarContrato();
        
    } catch (error) {
        console.error('❌ Error en inicialización:', error);
        mostrarError('Error inicializando la página');
    }
});

/**
 * Carga la configuración de la reserva
 */
function cargarConfiguracion() {
    try {
        configuracionReserva = JSON.parse(sessionStorage.getItem('reserva_configuracion'));
        
        if (!configuracionReserva || !configuracionReserva.datos_confirmados || !configuracionReserva.reserva_id) {
            throw new Error('Configuración de reserva incompleta');
        }
        
        // Actualizar información en la interfaz
        const titleElement = document.getElementById('contract-title');
        if (titleElement) {
            titleElement.textContent = `Contrato de Reserva - ${configuracionReserva.vivienda_nombre || 'Vivienda'}`;
        }
        
        console.log('✅ Configuración cargada correctamente');
        
    } catch (error) {
        console.error('❌ Error cargando configuración:', error);
        mostrarError('No se pueden cargar los datos de la reserva. Redirigiendo...');
        setTimeout(() => {
            window.location.href = 'paso3-confirmacion.html';
        }, 3000);
        throw error;
    }
}

/**
 * Inicializa el canvas para la firma
 */
function inicializarCanvas() {
    canvas = document.getElementById('signature-canvas');
    if (!canvas) {
        console.error('❌ Canvas de firma no encontrado');
        return;
    }
    
    contexto = canvas.getContext('2d');
    
    // Configurar canvas para alta resolución
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    contexto.scale(dpr, dpr);
    
    // Configurar estilo del canvas
    contexto.fillStyle = 'white';
    contexto.fillRect(0, 0, rect.width, rect.height);
    contexto.strokeStyle = '#000000';
    contexto.lineWidth = 2;
    contexto.lineCap = 'round';
    contexto.lineJoin = 'round';
    
    // Configurar eventos del canvas
    configurarEventosCanvas();
    
    console.log('🎨 Canvas inicializado correctamente');
}

/**
 * Configura los event listeners
 */
function configurarEventListeners() {
    // Navegación
    const btnVolver = document.getElementById('btn-volver');
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            window.location.href = 'paso3-confirmacion.html';
        });
    }
    
    // Acciones del contrato
    const btnPantallaCompleta = document.getElementById('btn-fullscreen');
    if (btnPantallaCompleta) {
        btnPantallaCompleta.addEventListener('click', abrirPantallaCompleta);
    }
    
    const btnImprimir = document.getElementById('btn-print');
    if (btnImprimir) {
        btnImprimir.addEventListener('click', imprimirContrato);
    }
    
    // Controles de firma
    const btnLimpiar = document.getElementById('btn-clear-signature');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFirma);
    }
    
    const btnGuardarFirma = document.getElementById('btn-save-signature');
    if (btnGuardarFirma) {
        btnGuardarFirma.addEventListener('click', guardarFirma);
    }
    
    // Confirmación final
    const checkboxFinal = document.getElementById('final-acceptance');
    if (checkboxFinal) {
        checkboxFinal.addEventListener('change', validarEstadoFinal);
    }
    
    // Botón de descarga del contrato firmado
    const btnDescargarFirmado = document.getElementById('btn-download-signed');
    if (btnDescargarFirmado) {
        btnDescargarFirmado.addEventListener('click', descargarContratoFirmado);
    }
    
    // Botón proceder al pago
    const btnProcederPago = document.getElementById('btn-proceder-pago');
    if (btnProcederPago) {
        btnProcederPago.addEventListener('click', procederAlPago);
    }
    
    console.log('🔧 Event listeners configurados');
}

/**
 * Configura los eventos del canvas de firma
 */
function configurarEventosCanvas() {
    if (!canvas) return;
    
    // Eventos de mouse
    canvas.addEventListener('mousedown', iniciarTrazo);
    canvas.addEventListener('mousemove', dibujarTrazo);
    canvas.addEventListener('mouseup', finalizarTrazo);
    canvas.addEventListener('mouseout', finalizarTrazo);
    
    // Eventos táctiles
    canvas.addEventListener('touchstart', iniciarTrazoTactil);
    canvas.addEventListener('touchmove', dibujarTrazoTactil);
    canvas.addEventListener('touchend', finalizarTrazo);
    
    // Prevenir scroll en dispositivos móviles
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
}

// ================================
// GENERACIÓN DE CONTRATO
// ================================
async function generarContrato() {
    if (contratoGenerado) {
        console.log('ℹ️ Contrato ya generado');
        return;
    }
    
    console.log('📄 Generando contrato...');
    
    try {
        mostrarEstadoContrato('Generando contrato personalizado...', 'loading');
        
        const response = await fetch(`${BACKEND_URL}/api/generar-contrato`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reservaId: configuracionReserva.reserva_id
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const resultado = await response.json();
        
        if (resultado.success) {
            console.log('✅ Contrato generado exitosamente');
            
            // Guardar URL del contrato
            configuracionReserva.contrato_url = resultado.contratoUrl;
            sessionStorage.setItem('reserva_configuracion', JSON.stringify(configuracionReserva));
            
            // Mostrar contrato
            mostrarContrato(resultado.contratoUrl);
            activarSeccionFirma();
            contratoGenerado = true;
            
        } else {
            throw new Error(resultado.error || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('❌ Error generando contrato:', error);
        mostrarErrorContrato(`Error generando el contrato: ${error.message}`);
    }
}

/**
 * Muestra el estado del contrato
 */
function mostrarEstadoContrato(mensaje, tipo) {
    const loadingElement = document.getElementById('contract-loading');
    if (!loadingElement) return;
    
    const iconos = {
        'loading': 'fas fa-spinner fa-spin',
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-triangle'
    };
    
    loadingElement.innerHTML = `
        <i class="${iconos[tipo] || 'fas fa-info-circle'}"></i>
        <h3>${tipo === 'loading' ? 'Generando contrato' : tipo === 'error' ? 'Error' : 'Contrato listo'}</h3>
        <p>${mensaje}</p>
    `;
}

/**
 * Muestra el contrato en el iframe
 */
function mostrarContrato(urlContrato) {
    console.log('📄 Mostrando contrato:', urlContrato);
    
    const loadingElement = document.getElementById('contract-loading');
    const iframe = document.getElementById('contract-iframe');
    const actions = document.getElementById('contract-actions');
    
    if (iframe) {
        iframe.src = urlContrato;
        iframe.style.display = 'block';
        
        iframe.onload = () => {
            console.log('✅ Contrato cargado en iframe');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            if (actions) {
                actions.style.display = 'flex';
            }
            mostrarNotificacion('Contrato generado correctamente. Puede revisarlo y proceder a firmar.', 'success');
        };
        
        iframe.onerror = () => {
            console.error('❌ Error cargando contrato en iframe');
            mostrarErrorContrato('Error cargando la visualización del contrato');
        };
    }
}

/**
 * Activa la sección de firma
 */
function activarSeccionFirma() {
    const signatureSection = document.getElementById('signature-section');
    if (signatureSection) {
        signatureSection.style.display = 'block';
        
        // Hacer scroll suave a la sección de firma
        setTimeout(() => {
            signatureSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 1000);
    }
}

/**
 * Muestra error en la generación del contrato
 */
function mostrarErrorContrato(mensaje) {
    mostrarEstadoContrato(mensaje, 'error');
    
    const loadingElement = document.getElementById('contract-loading');
    if (loadingElement) {
        loadingElement.innerHTML += `
            <button class="cta-button" onclick="location.reload()" style="margin-top: 20px;">
                <i class="fas fa-redo"></i> Reintentar
            </button>
        `;
    }
}

// ================================
// EVENTOS DE FIRMA
// ================================
function iniciarTrazo(e) {
    if (!canvas || !contexto) return;
    e.preventDefault();
    
    firmando = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    contexto.beginPath();
    contexto.moveTo(x, y);
}

function dibujarTrazo(e) {
    if (!firmando || !canvas || !contexto) return;
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    contexto.lineTo(x, y);
    contexto.stroke();
    
    // Habilitar botón de guardar cuando se empiece a dibujar
    const btnGuardar = document.getElementById('btn-save-signature');
    if (btnGuardar) {
        btnGuardar.disabled = false;
    }
}

function finalizarTrazo(e) {
    if (!firmando) return;
    e.preventDefault();
    firmando = false;
    if (contexto) {
        contexto.closePath();
    }
}

function iniciarTrazoTactil(e) {
    if (!e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    iniciarTrazo(mouseEvent);
}

function dibujarTrazoTactil(e) {
    if (!e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    dibujarTrazo(mouseEvent);
}

/**
 * Limpia la firma del canvas
 */
function limpiarFirma() {
    if (!canvas || !contexto) return;
    
    const rect = canvas.getBoundingClientRect();
    contexto.fillStyle = 'white';
    contexto.fillRect(0, 0, rect.width, rect.height);
    
    firmaCapturada = false;
    datosFirma = null;
    
    const btnGuardar = document.getElementById('btn-save-signature');
    if (btnGuardar) {
        btnGuardar.disabled = true;
    }
    
    const confirmacion = document.getElementById('signature-confirmation');
    if (confirmacion) {
        confirmacion.classList.remove('show');
    }
    
    const finalTerms = document.getElementById('final-terms');
    if (finalTerms) {
        finalTerms.classList.remove('show');
    }
    
    validarEstadoFinal();
    console.log('🧹 Firma limpiada');
}

/**
 * Guarda la firma capturada
 */
function guardarFirma() {
    if (!canvas || !contexto) {
        mostrarError('Canvas no disponible');
        return;
    }
    
    try {
        const firmaBase64 = canvas.toDataURL('image/png');
        
        // Verificar que la firma no esté vacía
        if (firmaBase64.length < 1000) {
            mostrarError('Por favor, firme en el área designada antes de guardar');
            return;
        }
        
        datosFirma = {
            imagen: firmaBase64,
            timestamp: new Date(),
            metadatos: {
                userAgent: navigator.userAgent,
                resolucion: `${canvas.width}x${canvas.height}`,
                ip: 'Cliente'
            }
        };
        
        firmaCapturada = true;
        
        // Mostrar confirmación
        const confirmacion = document.getElementById('signature-confirmation');
        if (confirmacion) {
            confirmacion.classList.add('show');
        }
        
        // Mostrar términos finales
        const finalTerms = document.getElementById('final-terms');
        if (finalTerms) {
            finalTerms.classList.add('show');
            
            // Scroll suave a términos finales
            setTimeout(() => {
                finalTerms.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 500);
        }
        
        validarEstadoFinal();
        mostrarNotificacion('Firma guardada correctamente', 'success');
        console.log('💾 Firma guardada correctamente');
        
    } catch (error) {
        console.error('❌ Error guardando firma:', error);
        mostrarError('Error guardando la firma. Inténtelo de nuevo.');
    }
}

/**
 * Valida el estado final para habilitar el botón de finalizar
 */
function validarEstadoFinal() {
    const checkboxFinal = document.getElementById('final-acceptance');
    const btnProcederPago = document.getElementById('btn-proceder-pago');
    
    const estadoValido = contratoGenerado && 
                        firmaCapturada && 
                        checkboxFinal && 
                        checkboxFinal.checked;
    
    if (btnProcederPago) {
        btnProcederPago.disabled = !estadoValido;
        
        if (estadoValido) {
            btnProcederPago.classList.remove('disabled');
            btnProcederPago.innerHTML = '<i class="fas fa-signature"></i> Firmar Contrato y Continuar';
        } else {
            btnProcederPago.classList.add('disabled');
            btnProcederPago.innerHTML = '<i class="fas fa-credit-card"></i> Proceder al Pago';
        }
    }
}

/**
 * Procesa la firma y genera el contrato firmado
 */
async function procesarFirmaYContinuar() {
    if (!datosFirma) {
        mostrarError('No se ha capturado la firma');
        return;
    }
    
    console.log('🏁 Procesando firma y generando contrato firmado...');
    
    try {
        // Mostrar overlay de procesamiento
        const overlay = document.getElementById('processing-overlay');
        if (overlay) {
            overlay.classList.add('show');
        }
        
        const response = await fetch(`${BACKEND_URL}/api/procesar-firma`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reservaId: configuracionReserva.reserva_id,
                firmaBase64: datosFirma.imagen,
                tipoFirma: 'digital',
                metadatos: JSON.stringify(datosFirma.metadatos)
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const resultado = await response.json();
        
        if (resultado.success) {
            console.log('✅ Contrato firmado exitosamente');
            
            // Guardar URL del contrato firmado
            contratoFirmadoUrl = resultado.contratoFirmadoUrl;
            configuracionReserva.contrato_firmado_url = contratoFirmadoUrl;
            configuracionReserva.contrato_firmado = true;
            configuracionReserva.fecha_firma = new Date().toISOString();
            sessionStorage.setItem('reserva_configuracion', JSON.stringify(configuracionReserva));
            
            // Ocultar overlay
            if (overlay) {
                overlay.classList.remove('show');
            }
            
            // Mostrar sección de descarga
            mostrarSeccionDescarga();
            
            mostrarNotificacion('¡Contrato firmado correctamente!', 'success');
            
        } else {
            throw new Error(resultado.error || 'Error procesando firma');
        }
        
    } catch (error) {
        console.error('❌ Error procesando firma:', error);
        
        const overlay = document.getElementById('processing-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
        
        mostrarError('Error procesando la firma. Inténtelo de nuevo.');
    }
}

/**
 * Muestra la sección de descarga del contrato firmado
 */
function mostrarSeccionDescarga() {
    const downloadSection = document.getElementById('download-section');
    if (downloadSection) {
        downloadSection.classList.add('show');
        
        // Hacer scroll a la sección de descarga
        setTimeout(() => {
            downloadSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 500);
    }
    
    // Habilitar el botón de proceder al pago con nuevo texto
    const btnProcederPago = document.getElementById('btn-proceder-pago');
    if (btnProcederPago) {
        btnProcederPago.disabled = false;
        btnProcederPago.classList.remove('disabled');
        btnProcederPago.innerHTML = '<i class="fas fa-credit-card"></i> Continuar al Pago';
    }
}

/**
 * Descarga el contrato firmado
 */
function descargarContratoFirmado() {
    if (!contratoFirmadoUrl) {
        mostrarError('No hay contrato firmado disponible para descargar');
        return;
    }
    
    try {
        const link = document.createElement('a');
        link.href = contratoFirmadoUrl;
        link.download = `Contrato_Firmado_${configuracionReserva.vivienda_nombre || 'Vivienda'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        mostrarNotificacion('Descarga iniciada', 'success');
        console.log('📥 Descarga del contrato firmado iniciada');
        
    } catch (error) {
        console.error('❌ Error descargando contrato:', error);
        mostrarError('Error al descargar el contrato');
    }
}

/**
 * Procede al paso de pago
 */
async function procederAlPago() {
    if (!firmaCapturada) {
        // Si no se ha firmado, procesar firma primero
        await procesarFirmaYContinuar();
        return;
    }
    
    try {
        // Actualizar progreso en Firebase si es necesario
        if (configuracionReserva.reserva_id) {
            await actualizarProgresoReserva(configuracionReserva.reserva_id, 4, {
                estado: 'contrato_firmado',
                fecha_contrato_firmado: new Date().toISOString()
            });
        }
        
        // Redirigir al paso de pago
        window.location.href = 'paso4-pago.html';
        
    } catch (error) {
        console.error('❌ Error al proceder al pago:', error);
        mostrarError('Error al continuar. Inténtelo de nuevo.');
    }
}

// ================================
// FUNCIONES DE UTILIDAD
// ================================

/**
 * Abre el contrato en pantalla completa
 */
function abrirPantallaCompleta() {
    const iframe = document.getElementById('contract-iframe');
    if (iframe && iframe.src) {
        window.open(iframe.src, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    }
}

/**
 * Imprime el contrato
 */
function imprimirContrato() {
    const iframe = document.getElementById('contract-iframe');
    if (iframe && iframe.src) {
        const printWindow = window.open(iframe.src, '_blank');
        printWindow.onload = function() {
            printWindow.print();
        };
    }
}

/**
 * Muestra una notificación al usuario
 */
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.className = `notification ${tipo}`;
    notificacion.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${mensaje}</span>
    `;
    
    document.body.appendChild(notificacion);
    
    // Mostrar con animación
    setTimeout(() => notificacion.classList.add('show'), 100);
    
    // Ocultar después de 4 segundos
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => notificacion.remove(), 300);
    }, 4000);
}

/**
 * Muestra un mensaje de error
 */
function mostrarError(mensaje) {
    mostrarNotificacion(mensaje, 'error');
}

// ================================
// EVENT LISTENERS FINALES
// ================================

// Configurar el event listener del botón proceder al pago
document.addEventListener('DOMContentLoaded', function() {
    const btnProcederPago = document.getElementById('btn-proceder-pago');
    if (btnProcederPago) {
        btnProcederPago.addEventListener('click', procederAlPago);
    }
    
    const checkboxFinal = document.getElementById('final-acceptance');
    if (checkboxFinal) {
        checkboxFinal.addEventListener('change', validarEstadoFinal);
    }
});