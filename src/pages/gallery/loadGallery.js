// ========================
// GALERÍA TIPO SLIDER - ESTILO GRALUSA
// ========================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🖼️ Inicializando galería tipo slider...');
  loadGalleryHTML();
});

// Variables globales
let galleryImages = [];
let currentImageIndex = 0;
let thumbnailScrollPosition = 0;

// ========================
// CARGA INICIAL
// ========================
async function loadGalleryHTML() {
  try {
      const response = await fetch('src/pages/gallery/gallery.html');
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      
      const html = await response.text();
      const placeholder = document.getElementById('gallery-placeholder');
      
      if (!placeholder) throw new Error('No existe #gallery-placeholder');
      
      placeholder.innerHTML = html;
      console.log('✅ HTML de galería cargado');
      
      // Cargar CSS
      loadGalleryCSS();
      
      // Inicializar galería
      await initSliderGallery();
      
  } catch (error) {
      console.error('Error al cargar gallery.html:', error);
      showGalleryError(error.message);
  }
}

function loadGalleryCSS() {
  if (document.querySelector('link[href*="gallery.css"]')) {
      console.log('CSS de galería ya cargado');
      return;
  }
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'src/css/pages/gallery.css';
  link.onload = () => console.log('✅ CSS de galería cargado');
  link.onerror = () => console.warn('⚠️ Error cargando CSS de galería');
  
  document.head.appendChild(link);
}

// ========================
// INICIALIZACIÓN PRINCIPAL
// ========================
async function initSliderGallery() {
  console.log('🎨 Inicializando slider de galería...');
  
  // Mostrar estado de carga
  showGalleryLoading();
  
  try {
      // Cargar imágenes desde Firebase
      const { cargarGaleriaFirebaseOptimizada } = await import('../../../dataService.js');
      galleryImages = await cargarGaleriaFirebaseOptimizada();
      
      if (!galleryImages || galleryImages.length === 0) {
          throw new Error('No se encontraron imágenes en Firebase Storage');
      }
      
      console.log(`✅ ${galleryImages.length} imágenes cargadas`);
      
      // Recargar el HTML completo para asegurar que existe
      await reloadGalleryHTML();
      
      // Configurar la galería con un pequeño delay
      setTimeout(() => {
          setupSliderGallery();
          setupGalleryEvents();
      }, 200);
      
  } catch (error) {
      console.error('❌ Error cargando galería:', error);
      showGalleryError(error.message);
  }
}

async function reloadGalleryHTML() {
  try {
      const response = await fetch('src/pages/gallery/gallery.html');
      const html = await response.text();
      const placeholder = document.getElementById('gallery-placeholder');
      
      if (placeholder) {
          placeholder.innerHTML = html;
          console.log('✅ HTML de galería recargado');
      }
  } catch (error) {
      console.warn('⚠️ Error recargando HTML:', error);
  }
}

// ========================
// CONFIGURACIÓN DEL SLIDER
// ========================
function setupSliderGallery() {
  // Verificar que los elementos existen antes de continuar
  const thumbnailsContainer = document.getElementById('gallery-thumbnails');
  const mainImage = document.getElementById('main-gallery-image');
  
  if (!thumbnailsContainer || !mainImage) {
      console.error('❌ Elementos de galería no encontrados');
      setTimeout(() => setupSliderGallery(), 500); // Reintentar después de 500ms
      return;
  }
  
  // Crear thumbnails
  createThumbnails();
  
  // Esperar un momento para que se renderice el DOM
  setTimeout(() => {
      // Mostrar primera imagen
      showMainImage(0);
      
      // Configurar navegación con teclado
      setupKeyboardNavigation();
      
      console.log('✅ Slider de galería configurado');
  }, 100);
}

function createThumbnails() {
  const thumbnailsContainer = document.getElementById('gallery-thumbnails');
  if (!thumbnailsContainer) {
      console.error('❌ Contenedor de thumbnails no encontrado');
      return;
  }
  
  thumbnailsContainer.innerHTML = '';
  
  galleryImages.forEach((imagen, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.className = 'gallery-thumbnail';
      thumbnail.dataset.index = index;
      
      if (index === 0) {
          thumbnail.classList.add('active');
      }
      
      thumbnail.innerHTML = `
          <img src="${imagen.url}" 
               alt="${getNombreImagen(imagen.nombre, index)}"
               loading="lazy"
               onerror="handleImageError(this, ${index})">
      `;
      
      // Evento click
      thumbnail.addEventListener('click', () => {
          showMainImage(index);
      });
      
      thumbnailsContainer.appendChild(thumbnail);
  });
  
  console.log(`✅ ${galleryImages.length} thumbnails creados`);
}

function showMainImage(index) {
  if (!galleryImages[index]) {
      console.warn(`⚠️ Imagen ${index} no encontrada`);
      return;
  }
  
  currentImageIndex = index;
  const imagen = galleryImages[index];
  const mainImage = document.getElementById('main-gallery-image');
  const mainTitle = document.getElementById('main-image-title');
  
  if (mainImage) {
      mainImage.src = imagen.url;
      mainImage.alt = getNombreImagen(imagen.nombre, index);
      mainImage.classList.add('fade-in');
  }
  
  if (mainTitle) {
      mainTitle.textContent = getNombreImagen(imagen.nombre, index);
  }
  
  // Actualizar botones de navegación
  updateNavigationButtons();
  
  // Actualizar thumbnail activo
  setActiveThumbnail(index);
  
  // Scroll automático de thumbnails si es necesario (con delay para asegurar render)
  setTimeout(() => {
      scrollToActiveThumbnail(index);
  }, 50);
}

function setActiveThumbnail(index) {
  const thumbnails = document.querySelectorAll('.gallery-thumbnail');
  
  thumbnails.forEach((thumb, i) => {
      if (i === index) {
          thumb.classList.add('active');
      } else {
          thumb.classList.remove('active');
      }
  });
}

// ========================
// NAVEGACIÓN
// ========================
function changeMainImage(direction) {
  let newIndex = currentImageIndex + direction;
  
  // Navegación circular
  if (newIndex >= galleryImages.length) {
      newIndex = 0;
  } else if (newIndex < 0) {
      newIndex = galleryImages.length - 1;
  }
  
  showMainImage(newIndex);
  setActiveThumbnail(newIndex);
}

function updateNavigationButtons() {
  const prevBtn = document.querySelector('.gallery-prev');
  const nextBtn = document.querySelector('.gallery-next');
  
  // En navegación circular, los botones siempre están activos
  // Si quieres desactivarlos en los extremos, usa esto:
  /*
  if (prevBtn) {
      prevBtn.disabled = currentImageIndex === 0;
  }
  if (nextBtn) {
      nextBtn.disabled = currentImageIndex === galleryImages.length - 1;
  }
  */
}

function scrollThumbnails(direction) {
  const container = document.getElementById('gallery-thumbnails');
  if (!container) return;
  
  const scrollAmount = 130; // Ancho del thumbnail + gap
  const newPosition = container.scrollLeft + (direction * scrollAmount);
  
  container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
  });
  
  // Actualizar estado de botones de scroll
  updateThumbnailNavButtons();
}

function scrollToActiveThumbnail(index) {
  const container = document.getElementById('gallery-thumbnails');
  
  if (!container) {
      console.warn('⚠️ Contenedor de thumbnails no encontrado');
      return;
  }
  
  // Verificar que el container tiene children
  if (!container.children || container.children.length === 0) {
      console.warn('⚠️ No hay thumbnails en el contenedor');
      return;
  }
  
  const thumbnail = container.children[index];
  
  if (!thumbnail) {
      console.warn(`⚠️ Thumbnail ${index} no encontrado`);
      return;
  }
  
  const containerWidth = container.clientWidth;
  const thumbnailLeft = thumbnail.offsetLeft;
  const thumbnailWidth = thumbnail.offsetWidth;
  
  // Calcular posición de scroll para centrar el thumbnail
  const scrollPosition = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);
  
  container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
  });
  
  setTimeout(updateThumbnailNavButtons, 300);
}

function updateThumbnailNavButtons() {
  const container = document.getElementById('gallery-thumbnails');
  const leftBtn = document.querySelector('.thumbnail-nav-left');
  const rightBtn = document.querySelector('.thumbnail-nav-right');
  
  if (!container || !leftBtn || !rightBtn) return;
  
  const isAtStart = container.scrollLeft <= 0;
  const isAtEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth;
  
  leftBtn.disabled = isAtStart;
  rightBtn.disabled = isAtEnd;
}

// ========================
// FULLSCREEN
// ========================
function openFullscreen() {
  const modal = document.getElementById('gallery-fullscreen-modal');
  const fullscreenImage = document.getElementById('fullscreen-image');
  const fullscreenTitle = document.getElementById('fullscreen-title');
  const currentCounter = document.getElementById('fullscreen-current');
  const totalCounter = document.getElementById('fullscreen-total');
  
  if (!modal) return;
  
  const currentImage = galleryImages[currentImageIndex];
  
  if (fullscreenImage) {
      fullscreenImage.src = currentImage.url;
      fullscreenImage.alt = getNombreImagen(currentImage.nombre, currentImageIndex);
  }
  
  if (fullscreenTitle) {
      fullscreenTitle.textContent = getNombreImagen(currentImage.nombre, currentImageIndex);
  }
  
  if (currentCounter) {
      currentCounter.textContent = currentImageIndex + 1;
  }
  
  if (totalCounter) {
      totalCounter.textContent = galleryImages.length;
  }
  
  modal.classList.add('active');
  document.body.classList.add('fullscreen-open');
}

function closeFullscreen() {
  const modal = document.getElementById('gallery-fullscreen-modal');
  
  if (modal) {
      modal.classList.remove('active');
      document.body.classList.remove('fullscreen-open');
  }
}

function updateFullscreenContent() {
  const fullscreenImage = document.getElementById('fullscreen-image');
  const fullscreenTitle = document.getElementById('fullscreen-title');
  const currentCounter = document.getElementById('fullscreen-current');
  
  if (!fullscreenImage) return;
  
  const currentImage = galleryImages[currentImageIndex];
  
  fullscreenImage.src = currentImage.url;
  fullscreenImage.alt = getNombreImagen(currentImage.nombre, currentImageIndex);
  
  if (fullscreenTitle) {
      fullscreenTitle.textContent = getNombreImagen(currentImage.nombre, currentImageIndex);
  }
  
  if (currentCounter) {
      currentCounter.textContent = currentImageIndex + 1;
  }
}

// ========================
// EVENTOS
// ========================
function setupGalleryEvents() {
  // Scroll de thumbnails
  const thumbnailsContainer = document.getElementById('gallery-thumbnails');
  if (thumbnailsContainer) {
      thumbnailsContainer.addEventListener('scroll', updateThumbnailNavButtons);
  }
  
  // Resize window
  window.addEventListener('resize', handleWindowResize);
  
  // Actualizar botones iniciales
  setTimeout(updateThumbnailNavButtons, 500);
}

function setupKeyboardNavigation() {
  document.addEventListener('keydown', (event) => {
      const modal = document.getElementById('gallery-fullscreen-modal');
      const isFullscreenOpen = modal && modal.classList.contains('active');
      
      switch(event.key) {
          case 'ArrowLeft':
              event.preventDefault();
              changeMainImage(-1);
              if (isFullscreenOpen) {
                  updateFullscreenContent();
              }
              break;
          case 'Escape':
              if (isFullscreenOpen) {
                  event.preventDefault();
                  closeFullscreen();
              }
              break;
      }
  });
}

function handleWindowResize() {
  // Recalcular posición de thumbnails
  updateThumbnailNavButtons();
  
  // Reajustar scroll si es necesario
  scrollToActiveThumbnail(currentImageIndex);
}

// ========================
// UTILIDADES
// ========================
function getNombreImagen(nombreArchivo, index) {
  const fileName = nombreArchivo.split('.')[0];
  
  const nameMap = {
      // Alzados y vistas exteriores
      '01_ALZ_1_CULT_R': 'Imagen 1 Fachada',
      '02_ALZ_2_CULT_R': 'Imagen 2 Fachada', 
      '03_ALZ_3_CULT_R': 'Imagen 3 Fachada',
      '04_ALZ_4_CULT_R': 'Imagen 4 Fachada',
      '05_ALZ_5_CULT_R': 'Imagen 5 Fachada',
      '06_ALZ_COMPLETO_CULT_R': 'Imagen Completa Fachada',
      '07_ALZ_COMPLETO_ESQUINA_CULT_R': 'Imagen Completa Esquina',
      
      // Vistas aéreas
      '08_IMG_AEREA_1': 'Vista Aérea General',
      '09_IMG_AEREA_2': 'Vista Aérea Lateral',
      
      // Patios interiores
      '10_IMG_PATIO_1': 'Imagen 1 Patio',
      '11_IMG_PATIO_2': 'Imagen 2 Patio',
      '12_IMG_PATIO_3': 'Imagen 3 Patio',
      '13_IMG_PATIO_4': 'Imagen 4 Patio',
      '14_IMG_PATIO_5': 'Imagen 5 Patio',
      
      // Distribuciones de plantas
      '15_IMG_PLANTA_1': 'Primera Planta',
      '16_IMG_PLANTA_2': 'Segunda Planta',
      '17_IMG_PLANTA_3': 'Tercera Planta',
      
      // Interiores actualizados (desde la 18)
      '18_IMG_BAÑO_P1': 'Imagen 1 Baño',
      '19_IMG_BAÑO_P2': 'Imagen 2 Baño',
      '20_IMG_BAÑO_P3': 'Imagen 3 Baño',
      '21_IMG_BAÑO_P4': 'Imagen 4 Baño',
      '22_IMG_BAÑO_P5': 'Imagen 5 Baño',
      '23_IMG_DORM_P1': 'Imagen 1 Dormitorio',
      '24_IMG_DORM_P2': 'Imagen 2 Dormitorio',
      '25_IMG_DORM_P3': 'Imagen 3 Dormitorio',
      '26_IMG_DORM_P4': 'Imagen 4 Dormitorio'
  };
  
  return nameMap[fileName] || `Imagen ${index + 1}`;
}

function handleImageError(img, index) {
  console.error('Error cargando imagen:', img.src);
  
  // Ocultar thumbnail problemático
  const thumbnail = img.closest('.gallery-thumbnail');
  if (thumbnail) {
      thumbnail.style.opacity = '0.5';
      thumbnail.style.pointerEvents = 'none';
  }
  
  // Si es la imagen principal, mostrar placeholder
  if (img.id === 'main-gallery-image') {
      img.alt = 'Error cargando imagen';
      img.style.background = '#f0f0f0';
  }
}

// ========================
// ESTADOS DE CARGA Y ERROR
// ========================
function showGalleryLoading() {
  const container = document.querySelector('.gallery-main-container');
  if (!container) return;
  
  container.innerHTML = `
      <div class="gallery-loading">
          <div class="spinner"></div>
          <h3>Cargando galería...</h3>
          <p>Obteniendo imágenes desde Firebase Storage...</p>
      </div>
  `;
}

function showGalleryError(message) {
  const container = document.querySelector('.gallery-main-container');
  if (!container) return;
  
  container.innerHTML = `
      <div class="gallery-error">
          <div class="error-icon">
              <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Error cargando galería</h3>
          <p>${message}</p>
          <button class="retry-btn" onclick="initSliderGallery()">
              <i class="fas fa-redo"></i>
              Reintentar
          </button>
      </div>
  `;
}

// ========================
// OPTIMIZACIONES
// ========================
function preloadNextImages() {
  // Precargar las siguientes 2-3 imágenes para mejorar la experiencia
  const startIndex = Math.max(0, currentImageIndex - 1);
  const endIndex = Math.min(galleryImages.length, currentImageIndex + 3);
  
  for (let i = startIndex; i < endIndex; i++) {
      if (i !== currentImageIndex && galleryImages[i]) {
          const img = new Image();
          img.src = galleryImages[i].url;
      }
  }
}

function optimizeForDevice() {
  const isMobile = window.innerWidth <= 768;
  const isTouch = 'ontouchstart' in window;
  
  if (isMobile || isTouch) {
      // Mostrar controles permanentemente en dispositivos táctiles
      const mainImage = document.querySelector('.gallery-main-image');
      if (mainImage) {
          mainImage.classList.add('touch-device');
      }
  }
}

// ========================
// FUNCIONES PÚBLICAS GLOBALES
// ========================
window.changeMainImage = changeMainImage;
window.scrollThumbnails = scrollThumbnails;
window.openFullscreen = openFullscreen;
window.closeFullscreen = closeFullscreen;
window.initSliderGallery = initSliderGallery;
window.handleImageError = handleImageError;

// ========================
// INICIALIZACIÓN FINAL
// ========================
document.addEventListener('DOMContentLoaded', () => {
  // Optimizar para el dispositivo actual
  optimizeForDevice();
  
  // Configurar eventos de resize con debounce
  let resizeTimeout;
  window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
          handleWindowResize();
          optimizeForDevice();
      }, 250);
  });
});

// Inicializar cuando se carga una imagen principal
document.addEventListener('DOMContentLoaded', () => {
  const mainImage = document.getElementById('main-gallery-image');
  if (mainImage) {
      mainImage.addEventListener('load', () => {
          // Precargar imágenes cercanas después de cargar la principal
          setTimeout(preloadNextImages, 500);
      });
  }
});

console.log('🎨 Galería tipo slider inicializada - Estilo Gralusa');FullscreenContent();
