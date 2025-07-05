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
// ========================
// LOAD GALLERY - SOLO FIREBASE STORAGE
// Sin referencias a archivos locales o carpeta assets
// ========================

document.addEventListener("DOMContentLoaded", function () {
    console.log('🖼️ Inicializando galería (solo Firebase)...');
    
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
                console.log('✅ HTML de galería cargado');
                
                // Inicializar galería desde Firebase
                initGalleryFromFirebase();
            } else {
                console.error("No se encontró el div con id 'gallery-placeholder'");
            }
        })
        .catch(error => {
            console.error("Error al cargar gallery.html:", error);
            showErrorGallery(error.message);
        });
});

// ========================
// FUNCIÓN PRINCIPAL: SOLO FIREBASE
// ========================
async function initGalleryFromFirebase() {
    console.log('🎨 Configurando galería desde Firebase Storage...');
    
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) {
        console.error('No se encontró .gallery-grid');
        return;
    }
    
    // Mostrar loading inicial
    galleryGrid.innerHTML = `
        <div class="loading-gallery-firebase" style="
            grid-column: 1 / -1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        ">
            <div style="
                width: 60px; 
                height: 60px; 
                border: 4px solid #f3f3f3; 
                border-top: 4px solid #e0c88c; 
                border-radius: 50%; 
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
            "></div>
            <h3 style="margin: 0 0 10px 0; color: #3a3a3a;">
                <i class="fas fa-cloud"></i> Cargando galería
            </h3>
            <p style="margin: 0; color: #666; text-align: center;">
                Conectando con Firebase Storage...
            </p>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    try {
        // Cargar galería desde Firebase
        await cargarGaleriaCompleta();
        
    } catch (error) {
        console.error('❌ Error cargando galería desde Firebase:', error);
        showErrorGallery(error.message);
    }
}

// ========================
// CARGAR GALERÍA COMPLETA DESDE FIREBASE
// ========================
async function cargarGaleriaCompleta() {
    try {
        console.log('🔥 Iniciando carga desde Firebase Storage...');
        
        // Importar dataService
        const { cargarGaleriaFirebaseOptimizada } = await import('./src/dataService.js');
        
        // Cargar imágenes desde Firebase
        const imagenesFirebase = await cargarGaleriaFirebaseOptimizada();
        
        if (!imagenesFirebase || imagenesFirebase.length === 0) {
            throw new Error('No se encontraron imágenes en Firebase Storage');
        }
        
        console.log(`✅ ${imagenesFirebase.length} imágenes cargadas desde Firebase Storage`);
        
        // Renderizar galería
        renderizarGaleria(imagenesFirebase);
        
        // Configurar modal
        configurarModal(imagenesFirebase);
        
        console.log('✅ Galería Firebase configurada correctamente');
        
    } catch (error) {
        console.error('❌ Error en carga completa:', error);
        throw error;
    }
}

// ========================
// RENDERIZAR GALERÍA
// ========================
function renderizarGaleria(imagenes) {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    // Crear estructura de galería
    const galleryHTML = imagenes.map((imagen, index) => {
        const nombreDisplay = getNombreImagen(imagen.nombre, index);
        
        return `
            <div class="gallery-item" 
                 data-index="${index}"
                 data-firebase-url="${imagen.url}"
                 style="
                    background-image: url('${imagen.url}');
                    background-size: cover;
                    background-position: center;
                    border-radius: 8px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    aspect-ratio: 1;
                    position: relative;
                    min-height: 200px;
                 "
                 onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.2)'"
                 onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.1)'"
                 onclick="openImageModal(${index})">
                
                <!-- Overlay con información -->
                <div style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(0,0,0,0.7));
                    color: white;
                    padding: 20px 15px 15px;
                    transform: translateY(100%);
                    transition: transform 0.3s ease;
                " class="gallery-overlay">
                    <p style="margin: 0; font-size: 14px; font-weight: 500;">
                        ${nombreDisplay}
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">
                        <i class="fas fa-cloud"></i> Firebase Storage
                    </p>
                </div>
            </div>
        `;
    }).join('');
    
    galleryGrid.innerHTML = galleryHTML;
    
    // Añadir hover effect para overlays
    const items = galleryGrid.querySelectorAll('.gallery-item');
    items.forEach(item => {
        const overlay = item.querySelector('.gallery-overlay');
        item.addEventListener('mouseenter', () => {
            overlay.style.transform = 'translateY(0)';
        });
        item.addEventListener('mouseleave', () => {
            overlay.style.transform = 'translateY(100%)';
        });
    });
}

// ========================
// CONFIGURAR MODAL
// ========================
function configurarModal(imagenes) {
    window.galleryImages = imagenes;
    window.currentImageIndex = 0;
    
    console.log('🖼️ Modal configurado con', imagenes.length, 'imágenes de Firebase');
}

// ========================
// FUNCIONES DEL MODAL
// ========================
function openImageModal(index) {
    if (!window.galleryImages || !window.galleryImages[index]) {
        console.error('Imagen no disponible:', index);
        return;
    }
    
    window.currentImageIndex = index;
    const imagen = window.galleryImages[index];
    const modal = document.getElementById('gallery-modal');
    const modalBody = modal.querySelector('.modal-body');
    
    const nombreDisplay = getNombreImagen(imagen.nombre, index);
    
    modalBody.innerHTML = `
        <div class="modal-image-container" style="position: relative; text-align: center;">
            <!-- Controles de navegación -->
            <button class="modal-nav modal-nav-prev" onclick="changeImage(-1)" style="
                position: absolute;
                left: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(0,0,0,0.7);
                color: white;
                border: none;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                z-index: 1001;
                transition: background 0.3s ease;
            " onmouseover="this.style.background='rgba(0,0,0,0.9)'" onmouseout="this.style.background='rgba(0,0,0,0.7)'">
                <i class="fas fa-chevron-left"></i>
            </button>
            
            <button class="modal-nav modal-nav-next" onclick="changeImage(1)" style="
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(0,0,0,0.7);
                color: white;
                border: none;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                z-index: 1001;
                transition: background 0.3s ease;
            " onmouseover="this.style.background='rgba(0,0,0,0.9)'" onmouseout="this.style.background='rgba(0,0,0,0.7)'">
                <i class="fas fa-chevron-right"></i>
            </button>
            
            <!-- Imagen principal -->
            <img src="${imagen.url}" 
                 alt="${nombreDisplay}"
                 style="
                    max-width: 100%;
                    max-height: 80vh;
                    width: auto;
                    height: auto;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                 ">
            
            <!-- Información de la imagen -->
            <div style="margin-top: 15px; text-align: center;">
                <h3 style="margin: 0 0 5px 0; color: #3a3a3a;">${nombreDisplay}</h3>
                <p style="margin: 0; color: #666; font-size: 14px;">
                    <i class="fas fa-cloud"></i> Imagen ${index + 1} de ${window.galleryImages.length} - Firebase Storage
                </p>
            </div>
        </div>
    `;
    
    // Mostrar modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Animación de entrada
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.transition = 'opacity 0.3s ease';
    }, 10);
}

function changeImage(direction) {
    if (!window.galleryImages) return;
    
    window.currentImageIndex += direction;
    
    // Navegación circular
    if (window.currentImageIndex >= window.galleryImages.length) {
        window.currentImageIndex = 0;
    } else if (window.currentImageIndex < 0) {
        window.currentImageIndex = window.galleryImages.length - 1;
    }
    
    openImageModal(window.currentImageIndex);
}

function closeImageModal() {
    const modal = document.getElementById('gallery-modal');
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

// ========================
// UTILIDADES
// ========================
function getNombreImagen(nombreArchivo, index) {
    const fileName = nombreArchivo.split('.')[0];
    const nameMap = {
        '01_ALZ_1_CULT_R': 'Alzado Vista 1',
        '02_ALZ_2_CULT_R': 'Alzado Vista 2', 
        '03_ALZ_3_CULT_R': 'Alzado Vista 3',
        '04_ALZ_4_CULT_R': 'Alzado Vista 4',
        '05_ALZ_5_CULT_R': 'Alzado Vista 5',
        '06_ALZ_COMPLETO_CULT_R': 'Vista Completa',
        '07_ALZ_COMPLETO_ESQUINA_CULT_R': 'Vista Esquina',
        '08_IMG_AEREA_1': 'Vista Aérea 1',
        '09_IMG_AEREA_2': 'Vista Aérea 2',
        '10_IMG_PATIO_1': 'Patio Interior 1',
        '11_IMG_PATIO_2': 'Patio Interior 2',
        '12_IMG_PATIO_3': 'Patio Interior 3',
        '13_IMG_PATIO_4': 'Patio Interior 4',
        '14_IMG_PATIO_5': 'Patio Interior 5',
        '15_IMG_PLANTA_1': 'Distribución Planta 1',
        '16_IMG_PLANTA_2': 'Distribución Planta 2',
        '17_IMG_PLANTA_3': 'Distribución Planta 3',
        '18_IMG_BAÑO_P1': 'Baño Principal 1',
        '19_IMG_BAÑO_P2': 'Baño Principal 2',
        '20_IMG_BAÑO_P3': 'Baño Principal 3',
        '21_IMG_DORM_P1': 'Dormitorio Principal 1',
        '22_IMG_DORM_P2': 'Dormitorio Principal 2'
    };
    return nameMap[fileName] || `Imagen ${index + 1}`;
}

// ========================
// MANEJO DE ERRORES
// ========================
function showErrorGallery(errorMessage) {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = `
        <div class="error-gallery-firebase" style="
            grid-column: 1 / -1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            background: linear-gradient(135deg, #fee 0%, #fdd 100%);
            border: 2px dashed #dc3545;
            border-radius: 12px;
            text-align: center;
        ">
            <i class="fas fa-exclamation-triangle" style="
                font-size: 3rem; 
                color: #dc3545; 
                margin-bottom: 20px;
            "></i>
            <h3 style="margin: 0 0 15px 0; color: #dc3545;">
                Error cargando galería desde Firebase
            </h3>
            <p style="margin: 0 0 10px 0; color: #666; max-width: 500px;">
                <strong>Error:</strong> ${errorMessage}
            </p>
            <p style="margin: 0 0 25px 0; color: #666; font-size: 14px; max-width: 500px;">
                Verifique que las imágenes estén subidas a Firebase Storage y que la autenticación anónima esté habilitada.
            </p>
            <button onclick="initGalleryFromFirebase()" style="
                background-color: #e0c88c;
                color: #3a3a3a;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: background 0.3s ease;
            " onmouseover="this.style.backgroundColor='#d4bc80'" onmouseout="this.style.backgroundColor='#e0c88c'">
                <i class="fas fa-redo"></i> Reintentar carga desde Firebase
            </button>
        </div>
    `;
}

// ========================
// CONFIGURAR EVENTOS GLOBALES
// ========================
document.addEventListener('DOMContentLoaded', () => {
    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('gallery-modal');
        if (modal && modal.style.display === 'flex') {
            switch(e.key) {
                case 'Escape':
                    closeImageModal();
                    break;
                case 'ArrowLeft':
                    changeImage(-1);
                    break;
                case 'ArrowRight':
                    changeImage(1);
                    break;
            }
        }
    });
    
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('gallery-modal');
        if (modal && modal.style.display === 'flex' && e.target === modal) {
            closeImageModal();
        }
    });
});

// ========================
// HACER FUNCIONES GLOBALES
// ========================
window.openImageModal = openImageModal;
window.changeImage = changeImage;
window.closeImageModal = closeImageModal;
window.initGalleryFromFirebase = initGalleryFromFirebase;

console.log('📸 Sistema de galería cargado (solo Firebase Storage)');