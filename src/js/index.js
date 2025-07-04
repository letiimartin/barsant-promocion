/**
 * Archivo principal para la web de Barsant Promociones - Ventanilla
 * Punto de entrada que importa todos los módulos necesarios
 */


import { fetchAllViviendas, getViviendaId} from '../../dataService.js';



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
const getImageName = (imagePath, index = 0) => {
  const fileName = imagePath.split('/').pop().split('.')[0];
  const nameMap = {
    '01_ALZ_1_CULT_R': 'Vista alzado 1',
    '02_ALZ_2_CULT_R': 'Vista alzado 2', 
    '03_ALZ_3_CULT_R': 'Vista alzado 3',
    '04_ALZ_4_CULT_R': 'Vista alzado 4',
    '05_ALZ_5_CULT_R': 'Vista alzado 5',
    '06_ALZ_COMPLETO_CULT_R': 'Vista completa',
    '07_ALZ_COMPLETO_ESQUINA_CULT_R': 'Vista esquina',
    '08_IMG_AEREA_1': 'Vista aérea 1',
    '09_IMG_AEREA_2': 'Vista aérea 2',
    '10_IMG_PATIO_1': 'Patio interior 1',
    '11_IMG_PATIO_2': 'Patio interior 2',
    '12_IMG_PATIO_3': 'Patio interior 3',
    '13_IMG_PATIO_4': 'Patio interior 4',
    '14_IMG_PATIO_5': 'Patio interior 5',
    '15_IMG_PLANTA_1': 'Distribución planta 1',
    '16_IMG_PLANTA_2': 'Distribución planta 2',
    '17_IMG_PLANTA_3': 'Distribución planta 3',
    '18_IMG_BAÑO_P1': 'Baño principal 1',
    '19_IMG_BAÑO_P2': 'Baño principal 2',
    '20_IMG_BAÑO_P3': 'Baño principal 3',
    '21_IMG_DORM_P1': 'Dormitorio principal 1',
    '22_IMG_DORM_P2': 'Dormitorio principal 2'
  };
  return nameMap[fileName] || `Imagen ${index + 1}`;
};


/**
 * Inicializa la galería con imagen principal y thumbnails
 */
function initGallery() {
  // Obtener imágenes existentes del HTML
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryImages = [];
  
  // Extraer URLs de las imágenes existentes
  galleryItems.forEach(item => {
    const bgImage = item.style.backgroundImage;
    if (bgImage) {
      // Extraer URL del background-image
      const imageUrl = bgImage.slice(4, -1).replace(/"/g, "");
      galleryImages.push(imageUrl);
    }
  });

  if (galleryImages.length === 0) {
    console.warn('No se encontraron imágenes en la galería');
    return;
  }

  let currentImageIndex = 0;
  
  // Crear estructura de la galería mejorada
  createGalleryStructure(galleryImages);
  
  // Configurar navegación
  setupGalleryNavigation(galleryImages);
  
  // Configurar modal para vista completa
  setupGalleryModal(galleryImages);
}

/**
 * Crea la estructura HTML de la galería
 */
function createGalleryStructure(images) {
  const galleryContainer = document.querySelector('.gallery-grid');
  if (!galleryContainer) return;

  // Limpiar contenido existente
  galleryContainer.innerHTML = '';
  
  // Generar nombres descriptivos para las imágenes
  function getImageName(imagePath, index) {
    const fileName = imagePath.split('/').pop().split('.')[0];
    
    // Mapear nombres más descriptivos basados en el patrón de nombres
    const nameMap = {
      '01_ALZ_1_CULT_R': 'Vista alzado 1',
      '02_ALZ_2_CULT_R': 'Vista alzado 2', 
      '03_ALZ_3_CULT_R': 'Vista alzado 3',
      '04_ALZ_4_CULT_R': 'Vista alzado 4',
      '05_ALZ_5_CULT_R': 'Vista alzado 5',
      '06_ALZ_COMPLETO_CULT_R': 'Vista completa',
      '07_ALZ_COMPLETO_ESQUINA_CULT_R': 'Vista esquina',
      '08_IMG_AEREA_1': 'Vista aérea 1',
      '09_IMG_AEREA_2': 'Vista aérea 2',
      '10_IMG_PATIO_1': 'Patio interior 1',
      '11_IMG_PATIO_2': 'Patio interior 2',
      '12_IMG_PATIO_3': 'Patio interior 3',
      '13_IMG_PATIO_4': 'Patio interior 4',
      '14_IMG_PATIO_5': 'Patio interior 5',
      '15_IMG_PLANTA_1': 'Distribución planta 1',
      '16_IMG_PLANTA_2': 'Distribución planta 2',
      '17_IMG_PLANTA_3': 'Distribución planta 3',
      '18_IMG_BAÑO_P1': 'Baño principal 1',
      '19_IMG_BAÑO_P2': 'Baño principal 2',
      '20_IMG_BAÑO_P3': 'Baño principal 3',
      '21_IMG_DORM_P1': 'Dormitorio principal 1',
      '22_IMG_DORM_P2': 'Dormitorio principal 2'
    };
    
    return nameMap[fileName] || `Imagen ${index + 1}`;
  }
  
  // Crear nueva estructura
  galleryContainer.innerHTML = `
    <div class="gallery-main-container">
      <!-- Imagen principal -->
      <div class="gallery-main-image">
        <img id="main-gallery-image" src="${images[0]}" alt="${getImageName(images[0], 0)}">
        <div class="gallery-nav-buttons">
          <button class="gallery-nav-btn gallery-prev" id="gallery-prev" title="Imagen anterior">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="gallery-nav-btn gallery-next" id="gallery-next" title="Siguiente imagen">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        <div class="gallery-fullscreen-btn" id="gallery-fullscreen" title="Ver en pantalla completa">
          <i class="fas fa-expand"></i>
        </div>
        <div class="gallery-image-title" id="gallery-image-title">
          ${getImageName(images[0], 0)}
        </div>
      </div>
      
      <!-- Thumbnails -->
      <div class="gallery-thumbnails" id="gallery-thumbnails">
        ${images.map((img, index) => `
          <div class="gallery-thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}" title="${getImageName(img, index)}">
            <img src="${img}" alt="${getImageName(img, index)}">
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Configura la navegación de la galería
 */
function setupGalleryNavigation(images) {
  let currentIndex = 0;
  
  const mainImage = document.getElementById('main-gallery-image');
  const imageTitle = document.getElementById('gallery-image-title');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');
  const thumbnails = document.querySelectorAll('.gallery-thumbnail');
  
  if (!mainImage || !prevBtn || !nextBtn) return;

  // Función para obtener nombre de imagen
  function getImageName(imagePath, index) {
    const fileName = imagePath.split('/').pop().split('.')[0];
    
    const nameMap = {
      '01_ALZ_1_CULT_R': 'Vista alzado 1',
      '02_ALZ_2_CULT_R': 'Vista alzado 2', 
      '03_ALZ_3_CULT_R': 'Vista alzado 3',
      '04_ALZ_4_CULT_R': 'Vista alzado 4',
      '05_ALZ_5_CULT_R': 'Vista alzado 5',
      '06_ALZ_COMPLETO_CULT_R': 'Vista completa',
      '07_ALZ_COMPLETO_ESQUINA_CULT_R': 'Vista esquina',
      '08_IMG_AEREA_1': 'Vista aérea 1',
      '09_IMG_AEREA_2': 'Vista aérea 2',
      '10_IMG_PATIO_1': 'Patio interior 1',
      '11_IMG_PATIO_2': 'Patio interior 2',
      '12_IMG_PATIO_3': 'Patio interior 3',
      '13_IMG_PATIO_4': 'Patio interior 4',
      '14_IMG_PATIO_5': 'Patio interior 5',
      '15_IMG_PLANTA_1': 'Distribución planta 1',
      '16_IMG_PLANTA_2': 'Distribución planta 2',
      '17_IMG_PLANTA_3': 'Distribución planta 3',
      '18_IMG_BAÑO_P1': 'Baño principal 1',
      '19_IMG_BAÑO_P2': 'Baño principal 2',
      '20_IMG_BAÑO_P3': 'Baño principal 3',
      '21_IMG_DORM_P1': 'Dormitorio principal 1',
      '22_IMG_DORM_P2': 'Dormitorio principal 2'
    };
    
    return nameMap[fileName] || `Imagen ${index + 1}`;
  }

  // Función para cambiar imagen
  function changeImage(newIndex) {
    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;
    
    currentIndex = newIndex;
    
    // Cambiar imagen principal con transición suave
    mainImage.style.opacity = '0';
    
    setTimeout(() => {
      mainImage.src = images[currentIndex];
      mainImage.alt = getImageName(images[currentIndex], currentIndex);
      
      // Actualizar título de la imagen
      if (imageTitle) {
        imageTitle.textContent = getImageName(images[currentIndex], currentIndex);
      }
      
      mainImage.style.opacity = '1';
    }, 150);
    
    // Actualizar thumbnail activo
    thumbnails.forEach((thumb, index) => {
      thumb.classList.toggle('active', index === currentIndex);
    });
    
    // Scroll automático a thumbnail activo si es necesario
    const activeThumbnail = thumbnails[currentIndex];
    if (activeThumbnail) {
      activeThumbnail.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }

  // Navegación con botones
  prevBtn.addEventListener('click', () => changeImage(currentIndex - 1));
  nextBtn.addEventListener('click', () => changeImage(currentIndex + 1));

  // Navegación con thumbnails
  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', () => changeImage(index));
  });

  // Navegación con teclado (solo cuando la galería está en viewport)
  let galleryInView = false;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      galleryInView = entry.isIntersecting;
    });
  }, { threshold: 0.3 });
  
  const gallerySection = document.getElementById('gallery');
  if (gallerySection) {
    observer.observe(gallerySection);
  }

  document.addEventListener('keydown', (e) => {
    if (galleryInView && !document.querySelector('.modal[style*="flex"]')) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        changeImage(currentIndex - 1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        changeImage(currentIndex + 1);
      }
    }
  });
}

/**
 * Configura el modal para vista a pantalla completa
 */
function setupGalleryModal(images) {
  let currentModalIndex = 0;
  
  const modal = document.getElementById('gallery-modal');
  const fullscreenBtn = document.getElementById('gallery-fullscreen');
  
  if (!modal || !fullscreenBtn) return;

  // Crear estructura del modal mejorada
  const modalBody = modal.querySelector('.modal-body');
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="modal-gallery-container">
        <img id="modal-gallery-image" src="" alt="Imagen en pantalla completa">
        <div class="modal-nav-buttons">
          <button class="modal-nav-btn modal-prev" id="modal-prev">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="modal-nav-btn modal-next" id="modal-next">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        <div class="modal-counter" id="modal-counter">
          <span id="current-image-num">1</span> / <span id="total-images">${images.length}</span>
        </div>
      </div>
    `;
  }

  const modalImage = document.getElementById('modal-gallery-image');
  const modalPrev = document.getElementById('modal-prev');
  const modalNext = document.getElementById('modal-next');
  const currentImageNum = document.getElementById('current-image-num');
  const closeModal = document.querySelector('.close-modal');

  // Función para cambiar imagen en modal
  function changeModalImage(newIndex) {
    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;
    
    currentModalIndex = newIndex;
    
    if (modalImage) {
      modalImage.style.opacity = '0';
      setTimeout(() => {
        modalImage.src = images[currentModalIndex];
        modalImage.style.opacity = '1';
      }, 150);
    }
    
    if (currentImageNum) {
      currentImageNum.textContent = currentModalIndex + 1;
    }
  }

  // Abrir modal
  fullscreenBtn.addEventListener('click', () => {
    const mainImage = document.getElementById('main-gallery-image');
    if (mainImage) {
      // Encontrar índice de la imagen actual
      currentModalIndex = images.findIndex(img => img === mainImage.src.split('/').pop());
      if (currentModalIndex === -1) currentModalIndex = 0;
      
      changeModalImage(currentModalIndex);
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  });

  // Navegación en modal
  if (modalPrev) {
    modalPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      changeModalImage(currentModalIndex - 1);
    });
  }

  if (modalNext) {
    modalNext.addEventListener('click', (e) => {
      e.stopPropagation();
      changeModalImage(currentModalIndex + 1);
    });
  }

  // Cerrar modal
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });
  }

  // Cerrar con ESC o click fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'flex') {
      switch(e.key) {
        case 'Escape':
          modal.style.display = 'none';
          document.body.style.overflow = 'auto';
          break;
        case 'ArrowLeft':
          changeModalImage(currentModalIndex - 1);
          break;
        case 'ArrowRight':
          changeModalImage(currentModalIndex + 1);
          break;
      }
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

  // Elimina duplicados por bloque+planta+letra
  const seen = new Set();
  const viviendasSinDuplicar = vivs.filter(v => {
    const key = `${v.bloque}|${v.planta}|${v.letra}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Ordena viviendas (como antes)
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
      <td>${(v.sup_construida || v.sup_total || 0).toFixed(2)} m²</td>
      <td>€${v.precio?.toLocaleString() || ''}</td>
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
