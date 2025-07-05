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
  