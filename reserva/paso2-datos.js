// paso2-datos.js - Script para el paso 2: Datos personales (NAVEGACIÓN CORREGIDA)

// Importar servicios de Firebase
import { 
    procesarDatosPaso2, 
    buscarClienteExistente 
} from './firebase-client-service.js';

let configuracionAnterior = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 Inicializando Paso 2: Datos Personales');
    
    cargarConfiguracionAnterior();
    configurarValidacion();
    configurarEventListeners();
    configurarAutocompletado();
});

/**
 * Carga la configuración del paso anterior
 */
function cargarConfiguracionAnterior() {
    try {
        configuracionAnterior = JSON.parse(sessionStorage.getItem('reserva_configuracion'));
        
        if (!configuracionAnterior) {
            console.error('No se encontró configuración del paso anterior');
            // Redirigir al paso 1
            window.location.href = 'reserva_index.html';
            return;
        }
        
        console.log('Configuración cargada:', configuracionAnterior);
        
        // Mostrar información de la vivienda si es necesario
        mostrarResumenVivienda();
        
    } catch (error) {
        console.error('Error cargando configuración:', error);
        window.location.href = 'reserva_index.html';
    }
}

/**
 * Muestra un resumen de la vivienda seleccionada
 */
function mostrarResumenVivienda() {
    // Podrías añadir un componente visual que muestre la vivienda seleccionada
    console.log('Vivienda seleccionada:', configuracionAnterior.vivienda_nombre);
}

/**
 * Configura el autocompletado basado en datos existentes
 */
function configurarAutocompletado() {
    const emailInput = document.getElementById('email');
    const dniInput = document.getElementById('dni');
    
    if (!emailInput || !dniInput) {
        console.warn('Elementos de autocompletado no encontrados');
        return;
    }
    
    // Autocompletado cuando se sale del campo email o DNI
    emailInput.addEventListener('blur', async function() {
        if (this.value && validarEmail(this.value)) {
            await buscarDatosExistentes('email', this.value);
        }
    });
    
    dniInput.addEventListener('blur', async function() {
        if (this.value && validarDNI(this.value)) {
            await buscarDatosExistentes('dni', this.value);
        }
    });
}

/**
 * Busca datos existentes del cliente y ofrece autocompletar
 */
async function buscarDatosExistentes(campo, valor) {
    try {
        mostrarIndicadorBusqueda(true);
        
        let cliente = null;
        if (campo === 'email') {
            cliente = await buscarClienteExistente(valor, '');
        } else if (campo === 'dni') {
            cliente = await buscarClienteExistente('', valor);
        }
        
        if (cliente) {
            mostrarOpcionAutocompletar(cliente);
        }
        
    } catch (error) {
        console.error('Error buscando datos existentes:', error);
        // No mostrar error al usuario, es una función auxiliar
    } finally {
        mostrarIndicadorBusqueda(false);
    }
}

/**
 * Muestra indicador de búsqueda
 */
function mostrarIndicadorBusqueda(mostrar) {
    let indicador = document.getElementById('search-indicator');
    
    if (mostrar) {
        if (!indicador) {
            indicador = document.createElement('div');
            indicador.id = 'search-indicator';
            indicador.className = 'search-indicator';
            indicador.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando datos existentes...';
            document.querySelector('.container').appendChild(indicador);
        }
        indicador.style.display = 'block';
    } else {
        if (indicador) {
            indicador.style.display = 'none';
        }
    }
}

/**
 * Muestra opción para autocompletar con datos existentes
 */
function mostrarOpcionAutocompletar(cliente) {
    // Eliminar notificación anterior si existe
    const notificacionAnterior = document.getElementById('autocomplete-notification');
    if (notificacionAnterior) {
        notificacionAnterior.remove();
    }
    
    // Crear notificación de autocompletado
    const notificacion = document.createElement('div');
    notificacion.id = 'autocomplete-notification';
    notificacion.className = 'autocomplete-notification';
    notificacion.innerHTML = `
        <div class="autocomplete-content">
            <div class="autocomplete-message">
                <i class="fas fa-user-check"></i>
                <span>Encontramos datos existentes para <strong>${cliente.nombre} ${cliente.apellidos}</strong></span>
            </div>
            <div class="autocomplete-actions">
                <button type="button" class="btn-autocomplete-si" onclick="aplicarAutocompletado('${cliente.id}')">
                    <i class="fas fa-check"></i> Usar estos datos
                </button>
                <button type="button" class="btn-autocomplete-no" onclick="rechazarAutocompletado()">
                    <i class="fas fa-times"></i> No, gracias
                </button>
            </div>
        </div>
    `;
    
    // Insertar después del primer form-section
    const primerSection = document.querySelector('.form-section');
    primerSection.parentNode.insertBefore(notificacion, primerSection.nextSibling);
    
    // Guardar datos del cliente para autocompletado
    window.clienteAutocompletado = cliente;
    
    // Auto-ocultar después de 30 segundos
    setTimeout(() => {
        if (document.getElementById('autocomplete-notification')) {
            rechazarAutocompletado();
        }
    }, 30000);
}

/**
 * Aplicar autocompletado de datos
 */
window.aplicarAutocompletado = function(clienteId) {
    const cliente = window.clienteAutocompletado;
    if (!cliente) return;
    
    // Rellenar campos del formulario de forma segura
    const elementos = {
        'nombre': cliente.nombre || '',
        'apellidos': cliente.apellidos || '',
        'dni': cliente.dni || '',
        'email': cliente.email || '',
        'telefono': cliente.telefono || '',
        'direccion': cliente.direccion || '',
        'ciudad': cliente.ciudad || '',
        'codigo_postal': cliente.codigo_postal || '',
        'fecha_nacimiento': cliente.fecha_nacimiento || '',
        'comentarios': cliente.comentarios || ''
    };
    
    // Rellenar solo los elementos que existen
    Object.keys(elementos).forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento && elementos[id]) {
            elemento.value = elementos[id];
        }
    });
    
    // Marcar como cliente existente
    configuracionAnterior.cliente_existente = {
        id: cliente.id,
        datos_originales: cliente
    };
    
    mostrarNotificacion('Datos completados automáticamente', 'success');
    rechazarAutocompletado();
};

/**
 * Rechazar autocompletado
 */
window.rechazarAutocompletado = function() {
    const notificacion = document.getElementById('autocomplete-notification');
    if (notificacion) {
        notificacion.remove();
    }
    window.clienteAutocompletado = null;
};

/**
 * Configura la validación de campos
 */
function configurarValidacion() {
    // Validación de DNI/NIE
    const dniInput = document.getElementById('dni');
    if (dniInput) {
        dniInput.addEventListener('blur', function() {
            if (this.value) {
                if (!validarDNI(this.value)) {
                    mostrarError(this, 'DNI/NIE no válido');
                } else {
                    limpiarError(this);
                }
            }
        });
    }

    // Validación de email
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value) {
                if (!validarEmail(this.value)) {
                    mostrarError(this, 'Email no válido');
                } else {
                    limpiarError(this);
                }
            }
        });
    }

    // Validación de teléfono
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('blur', function() {
            if (this.value) {
                if (!validarTelefono(this.value)) {
                    mostrarError(this, 'Teléfono no válido');
                } else {
                    limpiarError(this);
                }
            }
        });
    }

    // Validación de código postal
    const codigoPostalInput = document.getElementById('codigo_postal');
    if (codigoPostalInput) {
        codigoPostalInput.addEventListener('blur', function() {
            if (this.value) {
                if (!validarCodigoPostal(this.value)) {
                    mostrarError(this, 'Código postal no válido');
                } else {
                    limpiarError(this);
                }
            }
        });
    }
}

/**
 * Configura los event listeners - NAVEGACIÓN CORREGIDA
 */
function configurarEventListeners() {
    // Botón volver - CORREGIDO PARA MANTENER EL ID
    const btnVolver = document.getElementById('btn-volver');
    if (btnVolver) {
        btnVolver.addEventListener('click', function() {
            // Construir URL del paso anterior con el ID de la vivienda
            let urlVolver = 'reserva_index.html';
            
            if (configuracionAnterior && configuracionAnterior.vivienda_id) {
                urlVolver += `?id=${configuracionAnterior.vivienda_id}`;
            }
            
            console.log('🔙 Volviendo al paso 1 con URL:', urlVolver);
            window.location.href = urlVolver;
        });
    }

    // Formulario
    const formulario = document.getElementById('datos-personales-form');
    if (formulario) {
        formulario.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validarFormulario()) {
                guardarDatos();
                irSiguientePaso();
            }
        });
    }
}

/**
 * Valida todo el formulario - FUNCIÓN SIMPLIFICADA
 */
function validarFormulario() {
    let esValido = true;
    const errores = [];

    // Validar campos requeridos básicos (sin información financiera ni documentación)
    const camposRequeridos = [
        'nombre', 'apellidos', 'dni', 'fecha_nacimiento',
        'email', 'telefono', 'direccion', 'ciudad', 'codigo_postal'
    ];

    console.log('Iniciando validación de formulario simplificado...');

    camposRequeridos.forEach(campo => {
        const elemento = document.getElementById(campo);
        
        // Verificar si el elemento existe antes de acceder a .value
        if (!elemento) {
            console.error(`Elemento con ID '${campo}' no encontrado en el DOM`);
            errores.push(`Campo ${campo} no encontrado en el formulario`);
            esValido = false;
            return; // Continuar con el siguiente campo
        }

        // Ahora verificar si tiene valor
        if (!elemento.value || !elemento.value.trim()) {
            mostrarError(elemento, 'Este campo es obligatorio');
            errores.push(`${campo} es obligatorio`);
            esValido = false;
        } else {
            limpiarError(elemento);
        }
    });

    // Validaciones específicas - con verificación de existencia
    const dniElement = document.getElementById('dni');
    if (dniElement && dniElement.value) {
        if (!validarDNI(dniElement.value)) {
            errores.push('DNI/NIE no válido');
            esValido = false;
        }
    }

    const emailElement = document.getElementById('email');
    if (emailElement && emailElement.value) {
        if (!validarEmail(emailElement.value)) {
            errores.push('Email no válido');
            esValido = false;
        }
    }

    const telefonoElement = document.getElementById('telefono');
    if (telefonoElement && telefonoElement.value) {
        if (!validarTelefono(telefonoElement.value)) {
            errores.push('Teléfono no válido');
            esValido = false;
        }
    }

    // Validar términos y condiciones (ÚNICA VALIDACIÓN DE CHECKBOX)
    const aceptaTerminos = document.getElementById('acepta_terminos');
    if (!aceptaTerminos) {
        errores.push('Elemento de términos y condiciones no encontrado');
        esValido = false;
    } else if (!aceptaTerminos.checked) {
        mostrarError(aceptaTerminos.parentElement, 'Debe aceptar los términos y condiciones');
        errores.push('Debe aceptar los términos y condiciones');
        esValido = false;
    }

    if (!esValido) {
        console.error('Errores de validación:', errores);
        mostrarNotificacion('Por favor, corrija los errores indicados', 'error');
        
        // Scroll al primer error
        const primerError = document.querySelector('.error');
        if (primerError) {
            primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else {
        console.log('Formulario validado correctamente');
    }

    return esValido;
}

/**
 * Guarda los datos del formulario
 */
async function guardarDatos() {
    try {
        mostrarLoading(true, 'Guardando datos en la base de datos...');
        
        // Obtener datos del formulario de forma segura
        const formulario = document.getElementById('datos-personales-form');
        if (!formulario) {
            throw new Error('Formulario no encontrado');
        }
        
        const formData = new FormData(formulario);
        const datosPersonales = {};
        
        for (let [key, value] of formData.entries()) {
            datosPersonales[key] = value;
        }

        // Combinar con configuración anterior
        const configuracionCompleta = {
            ...configuracionAnterior,
            datos_personales: datosPersonales,
            paso_completado: 2,
            fecha_paso2: new Date().toISOString()
        };

        console.log('Datos a procesar:', configuracionCompleta);

        // **GUARDAR EN FIREBASE**
        const resultado = await procesarDatosPaso2(configuracionCompleta);
        
        if (resultado.success) {
            // Actualizar configuración con los IDs generados
            configuracionCompleta.cliente_id = resultado.cliente.id;
            configuracionCompleta.reserva_id = resultado.reserva.id;
            configuracionCompleta.datos_guardados_firebase = true;
            
            // Guardar configuración actualizada
            sessionStorage.setItem('reserva_configuracion', JSON.stringify(configuracionCompleta));
            
            console.log('Datos guardados exitosamente en Firebase:', {
                cliente_id: resultado.cliente.id,
                reserva_id: resultado.reserva.id
            });
            
            mostrarLoading(false);
            mostrarNotificacion('Datos guardados correctamente en la base de datos', 'success');
            
        } else {
            throw new Error('Error en el procesamiento de datos');
        }
        
    } catch (error) {
        console.error('Error guardando datos:', error);
        mostrarLoading(false);
        
        // Mostrar error específico al usuario
        let mensajeError = 'Error guardando los datos. ';
        if (error.message.includes('cliente')) {
            mensajeError += 'Problema con los datos del cliente.';
        } else if (error.message.includes('reserva')) {
            mensajeError += 'Problema creando la reserva.';
        } else if (error.message.includes('Firebase')) {
            mensajeError += 'Problema de conexión con la base de datos.';
        } else {
            mensajeError += 'Inténtelo de nuevo.';
        }
        
        mostrarNotificacion(mensajeError, 'error');
        throw error;
    }
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
        
        // Deshabilitar formulario
        const formulario = document.getElementById('datos-personales-form');
        if (formulario) {
            formulario.style.pointerEvents = 'none';
            formulario.style.opacity = '0.7';
        }
        
    } else {
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
        
        // Rehabilitar formulario
        const formulario = document.getElementById('datos-personales-form');
        if (formulario) {
            formulario.style.pointerEvents = 'auto';
            formulario.style.opacity = '1';
        }
    }
}

/**
 * Ir al siguiente paso
 */
function irSiguientePaso() {
    setTimeout(() => {
        window.location.href = 'paso3-confirmacion.html';
    }, 1500);
}

// FUNCIONES DE UI
// ================================

function mostrarError(elemento, mensaje) {
    limpiarError(elemento);
    
    elemento.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = mensaje;
    
    elemento.parentNode.appendChild(errorDiv);
}

function limpiarError(elemento) {
    elemento.classList.remove('error');
    const errorMessage = elemento.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
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
// FUNCIONES DE VALIDACIÓN
// ================================

function validarDNI(dni) {
    // Remover espacios y convertir a mayúsculas
    dni = dni.replace(/\s/g, '').toUpperCase();
    
    // Validar DNI español
    const dniRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
    if (dniRegex.test(dni)) {
        const numero = dni.slice(0, 8);
        const letra = dni.slice(8);
        const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
        return letra === letras[numero % 23];
    }
    
    // Validar NIE
    const nieRegex = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
    if (nieRegex.test(dni)) {
        const prefijo = dni[0];
        let numero = dni.slice(1, 8);
        const letra = dni.slice(8);
        
        // Convertir prefijo a número
        if (prefijo === 'X') numero = '0' + numero;
        else if (prefijo === 'Y') numero = '1' + numero;
        else if (prefijo === 'Z') numero = '2' + numero;
        
        const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
        return letra === letras[parseInt(numero) % 23];
    }
    
    return false;
}

function validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validarTelefono(telefono) {
    // Remover espacios, guiones y paréntesis
    const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
    
    // Validar teléfonos españoles
    const telefonoRegex = /^(\+34|0034|34)?[6789][0-9]{8}$/;
    return telefonoRegex.test(telefonoLimpio);
}

function validarCodigoPostal(codigo) {
    // Código postal español: 5 dígitos
    const codigoRegex = /^[0-9]{5}$/;
    return codigoRegex.test(codigo);
}
