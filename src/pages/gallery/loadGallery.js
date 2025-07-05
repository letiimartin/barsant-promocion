// ========================
// LOAD GALLERY  –  URLs PÚBLICAS (sin Auth)
// ========================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🖼️ Inicializando galería (URLs públicas)…');
  
    fetch('src/pages/gallery/gallery.html')
      .then(r => {
        if (!r.ok) throw new Error(`No se pudo cargar la galería: ${r.status}`);
        return r.text();
      })
      .then(html => {
        const placeholder = document.getElementById('gallery-placeholder');
        if (!placeholder) throw new Error('No existe #gallery-placeholder');
        placeholder.innerHTML = html;
        console.log('✅ HTML de galería cargado');
  
        // ─── Carga de CSS una-sola-vez ───────────────────────
        if (!document.querySelector('link[href$="gallery.css"]')) {
          const link = document.createElement('link');
          link.rel  = 'stylesheet';
          link.href = '/src/css/pages/gallery.css';          //  ← ruta corregida
          document.head.appendChild(link);
        }
  
        initGalleryFromFirebase();  // función principal
      })
      .catch(err => {
        console.error('Error al cargar gallery.html:', err);
        showErrorGallery(err.message);
      });
  });
  
  // ========================
  // FUNCIÓN PRINCIPAL
  // ========================
  async function initGalleryFromFirebase () {
    console.log('🎨 Configurando galería desde Firebase…');
  
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return console.error('No se encontró .gallery-grid');
  
    // Skeleton / loading
    grid.innerHTML = `
      <div class="loading-gallery-firebase">
        <div class="spinner"></div>
        <h3><i class="fas fa-cloud"></i> Cargando galería…</h3>
        <p>Generando URLs públicas…</p>
      </div>
    `;
  
    try {
      // 1 · Import dinámico a tu servicio
      const { cargarGaleriaFirebaseOptimizada } = await import('../../../dataService.js');
      // 2 · Obtiene array [{nombre, url}, …]
      const imagenes = await cargarGaleriaFirebaseOptimizada();
      if (!imagenes.length) throw new Error('No hay imágenes en Firebase');
  
      console.log(`✅ ${imagenes.length} imágenes cargadas`);
      renderizarGaleria(imagenes);
      configurarModal(imagenes);
    } catch (e) {
      console.error('❌ Error cargando galería:', e);
      showErrorGallery(e.message);
    }
  }
  
  // ========================
  // RENDERIZAR GALERÍA
  // ========================
  function renderizarGaleria (imagenes) {
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;
  
    grid.innerHTML = imagenes.map((img, i) => `
      <div  class="gallery-item"
            data-index="${i}"
            style="background-image:url('${img.url}')" 
            onclick="openImageModal(${i})">
      </div>
    `).join('');
  }
  
  // ========================
  // MODAL Y NAVEGACIÓN (sin cambios de lógica)
  // ========================
  /* … openImageModal / changeImage / closeImageModal / getNombreImagen … */
  function configurarModal(imagenes) {
    window.galleryImages = imagenes;
    window.currentImageIndex = 0;
    
    console.log('🖼️ Modal configurado con', imagenes.length, 'imágenes públicas');
}


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
        <!-- Botón de Cerrar -->
        <button class="modal-close-button" onclick="closeImageModal()" style="
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.7);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            z-index: 1001;
            transition: background 0.3s ease;
        " onmouseover="this.style.background='rgba(0,0,0,0.9)'" onmouseout="this.style.background='rgba(0,0,0,0.7)'">
            <i class="fas fa-times"></i>
        </button>

        <div class="modal-image-container" style="position: relative; text-align: center;">
            <!-- Botón Anterior -->
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
            
            <!-- Botón Siguiente -->
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
  // ERRORES
  // ========================
  function showErrorGallery (msg) {
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;
    grid.innerHTML = `
      <div class="error-gallery-firebase">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error cargando galería</h3>
        <p>${msg}</p>
        <button onclick="initGalleryFromFirebase()">Reintentar</button>
      </div>`;
  }
  
  // ========================
  // ESTILOS RÁPIDOS IN-Jectados
  // (solo si no quieres tocar gallery.css)
  // ========================
  (function injectQuickCSS () {
    if (document.getElementById('gallery-quick-css')) return;
    const css = `
      .gallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px}
      .loading-gallery-firebase,.error-gallery-firebase{
        grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;border-radius:12px;text-align:center
      }
      .spinner{width:60px;height:60px;border:4px solid #f3f3f3;border-top:4px solid #e0c88c;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:20px}
      @keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
    `;
    const style = Object.assign(document.createElement('style'), { id:'gallery-quick-css', innerHTML: css });
    document.head.appendChild(style);
  })();
  