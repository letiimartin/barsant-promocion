// paso3-confirmacion.js - Script para el paso 3: Confirmación (CORREGIDO)

// Importar servicios de Firebase
import { actualizarProgresoReserva } from './firebase-client-service.js';

let configuracionCompleta = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 Inicializando Paso 3: Confirmación');
    
    cargarDatosCompletos();
    mostrarResumen();
    configurarEventListeners();
});

/**
 * Carga todos los datos de los pasos anteriores
 */
function cargarDatosCompletos() {
    try {
        configuracionCompleta = JSON.parse(sessionStorage.getItem('reserva_configuracion'));
        
        if (!configuracionCompleta || !configuracionCompleta.datos_personales || !configuracionCompleta.datos_guardados_firebase) {
            console.error('Datos incompletos. Redirigiendo...');
            window.location.href = 'reserva_index.html';
            return;
        }
        
        console.log('Configuración completa cargada:', configuracionCompleta);
        
    } catch (error) {
        console.error('Error cargando configuración:', error);
        window.location.href = 'reserva_index.html';
    }
}

/**
 * Muestra el resumen completo
 */
function mostrarResumen() {
    mostrarResumenVivienda();
    mostrarConfiguracion();
    mostrarDatosPersonales();
    mostrarResumenFinanciero();
}

/**
 * Muestra el resumen de la vivienda - FUNCIÓN CORREGIDA
 */
function mostrarResumenVivienda() {
    try {
        const { vivienda_nombre, vivienda_precio } = configuracionCompleta;
        
        // Verificar que los elementos existen antes de acceder a ellos
        const nombreElement = document.getElementById('vivienda-nombre');
        const precioElement = document.getElementById('vivienda-precio');
        const especificacionesElement = document.getElementById('vivienda-especificaciones');
        
        if (nombreElement) {
            nombreElement.textContent = vivienda_nombre || 'Vivienda no especificada';
        } else {
            console.warn('Elemento vivienda-nombre no encontrado');
        }
        
        if (precioElement) {
            precioElement.textContent = formatearPrecio(vivienda_precio || 0);
        } else {
            console.warn('Elemento vivienda-precio no encontrado');
        }
        
        if (especificacionesElement) {
            especificacionesElement.textContent = 'Vivienda seleccionada con las características indicadas en el paso 1';
        } else {
            console.warn('Elemento vivienda-especificaciones no encontrado');
        }
        
        console.log('Resumen de vivienda mostrado correctamente');
        
    } catch (error) {
        console.error('Error mostrando resumen de vivienda:', error);
    }
}

/**
 * Muestra la configuración seleccionada (cochera/trastero) - FUNCIÓN CORREGIDA
 */
function mostrarConfiguracion() {
    try {
        const contenedor = document.getElementById('configuracion-contenido');
        if (!contenedor) {
            console.warn('Contenedor de configuración no encontrado');
            return;
        }
        
        let html = '';

        if (!configuracionCompleta.tiene_asignados) {
            html = `
                <div class="config-item">
                    <i class="fas fa-info-circle"></i>
                    <span>Esta vivienda no incluye opción de cochera ni trastero.</span>
                </div>
            `;
        } else if (configuracionCompleta.es_pack_vinculado) {
            html = `
                <div class="config-item ${configuracionCompleta.incluir_cochera ? 'incluido' : 'no-incluido'}">
                    <i class="fas fa-${configuracionCompleta.incluir_cochera ? 'check-circle' : 'times-circle'}"></i>
                    <div>
                        <strong>Pack Cochera + Trastero:</strong>
                        <span>${configuracionCompleta.incluir_cochera ? 'INCLUIDO' : 'NO INCLUIDO'}</span>
                        ${configuracionCompleta.incluir_cochera ? `<br><small>Cochera: ${configuracionCompleta.cochera_id || 'N/A'} | Trastero: ${configuracionCompleta.trastero_id || 'N/A'}</small>` : ''}
                    </div>
                </div>
            `;
        } else {
            // Opciones individuales
            if (configuracionCompleta.cochera_id) {
                html += `
                    <div class="config-item ${configuracionCompleta.incluir_cochera ? 'incluido' : 'no-incluido'}">
                        <i class="fas fa-${configuracionCompleta.incluir_cochera ? 'check-circle' : 'times-circle'}"></i>
                        <div>
                            <strong>Plaza de Garaje:</strong>
                            <span>${configuracionCompleta.incluir_cochera ? 'INCLUIDA' : 'NO INCLUIDA'}</span>
                            ${configuracionCompleta.incluir_cochera ? `<br><small>Cochera: ${configuracionCompleta.cochera_id}</small>` : ''}
                        </div>
                    </div>
                `;
            }
            
            if (configuracionCompleta.trastero_id) {
                html += `
                    <div class="config-item ${configuracionCompleta.incluir_trastero ? 'incluido' : 'no-incluido'}">
                        <i class="fas fa-${configuracionCompleta.incluir_trastero ? 'check-circle' : 'times-circle'}"></i>
                        <div>
                            <strong>Trastero:</strong>
                            <span>${configuracionCompleta.incluir_trastero ? 'INCLUIDO' : 'NO INCLUIDO'}</span>
                            ${configuracionCompleta.incluir_trastero ? `<br><small>Trastero: ${configuracionCompleta.trastero_id}</small>` : ''}
                        </div>
                    </div>
                `;
            }
        }

        // Si no hay HTML generado, mostrar mensaje por defecto
        if (!html) {
            html = `
                <div class="config-item">
                    <i class="fas fa-info-circle"></i>
                    <span>Sin configuración adicional seleccionada.</span>
                </div>
            `;
        }

        contenedor.innerHTML = html;
        console.log('Configuración mostrada correctamente');
        
    } catch (error) {
        console.error('Error mostrando configuración:', error);
    }
}

/**
 * Muestra los datos personales - FUNCIÓN CORREGIDA
 */
function mostrarDatosPersonales() {
    try {
        const datos = configuracionCompleta.datos_personales;
        
        if (!datos) {
            console.error('No hay datos personales');
            return;
        }

        // Función helper para actualizar elemento de forma segura
        const actualizarElemento = (id, valor) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = valor || '-';
            } else {
                console.warn(`Elemento ${id} no encontrado`);
            }
        };

        // Actualizar cada campo de forma segura
        actualizarElemento('nombre-completo', `${datos.nombre || ''} ${datos.apellidos || ''}`.trim());
        actualizarElemento('dni', datos.dni);
        actualizarElemento('email', datos.email);
        actualizarElemento('telefono', datos.telefono);
        
        // Dirección completa
        const direccionCompleta = [
            datos.direccion,
            datos.codigo_postal,
            datos.ciudad
        ].filter(Boolean).join(', ');
        actualizarElemento('direccion-completa', direccionCompleta);
        
        // Comentarios (opcional)
        if (datos.comentarios && datos.comentarios.trim()) {
            const comentariosItem = document.getElementById('comentarios-item');
            const comentariosTexto = document.getElementById('comentarios-texto');
            if (comentariosItem && comentariosTexto) {
                comentariosItem.style.display = 'flex';
                comentariosTexto.textContent = datos.comentarios;
            }
        }
        
        console.log('Datos personales mostrados correctamente');
        
    } catch (error) {
        console.error('Error mostrando datos personales:', error);
    }
}

/**
 * Muestra el resumen financiero - FUNCIÓN CORREGIDA
 */
function mostrarResumenFinanciero() {
    try {
        const { precio_total, vivienda_precio } = configuracionCompleta;
        
        // Función helper para actualizar precio de forma segura
        const actualizarPrecio = (id, valor) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = formatearPrecio(valor || 0);
            } else {
                console.warn(`Elemento ${id} no encontrado`);
            }
        };

        // Precio base de la vivienda
        actualizarPrecio('precio-vivienda-resumen', vivienda_precio);
        
        // Calcular precios de extras (aquí podrías obtener precios reales desde la configuración)
        let precioCochera = 0;
        let precioTrastero = 0;
        let descuentoPack = 0;

        if (configuracionCompleta.incluir_cochera) {
            precioCochera = 30000; // Valor de ejemplo - deberías obtenerlo de la configuración real
            const lineaCochera = document.getElementById('precio-cochera-linea');
            if (lineaCochera) {
                lineaCochera.style.display = 'flex';
                actualizarPrecio('precio-cochera-resumen', precioCochera);
            }
        }

        if (configuracionCompleta.incluir_trastero) {
            precioTrastero = 12000; // Valor de ejemplo - deberías obtenerlo de la configuración real
            const lineaTrastero = document.getElementById('precio-trastero-linea');
            if (lineaTrastero) {
                lineaTrastero.style.display = 'flex';
                actualizarPrecio('precio-trastero-resumen', precioTrastero);
            }
        }

        if (configuracionCompleta.descuento_pack && configuracionCompleta.descuento_pack > 0) {
            descuentoPack = configuracionCompleta.descuento_pack;
            const lineaDescuento = document.getElementById('descuento-pack-linea');
            if (lineaDescuento) {
                lineaDescuento.style.display = 'flex';
                actualizarPrecio('descuento-pack-resumen', descuentoPack);
            }
        }

        // Precio total
        const precioTotalCalculado = precio_total || (vivienda_precio + precioCochera + precioTrastero - descuentoPack);
        actualizarPrecio('precio-total-resumen', precioTotalCalculado);
        
        // Precio pendiente (total - reserva)
        const precioPendiente = precioTotalCalculado - 6000;
        actualizarPrecio('precio-pendiente', precioPendiente);
        
        console.log('Resumen financiero mostrado correctamente');
        
    } catch (error) {
        console.error('Error mostrando resumen financiero:', error);
    }
}

/**
 * Configura los event listeners - FUNCIÓN CORREGIDA
 */
/**
 * Configura todos los event listeners
 */
function configurarEventListeners() {
    // Botón volver
    const btnVolver = document.getElementById('btn-volver');
    if (btnVolver) {
        btnVolver.addEventListener('click', function() {
            window.location.href = 'paso2-datos.html';
        });
    }
    
    // Botón editar datos
    const btnEditarDatos = document.getElementById('btn-editar-datos');
    if (btnEditarDatos) {
        btnEditarDatos.addEventListener('click', function() {
            window.location.href = 'paso2-datos.html';
        });
    }
    
    // Checkbox de confirmación
    const checkboxConfirmo = document.getElementById('confirmo-datos');
    if (checkboxConfirmo) {
        checkboxConfirmo.addEventListener('change', validarFormulario);
    }
    
    // Botón proceder al contrato (MODIFICADO)
    const btnProcederContrato = document.getElementById('btn-proceder-contrato');
    if (btnProcederContrato) {
        btnProcederContrato.addEventListener('click', procederAlContrato);
    }
    
    console.log('✅ Event listeners configurados');
}

/* Valida que todos los datos estén correctos para proceder*/
function validarFormulario() {
    const checkboxConfirmo = document.getElementById('confirmo-datos');
    const btnProceder = document.getElementById('btn-proceder-contrato');
    
    if (checkboxConfirmo && btnProceder) {
        const esValido = checkboxConfirmo.checked;
        
        btnProceder.disabled = !esValido;
        
        if (esValido) {
            btnProceder.classList.remove('disabled');
        } else {
            btnProceder.classList.add('disabled');
        }
    }
}
async function procederAlContrato() {
    try {
        console.log('🏁 Procediendo al paso 3.5: Contrato');
        
        // Marcar datos como confirmados
        configuracionCompleta.datos_confirmados = true;
        configuracionCompleta.fecha_confirmacion = new Date().toISOString();
        configuracionCompleta.paso_actual = 3;
        
        // Guardar en sessionStorage
        sessionStorage.setItem('reserva_configuracion', JSON.stringify(configuracionCompleta));
        
        // Actualizar estado en Firebase
        if (configuracionCompleta.reserva_id) {
            await actualizarProgresoReserva(configuracionCompleta.reserva_id, 3, {
                datos_confirmados: true,
                fecha_confirmacion: new Date().toISOString(),
                estado: 'datos_confirmados'
            });
            console.log('✅ Estado actualizado en Firebase');
        }
        
        // Mostrar mensaje de transición
        mostrarMensajeTransicion();
        
        // Redirigir al paso 3.5 (CONTRATO) después de un momento
        setTimeout(() => {
            window.location.href = 'paso35-contrato.html';
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error procediendo al contrato:', error);
        mostrarError('Error al proceder. Inténtalo de nuevo.');
    }
}

/**
 * Procede al paso de pago
 */
async function procederAlPago() {
    try {
        mostrarLoading(true, 'Actualizando estado de la reserva...');
        
        // Actualizar configuración con confirmación
        configuracionCompleta.paso_completado = 3;
        configuracionCompleta.fecha_paso3 = new Date().toISOString();
        configuracionCompleta.datos_confirmados = true;
        
        // Actualizar progreso en Firebase
        if (configuracionCompleta.reserva_id) {
            await actualizarProgresoReserva(configuracionCompleta.reserva_id, 3, {
                estado: 'pendiente_pago',
                fecha_confirmacion: new Date().toISOString()
            });
            console.log('Progreso actualizado en Firebase');
        }
        
        sessionStorage.setItem('reserva_configuracion', JSON.stringify(configuracionCompleta));
        
        mostrarLoading(false);
        mostrarNotificacion('Datos confirmados correctamente', 'success');
        
        setTimeout(() => {
            window.location.href = 'paso4-pago.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error al proceder al pago:', error);
        mostrarLoading(false);
        mostrarNotificacion('Error al proceder. Inténtelo de nuevo.', 'error');
    }
}
function mostrarMensajeTransicion() {
    // Deshabilitar botón
    const btnProceder = document.getElementById('btn-proceder-contrato');
    if (btnProceder) {
        btnProceder.disabled = true;
        btnProceder.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando contrato...';
    }
    
    // Mostrar notificación
    mostrarNotificacion('Datos confirmados correctamente. Generando tu contrato personalizado...', 'success');
}
/**
 * Mostrar/ocultar indicador de loading
 */
function mostrarLoading(mostrar, mensaje = 'Procesando...') {
    let loadingDiv = document.getElementById('loading-overlay');
    
    if (mostrar) {
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.id = 'loading-overlay';
            loadingDiv.className = 'loading-overlay';
            loadingDiv.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <div class="loading-message">${mensaje}</div>
                </div>
            `;
            document.body.appendChild(loadingDiv);
        } else {
            loadingDiv.querySelector('.loading-message').textContent = mensaje;
        }
        loadingDiv.style.display = 'flex';
        
    } else {
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }
}

// ================================
// FUNCIONES DE UTILIDAD
// ================================

function formatearPrecio(precio) {
    return `€${precio.toLocaleString('es-ES')}`;
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

/**
 * Muestra mensajes de error
 */
function mostrarError(mensaje) {
    mostrarNotificacion(mensaje, 'error');
}

// Funciones de utilidad adicionales
window.editarDatos = function() {
    window.location.href = 'paso2-datos.html';
};

window.volverAConfiguracion = function() {
    window.location.href = 'reserva_index.html';
};