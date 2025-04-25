/**
 * Archivo principal para la web de Barsant Promociones - Ventanilla
 * Punto de entrada que importa todos los módulos necesarios
 */

// Importar los estilos principales
import '../css/styles.css';

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

// Datos de viviendas (copiados del original)
window.viviendas = [
    // Bloque A (9 viviendas)
    { bloque: 'A', piso: 'Primero A', dormitorios: 2, baños: 2, supUtil: 54.35, supConst: 79.60, precio: 274620, estado: 'Disponible' },
    { bloque: 'A', piso: 'Primero B', dormitorios: 1, baños: 1, supUtil: 36.78, supConst: 50.58, precio: 187146, estado: 'Disponible' },
    { bloque: 'A', piso: 'Primero C', dormitorios: 1, baños: 1, supUtil: 36.91, supConst: 51.34, precio: 189958, estado: 'Disponible' },
    { bloque: 'A', piso: 'Segundo A', dormitorios: 2, baños: 2, supUtil: 68.65, supConst: 98.71, precio: 365227, estado: 'Disponible' },
    { bloque: 'A', piso: 'Segundo B', dormitorios: 2, baños: 2, supUtil: 76.16, supConst: 103.73, precio: 394174, estado: 'Disponible' },
    { bloque: 'A', piso: 'Tercero A', dormitorios: 2, baños: 2, supUtil: 68.65, supConst: 98.71, precio: 375098, estado: 'Disponible' },
    { bloque: 'A', piso: 'Tercero B', dormitorios: 2, baños: 2, supUtil: 76.01, supConst: 103.73, precio: 404547, estado: 'Disponible' },
    { bloque: 'A', piso: 'Cuarto A', dormitorios: 2, baños: 2, supUtil: 68.61, supConst: 98.71, precio: 394840, estado: 'Disponible' },
    { bloque: 'A', piso: 'Cuarto B', dormitorios: 2, baños: 2, supUtil: 75.97, supConst: 103.73, precio: 425293, estado: 'Disponible' },
    
    // Bloque B (10 viviendas)
    { bloque: 'B', piso: 'Primero A', dormitorios: 1, baños: 1, supUtil: 36.85, supConst: 49.71, precio: 186412.5, estado: 'Disponible' },
    { bloque: 'B', piso: 'Primero B', dormitorios: 1, baños: 1, supUtil: 36.39, supConst: 49.23, precio: 184612.5, estado: 'Disponible' },
    { bloque: 'B', piso: 'Primero C', dormitorios: 1, baños: 1, supUtil: 36.92, supConst: 50.64, precio: 189900, estado: 'Disponible' },
    { bloque: 'B', piso: 'Primero D', dormitorios: 1, baños: 1, supUtil: 37.03, supConst: 50.64, precio: 189900, estado: 'Disponible' },
    { bloque: 'B', piso: 'Segundo A', dormitorios: 3, baños: 2, supUtil: 87.58, supConst: 117.84, precio: 447792, estado: 'Disponible' },
    { bloque: 'B', piso: 'Segundo B', dormitorios: 2, baños: 2, supUtil: 76.54, supConst: 103.51, precio: 393338, estado: 'Disponible' },
    { bloque: 'B', piso: 'Tercero A', dormitorios: 3, baños: 2, supUtil: 87.59, supConst: 117.84, precio: 459576, estado: 'Disponible' },
    { bloque: 'B', piso: 'Tercero B', dormitorios: 2, baños: 2, supUtil: 76.45, supConst: 103.51, precio: 403689, estado: 'Disponible' },
    { bloque: 'B', piso: 'Cuarto A', dormitorios: 3, baños: 2, supUtil: 87.60, supConst: 117.84, precio: 483144, estado: 'Disponible' },
    { bloque: 'B', piso: 'Cuarto B', dormitorios: 2, baños: 2, supUtil: 76.34, supConst: 103.51, precio: 424391, estado: 'Disponible' },
    
    // Bloque C (4 viviendas)
    { bloque: 'C', piso: 'Primero A', dormitorios: 2, baños: 2, supUtil: 50.83, supConst: 82.72, precio: 281248, estado: 'Disponible' },
    { bloque: 'C', piso: 'Segundo A', dormitorios: 2, baños: 2, supUtil: 60.49, supConst: 98.17, precio: 343595, estado: 'Disponible' },
    { bloque: 'C', piso: 'Tercero A', dormitorios: 2, baños: 2, supUtil: 60.49, supConst: 98.17, precio: 353412, estado: 'Disponible' },
    { bloque: 'C', piso: 'Cuarto A', dormitorios: 2, baños: 2, supUtil: 58.90, supConst: 98.17, precio: 392680, estado: 'Disponible' },
    
    // Bloque D (8 viviendas)
    { bloque: 'D', piso: 'Primero A', dormitorios: 2, baños: 2, supUtil: 63.87, supConst: 98.14, precio: 318955, estado: 'Disponible' },
    { bloque: 'D', piso: 'Primero B', dormitorios: 1, baños: 1, supUtil: 38.55, supConst: 57.80, precio: 202300, estado: 'Disponible' },
    { bloque: 'D', piso: 'Segundo A', dormitorios: 1, baños: 1, supUtil: 36.96, supConst: 58.35, precio: 210060, estado: 'Disponible' },
    { bloque: 'D', piso: 'Segundo B', dormitorios: 1, baños: 1, supUtil: 34.46, supConst: 52.61, precio: 189396, estado: 'Disponible' },
    { bloque: 'D', piso: 'Segundo C', dormitorios: 1, baños: 1, supUtil: 35.99, supConst: 54.95, precio: 197820, estado: 'Disponible' },
    { bloque: 'D', piso: 'Tercero A', dormitorios: 1, baños: 1, supUtil: 36.96, supConst: 58.35, precio: 215895, estado: 'Disponible' },
    { bloque: 'D', piso: 'Tercero B', dormitorios: 1, baños: 1, supUtil: 34.46, supConst: 52.61, precio: 194657, estado: 'Disponible' },
    { bloque: 'D', piso: 'Tercero C', dormitorios: 1, baños: 1, supUtil: 35.99, supConst: 54.95, precio: 203315, estado: 'Disponible' },
    
    // Bloque E (2 viviendas)
    { bloque: 'E', piso: 'Primero A', dormitorios: 2, baños: 2, supUtil: 64.65, supConst: 105.69, precio: 338208, estado: 'Disponible' },
    { bloque: 'E', piso: 'Segundo A', dormitorios: 2, baños: 2, supUtil: 72.18, supConst: 119.16, precio: 428976, estado: 'Disponible' }
];

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
  console.log('Aplicación Barsant Ventanilla inicializada correctamente');
  
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
  
  // Carga inicial de viviendas
  if (window.viviendas) {
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
    filtered = filtered.filter(v => v.piso.includes(planta));
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
    const viviendaId = `${v.bloque}-${v.piso.replace(' ', '-')}`.toLowerCase();
    
    row.innerHTML = `
      <td><a href="viviendas/${viviendaId}.html" class="vivienda-link">${v.bloque}</a></td>
      <td><a href="viviendas/${viviendaId}.html" class="vivienda-link">${v.piso}</a></td>
      <td>${v.dormitorios}</td>
      <td>${v.baños}</td>
      <td>${v.supConst.toFixed(2)} m²</td>
      <td>€${v.precio.toLocaleString()}</td>
      <td class="${estadoClass}">${v.estado}</td>
      <td>
        <i class="fas fa-download plano-icon" title="Descargar plano"></i>
        <i class="fas fa-eye plano-icon" title="Ver plano"></i>
      </td>
    `;

    row.addEventListener('click', (e) => {
      if (!e.target.classList.contains('plano-icon')) {
        window.location.href = `viviendas/${viviendaId}.html`;
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
