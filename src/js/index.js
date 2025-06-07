/**
 * Archivo principal para la web de Barsant Promociones - Ventanilla
 * Punto de entrada que importa todos los módulos necesarios
 */

// Importar los estilos principales
import '../css/styles.css';
import { fetchAllViviendas } from '../../loadVivienda.js';

// Importar componentes
import './components/index.js';

// Importar utilidades
import { 
  formatCurrency, 
  validateField, 
  handleFormSubmit 
} from './utils/index.js';

// Importar funcionalidades específicas
import './main.js';

// Lista de viviendas obtenidas desde Firebase
window.viviendas = [];

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Aplicación Barsant Ventanilla inicializada correctamente');

  try {
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

/**
 * Filtra viviendas según los criterios seleccionados
 */
function filterViviendas() {
  const plantaFilter = document.getElementById('planta-filter');
  const dormitoriosFilter = document.getElementById('dormitorios-filter');
  
  if (!plantaFilter || !dormitoriosFilter || !window.viviendas) return;
  
  const planta = plantaFilter.value;
  const dormitorios = dormitoriosFilter.value;

  let filtered = [...window.viviendas];

  if (planta) {
    filtered = filtered.filter(v => {
      const text = (v.piso || v.planta || '').toString().toLowerCase();
      return text.includes(planta.toLowerCase());
    });
  }
  
  if (dormitorios) {
    filtered = filtered.filter(v => v.dormitorios == dormitorios);
  }

  displayViviendas(filtered);
}

/**
 * Muestra las viviendas filtradas en la tabla
 */
function displayViviendas(viviendas) {
  // Cambiamos la forma de obtener la tabla
  const viviendasTable = document.getElementById('viviendas-table');
  
  if (!viviendasTable) {
    console.error('No se encontró la tabla de viviendas con ID "viviendas-table"');
    return;
  }
  
  console.log('Mostrando', viviendas.length, 'viviendas en la tabla');
  
  // Limpiar tabla
  viviendasTable.innerHTML = '';
  
  // Insertar filas
  viviendas.forEach(v => {
    const row = document.createElement('tr');
    row.className = 'vivienda-row';
    const estadoClass = v.estado === 'Reservado' ? 'estado-reservado' : 'estado-disponible';
    const viviendaId = v.id || `${v.bloque}-${v.planta || v.piso}`.toLowerCase().replace(/\s+/g, '-');
    const pisoLabel = v.piso || `${v.planta} ${v.letra}`;
    
    row.innerHTML = `
      <td><a href="viviendas/template-viviendas.html?id=${viviendaId}" class="vivienda-link">${v.bloque}</a></td>
      <td><a href="viviendas/template-viviendas.html?id=${viviendaId}" class="vivienda-link">${pisoLabel}</a></td>
      <td>${v.dormitorios}</td>
      <td>${v.baños}</td>
      <td>${(v.supConst || v.sup_construida || v.sup_total).toFixed(2)} m²</td>
      <td>€${v.precio.toLocaleString()}</td>
      <td class="${estadoClass}">${v.estado}</td>
      <td>
        <i class="fas fa-download plano-icon" title="Descargar plano"></i>
        <i class="fas fa-eye plano-icon" title="Ver plano"></i>
      </td>
    `;

    row.addEventListener('click', (e) => {
      if (!e.target.classList.contains('plano-icon')) {
        window.location.href = `viviendas/template-viviendas.html?id=${viviendaId}`;
      }
    });
    
    viviendasTable.appendChild(row);
  });
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
