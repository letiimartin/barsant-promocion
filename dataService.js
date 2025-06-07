// dataService.js - Servicio de datos para el frontend
// Solo lectura, optimizado para la aplicación web

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
    console.warn('Firebase no disponible:', err);
    return null;
  }
}

// ========================
// FUNCIONES DE FALLBACK LOCAL
// ========================
async function getLocalViviendas() {
  const res = await fetch('/data/viviendas.json');
  const data = await res.json();
  return data.map(v => ({ ...v, id: getViviendaId(v) }));
}

async function getLocalCocheras() {
  try {
    const res = await fetch('/data/cocheras.json');
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('No se pudo cargar cocheras locales:', err);
    return [];
  }
}

async function getLocalTrasteros() {
  try {
    const res = await fetch('/data/trasteros.json');
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('No se pudo cargar trasteros locales:', err);
    return [];
  }
}

// ========================
// FUNCIONES BÁSICAS (tu código actual mejorado)
// ========================

// Obtiene una vivienda por su ID
export async function fetchVivienda(id) {
  if (!id) return null;
  
  const db = await getDb();
  if (db) {
    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const snap = await getDoc(doc(db, 'viviendas', id));
      return snap.exists() ? { id, ...snap.data() } : null;
    } catch (err) {
      console.warn('Fallo Firebase, usando datos locales:', err);
    }
  }
  
  const vivs = await getLocalViviendas();
  return vivs.find(v => v.id === id) || null;
}

// Obtiene todas las viviendas
export async function fetchAllViviendas() {
  const db = await getDb();
  if (db) {
    try {
      const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const snapshot = await getDocs(collection(db, 'viviendas'));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn('Error leyendo Firebase, usando datos locales:', err);
    }
  }
  return await getLocalViviendas();
}

// Obtiene una cochera por su ID
export async function fetchCochera(id) {
  if (!id) return null;
  
  const db = await getDb();
  if (db) {
    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const snap = await getDoc(doc(db, 'cocheras', id));
      return snap.exists() ? { id, ...snap.data() } : null;
    } catch (err) {
      console.warn('Fallo Firebase para cochera, usando datos locales:', err);
    }
  }
  
  const cocheras = await getLocalCocheras();
  return cocheras.find(c => c.id === id) || null;
}

// Obtiene un trastero por su ID
export async function fetchTrastero(id) {
  if (!id) return null;
  
  const db = await getDb();
  if (db) {
    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const snap = await getDoc(doc(db, 'trasteros', id));
      return snap.exists() ? { id, ...snap.data() } : null;
    } catch (err) {
      console.warn('Fallo Firebase para trastero, usando datos locales:', err);
    }
  }
  
  const trasteros = await getLocalTrasteros();
  return trasteros.find(t => t.id === id) || null;
}

// ========================
// FUNCIONES AVANZADAS PARA FRONTEND
// ========================

// Obtiene vivienda con información completa de cochera y trastero
export async function fetchViviendaCompleta(id) {
  const vivienda = await fetchVivienda(id);
  if (!vivienda) return null;
  
  // Cargar cochera si está asignada
  if (vivienda.cochera_asignada) {
    vivienda.cochera_info = await fetchCochera(vivienda.cochera_asignada);
  }
  
  // Cargar trastero si está asignado
  if (vivienda.trastero_asignado) {
    vivienda.trastero_info = await fetchTrastero(vivienda.trastero_asignado);
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
  return viviendas.filter(v => 
    v.precio >= minPrecio && v.precio <= maxPrecio
  );
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
    viviendas = viviendas.filter(v => v.precio >= filtros.precio_min);
  }
  
  if (filtros.precio_max) {
    viviendas = viviendas.filter(v => v.precio <= filtros.precio_max);
  }
  
  if (filtros.estado) {
    viviendas = viviendas.filter(v => v.estado === filtros.estado);
  }
  
  if (filtros.con_terraza) {
    viviendas = viviendas.filter(v => v.terraza && v.terraza > 0);
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

// Genera la URL del plano
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
  return `${vivienda.dormitorios} dormitorios · ${vivienda.baños} baños · ${vivienda.sup_util} m² útiles · ${vivienda.sup_total} m² construidos`;
}

// ========================
// FUNCIÓN PARA CARGAR EN PÁGINA (tu código actual mejorado)
// ========================
export async function loadViviendaFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const vivienda = await fetchViviendaCompleta(id); // Usar versión completa
  
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
    precioElement.textContent = formatearPrecio(vivienda.precio);
  }
  
  const subtituloElement = document.getElementById('subtitulo');
  if (subtituloElement) {
    subtituloElement.textContent = getSubtituloVivienda(vivienda);
  }
  
  // Actualizar campos individuales (compatibilidad con template actual)
  const supUtilElement = document.getElementById('sup_util');
  if (supUtilElement) {
    supUtilElement.textContent = `${vivienda.sup_util} m² útiles`;
  }
  
  const supTotalElement = document.getElementById('sup_total');
  if (supTotalElement) {
    supTotalElement.textContent = `${vivienda.sup_total} m² construidos`;
  }
  
  const dormitoriosElement = document.getElementById('dormitorios');
  if (dormitoriosElement) {
    dormitoriosElement.textContent = `${vivienda.dormitorios} dormitorio(s)`;
  }
  
  const bañosElement = document.getElementById('baños');
  if (bañosElement) {
    bañosElement.textContent = `${vivienda.baños} baño(s)`;
  }
  
  // Mostrar información de cochera y trastero si existe
  if (vivienda.cochera_info) {
    console.log('Cochera asignada:', vivienda.cochera_info);
  }
  
  if (vivienda.trastero_info) {
    console.log('Trastero asignado:', vivienda.trastero_info);
  }
  
  return vivienda;
}

// ========================
// FUNCIONES PARA ESTADÍSTICAS (útiles para dashboards)
// ========================
export async function getEstadisticasViviendas() {
  const viviendas = await fetchAllViviendas();
  
  const stats = {
    total: viviendas.length,
    disponibles: viviendas.filter(v => v.estado === 'disponible' || !v.estado).length,
    reservadas: viviendas.filter(v => v.estado === 'reservada').length,
    vendidas: viviendas.filter(v => v.estado === 'vendida').length,
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
  const precios = viviendas.map(v => v.precio).filter(p => p);
  if (precios.length > 0) {
    stats.precio_medio = precios.reduce((a, b) => a + b, 0) / precios.length;
    stats.precio_min = Math.min(...precios);
    stats.precio_max = Math.max(...precios);
  }
  
  return stats;
}