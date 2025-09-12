// ========================
// GALERÍA INSTANTÁNEA - SIN DELAYS
// Carga directa, sin estados intermedios
// ========================

document.addEventListener('DOMContentLoaded', () => {
    loadGalleryHTML();
});

let galleryImages = [];
let currentImageIndex = 0;

// ========================
// DATOS DIRECTOS
// ========================
function getGalleryImages() {
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/ventanilla-barsant.firebasestorage.app/o/';
    
    return [
        // Fachadas
        { name: '01_ALZ_1_CULT_R.png', title: 'Imagen 1 Fachada' },
        { name: '02_ALZ_2_CULT_R.png', title: 'Imagen 2 Fachada' },
        { name: '03_ALZ_3_CULT_R.png', title: 'Imagen 3 Fachada' },
        { name: '04_ALZ_4_CULT_R.png', title: 'Imagen 4 Fachada' },
        { name: '05_ALZ_5_CULT_R.png', title: 'Imagen 5 Fachada' },
        { name: '06_ALZ_COMPLETO_CULT_R.png', title: 'Imagen Completa Fachada' },
        { name: '07_ALZ_COMPLETO_ESQUINA_CULT_R.png', title: 'Imagen Completa Esquina' },
        
        // Vistas aéreas
        { name: '08_IMG_AEREA_1.jpg', title: 'Vista Aérea General' },
        { name: '09_IMG_AEREA_2.jpg', title: 'Vista Aérea Lateral' },
        
        // Patios interiores
        { name: '10_IMG_PATIO_1.jpg', title: 'Imagen 1 Patio' },
        { name: '11_IMG_PATIO_2.jpg', title: 'Imagen 2 Patio' },
        { name: '12_IMG_PATIO_3.jpg', title: 'Imagen 3 Patio' },
        { name: '13_IMG_PATIO_4.jpg', title: 'Imagen 4 Patio' },
        { name: '14_IMG_PATIO_5.jpg', title: 'Imagen 5 Patio' },
        
        // Distribuciones de plantas
        { name: '15_IMG_PLANTA_1.jpg', title: 'Primera Planta' },
        { name: '16_IMG_PLANTA_2.jpg', title: 'Segunda Planta' },
        { name: '17_IMG_PLANTA_3.jpg', title: 'Tercera Planta' },
        
        // Baños
        { name: '18_IMG_BAÑO_P1.jpg', title: 'Imagen 1 Baño' },
        { name: '19_IMG_BAÑO_P2.jpg', title: 'Imagen 2 Baño' },
        { name: '20_IMG_BAÑO_P3.jpg', title: 'Imagen 3 Baño' },
        { name: '21_IMG_BAÑO_P4.jpg', title: 'Imagen 4 Baño' },
        { name: '22_IMG_BAÑO_P5.jpg', title: 'Imagen 5 Baño' },
        
        // Dormitorios
        { name: '23_IMG_DORM_P1.jpg', title: 'Imagen 1 Dormitorio' },
        { name: '24_IMG_DORM_P2.jpg', title: 'Imagen 2 Dormitorio' },
        { name: '25_IMG_DORM_P3.jpg', title: 'Imagen 3 Dormitorio' },
        { name: '26_IMG_DORM_P4.jpg', title: 'Imagen 4 Dormitorio' },
        
        // Salón/Cocina (nuevas)
        { name: '27_IMG_SALON 3_COCINA_R.jpg', title: 'Imagen 3 Salón Cocina' },
        { name: '28_IMG_SALON 3_SALON_R.jpg', title: 'Imagen 3 Salón' },
        { name: '29_IMG_SALON 2_SALON_R.jpg', title: 'Imagen 2 Salón' },
        { name: '30_IMG_SALON 2_COCINA_R.jpg', title: 'Imagen 2 Salón Cocina' },
        { name: '31_IMG_SALON 1_COCINA_R.jpg', title: 'Imagen 1 Salón Cocina' },
        { name: '32_IMG_SALON 1_SALON_R.jpg', title: 'Imagen 1 Salón' }
    ].map((img, index) => ({
        url: `${baseUrl}${encodeURIComponent(img.name)}?alt=media`,
        title: img.title,
        index: index
    }));
}

// ========================
// CARGA DIRECTA
// ========================
async function loadGalleryHTML() {
    try {
        const response = await fetch('src/pages/gallery/gallery.html');
        const html = await response.text();
        const placeholder = document.getElementById('gallery-placeholder');
        
        if (placeholder) {
            placeholder.innerHTML = html;
            
            // CSS
            if (!document.querySelector('link[href*="gallery.css"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'src/css/pages/gallery.css';
                document.head.appendChild(link);
            }
            
            // Inicializar sin delays
            initGallery();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// ========================
// INICIALIZACIÓN DIRECTA
// ========================
function initGallery() {
    galleryImages = getGalleryImages();
    
    createThumbnails();
    showImage(0);
    setupNavigation();
}

// ========================
// CREAR INTERFAZ
// ========================
function createThumbnails() {
    const container = document.getElementById('gallery-thumbnails');
    if (!container) return;
    
    container.innerHTML = galleryImages.map((image, index) => `
        <div class="gallery-thumbnail ${index === 0 ? 'active' : ''}" onclick="showImage(${index})">
            <img src="${image.url}" alt="${image.title}" loading="lazy">
            <div class="thumbnail-overlay">
                <span class="thumbnail-title">${image.title}</span>
            </div>
        </div>
    `).join('');
}

function showImage(index) {
    if (!galleryImages[index]) return;
    
    currentImageIndex = index;
    const image = galleryImages[index];
    
    // Imagen principal
    const mainImg = document.getElementById('main-gallery-image');
    if (mainImg) {
        mainImg.src = image.url;
        mainImg.alt = image.title;
    }
    
    // Título
    const title = document.getElementById('main-image-title');
    if (title) {
        title.textContent = image.title;
    }
    
    // Actualizar thumbnails
    document.querySelectorAll('.gallery-thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
    
    // Scroll a thumbnail activo
    scrollToThumbnail(index);
    
    // Actualizar fullscreen
    const fullscreenImg = document.getElementById('fullscreen-image');
    const fullscreenTitle = document.getElementById('fullscreen-title');
    const fullscreenCurrent = document.getElementById('fullscreen-current');
    const fullscreenTotal = document.getElementById('fullscreen-total');
    
    if (fullscreenImg) fullscreenImg.src = image.url;
    if (fullscreenTitle) fullscreenTitle.textContent = image.title;
    if (fullscreenCurrent) fullscreenCurrent.textContent = index + 1;
    if (fullscreenTotal) fullscreenTotal.textContent = galleryImages.length;
}

// ========================
// NAVEGACIÓN
// ========================
function changeMainImage(direction) {
    let newIndex = currentImageIndex + direction;
    
    if (newIndex >= galleryImages.length) {
        newIndex = 0;
    } else if (newIndex < 0) {
        newIndex = galleryImages.length - 1;
    }
    
    showImage(newIndex);
}

function scrollThumbnails(direction) {
    const container = document.getElementById('gallery-thumbnails');
    if (!container) return;
    
    container.scrollBy({
        left: direction * 120,
        behavior: 'smooth'
    });
}

function scrollToThumbnail(index) {
    const container = document.getElementById('gallery-thumbnails');
    const thumbnails = container.querySelectorAll('.gallery-thumbnail');
    const thumbnail = thumbnails[index];
    
    if (thumbnail) {
        const containerWidth = container.clientWidth;
        const thumbnailLeft = thumbnail.offsetLeft;
        const thumbnailWidth = thumbnail.offsetWidth;
        
        container.scrollTo({
            left: thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2),
            behavior: 'smooth'
        });
    }
}

// ========================
// FULLSCREEN
// ========================
function openFullscreen() {
    const modal = document.getElementById('gallery-fullscreen-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.classList.add('fullscreen-open');
        showImage(currentImageIndex); // Actualizar contenido
    }
}

function closeFullscreen() {
    const modal = document.getElementById('gallery-fullscreen-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('fullscreen-open');
    }
}

// ========================
// EVENTOS
// ========================
function setupNavigation() {
    // Teclado
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                changeMainImage(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                changeMainImage(1);
                break;
            case 'Escape':
                closeFullscreen();
                break;
        }
    });
    
    // Botones de navegación de thumbnails
    const container = document.getElementById('gallery-thumbnails');
    if (container) {
        container.addEventListener('scroll', () => {
            const leftBtn = document.querySelector('.thumbnail-nav-left');
            const rightBtn = document.querySelector('.thumbnail-nav-right');
            
            if (leftBtn && rightBtn) {
                leftBtn.disabled = container.scrollLeft <= 0;
                rightBtn.disabled = container.scrollLeft >= container.scrollWidth - container.clientWidth;
            }
        });
    }
}

// ========================
// FUNCIONES GLOBALES
// ========================
window.changeMainImage = changeMainImage;
window.scrollThumbnails = scrollThumbnails;
window.openFullscreen = openFullscreen;
window.closeFullscreen = closeFullscreen;
window.showImage = showImage;