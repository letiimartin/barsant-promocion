// ========================
// DATASERVICE.JS - OPTIMIZADO PARA GALERÍA
// Acceso público directo a Firebase Storage con optimizaciones
// ========================

// ========================
// CONFIGURACIÓN SIMPLE
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
// CONEXIÓN A FIREBASE FIRESTORE
// ========================
async function getDb() {
  try {
      const resp = await fetch('/src/firebase/firebase-client-config.json');
      if (!resp.ok) {
          throw new Error(`Credenciales no encontradas: ${resp.status}`);
      }
      
      const config = await resp.json();
      
      if (!config.apiKey || !config.projectId) {
          throw new Error('Configuración Firebase incompleta');
      }
      
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      
      const app = initializeApp(config);
      const db = getFirestore(app);
      
      console.log('✅ Firestore conectado correctamente');
      return db;
      
  } catch (err) {
      console.error('❌ Firebase no disponible:', err);
      throw new Error(`No se pudo conectar a la base de datos: ${err.message}`);
  }
}

// ========================
// FIREBASE STORAGE - OPTIMIZADO
// URLs públicas directas con soporte para múltiples tamaños
// ========================

// Función para generar URLs públicas de Firebase Storage
function getPublicStorageUrl(fileName) {
  // URL pública de Firebase Storage sin autenticación
  const projectId = 'ventanilla-barsant';
  const bucket = `${projectId}.firebasestorage.app`;
  
  // Codificar el nombre del archivo para URL
  const encodedFileName = encodeURIComponent(fileName);
  
  // URL de descarga pública (token alt=media para descarga directa)
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedFileName}?alt=media`;
}

// Función optimizada para generar URLs con diferentes tamaños
function getOptimizedStorageUrl(fileName, size = 'original') {
  // TEMPORALMENTE DESHABILITADO - usar solo imágenes originales
  // hasta que se suban las versiones optimizadas
  
  /*
  const sizeConfigs = {
    'thumbnail': '_200x150',  // Para thumbnails
    'medium': '_800x600',     // Para imagen principal
    'large': '_1200x900',     // Para fullscreen
    'original': ''            // Sin modificaciones
  };
  
  const extension = fileName.split('.').pop();
  const baseName = fileName.split('.').slice(0, -1).join('.');
  const suffix = sizeConfigs[size];
  
  // Si existe versión optimizada, usar esa URL
  if (suffix) {
    const optimizedFileName = `${baseName}${suffix}.${extension}`;
    return getPublicStorageUrl(optimizedFileName);
  }
  */
  
  // Por ahora, siempre retornar imagen original
  console.log(`📷 Usando imagen original para ${fileName} (tamaño solicitado: ${size})`);
  return getPublicStorageUrl(fileName);
}

// DOCUMENTOS ESPECÍFICOS - URLs públicas
export async function getMemoriaCalidadesUrl() {
  console.log('📄 Obteniendo memoria de calidades (URL pública)...');
  const url = getPublicStorageUrl('MEMORIA CALIDADES_VENTANILLA.pdf');
  console.log('✅ Memoria de calidades - URL pública generada');
  return url;
}

export async function getPlanosArquitectonicosUrl() {
  console.log('📐 Obteniendo planos arquitectónicos (URL pública)...');
  const url = getPublicStorageUrl('R05 PLANOS BASICO REFORMADO 22.pdf');
  console.log('✅ Planos arquitectónicos - URL pública generada');
  return url;
}

// Función para obtener URL de plano específico
export async function getPlanoViviendaUrl(vivienda) {
  // PRIORIDAD 1: planoLink desde los datos de la vivienda
  if (vivienda.planoLink && vivienda.planoLink.trim() !== '') {
      if (vivienda.planoLink.startsWith('http')) {
          return vivienda.planoLink;
      }
  }
  
  // PRIORIDAD 2: Generar URL pública usando patrón de nombres
  const plantaTexto = convertirPlanta(vivienda.planta);
  const fileName = `plano-${vivienda.bloque}-${plantaTexto}-${vivienda.letra}.pdf`;
  console.log(`📐 Generando URL pública para: ${fileName}`);
  return getPublicStorageUrl(fileName);
}

// ========================
// FIRESTORE - FUNCIONES BÁSICAS
// ========================

// Obtiene una vivienda por su ID
export async function fetchVivienda(id) {
  if (!id) {
      throw new Error('ID de vivienda requerido');
  }
  
  try {
      const db = await getDb();
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const snap = await getDoc(doc(db, 'datos_web', id));
      
      if (snap.exists()) {
          console.log(`✅ Vivienda ${id} cargada desde Firestore`);
          return { id, ...snap.data() };
      }
      
      throw new Error(`Vivienda con ID ${id} no encontrada en Firestore`);
      
  } catch (err) {
      console.error('❌ Error obteniendo vivienda:', err);
      throw new Error(`Error cargando vivienda ${id}: ${err.message}`);
  }
}

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

// Obtiene todas las viviendas
export async function fetchAllViviendas() {
  try {
      const db = await getDb();
      const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const snapshot = await getDocs(collection(db, 'datos_web'));
      
      if (snapshot.empty) {
          throw new Error('No se encontraron viviendas en Firestore');
      }
      
      const viviendas = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log(`✅ ${viviendas.length} viviendas cargadas desde Firestore`);
      return viviendas;
      
  } catch (err) {
      console.error('❌ Error obteniendo viviendas:', err);
      throw new Error(`Error cargando viviendas: ${err.message}`);
  }
}

// Obtiene una cochera por su ID
export async function fetchCochera(id) {
  if (!id) return null;
  
  try {
      const db = await getDb();
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const snap = await getDoc(doc(db, 'cocheras', id));
      
      if (snap.exists()) {
          console.log(`✅ Cochera ${id} cargada desde Firestore`);
          return { id, ...snap.data() };
      }
      
      return null;
  } catch (err) {
      console.error('Error obteniendo cochera:', err);
      throw new Error(`Error cargando cochera ${id}: ${err.message}`);
  }
}

// Obtiene un trastero por su ID
export async function fetchTrastero(id) {
  if (!id) return null;
  
  try {
      const db = await getDb();
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const snap = await getDoc(doc(db, 'trasteros', id));
      
      if (snap.exists()) {
          console.log(`✅ Trastero ${id} cargado desde Firestore`);
          return { id, ...snap.data() };
      }
      
      return null;
  } catch (err) {
      console.error('Error obteniendo trastero:', err);
      throw new Error(`Error cargando trastero ${id}: ${err.message}`);
  }
}

// Obtiene vivienda con información completa
export async function fetchViviendaCompleta(id) {
  const vivienda = await fetchVivienda(id);
  if (!vivienda) return null;
  
  // Cargar información adicional de cochera si está asignada
  if (vivienda.cochera) {
      try {
          vivienda.cochera_info = await fetchCochera(vivienda.cochera);
      } catch (err) {
          console.warn(`No se pudo cargar información de cochera ${vivienda.cochera}:`, err);
      }
  }
  
  // Cargar información adicional de trastero si está asignado
  if (vivienda.trastero) {
      try {
          vivienda.trastero_info = await fetchTrastero(vivienda.trastero);
      } catch (err) {
          console.warn(`No se pudo cargar información de trastero ${vivienda.trastero}:`, err);
      }
  }
  
  return vivienda;
}

// ========================
// GALERÍA DE IMÁGENES - OPTIMIZADA
// ========================

// Lista actualizada de imágenes de la galería en Firebase Storage
const IMAGENES_GALERIA_FIREBASE = [
  // Alzados y vistas exteriores (1-7)
  '01_ALZ_1_CULT_R.png',
  '02_ALZ_2_CULT_R.png',
  '03_ALZ_3_CULT_R.png',
  '04_ALZ_4_CULT_R.png',
  '05_ALZ_5_CULT_R.png',
  '06_ALZ_COMPLETO_CULT_R.png',
  '07_ALZ_COMPLETO_ESQUINA_CULT_R.png',
  
  // Vistas aéreas (8-9)
  '08_IMG_AEREA_1.jpg',
  '09_IMG_AEREA_2.jpg',
  
  // Patios interiores (10-14)
  '10_IMG_PATIO_1.jpg',
  '11_IMG_PATIO_2.jpg',
  '12_IMG_PATIO_3.jpg',
  '13_IMG_PATIO_4.jpg',
  '14_IMG_PATIO_5.jpg',
  
  // Distribuciones de plantas (15-17)
  '15_IMG_PLANTA_1.jpg',
  '16_IMG_PLANTA_2.jpg',
  '17_IMG_PLANTA_3.jpg',
  
  // Baños (18-22)
  '18_IMG_BAÑO_P1.jpg',
  '19_IMG_BAÑO_P2.jpg',
  '20_IMG_BAÑO_P3.jpg',
  '21_IMG_BAÑO_P4.jpg',
  '22_IMG_BAÑO_P5.jpg',
  
  // Dormitorios (23-26)
  '23_IMG_DORM_P1.jpg',
  '24_IMG_DORM_P2.jpg',
  '25_IMG_DORM_P3.jpg',
  '26_IMG_DORM_P4.jpg'
];

// Mapeo de nombres actualizado
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
      
      // Baños (actualizados)
      '18_IMG_BAÑO_P1': 'Imagen 1 Baño',
      '19_IMG_BAÑO_P2': 'Imagen 2 Baño',
      '20_IMG_BAÑO_P3': 'Imagen 3 Baño',
      '21_IMG_BAÑO_P4': 'Imagen 4 Baño',
      '22_IMG_BAÑO_P5': 'Imagen 5 Baño',
      
      // Dormitorios (nuevos)
      '23_IMG_DORM_P1': 'Imagen 1 Dormitorio',
      '24_IMG_DORM_P2': 'Imagen 2 Dormitorio',
      '25_IMG_DORM_P3': 'Imagen 3 Dormitorio',
      '26_IMG_DORM_P4': 'Imagen 4 Dormitorio'
  };
  
  return nameMap[fileName] || `Imagen ${index + 1}`;
}

// Función optimizada para cargar galería con prioridades y tamaños múltiples
export async function cargarGaleriaFirebaseOptimizada() {
  try {
      console.log('🔥 Cargando galería con URLs públicas (solo originales)...');
      
      // Generar URLs solo con imágenes originales por ahora
      const imagenesConUrl = IMAGENES_GALERIA_FIREBASE.map((nombreImagen, index) => {
          // Solo URL original hasta que se suban las optimizadas
          const urlOriginal = getPublicStorageUrl(nombreImagen);
          
          // Determinar prioridad de carga
          let prioridad;
          if (index < 3) {
              prioridad = 1; // Crítica - cargar inmediatamente
          } else if (index < 8) {
              prioridad = 2; // Alta - cargar pronto
          } else if (index < 15) {
              prioridad = 3; // Media - cargar después
          } else {
              prioridad = 4; // Baja - cargar al final
          }
          
          console.log(`✅ URL generada para: ${nombreImagen} (Prioridad: ${prioridad})`);
          
          return {
              nombre: nombreImagen,
              nombreDisplay: getNombreImagen(nombreImagen, index),
              url: urlOriginal,           // URL original
              urlThumbnail: urlOriginal,  // Misma URL por ahora
              urlMedium: urlOriginal,     // Misma URL por ahora
              urlLarge: urlOriginal,      // Misma URL por ahora
              prioridad: prioridad,
              index: index,
              categoria: getCategoriaImagen(nombreImagen)
          };
      });
      
      console.log(`✅ Galería preparada: ${imagenesConUrl.length} imágenes (solo originales)`);
      return imagenesConUrl;
      
  } catch (error) {
      console.error('❌ Error generando URLs públicas:', error);
      throw new Error(`Error en galería: ${error.message}`);
  }
}

// Función para categorizar imágenes
function getCategoriaImagen(nombreArchivo) {
  const fileName = nombreArchivo.split('.')[0];
  
  if (fileName.includes('ALZ')) return 'fachada';
  if (fileName.includes('AEREA')) return 'aerea';
  if (fileName.includes('PATIO')) return 'patio';
  if (fileName.includes('PLANTA')) return 'planta';
  if (fileName.includes('BAÑO')) return 'baño';
  if (fileName.includes('DORM')) return 'dormitorio';
  
  return 'general';
}

// Función para cargar galería con lazy loading inteligente
export async function cargarGaleriaConLazyLoading() {
  try {
      console.log('🚀 Iniciando carga con lazy loading inteligente...');
      
      const todasLasImagenes = await cargarGaleriaFirebaseOptimizada();
      
      // Separar por prioridades
      const imagenesInmediatas = todasLasImagenes.filter(img => img.prioridad === 1);
      const imagenesTempranas = todasLasImagenes.filter(img => img.prioridad === 2);
      const imagenesMedias = todasLasImagenes.filter(img => img.prioridad === 3);
      const imagenesTardias = todasLasImagenes.filter(img => img.prioridad === 4);
      
      console.log(`📊 Distribución de carga:
        - Inmediatas (P1): ${imagenesInmediatas.length}
        - Tempranas (P2): ${imagenesTempranas.length}
        - Medias (P3): ${imagenesMedias.length}
        - Tardías (P4): ${imagenesTardias.length}`);
      
      // Retornar todas para que el frontend maneje el lazy loading
      return todasLasImagenes;
      
  } catch (error) {
      console.error('❌ Error en carga con lazy loading:', error);
      throw new Error(`Error en lazy loading: ${error.message}`);
  }
}

// Función para obtener imagen con el tamaño apropiado
export function getImagenOptimizada(imagen, tamaño = 'medium') {
  if (!imagen) return null;
  
  // Por ahora, siempre retornar la URL original
  // hasta que se suban las versiones optimizadas
  console.log(`📷 Solicitado tamaño "${tamaño}" para ${imagen.nombre}, devolviendo original`);
  return imagen.url;
  
  /*
  // Código para cuando tengamos imágenes optimizadas:
  switch (tamaño) {
      case 'thumbnail':
          return imagen.urlThumbnail || imagen.url;
      case 'medium':
          return imagen.urlMedium || imagen.url;
      case 'large':
          return imagen.urlLarge || imagen.url;
      case 'original':
      default:
          return imagen.url;
  }
  */
}

// Función para precargar imagen específica
export async function precargarImagen(imagen, tamaño = 'medium') {
  return new Promise((resolve, reject) => {
      const img = new Image();
      const url = getImagenOptimizada(imagen, tamaño);
      
      img.onload = () => {
          console.log(`✅ Imagen precargada: ${imagen.nombreDisplay} (${tamaño})`);
          resolve(img);
      };
      
      img.onerror = () => {
          console.warn(`⚠️ Error precargando: ${imagen.nombreDisplay}`);
          reject(new Error(`Error precargando imagen: ${imagen.nombre}`));
      };
      
      img.src = url;
  });
}

// ========================
// FUNCIONES DE UTILIDAD
// ========================

// Genera el nombre completo de una vivienda
export function getNombreVivienda(vivienda) {
  const plantaTexto = convertirPlanta(vivienda.planta);
  return `Bloque ${vivienda.bloque} - ${plantaTexto} ${vivienda.letra}`;
}

// Formatea el precio
export function formatearPrecio(precio) {
  return `€${precio?.toLocaleString() || 0}`;
}

// Genera el subtítulo con características
export function getSubtituloVivienda(vivienda) {
  return `${vivienda.dormitorios} dormitorios · ${vivienda.baños} baños · ${vivienda.m2_construidos} m² construidos`;
}

// ========================
// FUNCIONES LEGACY (para compatibilidad)
// ========================

// Funciones que ahora generan URLs públicas
export async function iniciarSesionAnonima() {
  console.log('✅ Sin autenticación requerida - usando URLs públicas');
  return true;
}

export async function verificarEstadoAuth() {
  console.log('✅ Sin autenticación - acceso público directo');
  return true;
}

export async function getDownloadUrl(filePath) {
  console.log(`📁 Generando URL pública para: ${filePath}`);
  return getPublicStorageUrl(filePath);
}

console.log('🚀 DataService optimizado cargado - modo público con múltiples tamaños');