async function initOptimizedSliderGallery() {
    console.log('🎨 Inicializando slider (modo compatibilidad - solo originales)...');
    
    // Mostrar estado de carga
    showGalleryLoading();
    
    try {
        // Cargar imágenes básicas desde Firebase
        console.log('📥 Importando dataService...');
        const dataService = await import('../../../dataService.js');
        console.log('✅ DataService importado');
        
        // Usar la función básica (solo originales)
        galleryImages = await dataService.cargarGaleriaFirebaseOptimizada();
        
        if (!galleryImages || galleryImages.length === 0) {
            throw new Error('No se encontraron imágenes en Firebase Storage');
        }
        
        console.log(`✅ ${galleryImages.length} imágenes cargadas (solo originales)`);
        console.log('🔍 Primera imagen:', galleryImages[0]);
        
        // Guardar función para usar globalmente
        window.getImagenOptimizada = dataService.getImagenOptimizada;
        
        // Recargar el HTML completo para asegurar que existe
        await reloadGalleryHTML();
        
        // Configurar la galería con delay mayor para asegurar rendering
        setTimeout(() => {
            setupOptimizedSliderGallery();
            setupGalleryEvents();
            
            console.log('🎯 Galería inicializada correctamente');
        }, 500); // Aumentar delay
        
    } catch (error) {
        console.error('❌ Error cargando galería:', error);
        showGalleryError(error.message);
    }
}// ========================
// GALERÍA TIPO SLIDER - OPTIMIZADA CON DATASERVICE
// Usa las nuevas funciones optimizadas del dataService.js
// ========================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🖼️ Inicializando galería optimizada tipo slider...');
    loadGalleryHTML();
});

// Variables globales
let galleryImages = [];
let currentImageIndex = 0;
let thumbnailScrollPosition = 0;
let imageCache = new Map();

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
        
        // Inicializar galería optimizada
        await initOptimizedSliderGallery();
        
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
// INICIALIZACIÓN OPTIMIZADA
// ========================
async function initOptimizedSliderGallery() {
    console.log('🎨 Inicializando slider optimizado...');
    
    // Mostrar estado de carga
    showGalleryLoading();
    
    try {
        // Cargar imágenes optimizadas desde Firebase
        const { cargarGaleriaConLazyLoading, getImagenOptimizada } = await import('../../../dataService.js');
        galleryImages = await cargarGaleriaConLazyLoading();
        
        if (!galleryImages || galleryImages.length === 0) {
            throw new Error('No se encontraron imágenes en Firebase Storage');
        }
        
        console.log(`✅ ${galleryImages.length} imágenes optimizadas cargadas`);
        
        // Guardar función para usar globalmente
        window.getImagenOptimizada = getImagenOptimizada;
        
        // Recargar el HTML completo para asegurar que existe
        await reloadGalleryHTML();
        
        // Configurar la galería optimizada con delay
        setTimeout(() => {
            setupOptimizedSliderGallery();
            setupGalleryEvents();
            
            // Iniciar precarga inteligente después de configurar
            setTimeout(startIntelligentPreloading, 300);
        }, 200);
        
    } catch (error) {
        console.error('❌ Error cargando galería optimizada:', error);
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
// CONFIGURACIÓN OPTIMIZADA DEL SLIDER
// ========================
function setupOptimizedSliderGallery() {
    // Verificar que los elementos existen
    const thumbnailsContainer = document.getElementById('gallery-thumbnails');
    const mainImage = document.getElementById('main-gallery-image');
    
    if (!thumbnailsContainer || !mainImage) {
        console.error('❌ Elementos de galería no encontrados');
        setTimeout(() => setupOptimizedSliderGallery(), 500);
        return;
    }
    
    // Crear thumbnails optimizados
    createOptimizedThumbnails();
    
    // Esperar renderizado del DOM
    setTimeout(() => {
        // Mostrar primera imagen optimizada
        showOptimizedMainImage(0);
        
        // Configurar navegación
        setupKeyboardNavigation();
        
        console.log('✅ Slider optimizado configurado');
    }, 100);
}

function createOptimizedThumbnails() {
    const thumbnailsContainer = document.getElementById('gallery-thumbnails');
    if (!thumbnailsContainer) {
        console.error('❌ Contenedor de thumbnails no encontrado');
        return;
    }
    
    thumbnailsContainer.innerHTML = '';
    
    console.log('🔍 Creando thumbnails para', galleryImages.length, 'imágenes (solo originales)');
    
    galleryImages.forEach((imagen, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'gallery-thumbnail';
        thumbnail.dataset.index = index;
        thumbnail.dataset.categoria = imagen.categoria || 'general';
        
        if (index === 0) {
            thumbnail.classList.add('active');
        }
        
        // USAR SOLO URL ORIGINAL - no intentar optimizadas
        const thumbnailUrl = imagen.url; // Siempre usar original
        
        console.log(`🖼️ Thumbnail ${index + 1}: ${imagen.nombreDisplay} -> ${thumbnailUrl}`);
        
        // Cargar inmediatamente las primeras 8 imágenes
        const shouldLoadImmediately = index < 8; // Aumentar para evitar lazy loading por ahora
        
        thumbnail.innerHTML = `
            <img src="${shouldLoadImmediately ? thumbnailUrl : ''}" 
                 ${!shouldLoadImmediately ? `data-src="${thumbnailUrl}"` : ''}
                 alt="${imagen.nombreDisplay || imagen.nombre}"
                 class="${shouldLoadImmediately ? 'loaded' : 'lazy-load'}"
                 loading="lazy"
                 onerror="handleImageError(this, ${index})"
                 onload="console.log('✅ Thumbnail ${index + 1} cargado correctamente')">
            <div class="thumbnail-overlay">
                <span class="thumbnail-title">${imagen.nombreDisplay || `Imagen ${index + 1}`}</span>
                <span class="thumbnail-category">${imagen.categoria || ''}</span>
            </div>
        `;
        
        // Evento click simplificado
        thumbnail.addEventListener('click', () => {
            console.log('🔘 Click en thumbnail', index, imagen.nombreDisplay);
            showOptimizedMainImage(index);
        });
        
        thumbnailsContainer.appendChild(thumbnail);
    });
    
    // Configurar lazy loading solo para imágenes que no se cargaron inmediatamente
    if (galleryImages.length > 8) {
        setupThumbnailLazyLoading();
    }
    
    console.log(`✅ ${galleryImages.length} thumbnails creados (primeros 8 cargados inmediatamente)`);
}

// ========================
// LAZY LOADING DE THUMBNAILS
// ========================
function setupThumbnailLazyLoading() {
    if (!('IntersectionObserver' in window)) {
        // Fallback: cargar todas las imágenes lazy
        document.querySelectorAll('.lazy-load').forEach(loadLazyThumbnail);
        return;
    }
    
    const thumbnailObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                loadLazyThumbnail(img);
                thumbnailObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '100px' // Cargar 100px antes de que sea visible
    });
    
    document.querySelectorAll('.lazy-load').forEach(img => {
        thumbnailObserver.observe(img);
    });
}

function loadLazyThumbnail(img) {
    const src = img.dataset.src;
    if (src && !img.src) {
        img.src = src;
        img.classList.remove('lazy-load');
        img.classList.add('loaded');
        img.removeAttribute('data-src');
        
        // Añadir efecto de fade-in
        img.style.opacity = '0';
        img.onload = () => {
            img.style.transition = 'opacity 0.3s ease';
            img.style.opacity = '1';
        };
    }
}

// ========================
// IMAGEN PRINCIPAL OPTIMIZADA
// ========================
function showOptimizedMainImage(index) {
    if (!galleryImages[index]) {
        console.warn(`⚠️ Imagen ${index} no encontrada`);
        return;
    }
    
    currentImageIndex = index;
    const imagen = galleryImages[index];
    const mainImage = document.getElementById('main-gallery-image');
    const mainTitle = document.getElementById('main-image-title');
    
    if (mainImage) {
        // Usar siempre la URL original por ahora
        const imageUrl = imagen.url;
        
        console.log(`🖼️ Cargando imagen principal ${index + 1}: ${imagen.nombreDisplay}`);
        console.log(`🔗 URL: ${imageUrl}`);
        
        // Mostrar loading state
        mainImage.style.opacity = '0.7';
        if (mainImage.parentElement) {
            mainImage.parentElement.classList.add('loading');
        }
        
        // Verificar cache primero
        if (imageCache.has(imageUrl)) {
            console.log(`📦 Imagen ${index + 1} desde cache`);
            const cachedImg = imageCache.get(imageUrl);
            mainImage.src = cachedImg.src;
            mainImage.alt = imagen.nombreDisplay || imagen.nombre;
            mainImage.style.opacity = '1';
            if (mainImage.parentElement) {
                mainImage.parentElement.classList.remove('loading');
            }
            mainImage.classList.add('fade-in');
        } else {
            // Cargar nueva imagen
            const newImg = new Image();
            newImg.onload = () => {
                // Guardar en cache
                imageCache.set(imageUrl, newImg);
                
                mainImage.src = newImg.src;
                mainImage.alt = imagen.nombreDisplay || imagen.nombre;
                mainImage.style.opacity = '1';
                if (mainImage.parentElement) {
                    mainImage.parentElement.classList.remove('loading');
                }
                mainImage.classList.add('fade-in');
                
                console.log(`✅ Imagen principal ${index + 1} cargada y cacheada`);
            };
            newImg.onerror = () => {
                console.error(`❌ Error cargando imagen principal ${index + 1}:`, imageUrl);
                mainImage.style.opacity = '1';
                if (mainImage.parentElement) {
                    mainImage.parentElement.classList.remove('loading');
                }
                handleImageError(mainImage, index);
            };
            newImg.src = imageUrl;
        }
    }
    
    if (mainTitle) {
        mainTitle.textContent = imagen.nombreDisplay || imagen.nombre;
    }
    
    // Actualizar interfaz
    updateNavigationButtons();
    setActiveThumbnail(index);
    
    setTimeout(() => {
        scrollToActiveThumbnail(index);
    }, 50);
}

// ========================
// PRECARGA INTELIGENTE
// ========================
function startIntelligentPreloading() {
    console.log('🚀 Iniciando precarga inteligente...');
    
    // Separar imágenes por prioridad
    const prioridad1 = galleryImages.filter(img => img.prioridad === 1);
    const prioridad2 = galleryImages.filter(img => img.prioridad === 2);
    
    // Precargar prioridad 1 inmediatamente (ya están cargadas en thumbnails)
    console.log(`📦 Prioridad 1: ${prioridad1.length} imágenes (ya cargadas)`);
    
    // Precargar prioridad 2 con delay
    setTimeout(() => {
        prioridad2.forEach((imagen, index) => {
            setTimeout(() => {
                preloadOptimizedImage(imagen, 'medium');
            }, index * 200);
        });
    }, 1000);
    
    console.log(`⏳ Precargando prioridad 2: ${prioridad2.length} imágenes`);
}

function preloadNearbyImages() {
    const preloadQueue = [];
    
    // Imagen anterior
    if (currentImageIndex > 0) {
        preloadQueue.push({ index: currentImageIndex - 1, priority: 1 });
    }
    
    // Siguientes 2 imágenes
    for (let i = 1; i <= 2; i++) {
        const nextIndex = currentImageIndex + i;
        if (nextIndex < galleryImages.length) {
            preloadQueue.push({ index: nextIndex, priority: i });
        }
    }
    
    // Precargar con delays escalonados
    preloadQueue.forEach((item, delay) => {
        setTimeout(() => {
            const imagen = galleryImages[item.index];
            if (imagen) {
                preloadOptimizedImage(imagen, 'medium');
            }
        }, delay * 150);
    });
}

function preloadOptimizedImage(imagen, size = 'medium') {
    const url = window.getImagenOptimizada 
        ? window.getImagenOptimizada(imagen, size)
        : imagen.url;
    
    // Verificar cache
    if (imageCache.has(url)) {
        return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            imageCache.set(url, img);
            console.log(`✅ Precargada: ${imagen.nombreDisplay} (${size})`);
            resolve(img);
        };
        img.onerror = () => {
            console.warn(`⚠️ Error precargando: ${imagen.nombreDisplay}`);
            reject();
        };
        img.src = url;
    });
}

// ========================
// NAVEGACIÓN OPTIMIZADA
// ========================
function changeMainImage(direction) {
    let newIndex = currentImageIndex + direction;
    
    // Navegación circular
    if (newIndex >= galleryImages.length) {
        newIndex = 0;
    } else if (newIndex < 0) {
        newIndex = galleryImages.length - 1;
    }
    
    showOptimizedMainImage(newIndex);
}

function setActiveThumbnail(index) {
    const thumbnails = document.querySelectorAll('.gallery-thumbnail');
    
    thumbnails.forEach((thumb, i) => {
        if (i === index) {
            thumb.classList.add('active');
            
            // Cargar thumbnail si no está cargado
            const img = thumb.querySelector('img');
            if (img && img.classList.contains('lazy-load')) {
                loadLazyThumbnail(img);
            }
        } else {
            thumb.classList.remove('active');
        }
    });
}

function scrollToActiveThumbnail(index) {
    const container = document.getElementById('gallery-thumbnails');
    
    if (!container || !container.children || container.children.length === 0) {
        console.warn('⚠️ No hay thumbnails para hacer scroll');
        return;
    }
    
    const thumbnail = container.children[index];
    if (!thumbnail) return;
    
    const containerWidth = container.clientWidth;
    const thumbnailLeft = thumbnail.offsetLeft;
    const thumbnailWidth = thumbnail.offsetWidth;
    
    const scrollPosition = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);
    
    container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
    });
    
    setTimeout(updateThumbnailNavButtons, 300);
}

function updateNavigationButtons() {
    // En navegación circular, botones siempre activos
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');
    
    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) nextBtn.disabled = false;
}

function scrollThumbnails(direction) {
    const container = document.getElementById('gallery-thumbnails');
    if (!container) return;
    
    const scrollAmount = 130;
    const newPosition = container.scrollLeft + (direction * scrollAmount);
    
    container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
    });
    
    updateThumbnailNavButtons();
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
// FULLSCREEN OPTIMIZADO
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
        // Usar imagen de alta calidad para fullscreen
        const largeUrl = window.getImagenOptimizada 
            ? window.getImagenOptimizada(currentImage, 'large')
            : currentImage.urlLarge || currentImage.url;
        
        fullscreenImage.src = largeUrl;
        fullscreenImage.alt = currentImage.nombreDisplay || currentImage.nombre;
    }
    
    if (fullscreenTitle) {
        fullscreenTitle.textContent = currentImage.nombreDisplay || currentImage.nombre;
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
    const largeUrl = window.getImagenOptimizada 
        ? window.getImagenOptimizada(currentImage, 'large')
        : currentImage.urlLarge || currentImage.url;
    
    fullscreenImage.src = largeUrl;
    fullscreenImage.alt = currentImage.nombreDisplay || currentImage.nombre;
    
    if (fullscreenTitle) {
        fullscreenTitle.textContent = currentImage.nombreDisplay || currentImage.nombre;
    }
    
    if (currentCounter) {
        currentCounter.textContent = currentImageIndex + 1;
    }
}

// ========================
// EVENTOS Y CONFIGURACIÓN
// ========================
function setupGalleryEvents() {
    const thumbnailsContainer = document.getElementById('gallery-thumbnails');
    if (thumbnailsContainer) {
        thumbnailsContainer.addEventListener('scroll', updateThumbnailNavButtons);
    }
    
    window.addEventListener('resize', handleWindowResize);
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
            case 'ArrowRight':
                event.preventDefault();
                changeMainImage(1);
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
    updateThumbnailNavButtons();
    scrollToActiveThumbnail(currentImageIndex);
}

// ========================
// UTILIDADES
// ========================
function handleImageError(img, index) {
    console.error(`❌ Error cargando thumbnail ${index + 1}:`, {
        src: img.src,
        alt: img.alt,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
    });
    
    // Intentar con URL original si existe
    const imagen = galleryImages[index];
    if (imagen && imagen.url && img.src !== imagen.url) {
        console.log(`🔄 Intentando URL original para imagen ${index + 1}:`, imagen.url);
        img.src = imagen.url;
        return;
    }
    
    // Si aún falla, mostrar placeholder
    const thumbnail = img.closest('.gallery-thumbnail');
    if (thumbnail) {
        thumbnail.style.opacity = '0.5';
        thumbnail.classList.add('error');
        
        // Crear placeholder visual
        img.style.display = 'none';
        if (!thumbnail.querySelector('.error-placeholder')) {
            const placeholder = document.createElement('div');
            placeholder.className = 'error-placeholder';
            placeholder.innerHTML = `
                <i class="fas fa-image"></i>
                <span>Error</span>
            `;
            thumbnail.querySelector('.thumbnail-overlay').before(placeholder);
        }
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
            <h3>Cargando galería optimizada...</h3>
            <p>Preparando imágenes con múltiples tamaños...</p>
            <div class="loading-stats">
                <small>Sistema de precarga inteligente activado</small>
            </div>
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
            <h3>Error cargando galería optimizada</h3>
            <p>${message}</p>
            <div class="error-details">
                <small>Verifique la conexión a Firebase Storage</small>
            </div>
            <button class="retry-btn" onclick="initOptimizedSliderGallery()">
                <i class="fas fa-redo"></i>
                Reintentar
            </button>
        </div>
    `;
}

// ========================
// FUNCIONES PÚBLICAS GLOBALES
// ========================
window.changeMainImage = changeMainImage;
window.scrollThumbnails = scrollThumbnails;
window.openFullscreen = openFullscreen;
window.closeFullscreen = closeFullscreen;
window.initOptimizedSliderGallery = initOptimizedSliderGallery;
window.handleImageError = handleImageError;

// ========================
// INICIALIZACIÓN FINAL
// ========================
document.addEventListener('DOMContentLoaded', () => {
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            handleWindowResize();
        }, 250);
    });
});

console.log('🎨 Galería optimizada con dataService cargada - Múltiples tamaños y precarga inteligente');