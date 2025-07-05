// ========================
// DATASERVICE.JS - SIN AUTENTICACIÓN
// Acceso público directo a Firebase Storage
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
// FIREBASE STORAGE - SIN AUTENTICACIÓN
// URLs públicas directas
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
// GALERÍA DE IMÁGENES - URLs PÚBLICAS
// ========================

// Lista de imágenes de la galería en Firebase Storage
const IMAGENES_GALERIA_FIREBASE = [
  '01_ALZ_1_CULT_R.png',
  '02_ALZ_2_CULT_R.png',
  '03_ALZ_3_CULT_R.png',
  '04_ALZ_4_CULT_R.png',
  '05_ALZ_5_CULT_R.png',
  '06_ALZ_COMPLETO_CULT_R.png',
  '07_ALZ_COMPLETO_ESQUINA_CULT_R.png',
  '08_IMG_AEREA_1.jpg',
  '09_IMG_AEREA_2.jpg',
  '10_IMG_PATIO_1.jpg',
  '11_IMG_PATIO_2.jpg',
  '12_IMG_PATIO_3.jpg',
  '13_IMG_PATIO_4.jpg',
  '14_IMG_PATIO_5.jpg',
  '15_IMG_PLANTA_1.jpg',
  '16_IMG_PLANTA_2.jpg',
  '17_IMG_PLANTA_3.jpg',
  '18_IMG_BAÑO_P1.jpg',
  '19_IMG_BAÑO_P2.jpg',
  '20_IMG_BAÑO_P3.jpg',
  '21_IMG_DORM_P1.jpg',
  '22_IMG_DORM_P2.jpg'
];

// Función para cargar galería con URLs públicas
export async function cargarGaleriaFirebaseOptimizada() {
  try {
      console.log('🔥 Cargando galería con URLs públicas...');
      
      // Generar URLs públicas para todas las imágenes
      const imagenesConUrl = IMAGENES_GALERIA_FIREBASE.map((nombreImagen, index) => {
          const url = getPublicStorageUrl(nombreImagen);
          console.log(`✅ URL pública generada: ${nombreImagen}`);
          
          return {
              nombre: nombreImagen,
              url: url,
              prioridad: index < 3 ? 1 : (index < 8 ? 2 : 3)
          };
      });
      
      console.log(`✅ Galería preparada: ${imagenesConUrl.length} imágenes con URLs públicas`);
      return imagenesConUrl;
      
  } catch (error) {
      console.error('❌ Error generando URLs públicas:', error);
      throw new Error(`Error en galería: ${error.message}`);
  }
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

console.log('🚀 DataService cargado - modo público sin autenticación');