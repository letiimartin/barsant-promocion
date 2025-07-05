/* // src/pages/gallery/loadGallery.js - CORREGIDO
document.addEventListener("DOMContentLoaded", function () {
    fetch('src/pages/gallery/gallery.html')
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el gallery: " + response.status);
            }
            return response.text();
        })
        .then(data => {
            const placeholder = document.getElementById('gallery-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;
                
                // Inicializar galería Firebase después de cargar HTML
                inicializarGaleriaFirebase();
            } else {
                console.error("No se encontró el div con id 'gallery-placeholder'");
            }
        })
        .catch(error => console.error(error));
});

// Función para inicializar galería con Firebase
async function inicializarGaleriaFirebase() {
    try {
        cargarCSSFirebase();
        
        setTimeout(async () => {
            try {
                const { cargarGaleriaFirebaseOptimizada } = await import('../../../dataService.js');
                
                // ✅ HACER LA FUNCIÓN GLOBAL
                window.cargarGaleriaFirebaseOptimizada = cargarGaleriaFirebaseOptimizada;
                
                await cargarGaleriaFirebaseOptimizada();
                
                console.log('✅ Galería Firebase inicializada y función exportada globalmente');
                
            } catch (importError) {
                console.error('Error importando dataService:', importError);
                // ... resto del código de error
            }
        }, 100);
        
    } catch (error) {
        console.error('Error inicializando galería Firebase:', error);
    }
}

// Cargar CSS específico para la galería Firebase
function cargarCSSFirebase() {
    // Verificar si ya está cargado
    if (document.querySelector('link[href*="gallery.css"]')) {
        return;
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'src/css/pages/gallery.css';
    link.onload = () => console.log('✅ CSS de galería Firebase cargado');
    link.onerror = () => console.warn('⚠️ Error cargando CSS de galería Firebase');
    document.head.appendChild(link);
} */

document.addEventListener("DOMContentLoaded", function () {
    console.log('🖼️ Inicializando galería...');
    
    fetch('src/pages/gallery/gallery.html')
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar la galería: " + response.status);
            }
            return response.text();
        })
        .then(data => {
            const placeholder = document.getElementById('gallery-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;
                initGallery();
            } else {
                console.error("No se encontró el div con id 'gallery-placeholder'");
            }
        })
        .catch(error => {
            console.error("Error al cargar gallery.html:", error);
            // Mostrar galería básica como fallback
            showFallbackGallery();
        });
});

function initGallery() {
    console.log('🎨 Configurando galería...');
    
    // Primero intentar cargar desde Firebase, luego fallback a imágenes locales
    loadGalleryImages();
    
    // Configurar modal de galería
    setupGalleryModal();
}

function loadGalleryImages() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) {
        console.warn('No se encontró .gallery-grid');
        return;
    }
    
    // Lista de imágenes locales como fallback
    const localImages = [
        { name: '06_ALZ_COMPLETO_CULT_R.png', alt: 'Alzado completo' },
        { name: '07_ALZ_COMPLETO_ESQUINA_CULT_R.png', alt: 'Alzado esquina' },
        { name: '08_IMG_AEREA_1.jpg', alt: 'Vista aérea 1' },
        { name: '01_ALZ_1_CULT_R.png', alt: 'Alzado 1' },
        { name: '02_ALZ_2_CULT_R.png', alt: 'Alzado 2' },
        { name: '09_IMG_AEREA_2.jpg', alt: 'Vista aérea 2' },
        { name: '15_IMG_PLANTA_1.jpg', alt: 'Planta tipo 1' },
        { name: '03_ALZ_3_CULT_R.png', alt: 'Alzado 3' },
        { name: '04_ALZ_4_CULT_R.png', alt: 'Alzado 4' },
        { name: '05_ALZ_5_CULT_R.png', alt: 'Alzado 5' },
        { name: '10_IMG_PATIO_1.jpg', alt: 'Patio 1' },
        { name: '11_IMG_PATIO_2.jpg', alt: 'Patio 2' },
        { name: '12_IMG_PATIO_3.jpg', alt: 'Patio 3' },
        { name: '13_IMG_PATIO_4.jpg', alt: 'Patio 4' },
        { name: '14_IMG_PATIO_5.jpg', alt: 'Patio 5' },
        { name: '16_IMG_PLANTA_2.jpg', alt: 'Planta tipo 2' },
        { name: '17_IMG_PLANTA_3.jpg', alt: 'Planta tipo 3' },
        { name: '18_IMG_BAÑO_P1.jpg', alt: 'Baño modelo 1' },
        { name: '19_IMG_BAÑO_P2.jpg', alt: 'Baño modelo 2' },
        { name: '20_IMG_BAÑO_P3.jpg', alt: 'Baño modelo 3' },
        { name: '21_IMG_DORM_P1.jpg', alt: 'Dormitorio modelo 1' },
        { name: '22_IMG_DORM_P2.jpg', alt: 'Dormitorio modelo 2' }
    ];
    
    // Intentar cargar desde Firebase Storage primero
    tryLoadFromFirebase(localImages, galleryGrid);
}

function tryLoadFromFirebase(localImages, galleryGrid) {
    // Intentar cargar dataService
    loadDataServiceForGallery()
        .then(dataService => {
            if (dataService && dataService.cargarGaleriaFirebaseOptimizada) {
                console.log('🔥 Cargando galería desde Firebase...');
                return dataService.cargarGaleriaFirebaseOptimizada();
            } else {
                throw new Error('DataService no disponible');
            }
        })
        .catch(error => {
            console.warn('⚠️ No se pudo cargar desde Firebase, usando imágenes locales:', error);
            loadLocalGallery(localImages, galleryGrid);
        });
}

function loadDataServiceForGallery() {
    return new Promise((resolve, reject) => {
        try {
            // Crear script dinámico para cargar dataService
            const script = document.createElement('script');
            script.type = 'module';
            script.textContent = `
                import { cargarGaleriaFirebaseOptimizada } from './src/dataService.js';
                window.galleryDataService = { cargarGaleriaFirebaseOptimizada };
                window.dispatchEvent(new CustomEvent('galleryDataServiceLoaded'));
            `;
            
            const timeout = setTimeout(() => {
                reject(new Error('Timeout cargando dataService'));
            }, 5000);
            
            window.addEventListener('galleryDataServiceLoaded', () => {
                clearTimeout(timeout);
                resolve(window.galleryDataService);
            }, { once: true });
            
            script.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Error cargando dataService'));
            };
            
            document.head.appendChild(script);
        } catch (error) {
            reject(error);
        }
    });
}

function loadLocalGallery(images, galleryGrid) {
    console.log('📁 Cargando galería desde archivos locales...');
    
    galleryGrid.innerHTML = '';
    
    images.forEach((image, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <div class="gallery-image" style="background-image: url('assets/images/gallery/${image.name}')">
                <div class="gallery-overlay">
                    <i class="fas fa-expand-alt"></i>
                </div>
            </div>
        `;
        
        // Añadir click listener
        galleryItem.addEventListener('click', () => {
            openGalleryModal(`assets/images/gallery/${image.name}`, image.alt);
        });
        
        galleryGrid.appendChild(galleryItem);
    });
    
    console.log(`✅ Galería local cargada con ${images.length} imágenes`);
}

function setupGalleryModal() {
    const modal = document.getElementById('gallery-modal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeGalleryModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeGalleryModal();
            }
        });
    }
    
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeGalleryModal();
        }
    });
}

function openGalleryModal(imageSrc, imageAlt) {
    const modal = document.getElementById('gallery-modal');
    const modalBody = document.querySelector('.modal-body');
    
    if (modal && modalBody) {
        modalBody.innerHTML = `
            <img src="${imageSrc}" alt="${imageAlt}" style="
                max-width: 100%;
                max-height: 90vh;
                object-fit: contain;
                border-radius: 8px;
            ">
        `;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeGalleryModal() {
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function showFallbackGallery() {
    const placeholder = document.getElementById('gallery-placeholder');
    if (placeholder) {
        placeholder.innerHTML = `
            <section id="gallery" class="section">
                <div class="container">
                    <div class="text-center mb-5">
                        <h2 class="section-title">Galería del Proyecto</h2>
                        <p class="section-subtitle">Descubre el diseño y los espacios de Ventanilla</p>
                    </div>
                    <div class="gallery-grid">
                        <div class="gallery-item">
                            <div class="gallery-image" style="background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; min-height: 200px;">
                                <p style="color: #666;">Galería no disponible</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }
}

// Hacer funciones globales
window.openGalleryModal = openGalleryModal;
window.closeGalleryModal = closeGalleryModal;