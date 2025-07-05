// src/pages/gallery/loadGallery.js - CORREGIDO
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
        // Cargar CSS específico para Firebase
        cargarCSSFirebase();
        
        // Esperar un poco para que el DOM se estabilice
        setTimeout(async () => {
            try {
                // ✅ RUTA CORREGIDA: desde gallery/ hacia dataService.js
                const { cargarGaleriaFirebaseOptimizada } = await import('../../../dataService.js');
                
                // Inicializar galería optimizada
                await cargarGaleriaFirebaseOptimizada();
                
                console.log('✅ Galería Firebase inicializada');
                
            } catch (importError) {
                console.error('Error importando dataService:', importError);
                
                // Fallback: Mostrar mensaje de error en lugar de galería vacía
                const galleryGrid = document.querySelector('.gallery-grid');
                if (galleryGrid) {
                    galleryGrid.innerHTML = `
                        <div class="gallery-error-fallback">
                            <p>⚠️ Error cargando galería desde Firebase</p>
                            <p>Las imágenes se cargarán próximamente</p>
                        </div>
                    `;
                }
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
}