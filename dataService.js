// dataService.js - Servicio de datos para el frontend
// Solo lectura, optimizado para la aplicación web

let firebaseAuth = null;
let authInitialized = false;

// Función para obtener autenticación
async function getAuth() {
  if (firebaseAuth) return firebaseAuth;
  
  try {
    const resp = await fetch('/src/firebase/firebase-client-config.json');
    if (!resp.ok) throw new Error('Configuración no encontrada');
    const config = await resp.json();
    
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    
    const app = initializeApp(config);
    firebaseAuth = getAuth(app);
    return firebaseAuth;
  } catch (error) {
    console.error('Error inicializando Auth:', error);
    throw error;
  }
}

// Función para autenticación anónima
async function iniciarSesionAnonima() {
  if (authInitialized) return true;
  
  try {
    const auth = await getAuth();
    const { signInAnonymously, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    
    // Verificar si ya hay un usuario autenticado
    if (auth.currentUser) {
      console.log('✅ Usuario ya autenticado:', auth.currentUser.uid);
      authInitialized = true;
      return true;
    }
    
    // Autenticación anónima
    console.log('🔐 Iniciando autenticación anónima...');
    const userCredential = await signInAnonymously(auth);
    
    console.log('✅ Autenticación anónima exitosa:', userCredential.user.uid);
    authInitialized = true;
    return true;
    
  } catch (error) {
    console.error('❌ Error en autenticación anónima:', error);
    
    // Información específica del error
    if (error.code === 'auth/operation-not-allowed') {
      console.error('🚫 Autenticación anónima no habilitada en Firebase Console');
    }
    
    return false;
  }
}
// ========================
// CONFIGURACIÓN Y UTILIDADES
// ========================
export function getViviendaId(v) {
  const planta = (v.piso || v.planta || '').toString().toLowerCase().replace(/\s+/g, '-');
  const letra = (v.letra || '').toString().toLowerCase();
  return v.id || [v.bloque, planta, letra].filter(Boolean).join('-');
}

function convertirPlanta(planta) {
  const mapa = {
    0: 'Bajo',
    1: 'Primero', 
    2: 'Segundo',
    3: 'Tercero',
    4: 'Cuarto'
  };
  return mapa[planta] || planta;
}

// ========================
// CONEXIÓN A FIREBASE
// ========================
async function getDb() {
  try {
    const resp = await fetch('/src/firebase/firebase-client-config.json');
    if (!resp.ok) throw new Error('credenciales no encontradas');
    const config = await resp.json();
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const app = initializeApp(config);
    return getFirestore(app);
  } catch (err) {
    console.error('Firebase no disponible:', err);
    throw new Error('No se pudo conectar a la base de datos');
  }
}


// ========================
// FUNCIONES DE FIREBASE STORAGE
// ========================

// Obtiene la URL de descarga de un archivo en Firebase Storage
export async function getDownloadUrl(filePath) {
  try {
    // Asegurar autenticación
    const authExitosa = await iniciarSesionAnonima();
    if (!authExitosa) {
      throw new Error('No se pudo autenticar para acceder al archivo');
    }
    
    const storage = await getStorage();
    const { ref, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js');
    const fileRef = ref(storage, filePath);
    
    const url = await getDownloadURL(fileRef);
    console.log(`✅ URL autenticada obtenida para: ${filePath}`);
    return url;
    
  } catch (err) {
    console.error(`❌ Error obteniendo URL para ${filePath}:`, err);
    
    // Información específica del error
    if (err.code === 'storage/unauthorized') {
      console.error('🔒 Error de autorización - usuario no autenticado o reglas restrictivas');
    } else if (err.code === 'storage/object-not-found') {
      console.error('📁 Archivo no encontrado en Storage');
    } else if (err.code === 'auth/operation-not-allowed') {
      console.error('🚫 Autenticación anónima no habilitada en Firebase');
    }
    
    throw new Error(`No se pudo obtener la URL del archivo: ${filePath} (${err.code || err.message})`);
  }
}

// Funciones específicas para documentos
export async function getMemoriaCalidadesUrl() {
  try {
    return await getDownloadUrl('MEMORIA CALIDADES_VENTANILLA.pdf');
  } catch (err) {
    console.warn('Error cargando memoria de calidades desde Storage, usando fallback');
    // Fallback a una URL local si existe
    return 'assets/docs/MEMORIA CALIDADES_VENTANILLA.pdf';
  }
}

export async function getPlanosArquitectonicosUrl() {
  try {
    return await getDownloadUrl('R05 PLANOS BASICO REFORMADO 22.pdf');
  } catch (err) {
    console.warn('Error cargando planos arquitectónicos desde Storage, usando fallback');
    // Fallback a una URL local si existe
    return 'assets/docs/R05 PLANOS BASICO REFORMADO 22.pdf';
  }
}

// Función genérica para obtener URL de plano específico
export async function getPlanoViviendaUrl(vivienda) {
  // PRIORIDAD 1: planoLink desde los datos de la vivienda
  if (vivienda.planoLink && vivienda.planoLink.trim() !== '') {
    // Si planoLink es una ruta de Storage, convertirla a URL de descarga
    if (vivienda.planoLink.startsWith('gs://') || vivienda.planoLink.includes('firebasestorage')) {
      try {
        // Extraer el path del archivo
        let filePath = vivienda.planoLink;
        if (filePath.startsWith('gs://')) {
          filePath = filePath.replace('gs://ventanilla-barsant.firebasestorage.app/', '');
        }
        return await getDownloadUrl(filePath);
      } catch (err) {
        console.warn('Error cargando plano desde planoLink:', err);
      }
    } else {
      // planoLink es una URL directa
      return vivienda.planoLink;
    }
  }
  
  // PRIORIDAD 2: Intentar cargar desde Storage usando patrón de nombres
  try {
    const plantaTexto = convertirPlanta(vivienda.planta);
    const fileName = `plano-${vivienda.bloque}-${plantaTexto}-${vivienda.letra}.pdf`;
    return await getDownloadUrl(fileName);
  } catch (err) {
    console.warn('Error cargando plano desde Storage con patrón:', err);
  }
  
  // PRIORIDAD 3: Fallback a URL local
  const plantaTexto = convertirPlanta(vivienda.planta);
  return `assets/docs/plano-${vivienda.bloque}-${plantaTexto}-${vivienda.letra}.pdf`;
}

// ========================
// FUNCIONES BÁSICAS - SIN FALLBACK LOCAL
// ========================

// Obtiene una vivienda por su ID desde datos_web
export async function fetchVivienda(id) {
  if (!id) return null;
  
  try {
    const db = await getDb();
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const snap = await getDoc(doc(db, 'datos_web', id));
    
    if (snap.exists()) {
      return { id, ...snap.data() };
    }
    
    return null;
  } catch (err) {
    console.error('Error obteniendo vivienda:', err);
    throw new Error(`No se pudo cargar la vivienda ${id}`);
  }
}

// Obtiene todas las viviendas desde datos_web
export async function fetchAllViviendas() {
  try {
    const db = await getDb();
    const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const snapshot = await getDocs(collection(db, 'datos_web'));
    
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Error obteniendo viviendas:', err);
    throw new Error('No se pudieron cargar las viviendas');
  }
}

// Obtiene una cochera por su ID
export async function fetchCochera(id) {
  if (!id) return null;
  
  try {
    const db = await getDb();
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const snap = await getDoc(doc(db, 'cocheras', id));
    
    return snap.exists() ? { id, ...snap.data() } : null;
  } catch (err) {
    console.error('Error obteniendo cochera:', err);
    return null;
  }
}

// Obtiene un trastero por su ID
export async function fetchTrastero(id) {
  if (!id) return null;
  
  try {
    const db = await getDb();
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const snap = await getDoc(doc(db, 'trasteros', id));
    
    return snap.exists() ? { id, ...snap.data() } : null;
  } catch (err) {
    console.error('Error obteniendo trastero:', err);
    return null;
  }
}

// ========================
// FUNCIONES AVANZADAS PARA FRONTEND
// ========================

// Obtiene vivienda con información completa de cochera y trastero
export async function fetchViviendaCompleta(id) {
  const vivienda = await fetchVivienda(id);
  if (!vivienda) return null;
  
  // Cargar información adicional de cochera si está asignada
  if (vivienda.cochera) {
    vivienda.cochera_info = await fetchCochera(vivienda.cochera);
  }
  
  // Cargar información adicional de trastero si está asignado
  if (vivienda.trastero) {
    vivienda.trastero_info = await fetchTrastero(vivienda.trastero);
  }
  
  return vivienda;
}

// Obtiene solo viviendas disponibles
export async function fetchViviendasDisponibles() {
  const viviendas = await fetchAllViviendas();
  return viviendas.filter(v => v.estado === 'disponible' || !v.estado);
}

// Obtiene viviendas por bloque
export async function fetchViviendasPorBloque(bloque) {
  const viviendas = await fetchAllViviendas();
  return viviendas.filter(v => v.bloque === bloque);
}

// Obtiene viviendas por tipo (exterior/interior)
export async function fetchViviendasPorTipo(tipo) {
  const viviendas = await fetchAllViviendas();
  return viviendas.filter(v => v.tipo_vivienda === tipo);
}

// Obtiene viviendas por número de dormitorios
export async function fetchViviendasPorDormitorios(dormitorios) {
  const viviendas = await fetchAllViviendas();
  return viviendas.filter(v => v.dormitorios === dormitorios);
}

// Obtiene viviendas en un rango de precio
export async function fetchViviendasPorPrecio(minPrecio, maxPrecio) {
  const viviendas = await fetchAllViviendas();
  return viviendas.filter(v => {
    const precio = v.precio_vivienda || v.precio_total || 0;
    return precio >= minPrecio && precio <= maxPrecio;
  });
}

// Búsqueda avanzada con múltiples filtros
export async function buscarViviendas(filtros = {}) {
  let viviendas = await fetchAllViviendas();
  
  // Aplicar filtros
  if (filtros.bloque) {
    viviendas = viviendas.filter(v => v.bloque === filtros.bloque);
  }
  
  if (filtros.dormitorios) {
    viviendas = viviendas.filter(v => v.dormitorios === filtros.dormitorios);
  }
  
  if (filtros.tipo_vivienda) {
    viviendas = viviendas.filter(v => v.tipo_vivienda === filtros.tipo_vivienda);
  }
  
  if (filtros.precio_min) {
    const precio = v => v.precio_vivienda || v.precio_total || 0;
    viviendas = viviendas.filter(v => precio(v) >= filtros.precio_min);
  }
  
  if (filtros.precio_max) {
    const precio = v => v.precio_vivienda || v.precio_total || 0;
    viviendas = viviendas.filter(v => precio(v) <= filtros.precio_max);
  }
  
  if (filtros.estado) {
    viviendas = viviendas.filter(v => v.estado === filtros.estado);
  }
  
  if (filtros.con_terraza) {
    viviendas = viviendas.filter(v => v.terraza && v.terraza > 0);
  }

  if (filtros.con_cochera) {
    viviendas = viviendas.filter(v => v.cochera);
  }

  if (filtros.con_trastero) {
    viviendas = viviendas.filter(v => v.trastero);
  }

  if (filtros.vinculado !== undefined) {
    viviendas = viviendas.filter(v => v.vinculado === filtros.vinculado);
  }
  
  return viviendas;
}

// ========================
// FUNCIONES DE UTILIDAD PARA LA UI
// ========================

// Genera el nombre completo de una vivienda
export function getNombreVivienda(vivienda) {
  const plantaTexto = convertirPlanta(vivienda.planta);
  return `Bloque ${vivienda.bloque} - ${plantaTexto} ${vivienda.letra}`;
}

// Genera la URL del plano (DEPRECATED - usar getPlanoViviendaUrl)
export function getUrlPlano(vivienda) {
  const plantaTexto = convertirPlanta(vivienda.planta).toLowerCase();
  return `../assets/docs/plano-${vivienda.bloque}-${plantaTexto}-${vivienda.letra}.pdf`;
}

// Formatea el precio
export function formatearPrecio(precio) {
  return `€${precio?.toLocaleString() || 0}`;
}

// Genera el subtítulo con características
export function getSubtituloVivienda(vivienda) {
  return `${vivienda.dormitorios} dormitorios · ${vivienda.baños} baños · ${vivienda.m2_construidos} m² construidos`;
}

// Calcula el precio total incluyendo cochera y trastero
export function calcularPrecioTotal(vivienda) {
  let total = vivienda.precio_vivienda || 0;
  
  if (vivienda.cochera && vivienda.precio_cochera) {
    total += vivienda.precio_cochera;
  }
  
  if (vivienda.trastero && vivienda.precio_trastero) {
    total += vivienda.precio_trastero;
  }
  
  return total;
}

// Obtiene información resumida de extras (cochera/trastero)
export function getExtrasInfo(vivienda) {
  const extras = [];
  
  if (vivienda.cochera) {
    extras.push({
      tipo: 'cochera',
      id: vivienda.cochera,
      precio: vivienda.precio_cochera,
      vinculado: vivienda.vinculado
    });
  }
  
  if (vivienda.trastero) {
    extras.push({
      tipo: 'trastero',
      id: vivienda.trastero,
      precio: vivienda.precio_trastero,
      vinculado: vivienda.vinculado
    });
  }
  
  return extras;
}

// ========================
// FUNCIÓN PARA CARGAR EN PÁGINA
// ========================
export async function loadViviendaFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const vivienda = await fetchViviendaCompleta(id);
  
  if (!vivienda) {
    const cont = document.getElementById('contenido');
    if (cont) cont.innerHTML = '<p>Vivienda no encontrada.</p>';
    return;
  }
  
  // Actualizar información básica
  const nombreElement = document.getElementById('nombre');
  if (nombreElement) {
    nombreElement.textContent = getNombreVivienda(vivienda);
  }
  
  const precioElement = document.getElementById('precio');
  if (precioElement) {
    const precio = vivienda.precio_vivienda || vivienda.precio_total || 0;
    precioElement.textContent = formatearPrecio(precio);
  }
  
  const subtituloElement = document.getElementById('subtitulo');
  if (subtituloElement) {
    subtituloElement.textContent = getSubtituloVivienda(vivienda);
  }
  
  // Actualizar campos individuales
  const supTotalElement = document.getElementById('sup_total');
  if (supTotalElement) {
    supTotalElement.textContent = `${vivienda.m2_construidos} m² construidos`;
  }
  
  const dormitoriosElement = document.getElementById('dormitorios');
  if (dormitoriosElement) {
    dormitoriosElement.textContent = `${vivienda.dormitorios} dormitorio(s)`;
  }
  
  const bañosElement = document.getElementById('baños');
  if (bañosElement) {
    bañosElement.textContent = `${vivienda.baños} baño(s)`;
  }
  
  // Log información de extras para depuración
  if (vivienda.cochera) {
    console.log('Cochera asignada:', vivienda.cochera, 'Precio:', vivienda.precio_cochera);
  }
  
  if (vivienda.trastero) {
    console.log('Trastero asignado:', vivienda.trastero, 'Precio:', vivienda.precio_trastero);
  }
  
  if (vivienda.vinculado) {
    console.log('Pack vinculado:', vivienda.vinculado);
  }
  
  return vivienda;
}

// ========================
// FUNCIONES PARA ESTADÍSTICAS
// ========================
export async function getEstadisticasViviendas() {
  const viviendas = await fetchAllViviendas();
  
  const stats = {
    total: viviendas.length,
    disponibles: viviendas.filter(v => v.estado === 'disponible' || !v.estado).length,
    reservadas: viviendas.filter(v => v.estado === 'reservada').length,
    vendidas: viviendas.filter(v => v.estado === 'vendida').length,
    con_cochera: viviendas.filter(v => v.cochera).length,
    con_trastero: viviendas.filter(v => v.trastero).length,
    packs_vinculados: viviendas.filter(v => v.vinculado).length,
    por_bloque: {},
    por_dormitorios: {},
    precio_medio: 0,
    precio_min: 0,
    precio_max: 0
  };
  
  // Estadísticas por bloque
  viviendas.forEach(v => {
    stats.por_bloque[v.bloque] = (stats.por_bloque[v.bloque] || 0) + 1;
    stats.por_dormitorios[v.dormitorios] = (stats.por_dormitorios[v.dormitorios] || 0) + 1;
  });
  
  // Estadísticas de precios
  const precios = viviendas.map(v => v.precio_vivienda || v.precio_total || 0).filter(p => p > 0);
  if (precios.length > 0) {
    stats.precio_medio = precios.reduce((a, b) => a + b, 0) / precios.length;
    stats.precio_min = Math.min(...precios);
    stats.precio_max = Math.max(...precios);
  }
  
  return stats;
}
// ========================
// MODIFICAR getStorage para incluir autenticación
// ========================
async function getStorage() {
  try {
    // Asegurar autenticación antes de acceder a Storage
    const authExitosa = await iniciarSesionAnonima();
    if (!authExitosa) {
      throw new Error('No se pudo autenticar para acceder a Storage');
    }
    
    const resp = await fetch('/src/firebase/firebase-client-config.json');
    if (!resp.ok) throw new Error('credenciales no encontradas');
    const config = await resp.json();
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getStorage } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js');
    const app = initializeApp(config);
    return getStorage(app);
  } catch (err) {
    console.error('Firebase Storage no disponible:', err);
    throw new Error('No se pudo conectar al almacenamiento: ' + err.message);
  }
}




// ========================
// FUNCIÓN PARA VERIFICAR ESTADO DE AUTENTICACIÓN
// ========================
export async function verificarEstadoAuth() {
  try {
    const auth = await getAuth();
    
    if (auth.currentUser) {
      console.log('👤 Usuario autenticado:');
      console.log(`   - UID: ${auth.currentUser.uid}`);
      console.log(`   - Anónimo: ${auth.currentUser.isAnonymous}`);
      console.log(`   - Proveedor: ${auth.currentUser.providerData[0]?.providerId || 'anonymous'}`);
      return true;
    } else {
      console.log('❌ No hay usuario autenticado');
      return false;
    }
  } catch (error) {
    console.error('Error verificando autenticación:', error);
    return false;
  }
}

// ========================
// AUTO-INICIALIZAR AUTENTICACIÓN AL CARGAR LA PÁGINA
// ========================
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar autenticación automáticamente
  setTimeout(async () => {
    console.log('🚀 Inicializando autenticación Firebase...');
    const exitosa = await iniciarSesionAnonima();
    
    if (exitosa) {
      console.log('✅ Sistema de autenticación listo');
      await verificarEstadoAuth();
    } else {
      console.error('❌ Fallo en la inicialización de autenticación');
    }
  }, 1000);
});
// ========================
// AÑADIR ESTAS FUNCIONES AL FINAL DE TU dataService.js
// ========================

// Cache de URLs de Firebase Storage
const FIREBASE_URL_CACHE = new Map();
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hora

// Lista de imágenes de la galería
const IMAGENES_GALERIA_FIREBASE = [
    { nombre: '06_ALZ_COMPLETO_CULT_R.png', prioridad: 1 },
    { nombre: '07_ALZ_COMPLETO_ESQUINA_CULT_R.png', prioridad: 1 },
    { nombre: '08_IMG_AEREA_1.jpg', prioridad: 1 },
    { nombre: '01_ALZ_1_CULT_R.png', prioridad: 2 },
    { nombre: '02_ALZ_2_CULT_R.png', prioridad: 2 },
    { nombre: '09_IMG_AEREA_2.jpg', prioridad: 2 },
    { nombre: '15_IMG_PLANTA_1.jpg', prioridad: 2 },
    { nombre: '03_ALZ_3_CULT_R.png', prioridad: 3 },
    { nombre: '04_ALZ_4_CULT_R.png', prioridad: 3 },
    { nombre: '05_ALZ_5_CULT_R.png', prioridad: 3 },
    { nombre: '10_IMG_PATIO_1.jpg', prioridad: 3 },
    { nombre: '11_IMG_PATIO_2.jpg', prioridad: 3 },
    { nombre: '12_IMG_PATIO_3.jpg', prioridad: 3 },
    { nombre: '13_IMG_PATIO_4.jpg', prioridad: 3 },
    { nombre: '14_IMG_PATIO_5.jpg', prioridad: 3 },
    { nombre: '16_IMG_PLANTA_2.jpg', prioridad: 3 },
    { nombre: '17_IMG_PLANTA_3.jpg', prioridad: 3 },
    { nombre: '18_IMG_BAÑO_P1.jpg', prioridad: 3 },
    { nombre: '19_IMG_BAÑO_P2.jpg', prioridad: 3 },
    { nombre: '20_IMG_BAÑO_P3.jpg', prioridad: 3 },
    { nombre: '21_IMG_DORM_P1.jpg', prioridad: 3 },
    { nombre: '22_IMG_DORM_P2.jpg', prioridad: 3 }
];

// Función principal para cargar galería desde Firebase
export async function cargarGaleriaFirebaseOptimizada() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;

    console.time('🔥 Galería Firebase');
    
    // Crear estructura con skeletons
    crearEstructuraGaleria(galleryGrid);
    
    // Cargar desde cache si existe
    await cargarDesdeCache();
    
    // Cargar por prioridades
    await cargarPorPrioridades();
    
    console.timeEnd('🔥 Galería Firebase');
}

// Crear estructura visual inmediata
function crearEstructuraGaleria(container) {
    container.innerHTML = '';
    
    IMAGENES_GALERIA_FIREBASE.forEach((imagen, index) => {
        const item = document.createElement('div');
        item.className = `gallery-item gallery-skeleton priority-${imagen.prioridad}`;
        item.dataset.imageName = imagen.nombre;
        item.innerHTML = `
            <div class="skeleton-shimmer">
                <div class="skeleton-icon">🖼️</div>
            </div>
        `;
        container.appendChild(item);
    });
}

// Cargar desde localStorage cache
async function cargarDesdeCache() {
    const cacheData = localStorage.getItem('firebase_gallery_cache');
    if (!cacheData) return;
    
    try {
        const cache = JSON.parse(cacheData);
        const now = Date.now();
        
        if (cache.timestamp && (now - cache.timestamp) < CACHE_EXPIRY) {
            for (const [nombreImagen, url] of Object.entries(cache.urls)) {
                FIREBASE_URL_CACHE.set(nombreImagen, url);
                const elemento = document.querySelector(`[data-image-name="${nombreImagen}"]`);
                if (elemento) {
                    cargarImagenEnElemento(elemento, url, nombreImagen);
                }
            }
            console.log(`⚡ Imágenes cargadas desde cache`);
        } else {
            localStorage.removeItem('firebase_gallery_cache');
        }
    } catch (error) {
        localStorage.removeItem('firebase_gallery_cache');
    }
}

// Cargar por prioridades
async function cargarPorPrioridades() {
    // Prioridad 1: Críticas
    const criticas = IMAGENES_GALERIA_FIREBASE.filter(img => img.prioridad === 1);
    await procesarGrupo(criticas, 3);
    
    // Prioridad 2: Importantes  
    const importantes = IMAGENES_GALERIA_FIREBASE.filter(img => img.prioridad === 2);
    await procesarGrupo(importantes, 4);
    
    // Prioridad 3: Lazy loading
    const secundarias = IMAGENES_GALERIA_FIREBASE.filter(img => img.prioridad === 3);
    configurarLazyLoading(secundarias);
}

// Procesar grupo de imágenes
async function procesarGrupo(imagenes, maxParalelo) {
    const chunks = [];
    for (let i = 0; i < imagenes.length; i += maxParalelo) {
        chunks.push(imagenes.slice(i, i + maxParalelo));
    }
    
    for (const chunk of chunks) {
        const promesas = chunk.map(imagen => cargarImagenFirebase(imagen));
        await Promise.allSettled(promesas);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

// Cargar imagen individual desde Firebase
async function cargarImagenFirebase(imagen) {
    if (FIREBASE_URL_CACHE.has(imagen.nombre)) {
        const url = FIREBASE_URL_CACHE.get(imagen.nombre);
        const elemento = document.querySelector(`[data-image-name="${imagen.nombre}"]`);
        if (elemento) {
            cargarImagenEnElemento(elemento, url, imagen.nombre);
        }
        return;
    }
    
    const elemento = document.querySelector(`[data-image-name="${imagen.nombre}"]`);
    if (!elemento) return;
    
    try {
        const url = await getDownloadUrl(imagen.nombre);
        FIREBASE_URL_CACHE.set(imagen.nombre, url);
        cargarImagenEnElemento(elemento, url, imagen.nombre);
    } catch (error) {
        console.error(`Error cargando ${imagen.nombre}:`, error);
        elemento.classList.add('gallery-error');
        elemento.innerHTML = `<div class="error-content">⚠️ Error</div>`;
    }
}

// Cargar imagen en elemento DOM
function cargarImagenEnElemento(elemento, url, nombreImagen) {
    if (elemento.classList.contains('gallery-loaded')) return;
    
    const img = new Image();
    img.onload = () => {
        elemento.style.backgroundImage = `url('${url}')`;
        elemento.classList.remove('gallery-skeleton');
        elemento.classList.add('gallery-loaded');
        elemento.innerHTML = '';
    };
    img.src = url;
}

// Configurar lazy loading
function configurarLazyLoading(imagenes) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const elemento = entry.target;
                const nombreImagen = elemento.dataset.imageName;
                const imagen = imagenes.find(img => img.nombre === nombreImagen);
                
                if (imagen && !elemento.classList.contains('gallery-loaded')) {
                    cargarImagenFirebase(imagen);
                    observer.unobserve(elemento);
                }
            }
        });
    }, { rootMargin: '200px' });
    
    imagenes.forEach(imagen => {
        const elemento = document.querySelector(`[data-image-name="${imagen.nombre}"]`);
        if (elemento) observer.observe(elemento);
    });
}

// Guardar cache local
function guardarCacheLocal() {
    const urlsParaCache = {};
    FIREBASE_URL_CACHE.forEach((url, nombre) => {
        urlsParaCache[nombre] = url;
    });
    
    try {
        localStorage.setItem('firebase_gallery_cache', JSON.stringify({
            urls: urlsParaCache,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.warn('Error guardando cache:', error);
    }
}

// Auto-guardar cache
window.addEventListener('beforeunload', guardarCacheLocal);
setInterval(() => {
    if (FIREBASE_URL_CACHE.size > 0) guardarCacheLocal();
}, 30000);