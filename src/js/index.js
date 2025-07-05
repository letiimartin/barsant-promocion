/**
 * Archivo principal para la web de Barsant Promociones - Ventanilla
 * Versión simplificada sin problemas de MIME types
 */

// ========================
// FUNCIONES BÁSICAS PARA VIVIENDAS
// ========================

// Lista de viviendas obtenidas desde Firebase
window.viviendas = [];

// Función para esperar a que aparezca un elemento
async function waitForElement(selector, timeout = 2000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(interval);
        resolve(element);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error(`Elemento ${selector} no encontrado a tiempo`));
      }
    }, 100);
  });
}

// Función para cargar viviendas con método simple
async function loadViviendas() {
    try {
        console.log('🏠 Cargando viviendas desde Firebase...');
        
        // RUTA CORREGIDA: usar ruta relativa correcta desde /src/js/
        const { fetchAllViviendas } = await import('../../dataService.js');
        
        window.viviendas = await fetchAllViviendas();
        console.log(`✅ ${window.viviendas.length} viviendas cargadas`);
        
        return window.viviendas;
    } catch (err) {
        console.error('❌ Error cargando viviendas:', err);
        window.viviendas = [];
        return [];
    }
}

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Aplicación Barsant Ventanilla inicializada');

  try {
    // Esperar a que aparezca la tabla de viviendas
    await waitForElement('#viviendas-table');
    
    // Cargar viviendas
    await loadViviendas();
    
    // Inicializar tabla si hay viviendas
    if (window.viviendas.length > 0) {
        displayViviendas(window.viviendas);
    }
    
  } catch (err) {
    console.error('❌ Error en inicialización:', err);
  }
  
  // Inicializar otros componentes
  initHeader();
  initPropertiesTable();
  setupContactForm();
  setupNavigation();
});

// ========================
// FUNCIONES DE INTERFAZ
// ========================

/**
 * Inicializa la funcionalidad del header
 */
function initHeader() {
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', function() {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  }
}

/**
 * Inicializa la tabla de propiedades
 */
function initPropertiesTable() {
  // Eventos para los filtros
  const plantaFilter = document.getElementById('planta-filter');
  const dormitoriosFilter = document.getElementById('dormitorios-filter');
  
  if (plantaFilter) {
    plantaFilter.addEventListener('change', filterViviendas);
  }
  
  if (dormitoriosFilter) {
    dormitoriosFilter.addEventListener('change', filterViviendas);
  }
}

// ========================
// FUNCIONES DE VIVIENDAS
// ========================

function getViviendaId(v) {
    const planta = (v.piso || v.planta || '').toString().toLowerCase().replace(/\s+/g, '-');
    const letra = (v.letra || '').toString().toLowerCase();
    return v.id || [v.bloque, planta, letra].filter(Boolean).join('-');
}

function filterViviendas() {
  const plantaFilter = document.getElementById('planta-filter')?.value;
  const dormitoriosFilter = document.getElementById('dormitorios-filter')?.value;

  let filtered = [...window.viviendas];

  if (plantaFilter) {
    filtered = filtered.filter(v => mapPlantaNumeroALetra(v.planta) === plantaFilter);
  }
  if (dormitoriosFilter) {
    filtered = filtered.filter(v => String(v.dormitorios) === dormitoriosFilter);
  }

  displayViviendas(filtered);
}

function displayViviendas(vivs) {
  const tabla = document.getElementById('viviendas-table');
  if (!tabla) return;

  tabla.innerHTML = '';

  // Elimina duplicados por bloque+planta+letra
  const seen = new Set();
  const viviendasSinDuplicar = vivs.filter(v => {
    const key = `${v.bloque}|${v.planta}|${v.letra}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Ordena viviendas
  const bloquesOrder = ['A', 'B', 'C', 'D', 'E'];
  viviendasSinDuplicar.sort((a, b) => {
    const bloqueDiff = bloquesOrder.indexOf(a.bloque) - bloquesOrder.indexOf(b.bloque);
    if (bloqueDiff !== 0) return bloqueDiff;
    return (a.planta - b.planta);
  });

  viviendasSinDuplicar.forEach(v => {
    const row = document.createElement('tr');
    const estadoClass = v.estado === 'Reservado' ? 'estado-reservado' : 'estado-disponible';
    const id = getViviendaId(v);
    const plantaTexto = mapPlantaNumeroALetra(v.planta);
    const pisoLabel = `${plantaTexto} ${v.letra || ''}`.trim();

    let planoLink = '-';
    if (v.letra) {
      const pdfPath = `assets/docs/plano-${v.bloque}-${plantaTexto}-${v.letra}.pdf`;
      planoLink = `
        <a href="${pdfPath}" target="_blank" title="Ver plano">
          <i class="fas fa-external-link-alt"></i>
        </a>
        <a href="${pdfPath}" download title="Descargar plano">
          <i class="fas fa-download"></i>
        </a>`;
    }

    const accionesLinks = `
      <a href="viviendas/template-viviendas.html?id=${id}" class="vivienda-link">
        Más información
      </a>
    `;

    row.innerHTML = `
      <td>${v.bloque}</td>
      <td>${pisoLabel}</td>
      <td>${v.dormitorios}</td>
      <td>${v.baños}</td>
      <td>${(v.m2_construidos || 0).toFixed(2)} m²</td>
      <td>€${v.precio_vivienda?.toLocaleString() || ''}</td>
      <td class="planos">${planoLink}</td>
      <td class="${estadoClass}">${v.estado}</td>
      <td class="acciones-cell" style="min-width: 160px;">
        ${accionesLinks}
      </td>`;

    tabla.appendChild(row);
  });
}

function mapPlantaNumeroALetra(num) {
  switch (parseInt(num)) {
    case 1: return 'Primero';
    case 2: return 'Segundo';
    case 3: return 'Tercero';
    case 4: return 'Cuarto';
    default: return num;
  }
}

// ========================
// FORMULARIO DE CONTACTO
// ========================

/**
 * Configura el formulario de contacto con envío real de emails
 */
function setupContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;
  
  // Inicializar EmailJS cuando se carga la página
  initEmailJS();
  
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validar formulario
    if (!validarFormularioContacto()) {
      return;
    }
    
    // Mostrar loading
    mostrarEstadoEnvio('enviando');
    
    // Enviar email
    enviarEmailContacto(contactForm);
  });
}

/**
 * Inicializa EmailJS con tu User ID público
 */
function initEmailJS() {
  emailjs.init("ATPsbq4KNK2UyMIMW");
}

/**
 * Valida el formulario de contacto
 */
function validarFormularioContacto() {
  const form = document.getElementById('contact-form');
  const nombre = form.querySelector('#name').value.trim();
  const email = form.querySelector('#email').value.trim();
  const telefono = form.querySelector('#phone').value.trim();
  
  // Validar campos obligatorios
  if (!nombre) {
    mostrarErrorValidacion('name', 'El nombre es obligatorio');
    return false;
  }
  
  if (!email) {
    mostrarErrorValidacion('email', 'El email es obligatorio');
    return false;
  }
  
  if (!validarEmail(email)) {
    mostrarErrorValidacion('email', 'Ingrese un email válido');
    return false;
  }
  
  if (!telefono) {
    mostrarErrorValidacion('phone', 'El teléfono es obligatorio');
    return false;
  }
  
  if (!validarTelefono(telefono)) {
    mostrarErrorValidacion('phone', 'Ingrese un teléfono válido');
    return false;
  }
  
  // Limpiar errores anteriores
  limpiarErroresValidacion();
  return true;
}

/**
 * Envía el email usando EmailJS
 */
function enviarEmailContacto(form) {
  // Obtener datos del formulario
  const formData = new FormData(form);
  const templateParams = {
    from_name: formData.get('name') || document.getElementById('name').value,
    from_email: formData.get('email') || document.getElementById('email').value,
    phone: formData.get('phone') || document.getElementById('phone').value,
    message: formData.get('message') || document.getElementById('message').value || 'Sin mensaje adicional',
    to_email: 'info@barsant.es'
  };
  
  // Enviar usando EmailJS
  emailjs.send('service_md1c3ua', 'template_08agbvf', templateParams)
    .then(function(response) {
      console.log('✅ Email enviado exitosamente:', response);
      mostrarEstadoEnvio('exito');
      
      // Resetear formulario después de 2 segundos
      setTimeout(() => {
        form.reset();
        ocultarEstadoEnvio();
      }, 2000);
      
    }, function(error) {
      console.error('❌ Error enviando email:', error);
      mostrarEstadoEnvio('error');
      
      // Ocultar mensaje de error después de 5 segundos
      setTimeout(() => {
        ocultarEstadoEnvio();
      }, 5000);
    });
}

/**
 * Muestra el estado del envío del formulario
 */
function mostrarEstadoEnvio(estado) {
  const form = document.getElementById('contact-form');
  const submitButton = form.querySelector('button[type="submit"]');
  
  // Eliminar notificación anterior si existe
  const notificacionAnterior = document.querySelector('.form-notification');
  if (notificacionAnterior) {
    notificacionAnterior.remove();
  }
  
  // Crear notificación
  const notificacion = document.createElement('div');
  notificacion.className = 'form-notification';
  
  switch (estado) {
    case 'enviando':
      notificacion.innerHTML = `
        <div class="notification sending">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Enviando mensaje...</span>
        </div>
      `;
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      break;
      
    case 'exito':
      notificacion.innerHTML = `
        <div class="notification success">
          <i class="fas fa-check-circle"></i>
          <span>¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.</span>
        </div>
      `;
      submitButton.disabled = false;
      submitButton.innerHTML = '<i class="fas fa-check"></i> Enviado';
      break;
      
    case 'error':
      notificacion.innerHTML = `
        <div class="notification error">
          <i class="fas fa-exclamation-triangle"></i>
          <span>Error al enviar el mensaje. Por favor, inténtalo de nuevo o contacta directamente a info@barsant.es</span>
        </div>
      `;
      submitButton.disabled = false;
      submitButton.innerHTML = 'Enviar Solicitud';
      break;
  }
  
  // Insertar notificación antes del botón
  form.insertBefore(notificacion, submitButton.closest('.form-group'));
}

/**
 * Oculta el estado del envío
 */
function ocultarEstadoEnvio() {
  const notificacion = document.querySelector('.form-notification');
  if (notificacion) {
    notificacion.remove();
  }
  
  const submitButton = document.querySelector('#contact-form button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Enviar Solicitud';
  }
}

/**
 * Muestra error de validación en un campo específico
 */
function mostrarErrorValidacion(fieldId, mensaje) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  
  // Limpiar error anterior
  limpiarErrorValidacion(fieldId);
  
  // Agregar clase de error
  field.classList.add('error');
  
  // Crear mensaje de error
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = mensaje;
  
  // Insertar después del campo
  field.parentNode.insertBefore(errorDiv, field.nextSibling);
  
  // Hacer scroll al campo con error
  field.scrollIntoView({ behavior: 'smooth', block: 'center' });
  field.focus();
}

/**
 * Limpia error de validación de un campo específico
 */
function limpiarErrorValidacion(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  
  field.classList.remove('error');
  const errorDiv = field.parentNode.querySelector('.field-error');
  if (errorDiv) {
    errorDiv.remove();
  }
}

/**
 * Limpia todos los errores de validación
 */
function limpiarErroresValidacion() {
  const errores = document.querySelectorAll('.field-error');
  errores.forEach(error => error.remove());
  
  const camposConError = document.querySelectorAll('.error');
  camposConError.forEach(campo => campo.classList.remove('error'));
}

/**
 * Valida formato de email
 */
function validarEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida formato de teléfono español
 */
function validarTelefono(telefono) {
  // Eliminar espacios, guiones y paréntesis
  const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
  
  // Validar teléfonos españoles (móvil y fijo)
  const telefonoRegex = /^(\+34|0034|34)?[679][0-9]{8}$/;
  return telefonoRegex.test(telefonoLimpio);
}

// ========================
// NAVEGACIÓN
// ========================

/**
 * Configura la navegación activa
 */
function setupNavigation() {
  console.log('🔧 Configurando navegación...');
  
  // Esperar a que se carguen todas las secciones
  setTimeout(() => {
    const navLinks = document.querySelectorAll('nav a');
    console.log('📍 Enlaces de navegación encontrados:', navLinks.length);
    
    // Manejar clicks en enlaces
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const href = this.getAttribute('href');
        
        // Solo procesar enlaces que empiecen con #
        if (!href || !href.startsWith('#')) {
          return;
        }
        
        const targetId = href.substring(1);
        console.log('🎯 Navegando a:', targetId);
        
        // Mapeo de IDs del header a IDs reales de las secciones
        const sectionMapping = {
          'home': 'inicio-placeholder',
          'inicio': 'inicio-placeholder',
          'about': 'about-placeholder', 
          'properties': 'properties-placeholder',
          'location': 'map-placeholder',
          'map': 'map-placeholder',
          'gallery': 'gallery-placeholder',
          'documentation': 'documentation-placeholder',
          'contact': 'contact-placeholder'
        };
        
        // Buscar el elemento objetivo
        let targetElement = document.getElementById(targetId);
        
        // Si no se encuentra, buscar con el mapeo
        if (!targetElement && sectionMapping[targetId]) {
          targetElement = document.getElementById(sectionMapping[targetId]);
        }
        
        // Si aún no se encuentra, buscar la sección dentro del placeholder
        if (!targetElement) {
          const placeholder = document.getElementById(targetId + '-placeholder');
          if (placeholder) {
            const section = placeholder.querySelector('section');
            targetElement = section || placeholder;
          }
        }
        
        if (targetElement) {
          console.log('✅ Elemento encontrado, haciendo scroll suave');
          
          // Scroll suave a la sección
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Actualizar clase active
          navLinks.forEach(l => l.classList.remove('active'));
          this.classList.add('active');
        } else {
          console.warn(`❌ Sección con ID "${targetId}" no encontrada`);
        }
      });
    });
    
    // Detectar sección activa al hacer scroll
    window.addEventListener('scroll', () => {
      let current = '';
      
      // Buscar todas las secciones posibles
      const sections = document.querySelectorAll('section, [id*="placeholder"]');
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        // Verificar si estamos en esta sección
        if (pageYOffset >= (sectionTop - 100) && pageYOffset < (sectionTop + sectionHeight - 100)) {
          let sectionId = section.getAttribute('id');
          
          // Limpiar el ID para matching
          if (sectionId) {
            sectionId = sectionId.replace('-placeholder', '');
            current = sectionId;
          }
        }
      });

      // Actualizar enlaces activos
      navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        
        if (linkHref && linkHref.includes(current) && current !== '') {
          link.classList.add('active');
        }
      });
    });
    
    console.log('✅ Navegación configurada correctamente');
    
  }, 1000);
}

// ========================
// MAPA (función simple)
// ========================

/**
 * Inicializar el mapa de ubicación
 */
function initMap() {
  try {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;
    
    const location = { lat: 37.182258, lng: -3.603283 };
    const map = new google.maps.Map(mapContainer, {
      zoom: 19,
      center: location,
      styles: [
        {
          "featureType": "poi",
          "stylers": [{ "visibility": "simplified" }]
        },
        {
          "featureType": "road",
          "elementType": "labels.icon",
          "stylers": [{ "visibility": "off" }]
        }
      ]
    });
    
    const marker = new google.maps.Marker({
      position: location,
      map: map,
      title: 'Ventanilla, Granada'
    });

    const infoWindow = new google.maps.InfoWindow({
      content: '<h3>Ventanilla Residencial</h3><p>Calle Ventanilla, Granada<br>33 viviendas modernas en el corazón de Granada</p>'
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });
  } catch (error) {
    console.error('Error al cargar el mapa:', error);
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
      mapContainer.innerHTML = '<p>Error al cargar el mapa. Por favor, verifica tu conexión o intenta de nuevo más tarde.</p>';
    }
  }
}

// Exportar funciones para que Google Maps pueda acceder globalmente
window.initMap = initMap;