/**
 * Archivo principal para la web de Barsant Promociones - Ventanilla
 * Versión simplificada sin problemas de MIME types
 */
/**
 * Función para diagnosticar problemas de carga
 **/
function diagnosticarProblemas() {
    console.log('🔍 DIAGNÓSTICO DEL SITIO WEB');
    console.log('================================');
    
    // 1. Verificar si el header se cargó
    const headerPlaceholder = document.getElementById('header-placeholder');
    const header = document.querySelector('header');
    console.log('📋 Header placeholder:', headerPlaceholder);
    console.log('📋 Header elemento:', header);
    
    // 2. Verificar todas las secciones
    const secciones = [
        'header-placeholder',
        'inicio-placeholder', 
        'about-placeholder',
        'features-placeholder',
        'properties-placeholder',
        'map-placeholder',
        'gallery-placeholder',
        'documentation-placeholder',
        'contact-placeholder',
        'footer-placeholder'
    ];
    
    console.log('📋 Estado de las secciones:');
    secciones.forEach(id => {
        const elemento = document.getElementById(id);
        console.log(`- ${id}: ${elemento ? '✅ Existe' : '❌ No existe'}`);
        if (elemento) {
            console.log(`  Contenido cargado: ${elemento.innerHTML.length > 0 ? '✅ Sí' : '❌ No'}`);
        }
    });
    
    // 3. Verificar archivos CSS
    const cssFiles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    console.log('📋 Archivos CSS cargados:', cssFiles.length);
    cssFiles.forEach(css => {
        console.log(`- ${css.href}`);
    });
    
    // 4. Verificar scripts cargados
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    console.log('📋 Scripts cargados:', scripts.length);
    scripts.forEach(script => {
        console.log(`- ${script.src}`);
    });
    
    // 5. Verificar viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    console.log('📋 Viewport meta tag:', viewport ? viewport.content : 'No encontrado');
    
    return {
        headerCargado: !!header,
        placeholderExists: !!headerPlaceholder,
        totalSecciones: secciones.filter(id => document.getElementById(id)).length
    };
}

/**
 * Función para forzar la carga de todas las secciones
 */
async function forzarCargaSecciones() {
    console.log('🔄 Forzando carga de todas las secciones...');
    
    const cargas = [
        { script: 'src/shared/loadHeader.js', placeholder: 'header-placeholder' },
        { script: 'src/pages/inicio/loadInicio.js', placeholder: 'inicio-placeholder' },
        { script: 'src/pages/about/loadAbout.js', placeholder: 'about-placeholder' },
        { script: 'src/pages/features/loadFeatures.js', placeholder: 'features-placeholder' },
        { script: 'src/pages/properties/loadProperties.js', placeholder: 'properties-placeholder' },
        { script: 'src/pages/gallery/loadGallery.js', placeholder: 'gallery-placeholder' },
        { script: 'src/pages/map/loadMap.js', placeholder: 'map-placeholder' },
        { script: 'src/pages/documentation/loadDocumentation.js', placeholder: 'documentation-placeholder' },
        { script: 'src/pages/contact/loadContact.js', placeholder: 'contact-placeholder' },
        { script: 'src/shared/loadFooter.js', placeholder: 'footer-placeholder' }
    ];
    
    for (const carga of cargas) {
        try {
            const placeholder = document.getElementById(carga.placeholder);
            if (placeholder && placeholder.innerHTML.trim() === '') {
                console.log(`⏳ Cargando ${carga.placeholder}...`);
                
                // Cargar el script si no está ya cargado
                if (!document.querySelector(`script[src="${carga.script}"]`)) {
                    await cargarScript(carga.script);
                }
                
                // Esperar un momento para que se ejecute
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (error) {
            console.error(`❌ Error cargando ${carga.placeholder}:`, error);
        }
    }
    
    console.log('✅ Carga forzada completada');
}

/**
 * Función para cargar un script dinámicamente
 */
function cargarScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Función para asegurar que el CSS esté cargado
 */
function asegurarCSS() {
    console.log('🎨 Verificando CSS...');
    
    // Verificar si styles.css está cargado
    const stylesCSS = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .find(link => link.href.includes('styles.css'));
    
    if (!stylesCSS) {
        console.log('⚠️ styles.css no encontrado, añadiendo...');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'src/css/styles.css';
        document.head.appendChild(link);
    }
    
    // Añadir viewport si no existe
    if (!document.querySelector('meta[name="viewport"]')) {
        console.log('📱 Añadiendo viewport meta tag...');
        const viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1.0';
        document.head.appendChild(viewport);
    }
}

/**
 * Función de inicialización completa y robusta
 */
/**
 * Función de inicialización completa y robusta
 */
async function inicializacionCompleta() {
  console.log('INICIANDO INICIALIZACIÓN COMPLETA');
  console.log('====================================');
  
  try {
      // 1. Diagnóstico inicial
      const diagnostico = diagnosticarProblemas();
      
      // 2. Asegurar CSS básico
      asegurarCSS();
      
      // 3. Si faltan secciones, forzar carga
      if (diagnostico.totalSecciones < 8) {
          console.log('Faltan secciones, forzando carga...');
          await forzarCargaSecciones();
      }
      
      // 4. Esperar a que el header esté completamente cargado
      await esperarElemento('header', 5000);
      
      // 5. Inicializar menú móvil
      console.log('Inicializando menú móvil...');
      initMobileMenu();
      
      // 6. Inicializar navegación
      console.log('Inicializando navegación...');
      setupNavigation();
      
      // 7. Cargar viviendas
      console.log('Cargando viviendas...');
      try {
          await loadViviendas();
          if (window.viviendas && window.viviendas.length > 0) {
              displayViviendas(window.viviendas);
          }
      } catch (viviendaError) {
          console.warn('Error cargando viviendas:', viviendaError);
      }
      
      // 8. Configurar formulario
      console.log('Configurando formulario...');
      setupContactForm();
      
      // 9. Inicializar header scroll
      initHeader();
      
      // 10. Inicializar tabla de propiedades
      initPropertiesTable();
      
      // 11. Diagnóstico final
      setTimeout(() => {
          console.log('DIAGNÓSTICO FINAL:');
          diagnosticarProblemas();
          console.log('Inicialización completa terminada');
      }, 2000);
      
  } catch (error) {
      console.error('Error en inicialización completa:', error);
      
      // Fallback: intentar inicialización básica
      console.log('Intentando inicialización básica...');
      setTimeout(() => {
          try {
              initMobileMenu();
              setupNavigation();
              setupContactForm();
              initHeader();
              console.log('Inicialización básica completada');
          } catch (fallbackError) {
              console.error('Error en inicialización básica:', fallbackError);
          }
      }, 1000);
  }
}

/**
* Función setupNavigation actualizada para integrar con menú móvil
*/
function setupNavigation() {
  console.log('Configurando navegación...');
  
  setTimeout(() => {
      const navLinks = document.querySelectorAll('nav ul li a');
      console.log('Enlaces de navegación encontrados:', navLinks.length);
      
      // Manejar clicks en enlaces de navegación desktop
      navLinks.forEach(link => {
          link.addEventListener('click', function(e) {
              e.preventDefault();
              
              const href = this.getAttribute('href');
              
              // Solo procesar enlaces que empiecen con #
              if (!href || !href.startsWith('#')) {
                  return;
              }
              
              const targetId = href.substring(1);
              console.log('Navegando a:', targetId);
              
              // Usar la función unificada de navegación
              navigateToSection(targetId);
              
              // Actualizar clase active en navegación desktop
              navLinks.forEach(l => l.classList.remove('active'));
              this.classList.add('active');
              
              // Sincronizar con menú móvil
              syncMobileNavigation(href);
          });
      });
      
      // Detectar sección activa al hacer scroll
      window.addEventListener('scroll', () => {
          updateActiveNavigation();
      });
      
      console.log('Navegación configurada correctamente');
      
  }, 1000);
}

/**
* Función unificada de navegación que funciona para desktop y móvil
*/
function navigateToSection(targetId) {
  console.log('Navegando a sección:', targetId);
  
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
      console.log('Elemento encontrado, haciendo scroll suave');
      
      // Scroll suave a la sección con compensación del header fijo
      const headerHeight = document.querySelector('header')?.offsetHeight || 80;
      const targetPosition = targetElement.offsetTop - headerHeight;
      
      window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: 'smooth'
      });
  } else {
      console.warn('Sección no encontrada:', targetId);
  }
}

/**
* Sincronizar navegación móvil con desktop
*/
function syncMobileNavigation(href) {
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  mobileLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === href) {
          link.classList.add('active');
      }
  });
}

/**
* Actualizar navegación activa basada en scroll
*/
function updateActiveNavigation() {
  let current = '';
  
  // Buscar todas las secciones posibles
  const sections = document.querySelectorAll('section, [id*="placeholder"]');
  
  sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      const headerHeight = 100; // Margen adicional
      
      // Verificar si estamos en esta sección
      if (pageYOffset >= (sectionTop - headerHeight) && 
          pageYOffset < (sectionTop + sectionHeight - headerHeight)) {
          let sectionId = section.getAttribute('id');
          
          // Limpiar el ID para matching
          if (sectionId) {
              sectionId = sectionId.replace('-placeholder', '');
              current = sectionId;
          }
      }
  });

  // Actualizar enlaces activos en ambas navegaciones
  if (current) {
      // Desktop navigation
      const navLinks = document.querySelectorAll('nav ul li a');
      navLinks.forEach(link => {
          link.classList.remove('active');
          const linkHref = link.getAttribute('href');
          
          if (linkHref && linkHref.includes(current)) {
              link.classList.add('active');
          }
      });
      
      // Mobile navigation
      const mobileLinks = document.querySelectorAll('.mobile-nav-link');
      mobileLinks.forEach(link => {
          link.classList.remove('active');
          const linkHref = link.getAttribute('href');
          
          if (linkHref && linkHref.includes(current)) {
              link.classList.add('active');
          }
      });
  }
}

/**
 * Función auxiliar para esperar a que aparezca un elemento
 */
function esperarElemento(selector, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const elemento = document.querySelector(selector);
        if (elemento) {
            resolve(elemento);
            return;
        }
        
        const observer = new MutationObserver((mutations, obs) => {
            const elemento = document.querySelector(selector);
            if (elemento) {
                obs.disconnect();
                resolve(elemento);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Elemento ${selector} no apareció en ${timeout}ms`));
        }, timeout);
    });
}
function arreglarHeaderDespuesDeCerrarMenu() {
  document.body.style.paddingTop = '80px';
  console.log('✅ Header fijo arreglado');
}

// Ejecutar después de cerrar el menú
setTimeout(() => {
  arreglarHeaderDespuesDeCerrarMenu();
}, 500);
// ========================
// FUNCIONES DE DEBUGGING PARA CONSOLA
// ========================

/**
 * Función para ejecutar en consola para debugging
 */
function debugCompleto() {
    console.clear();
    diagnosticarProblemas();
    
    // Verificar específicamente el problema del header
    const header = document.querySelector('header');
    if (header) {
        const computedStyle = window.getComputedStyle(header);
        console.log('📋 Estilos del header:');
        console.log('- Display:', computedStyle.display);
        console.log('- Position:', computedStyle.position);
        console.log('- Z-index:', computedStyle.zIndex);
        console.log('- Visibility:', computedStyle.visibility);
        console.log('- Opacity:', computedStyle.opacity);
    }
    
    // Verificar botón hamburguesa
    const botonHamburguesa = document.getElementById('mobile-menu-toggle');
    console.log('📋 Botón hamburguesa:', botonHamburguesa);
    if (botonHamburguesa) {
        const style = window.getComputedStyle(botonHamburguesa);
        console.log('- Display:', style.display);
        console.log('- Visibility:', style.visibility);
    }
}

/**
 * Función para recargar manualmente el header
 */
async function recargarHeader() {
    console.log('🔄 Recargando header manualmente...');
    
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        try {
            const response = await fetch('src/shared/header.html');
            if (response.ok) {
                const html = await response.text();
                headerPlaceholder.innerHTML = html;
                console.log('✅ Header recargado');
                
                // Reinicializar menú móvil
                setTimeout(() => {
                    initMobileMenu();
                }, 500);
            }
        } catch (error) {
            console.error('❌ Error recargando header:', error);
        }
    }
}

// Hacer funciones disponibles globalmente para debugging
window.debugCompleto = debugCompleto;
window.recargarHeader = recargarHeader;
window.diagnosticarProblemas = diagnosticarProblemas;
window.forzarCargaSecciones = forzarCargaSecciones;

// ========================
// NUEVA INICIALIZACIÓN PRINCIPAL
// ========================

// Reemplazar el DOMContentLoaded existente con este:
document.addEventListener('DOMContentLoaded', inicializacionCompleta);

console.log('🛠️ Sistema de debug cargado. Funciones disponibles:');
console.log('- debugCompleto()');
console.log('- recargarHeader()'); 
console.log('- diagnosticarProblemas()');
console.log('- forzarCargaSecciones()');
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

/* // Inicialización cuando el DOM esté cargado
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
  initMobileMenu();
  initPropertiesTable();
  setupContactForm();
  setupNavigation();
}); */

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


/**
* Alterna la visibilidad del menú móvil
*/
function toggleMobileMenu() {
  console.log('🔄 Alternando menú móvil...');
  if (isMobileMenuOpen()) {
      closeMobileMenu();
  } else {
      openMobileMenu();
  }
}


/**
* Navega a una sección específica
*/
function navigateToSection(href) {
  console.log('🧭 Navegando a:', href);
  
  if (!href || !href.startsWith('#')) return;
  
  const targetId = href.substring(1);
  
  // Mapeo de IDs (igual que en tu código existente)
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
  
  if (!targetElement && sectionMapping[targetId]) {
      targetElement = document.getElementById(sectionMapping[targetId]);
  }
  
  if (!targetElement) {
      const placeholder = document.getElementById(targetId + '-placeholder');
      if (placeholder) {
          const section = placeholder.querySelector('section');
          targetElement = section || placeholder;
      }
  }
  
  if (targetElement) {
      // Scroll suave con offset para el header fijo
      const headerHeight = document.querySelector('header')?.offsetHeight || 80;
      const targetPosition = targetElement.offsetTop - headerHeight;
      
      window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: 'smooth'
      });
      
      console.log(`✅ Navegando a: ${targetId}`);
  } else {
      console.warn(`❌ Sección con ID "${targetId}" no encontrada`);
  }
}



// ========================
// FUNCIÓN DE TESTING
// ========================

/**
* Función para testear el menú móvil desde la consola
*/
function testMobileMenu() {
  console.log('🧪 Testing menú móvil...');
  
  const elements = {
      toggle: document.getElementById('mobile-menu-toggle'),
      overlay: document.getElementById('mobile-menu-overlay'),
      panel: document.getElementById('mobile-menu-panel'),
      links: document.querySelectorAll('.mobile-nav-link')
  };
  
  console.log('📋 Estado de elementos:', elements);
  
  if (elements.toggle) {
      console.log('🔘 Simulando click en botón hamburguesa...');
      elements.toggle.click();
  } else {
      console.error('❌ Botón hamburguesa no encontrado');
  }
}

// ========================
// FUNCIONES DEL MENÚ MÓVIL
// ========================

/**
 * Carga el logo desde Firebase Storage
 */
async function loadHeaderLogo() {
    try {
        console.log('Cargando logo desde Firebase Storage...');
        
        function getPublicStorageUrl(fileName) {
            const projectId = 'ventanilla-barsant';
            const bucket = `${projectId}.firebasestorage.app`;
            const encodedFileName = encodeURIComponent(fileName);
            return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedFileName}?alt=media`;
        }
        
        const logoUrl = getPublicStorageUrl('logo (3).png');
        
        const headerLogo = document.getElementById('header-logo');
        const mobileMenuLogo = document.getElementById('mobile-menu-logo');
        
        if (headerLogo) {
            headerLogo.src = logoUrl;
            headerLogo.onload = () => console.log('Logo del header cargado desde Firebase');
            headerLogo.onerror = () => {
                headerLogo.src = 'assets/images/logo (3).png';
            };
        }
        
        if (mobileMenuLogo) {
            mobileMenuLogo.src = logoUrl;
            mobileMenuLogo.onload = () => console.log('Logo del menú móvil cargado desde Firebase');
            mobileMenuLogo.onerror = () => {
                mobileMenuLogo.src = 'assets/images/logo (3).png';
            };
        }
        
    } catch (error) {
        console.error('Error cargando logo desde Firebase:', error);
        
        const headerLogo = document.getElementById('header-logo');
        const mobileMenuLogo = document.getElementById('mobile-menu-logo');
        
        if (headerLogo) headerLogo.src = 'assets/images/logo (3).png';
        if (mobileMenuLogo) mobileMenuLogo.src = 'assets/images/logo (3).png';
    }
}

/**
 * Inicializa el menú hamburguesa móvil
 */
function initMobileMenu() {
    console.log('Inicializando menú móvil...');
    
    setTimeout(() => {
        loadHeaderLogo();
        
        const menuToggle = document.getElementById('mobile-menu-toggle');
        const menuOverlay = document.getElementById('mobile-menu-overlay');
        const menuPanel = document.getElementById('mobile-menu-panel');
        const menuClose = document.getElementById('mobile-menu-close');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        
        if (!menuToggle || !menuOverlay || !menuPanel) {
            console.error('Elementos del menú móvil no encontrados');
            return;
        }
        
        // Event listeners
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openMobileMenu();
        });
        
        if (menuClose) {
            menuClose.addEventListener('click', function(e) {
                e.preventDefault();
                closeMobileMenu();
            });
        }
        
        menuOverlay.addEventListener('click', function(e) {
            closeMobileMenu();
        });
        
        // Navegación móvil
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const target = this.getAttribute('data-target');
                
                closeMobileMenu();
                
                setTimeout(() => {
                    navigateToMobileSection(target);
                    updateActiveMobileLink(this);
                }, 300);
            });
        });
        
        // Cerrar con Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMobileMenuOpen()) {
                closeMobileMenu();
            }
        });
        
        // Cerrar al cambiar tamaño de pantalla
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && isMobileMenuOpen()) {
                closeMobileMenu();
            }
        });
        
        console.log('Menú móvil inicializado correctamente');
        
    }, 500);
}

/**
 * Abre el menú móvil
 */
function openMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const menuOverlay = document.getElementById('mobile-menu-overlay');
    const menuPanel = document.getElementById('mobile-menu-panel');
    
    if (!menuToggle || !menuOverlay || !menuPanel) {
        return;
    }
    
    menuToggle.classList.add('active');
    menuOverlay.classList.add('active');
    menuPanel.classList.add('active');
    
    document.body.classList.add('menu-open');
    
    setTimeout(() => {
        const firstLink = document.querySelector('.mobile-nav-link');
        if (firstLink) firstLink.focus();
    }, 100);
}

/**
 * Cierra el menú móvil
 */
function closeMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const menuOverlay = document.getElementById('mobile-menu-overlay');
    const menuPanel = document.getElementById('mobile-menu-panel');
    
    if (!menuToggle || !menuOverlay || !menuPanel) {
        return;
    }
    
    menuToggle.classList.remove('active');
    menuOverlay.classList.remove('active');
    menuPanel.classList.remove('active');
    
    document.body.classList.remove('menu-open');
}

/**
 * Verifica si el menú móvil está abierto
 */
function isMobileMenuOpen() {
    const menuPanel = document.getElementById('mobile-menu-panel');
    return menuPanel && menuPanel.classList.contains('active');
}

/**
 * Navega a una sección específica desde el menú móvil
 */
function navigateToMobileSection(targetId) {
    const element = document.getElementById(targetId);
    
    if (element) {
        const headerHeight = document.querySelector('header').offsetHeight || 80;
        const targetPosition = element.offsetTop - headerHeight;
        
        window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: 'smooth'
        });
    }
}

/**
 * Actualiza el enlace activo en el menú móvil
 */
function updateActiveMobileLink(activeLink) {
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Sincronizar con navegación desktop
    const href = activeLink?.getAttribute('href');
    if (href) {
        document.querySelectorAll('nav ul li a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === href) {
                link.classList.add('active');
            }
        });
    }
}

// Hacer las funciones disponibles globalmente
window.openMobileMenu = openMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.initMobileMenu = initMobileMenu;
// Hacer la función disponible globalmente para debugging
window.testMobileMenu = testMobileMenu;


// Exportar funciones para que Google Maps pueda acceder globalmente
window.initMap = initMap;