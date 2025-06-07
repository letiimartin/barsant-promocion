/**
 * Archivo principal para la web de Barsant Promociones - Ventanilla
 * Punto de entrada que importa todos los módulos necesarios
 */


import { fetchAllViviendas, getViviendaId} from '../../loadVivienda.js';



// Importar utilidades
import { 
  formatCurrency, 
  validateField, 
  handleFormSubmit 
} from './utils/index.js';


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
// Lista de viviendas obtenidas desde Firebase
window.viviendas = [];

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Aplicación Barsant Ventanilla inicializada correctamente');

  try {
    await waitForElement('#viviendas-table');
    window.viviendas = await fetchAllViviendas();
  } catch (err) {
    console.error('Error al cargar viviendas desde Firebase:', err);
  }
  
  // Inicializar scripts específicos para el header
  initHeader();
  
  // Inicializar galerías y modales
  initGallery();
  
  // Inicializar tabla de propiedades
  initPropertiesTable();
  
  // Inicializar formulario de contacto
  setupContactForm();
  
  // Active Navigation Link
  setupNavigation();
  
  // Inicializar el mapa de ubicación
  initMap();
});

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
 * Inicializa la galería y el modal
 */
function initGallery() {
  const modal = document.getElementById('gallery-modal');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  if (!galleryItems.length || !modal) return;
  
  // Abrir modal al hacer clic en una imagen
  galleryItems.forEach(item => {
    item.addEventListener('click', function() {
      const imgSrc = this.style.backgroundImage.slice(4, -1).replace(/"/g, "");
      document.querySelector('.modal-body').innerHTML = `<img src="${imgSrc}" alt="Imagen ampliada">`;
      modal.style.display = 'flex';
    });
  });
  
  // Cerrar modal
  const closeModal = document.querySelector('.close-modal');
  if (closeModal) {
    closeModal.addEventListener('click', function() {
      modal.style.display = 'none';
    });
  }
  
  // También cerrar al hacer clic fuera de la imagen
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
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
  
  if (window.viviendas && window.viviendas.length) {
    displayViviendas(window.viviendas);
  }
}

/**
 * Inicializar el mapa de ubicación
 */
function initMap() {
  try {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;
    
    const location = { lat: 37.182258, lng: -3.603283 }; // Coordenadas precisas de Calle Ventanilla, Granada
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

    // Añadir InfoWindow
    const infoWindow = new google.maps.InfoWindow({
      content: '<h3>Ventanilla Residencial</h3><p>Calle Ventanilla, Granada<br>33 viviendas modernas en el corazón de Granada</p>'
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });
  } catch (error) {
    console.error('Error al cargar el mapa:', error);
    document.getElementById('map-container').innerHTML = '<p>Error al cargar el mapa. Por favor, verifica tu conexión o intenta de nuevo más tarde.</p>';
  }
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
  vivs.forEach(v => {
    const row = document.createElement('tr');
    const estadoClass = v.estado === 'Reservado' ? 'estado-reservado' : 'estado-disponible';
    const id = getViviendaId(v);
    const plantaTexto = mapPlantaNumeroALetra(v.planta);
    const pisoLabel = `${plantaTexto} ${v.letra || ''}`.trim();
    const planoLink = v.link_plano ? `<a href="${v.link_plano}" target="_blank">Ver plano</a>` : '-';

    row.innerHTML = `
      <td>${v.bloque}</td>
      <td>${pisoLabel}</td>
      <td>${v.dormitorios}</td>
      <td>${v.baños}</td>
      <td>${(v.sup_construida || v.sup_total || 0).toFixed(2)} m²</td>
      <td>€${v.precio?.toLocaleString() || ''}</td>
      <td>${planoLink}</td>
      <td class="${estadoClass}">${v.estado}</td>
      <td><a href="viviendas/template-viviendas.html?id=${id}" class="vivienda-link">Más información</a></td>`;
    
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
/**
 * Configura el formulario de contacto
 */
function setupContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Formulario enviado. Nos pondremos en contacto contigo pronto.');
    this.reset();
  });
}

/**
 * Configura la navegación activa
 */
function setupNavigation() {
  const navLinks = document.querySelectorAll('nav a');
  
  window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (pageYOffset >= sectionTop - 60) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current)) {
        link.classList.add('active');
      }
    });
  });
}

// Exportar funciones para que Google Maps pueda acceder a initMap globalmente
window.initMap = initMap;
