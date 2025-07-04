// reserva-functions.js - Script para la configuración de reserva (CORREGIDO)

// Importar funciones del dataService
import { 
    fetchViviendaCompleta, 
    getNombreVivienda, 
    formatearPrecio, 
    getSubtituloVivienda,
    getViviendaId 
  } from '../dataService.js';
  
  // Estado de la aplicación
  let viviendaActual = null;
  let viviendaId = null;
  let precioBaseVivienda = 0;
  let vinculacionActiva = null;
  let cocheras_disponibles = [];
  let trasteros_disponibles = [];
  let vinculaciones = [];
  
  // Función para obtener la conexión a Firebase
  async function getDb() {
    try {
        const resp = await fetch('/src/firebase/firebase-client-config.json');
        if (!resp.ok) throw new Error('Configuración Firebase no encontrada');
        const config = await resp.json();
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const app = initializeApp(config);
        return getFirestore(app);
    } catch (err) {
        console.error('Error conectando a Firebase:', err);
        throw new Error('No se pudo conectar a Firebase');
    }
  }
  
  // Función para cargar cocheras desde Firebase
  async function cargarCocheras() {
    const db = await getDb();
    const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const snapshot = await getDocs(collection(db, 'cocheras'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  // Función para cargar trasteros desde Firebase
  async function cargarTrasteros() {
    const db = await getDb();
    const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const snapshot = await getDocs(collection(db, 'trasteros'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  // Función para cargar vinculaciones desde Firebase
  async function cargarVinculaciones() {
    const db = await getDb();
    const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const snapshot = await getDocs(collection(db, 'vinculaciones'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  // FUNCIÓN PRINCIPAL DE INICIALIZACIÓN - EXPORTADA
  export async function inicializarReserva() {
    try {
        await inicializarAplicacion();
    } catch (error) {
        console.error('Error en la inicialización:', error);
        mostrarError(error.message);
    }
  }
  
  async function inicializarAplicacion() {
    try {
        // Mostrar loading
        document.getElementById('loading-state').style.display = 'block';
        console.log('Iniciando carga de datos...');
        
        // ============================================
        // LÓGICA CORREGIDA PARA OBTENER VIVIENDA ID
        // ============================================
        
        // 1. Intentar obtener ID desde URL
        const params = new URLSearchParams(window.location.search);
        viviendaId = params.get('id');
        
        // 2. Si no hay ID en URL, intentar obtener desde sessionStorage (navegación de vuelta)
        if (!viviendaId) {
            const configuracionPrevia = JSON.parse(sessionStorage.getItem('reserva_configuracion') || '{}');
            viviendaId = configuracionPrevia.vivienda_id;
            console.log('ID recuperado de sessionStorage:', viviendaId);
        }
        
        // 3. Si aún no hay ID, intentar extraer del parámetro 'vivienda'
        if (!viviendaId) {
            const viviendaNombre = params.get('vivienda');
            if (viviendaNombre) {
                viviendaId = extraerIdDeNombre(viviendaNombre);
                console.log('ID extraído del nombre:', viviendaId);
            }
        }
        
        // 4. Si todavía no hay ID, redirigir a la página principal
        if (!viviendaId) {
            console.error('No se pudo identificar la vivienda de ninguna manera');
            
            // Intentar redirigir a la vivienda guardada en localStorage como última opción
            const ultimaVivienda = localStorage.getItem('ultima_vivienda_visitada');
            if (ultimaVivienda) {
                console.log('Redirigiendo a última vivienda visitada:', ultimaVivienda);
                window.location.href = `reserva_index.html?id=${ultimaVivienda}`;
                return;
            }
            
            throw new Error('No se pudo identificar la vivienda. Por favor, seleccione una vivienda desde la página principal.');
        }
        
        // Guardar el ID para futuras navegaciones
        const configuracionActual = JSON.parse(sessionStorage.getItem('reserva_configuracion') || '{}');
        configuracionActual.vivienda_id = viviendaId;
        sessionStorage.setItem('reserva_configuracion', JSON.stringify(configuracionActual));
        
        // También guardar en localStorage como respaldo
        localStorage.setItem('ultima_vivienda_visitada', viviendaId);
        
        // ============================================
        
        console.log('Parámetros URL:', {
            id: params.get('id'),
            vivienda: params.get('vivienda'),
            precio: params.get('precio'),
            viviendaIdFinal: viviendaId
        });
  
        // Cargar datos desde Firebase
        console.log('Cargando vivienda...');
        const vivienda = await fetchViviendaCompleta(viviendaId);
        
        if (!vivienda) {
            throw new Error(`Vivienda con ID ${viviendaId} no encontrada`);
        }
        
        console.log('Datos de vivienda:', vivienda);
  
        console.log('Cargando cocheras...');
        const cocheras = await cargarCocheras();
        console.log('Cocheras cargadas:', cocheras.length);
  
        console.log('Cargando trasteros...');
        const trasteros = await cargarTrasteros();
        console.log('Trasteros cargados:', trasteros.length);
  
        console.log('Cargando vinculaciones...');
        const vinculacionesData = await cargarVinculaciones();
        console.log('Vinculaciones cargadas:', vinculacionesData.length);
  
        // Asignar datos globales
        viviendaActual = vivienda;
        cocheras_disponibles = cocheras.filter(c => c.estado === 'disponible');
        trasteros_disponibles = trasteros.filter(t => t.estado === 'disponible');
        vinculaciones = vinculacionesData;
  
        console.log('Datos asignados:', {
            vivienda: viviendaActual?.id,
            cocheras: cocheras_disponibles.length,
            trasteros: trasteros_disponibles.length,
            vinculaciones: vinculaciones.length
        });
  
        // Configurar UI
        configurarInformacionVivienda();
        verificarVinculaciones();
        configurarEventListeners();
        actualizarResumenPrecios();
  
        // Mostrar contenido principal
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        document.querySelector('.cta-button').disabled = false;
  
        console.log('Aplicación inicializada correctamente');
  
    } catch (error) {
        console.error('Error en inicialización:', error);
        console.error('Stack trace:', error.stack);
        mostrarError(error.message);
    }
  }
  
  function extraerIdDeNombre(nombreVivienda) {
    // Convertir "Bloque A - Cuarto A" a "A_CUARTO_A"
    const match = nombreVivienda.match(/Bloque ([A-E]) - (\w+) ([A-D])/i);
    if (match) {
        const bloque = match[1].toUpperCase();
        const planta = match[2].toUpperCase();
        const letra = match[3].toUpperCase();
        return `${bloque}_${planta}_${letra}`;
    }
    return null;
  }
  
  function mostrarError(mensaje = 'Error desconocido') {
    console.error('Mostrando error al usuario:', mensaje);
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'flex';
    
    // Añadir información del error al mensaje
    const errorDiv = document.getElementById('error-state');
    const errorDetails = errorDiv.querySelector('p');
    if (errorDetails) {
        errorDetails.innerHTML = `
            ${mensaje}<br>
            <small>Abre la consola del navegador (F12) para más información.</small>
        `;
    }
    
    // Añadir botón para volver a la página principal
    if (!errorDiv.querySelector('.home-button')) {
        const homeButton = document.createElement('button');
        homeButton.textContent = 'Volver a Inicio';
        homeButton.className = 'cta-button home-button';
        homeButton.style.marginTop = '15px';
        homeButton.style.marginRight = '10px';
        homeButton.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
        
        const retryButton = document.createElement('button');
        retryButton.textContent = 'Reintentar';
        retryButton.className = 'btn-secondary';
        retryButton.style.marginTop = '15px';
        retryButton.addEventListener('click', () => {
            location.reload();
        });
        
        errorDiv.appendChild(homeButton);
        errorDiv.appendChild(retryButton);
    }
  }
  
  function configurarInformacionVivienda() {
    try {
        console.log('Configurando información de vivienda:', viviendaActual);
        
        // Buscar vinculación para obtener el precio final de vivienda
        const vinculacion = vinculaciones.find(v => v.vivienda_id === viviendaId);
        precioBaseVivienda = vinculacion?.precio_final_vivienda || viviendaActual.precio_final || viviendaActual.precio || 0;
        
        const nombre = getNombreVivienda(viviendaActual);
        const subtitulo = getSubtituloVivienda(viviendaActual);
        const precio = formatearPrecio(precioBaseVivienda);
  
        console.log('Datos a mostrar:', { nombre, subtitulo, precio });
  
        // Verificar que los elementos existen
        const nombreEl = document.getElementById('vivienda-nombre');
        const specsEl = document.getElementById('vivienda-specs');
        const precioEl = document.getElementById('vivienda-precio');
        const precioViviendaEl = document.getElementById('precio-vivienda');
        const precioTotalEl = document.getElementById('precio-total');
  
        if (nombreEl) nombreEl.textContent = nombre;
        if (specsEl) specsEl.textContent = subtitulo;
        if (precioEl) precioEl.textContent = precio;
        if (precioViviendaEl) precioViviendaEl.textContent = precio;
        if (precioTotalEl) precioTotalEl.textContent = precio;
  
        // Actualizar título de la página
        document.title = `Reserva ${nombre} | Barsant Promociones`;
        
        console.log('Información de vivienda configurada');
    } catch (error) {
        console.error('Error configurando información de vivienda:', error);
        throw new Error('No se pudo configurar la información de la vivienda');
    }
  }
  
  function verificarVinculaciones() {
    try {
        console.log('Verificando vinculaciones para vivienda:', viviendaId);
        console.log('Vinculaciones disponibles:', vinculaciones);
        
        vinculacionActiva = vinculaciones.find(v => v.vivienda_id === viviendaId);
        console.log('Vinculación encontrada:', vinculacionActiva);
        
        // Verificar que los elementos DOM existen
        const packNotice = document.getElementById('pack-notice');
        const noOpcionesNotice = document.getElementById('no-opciones-notice');
        const packSection = document.getElementById('pack-vinculado-section');
        const seleccionesSection = document.getElementById('selecciones-individuales');
        
        if (!packNotice || !packSection || !seleccionesSection) {
            console.error('Elementos DOM no encontrados');
            return;
        }
        
        if (!vinculacionActiva || !vinculacionActiva.tiene_asignados) {
            // Caso 1: Sin cochera ni trastero asignado
            console.log('Caso 1: Vivienda sin cochera ni trastero asignado');
            if (noOpcionesNotice) noOpcionesNotice.style.display = 'flex';
            packSection.style.display = 'none';
            seleccionesSection.style.display = 'none';
            packNotice.style.display = 'none';
            return;
        }
  
        if (vinculacionActiva.vinculada) {
            // Caso 3: Pack vinculado (tiene_asignados=true, vinculada=true)
            console.log('Caso 3: Vivienda con pack cochera + trastero vinculado');
            packNotice.style.display = 'flex';
            packSection.style.display = 'block';
            seleccionesSection.style.display = 'none';
            if (noOpcionesNotice) noOpcionesNotice.style.display = 'none';
            
            configurarPackVinculado();
        } else {
            // Caso 2: Opciones individuales (tiene_asignados=true, vinculada=false)
            console.log('Caso 2: Vivienda con opciones individuales de cochera y/o trastero');
            packSection.style.display = 'none';
            seleccionesSection.style.display = 'block';
            packNotice.style.display = 'none';
            if (noOpcionesNotice) noOpcionesNotice.style.display = 'none';
            
            configurarOpcionesIndividuales();
        }
        
        console.log('Verificación de vinculaciones completada');
    } catch (error) {
        console.error('Error en verificarVinculaciones:', error);
        console.error('Stack trace:', error.stack);
        
        // Fallback: mostrar mensaje de error y configurar como sin opciones
        const noOpcionesNotice = document.getElementById('no-opciones-notice');
        if (noOpcionesNotice) {
            noOpcionesNotice.style.display = 'flex';
            noOpcionesNotice.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Error de configuración:</strong> No se pudieron cargar las opciones de cochera y trastero.
                </div>
            `;
        }
        
        // Ocultar otras secciones
        const packSection = document.getElementById('pack-vinculado-section');
        const seleccionesSection = document.getElementById('selecciones-individuales');
        const packNotice = document.getElementById('pack-notice');
        
        if (packSection) packSection.style.display = 'none';
        if (seleccionesSection) seleccionesSection.style.display = 'none';
        if (packNotice) packNotice.style.display = 'none';
    }
  }
  
  function configurarPackVinculado() {
    try {
        console.log('Configurando pack vinculado');
        
        // Verificar que tenemos los datos necesarios
        if (!vinculacionActiva || !vinculacionActiva.cochera_id || !vinculacionActiva.trastero_id) {
            console.error('Datos de vinculación incompletos:', vinculacionActiva);
            return;
        }
        
        // Buscar cochera y trastero
        const cochera = cocheras_disponibles.find(c => c.id === vinculacionActiva.cochera_id);
        const trastero = trasteros_disponibles.find(t => t.id === vinculacionActiva.trastero_id);
        
        console.log('Cochera encontrada:', cochera);
        console.log('Trastero encontrado:', trastero);
        
        // Verificar elementos DOM
        const cocheraPackInfo = document.getElementById('cochera-pack-info');
        const trasteroPackInfo = document.getElementById('trastero-pack-info');
        const packPriceOriginal = document.getElementById('pack-price-original');
        const packPriceFinal = document.getElementById('pack-price-final');
        
        if (!cocheraPackInfo || !trasteroPackInfo || !packPriceOriginal || !packPriceFinal) {
            console.error('Elementos DOM del pack no encontrados');
            return;
        }
        
        if (cochera && trastero) {
            const cocheraInfo = `${cochera.id} - ${cochera.sup_util}m² (${cochera.tamaño})`;
            const trasteroInfo = `${trastero.id} - ${trastero.sup_util}m² (${trastero.tamaño})`;
            
            cocheraPackInfo.textContent = cocheraInfo;
            trasteroPackInfo.textContent = trasteroInfo;
            
            // Calcular precios desde vinculación
            const precioCochera = vinculacionActiva.precio_final_cochera || 0;
            const precioTrastero = vinculacionActiva.precio_final_trastero || 0;
            const precioOriginal = precioCochera + precioTrastero;
            
            // El precio final podría tener descuento
            const descuento = vinculacionActiva.descuento_pack || 0;
            const precioFinal = precioOriginal - descuento;
            
            if (descuento > 0) {
                packPriceOriginal.textContent = `€${precioOriginal.toLocaleString()}`;
                packPriceOriginal.style.display = 'inline-block';
                packPriceFinal.textContent = `€${precioFinal.toLocaleString()}`;
            } else {
                packPriceOriginal.style.display = 'none';
                packPriceFinal.textContent = `€${precioOriginal.toLocaleString()}`;
            }
            
            console.log('Pack vinculado configurado correctamente');
        } else {
            console.error('No se encontraron cochera o trastero para el pack');
            // Mostrar información básica aunque no se encuentren
            cocheraPackInfo.textContent = vinculacionActiva.cochera_id || 'No disponible';
            trasteroPackInfo.textContent = vinculacionActiva.trastero_id || 'No disponible';
            packPriceFinal.textContent = '€0';
            packPriceOriginal.style.display = 'none';
        }
    } catch (error) {
        console.error('Error configurando pack vinculado:', error);
    }
  }
  
  function configurarOpcionesIndividuales() {
    try {
        console.log('Configurando opciones individuales');
        
        if (!vinculacionActiva) {
            console.error('No hay vinculación activa para opciones individuales');
            return;
        }
        
        // Verificar elementos DOM
        const cocheraDetails = document.getElementById('cochera-details');
        const cocheraPrice = document.getElementById('cochera-price');
        const trasteroDetails = document.getElementById('trastero-details');
        const trasteroPrice = document.getElementById('trastero-price');
        
        const cocheraSection = document.querySelector('#selecciones-individuales .form-section:first-child');
        const trasteroSection = document.querySelector('#selecciones-individuales .form-section:last-child');
        
        // Configurar cochera si está asignada
        if (vinculacionActiva.cochera_id) {
            const cochera = cocheras_disponibles.find(c => c.id === vinculacionActiva.cochera_id);
            console.log('Configurando cochera:', cochera);
            
            if (cochera && cocheraDetails && cocheraPrice) {
                const cocheraInfo = `${cochera.id} - ${cochera.sup_util}m² (${cochera.tamaño})`;
                const precio = vinculacionActiva.precio_final_cochera || 0;
                
                cocheraDetails.textContent = cocheraInfo;
                cocheraPrice.textContent = `€${precio.toLocaleString()}`;
                
                if (cocheraSection) cocheraSection.style.display = 'block';
            }
        } else {
            // Ocultar sección de cochera si no hay asignada
            console.log('No hay cochera asignada, ocultando sección');
            if (cocheraSection) cocheraSection.style.display = 'none';
        }
  
        // Configurar trastero si está asignado
        if (vinculacionActiva.trastero_id) {
            const trastero = trasteros_disponibles.find(t => t.id === vinculacionActiva.trastero_id);
            console.log('Configurando trastero:', trastero);
            
            if (trastero && trasteroDetails && trasteroPrice) {
                const trasteroInfo = `${trastero.id} - ${trastero.sup_util}m² (${trastero.tamaño})`;
                const precio = vinculacionActiva.precio_final_trastero || 0;
                
                trasteroDetails.textContent = trasteroInfo;
                trasteroPrice.textContent = `€${precio.toLocaleString()}`;
                
                if (trasteroSection) trasteroSection.style.display = 'block';
            }
        } else {
            // Ocultar sección de trastero si no hay asignado
            console.log('No hay trastero asignado, ocultando sección');
            if (trasteroSection) trasteroSection.style.display = 'none';
        }
        
        console.log('Opciones individuales configuradas');
    } catch (error) {
        console.error('Error configurando opciones individuales:', error);
    }
  }
  
  function configurarEventListeners() {
    if (!vinculacionActiva || !vinculacionActiva.tiene_asignados) {
        // Caso 1: Sin opciones - no hay event listeners necesarios
        console.log('Sin opciones de cochera/trastero - no se configuran event listeners');
        // Configurar solo el formulario
        configurarFormulario();
        return;
    }

    if (vinculacionActiva.vinculada) {
        // Caso 3: Pack vinculado
        const packCheckbox = document.getElementById('incluir_pack');
        const packCheckboxGroup = document.getElementById('pack-checkbox');
        
        if (packCheckbox && packCheckboxGroup) {
            packCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    packCheckboxGroup.classList.add('checked');
                } else {
                    packCheckboxGroup.classList.remove('checked');
                }
                actualizarResumenPrecios();
            });
        }
        
    } else {
        // Caso 2: Opciones individuales
        if (vinculacionActiva.cochera_id) {
            const cocheraCheckbox = document.getElementById('incluir_cochera');
            const cocheraCheckboxGroup = document.getElementById('cochera-checkbox');
            
            if (cocheraCheckbox && cocheraCheckboxGroup) {
                cocheraCheckbox.addEventListener('change', function() {
                    if (this.checked) {
                        cocheraCheckboxGroup.classList.add('checked');
                    } else {
                        cocheraCheckboxGroup.classList.remove('checked');
                    }
                    actualizarResumenPrecios();
                });
            }
        }
  
        if (vinculacionActiva.trastero_id) {
            const trasteroCheckbox = document.getElementById('incluir_trastero');
            const trasteroCheckboxGroup = document.getElementById('trastero-checkbox');
            
            if (trasteroCheckbox && trasteroCheckboxGroup) {
                trasteroCheckbox.addEventListener('change', function() {
                    if (this.checked) {
                        trasteroCheckboxGroup.classList.add('checked');
                    } else {
                        trasteroCheckboxGroup.classList.remove('checked');
                    }
                    actualizarResumenPrecios();
                });
            }
        }
    }
  
    // Configurar formulario
    configurarFormulario();
  }

  function configurarFormulario() {
    // Formulario (común para todos los casos)
    const form = document.getElementById('reservation-step1-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let configuracion = {
                vivienda_id: viviendaId,
                vivienda_nombre: getNombreVivienda(viviendaActual),
                vivienda_precio: precioBaseVivienda,
                precio_total: calcularPrecioTotal(),
                tiene_asignados: vinculacionActiva ? vinculacionActiva.tiene_asignados : false,
                es_pack_vinculado: false,
                incluir_cochera: false,
                cochera_id: null,
                incluir_trastero: false,
                trastero_id: null,
                descuento_pack: 0
            };
  
            if (!vinculacionActiva || !vinculacionActiva.tiene_asignados) {
                // Caso 1: Sin opciones
                // La configuración ya está por defecto
            } else if (vinculacionActiva.vinculada) {
                // Caso 3: Pack vinculado
                const incluirPackEl = document.getElementById('incluir_pack');
                const incluirPack = incluirPackEl ? incluirPackEl.checked : false;
                
                configuracion.es_pack_vinculado = incluirPack;
                configuracion.incluir_cochera = incluirPack;
                configuracion.cochera_id = incluirPack ? vinculacionActiva.cochera_id : null;
                configuracion.incluir_trastero = incluirPack;
                configuracion.trastero_id = incluirPack ? vinculacionActiva.trastero_id : null;
                configuracion.descuento_pack = incluirPack ? (vinculacionActiva.descuento_pack || 0) : 0;
            } else {
                // Caso 2: Opciones individuales
                const incluirCocheraEl = document.getElementById('incluir_cochera');
                const incluirTrasteroEl = document.getElementById('incluir_trastero');
                
                configuracion.incluir_cochera = vinculacionActiva.cochera_id && incluirCocheraEl ? 
                    incluirCocheraEl.checked : false;
                configuracion.cochera_id = configuracion.incluir_cochera ? vinculacionActiva.cochera_id : null;
                
                configuracion.incluir_trastero = vinculacionActiva.trastero_id && incluirTrasteroEl ? 
                    incluirTrasteroEl.checked : false;
                configuracion.trastero_id = configuracion.incluir_trastero ? vinculacionActiva.trastero_id : null;
            }
  
            // Guardar en sessionStorage para el siguiente paso
            sessionStorage.setItem('reserva_configuracion', JSON.stringify(configuracion));
            
            console.log('Configuración guardada:', configuracion);
            
            // Continuar al siguiente paso
            window.location.href = 'paso2-datos.html';
        });
    }
  }
  
  

function calcularPrecioTotal() {
    let total = precioBaseVivienda;
    let precioCochera = 0;
    let precioTrastero = 0;
    let descuentoPack = 0;

    if (vinculacionActiva && vinculacionActiva.vinculada) {
        // Pack vinculado
        const incluirPackEl = document.getElementById('incluir_pack');
        const incluirPack = incluirPackEl ? incluirPackEl.checked : false;
        
        if (incluirPack) {
            precioCochera = vinculacionActiva.precio_final_cochera || 0;
            precioTrastero = vinculacionActiva.precio_final_trastero || 0;
            descuentoPack = vinculacionActiva.descuento_pack || 0;
        }
    } else if (vinculacionActiva) {
        // Opciones individuales
        const incluirCocheraEl = document.getElementById('incluir_cochera');
        const incluirTrasteroEl = document.getElementById('incluir_trastero');
        
        if (incluirCocheraEl && incluirCocheraEl.checked && vinculacionActiva.cochera_id) {
            precioCochera = vinculacionActiva.precio_final_cochera || 0;
        }

        if (incluirTrasteroEl && incluirTrasteroEl.checked && vinculacionActiva.trastero_id) {
            precioTrastero = vinculacionActiva.precio_final_trastero || 0;
        }
    }

    return total + precioCochera + precioTrastero - descuentoPack;
}

function actualizarResumenPrecios() {
    let total = precioBaseVivienda;
    let precioCochera = 0;
    let precioTrastero = 0;
    let descuentoPack = 0;

    if (vinculacionActiva && vinculacionActiva.vinculada) {
        // Lógica para pack vinculado
        const incluirPackEl = document.getElementById('incluir_pack');
        const incluirPack = incluirPackEl ? incluirPackEl.checked : false;
        
        if (incluirPack) {
            precioCochera = vinculacionActiva.precio_final_cochera || 0;
            precioTrastero = vinculacionActiva.precio_final_trastero || 0;
            descuentoPack = vinculacionActiva.descuento_pack || 0;
        }
    } else if (vinculacionActiva) {
        // Lógica para selecciones individuales
        const incluirCocheraEl = document.getElementById('incluir_cochera');
        const incluirTrasteroEl = document.getElementById('incluir_trastero');
        
        if (incluirCocheraEl && incluirCocheraEl.checked && vinculacionActiva.cochera_id) {
            precioCochera = vinculacionActiva.precio_final_cochera || 0;
        }

        if (incluirTrasteroEl && incluirTrasteroEl.checked && vinculacionActiva.trastero_id) {
            precioTrastero = vinculacionActiva.precio_final_trastero || 0;
        }
    }

    total = precioBaseVivienda + precioCochera + precioTrastero - descuentoPack;

    // Actualizar UI
    const cocheraLine = document.getElementById('precio-cochera-line');
    const trasteroLine = document.getElementById('precio-trastero-line');
    const descuentoLine = document.getElementById('descuento-pack-line');

    if (precioCochera > 0) {
        if (cocheraLine) {
            cocheraLine.style.display = 'flex';
            const precioCocheraEl = document.getElementById('precio-cochera');
            if (precioCocheraEl) {
                precioCocheraEl.textContent = formatearPrecio(precioCochera);
            }
        }
    } else {
        if (cocheraLine) cocheraLine.style.display = 'none';
    }

    if (precioTrastero > 0) {
        if (trasteroLine) {
            trasteroLine.style.display = 'flex';
            const precioTrasteroEl = document.getElementById('precio-trastero');
            if (precioTrasteroEl) {
                precioTrasteroEl.textContent = formatearPrecio(precioTrastero);
            }
        }
    } else {
        if (trasteroLine) trasteroLine.style.display = 'none';
    }

    if (descuentoPack > 0) {
        if (descuentoLine) {
            descuentoLine.style.display = 'flex';
            const descuentoPackEl = document.getElementById('descuento-pack');
            if (descuentoPackEl) {
                descuentoPackEl.textContent = `-${formatearPrecio(descuentoPack)}`;
            }
        }
    } else {
        if (descuentoLine) descuentoLine.style.display = 'none';
    }

    const precioTotalEl = document.getElementById('precio-total');
    if (precioTotalEl) {
        precioTotalEl.textContent = formatearPrecio(total);
    }
}

// Hacer la función disponible globalmente
window.inicializarReserva = inicializarReserva;

// Exportar funciones globales para debugging
window.debugReserva = {
    viviendaActual,
    vinculacionActiva,
    cocheras_disponibles,
    trasteros_disponibles,
    calcularPrecioTotal,
    actualizarResumenPrecios
};