// ========================
// DATASERVICE.JS - OPTIMIZADO PARA GALERIA
// Acceso publico directo a Firebase Storage con optimizaciones
// ========================

// ========================
// CONFIGURACION SIMPLE
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
// CONEXION A FIREBASE FIRESTORE
// ========================
async function getDb() {
  try {
      const resp = await fetch('/src/firebase/firebase-client-config.json');
      if (!resp.ok) {
          throw new Error(`Credenciales no encontradas: ${resp.status}`);
      }
      
      const config = await resp.json();
      
      if (!config.apiKey || !config.projectId) {
          throw new Error('Configuracion Firebase incompleta');
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
// URLs publicas directas con soporte para multiples tamanos
// ========================

// Funcion para generar URLs publicas de Firebase Storage
function getPublicStorageUrl(fileName) {
  // URL publica de Firebase Storage sin autenticacion
  const projectId = 'ventanilla-barsant';
  const bucket = `${projectId}.firebasestorage.app`;
  
  // Codificar el nombre del archivo para URL
  const encodedFileName = encodeURIComponent(fileName);
  
  // URL de descarga publica (token alt=media para descarga directa)
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedFileName}?alt=media`;
}

// DOCUMENTOS ESPECIFICOS - URLs publicas
export async function getMemoriaCalidadesUrl() {
  console.log('📄 Obteniendo memoria de calidades (URL publica)...');
  const url = getPublicStorageUrl('MEMORIA CALIDADES_VENTANILLA.pdf');
  console.log('✅ Memoria de calidades - URL publica generada');
  return url;
}

export async function getPlanosArquitectonicosUrl() {
  console.log('📐 Obteniendo planos arquitectonicos (URL publica)...');
  const url = getPublicStorageUrl('R05 PLANOS BASICO REFORMADO 22.pdf');
  console.log('✅ Planos arquitectonicos - URL publica generada');
  return url;
}

// Funcion para obtener URL de plano especifico
export async function getPlanoViviendaUrl(vivienda) {
  // PRIORIDAD 1: planoLink desde los datos de la vivienda
  if (vivienda.planoLink && vivienda.planoLink.trim() !== '') {
      if (vivienda.planoLink.startsWith('http')) {
          return vivienda.planoLink;
      }
  }
  
  // PRIORIDAD 2: Generar URL publica usando patron de nombres
  const plantaTexto = convertirPlanta(vivienda.planta);
  const fileName = `plano-${vivienda.bloque}-${plantaTexto}-${vivienda.letra}.pdf`;
  console.log(`📐 Generando URL publica para: ${fileName}`);
  return getPublicStorageUrl(fileName);
}

// ========================
// FIRESTORE - FUNCIONES BASICAS
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
  
  // Actualizar informacion basica
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
  
  const banosElement = document.getElementById('banos');
  if (banosElement) {
    banosElement.textContent = `${vivienda.banos} bano(s)`;
  }
  
  // Log informacion de extras para depuracion
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

// Obtiene vivienda con informacion completa
export async function fetchViviendaCompleta(id) {
  const vivienda = await fetchVivienda(id);
  if (!vivienda) return null;
  
  // Cargar informacion adicional de cochera si esta asignada
  if (vivienda.cochera) {
      try {
          vivienda.cochera_info = await fetchCochera(vivienda.cochera);
      } catch (err) {
          console.warn(`No se pudo cargar informacion de cochera ${vivienda.cochera}:`, err);
      }
  }
  
  // Cargar informacion adicional de trastero si esta asignado
  if (vivienda.trastero) {
      try {
          vivienda.trastero_info = await fetchTrastero(vivienda.trastero);
      } catch (err) {
          console.warn(`No se pudo cargar informacion de trastero ${vivienda.trastero}:`, err);
      }
  }
  
  return vivienda;
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

// Genera el subtitulo con caracteristicas
export function getSubtituloVivienda(vivienda) {
  return `${vivienda.dormitorios} dormitorios · ${vivienda.banos} banos · ${vivienda.m2_construidos} m² construidos`;
}

// ========================
// FUNCIONES LEGACY (para compatibilidad)
// ========================

// Funciones que ahora generan URLs publicas
export async function iniciarSesionAnonima() {
  console.log('✅ Sin autenticacion requerida - usando URLs publicas');
  return true;
}

export async function verificarEstadoAuth() {
  console.log('✅ Sin autenticacion - acceso publico directo');
  return true;
}

export async function getDownloadUrl(filePath) {
  console.log(`📐 Generando URL publica para: ${filePath}`);
  return getPublicStorageUrl(filePath);
}

console.log('🚀 DataService optimizado cargado - modo publico');

// Funcion para forzar recarga de datos (sin cache)
export async function forzarRecargaDatos() {
  try {
    console.log('🔄 Forzando recarga de datos desde Firebase...');
    
    const db = await getDb();
    const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    
    // Obtener datos frescos con timestamp para evitar cache
    const snapshot = await getDocs(collection(db, 'datos_web'));
    
    if (snapshot.empty) {
      throw new Error('No se encontraron viviendas en Firebase');
    }
    
    const viviendasFrescas = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Limpiar cualquier cache que pueda existir
    if (window.viviendas) {
      window.viviendas = viviendasFrescas;
    }
    
    console.log(`✅ ${viviendasFrescas.length} viviendas recargadas desde Firebase`);
    console.log('📊 Estados actuales:', 
      viviendasFrescas.reduce((acc, v) => {
        acc[v.estado] = (acc[v.estado] || 0) + 1;
        return acc;
      }, {})
    );
    
    return viviendasFrescas;
    
  } catch (err) {
    console.error('❌ Error forzando recarga:', err);
    throw err;
  }
}

// Funcion para debugging - mostrar estados actuales
export async function mostrarEstadosActuales() {
  try {
    const viviendas = await fetchAllViviendas();
    
    console.log('📋 ESTADOS ACTUALES DE VIVIENDAS:');
    console.log('================================');
    
    const estadisticas = viviendas.reduce((acc, v) => {
      const key = `${v.bloque} ${v.planta} ${v.letra}`;
      acc[key] = v.estado;
      return acc;
    }, {});
    
    Object.entries(estadisticas)
      .sort()
      .forEach(([vivienda, estado]) => {
        const emoji = estado === 'Disponible' ? '✅' : '🔴';
        console.log(`${emoji} ${vivienda}: ${estado}`);
      });
    
    const totales = viviendas.reduce((acc, v) => {
      acc[v.estado] = (acc[v.estado] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 RESUMEN:');
    Object.entries(totales).forEach(([estado, cantidad]) => {
      console.log(`${estado}: ${cantidad} viviendas`);
    });
    
    return viviendas;
    
  } catch (err) {
    console.error('❌ Error obteniendo estados:', err);
  }
}