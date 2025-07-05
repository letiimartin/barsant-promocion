// ========================
// DATASERVICE.JS - SOLO FIREBASE
// Sin referencias a archivos locales o carpeta assets
// ========================

let firebaseAuth = null;
let authInitialized = false;

// ========================
// VALIDACIÓN DE ENTORNO
// ========================
function validarEntorno() {
  // Verificar conectividad básica
  if (!navigator.onLine) {
      console.warn('⚠️ Sin conexión a internet');
      return false;
  }
  
  // Verificar contexto de navegador
  if (typeof window === 'undefined') {
      console.warn('⚠️ No se está ejecutando en un navegador');
      return false;
  }
  
  // Verificar soporte para fetch
  if (typeof fetch === 'undefined') {
      console.warn('⚠️ Navegador no soporta fetch API');
      return false;
  }
  
  return true;
}

// Función para obtener autenticación con validación mejorada
async function getAuth() {
    if (firebaseAuth) return firebaseAuth;
    
    try {
        if (!validarEntorno()) {
            throw new Error('Entorno no compatible');
        }
        
        const resp = await fetch('/src/firebase/firebase-client-config.json');
        if (!resp.ok) {
            throw new Error(`Configuración no encontrada: ${resp.status}`);
        }
        
        const config = await resp.json();
        
        if (!config.apiKey || !config.projectId) {
            throw new Error('Configuración Firebase incompleta');
        }
        
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
        const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        
        const app = initializeApp(config);
        firebaseAuth = getAuth(app);
        
        console.log('✅ Firebase Auth inicializado correctamente');
        return firebaseAuth;
        
    } catch (error) {
        console.error('❌ Error inicializando Auth:', error);
        throw new Error(`Error de autenticación: ${error.message}`);
    }
}

// Función para autenticación anónima con reintentos
async function iniciarSesionAnonima(reintentos = 3) {
    if (authInitialized) return true;
    
    for (let intento = 1; intento <= reintentos; intento++) {
        try {
            console.log(`🔐 Iniciando autenticación anónima (intento ${intento}/${reintentos})...`);
            
            const auth = await getAuth();
            const { signInAnonymously } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
            
            // Verificar si ya hay un usuario autenticado
            if (auth.currentUser) {
                console.log('✅ Usuario ya autenticado:', auth.currentUser.uid);
                authInitialized = true;
                return true;
            }
            
            // Autenticación anónima
            const userCredential = await signInAnonymously(auth);
            console.log('✅ Autenticación anónima exitosa:', userCredential.user.uid);
            authInitialized = true;
            return true;
            
        } catch (error) {
            console.error(`❌ Error en autenticación anónima (intento ${intento}):`, error);
            
            if (error.code === 'auth/operation-not-allowed') {
                console.error('🚫 Autenticación anónima no habilitada en Firebase Console');
                throw new Error('Autenticación anónima no configurada en Firebase');
            }
            
            if (intento === reintentos) {
                throw new Error('No se pudo completar la autenticación después de varios intentos');
            }
            
            // Esperar antes del siguiente intento
            await new Promise(resolve => setTimeout(resolve, 1000 * intento));
        }
    }
    
    return false;
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
        if (!validarEntorno()) {
            throw new Error('Entorno no compatible');
        }
        
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
// CONEXIÓN A FIREBASE STORAGE
// ========================
async function getStorage() {
    try {
        // Asegurar autenticación antes de acceder a Storage
        const authExitosa = await iniciarSesionAnonima();
        if (!authExitosa) {
            throw new Error('No se pudo autenticar para acceder a Storage');
        }
        
        const resp = await fetch('/src/firebase/firebase-client-config.json');
        if (!resp.ok) {
            throw new Error(`Credenciales no encontradas: ${resp.status}`);
        }
        
        const config = await resp.json();
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
        const { getStorage } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js');
        const app = initializeApp(config);
        return getStorage(app);
        
    } catch (err) {
        console.error('❌ Firebase Storage no disponible:', err);
        throw new Error(`No se pudo conectar al almacenamiento: ${err.message}`);
    }
}

// ========================
// FUNCIONES DE FIREBASE STORAGE - SOLO FIREBASE
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
            throw new Error(`Error de autorización: Verifique que la autenticación anónima esté habilitada y las reglas de Storage permitan acceso al archivo: ${filePath}`);
        } else if (err.code === 'storage/object-not-found') {
            throw new Error(`Archivo no encontrado en Firebase Storage: ${filePath}. Verifique que el archivo existe en Storage.`);
        } else if (err.code === 'auth/operation-not-allowed') {
            throw new Error('Autenticación anónima no habilitada en Firebase Console');
        }
        
        throw new Error(`Error accediendo al archivo ${filePath}: ${err.message}`);
    }
}

// SOLO FIREBASE: Funciones específicas para documentos
export async function getMemoriaCalidadesUrl() {
    try {
        console.log('📄 Obteniendo memoria de calidades desde Firebase Storage...');
        const url = await getDownloadUrl('MEMORIA CALIDADES_VENTANILLA.pdf');
        console.log('✅ Memoria de calidades obtenida desde Firebase Storage');
        return url;
    } catch (err) {
        console.error('❌ Error obteniendo memoria de calidades desde Firebase Storage:', err);
        throw new Error(`No se pudo obtener la memoria de calidades: ${err.message}`);
    }
}

export async function getPlanosArquitectonicosUrl() {
    try {
        console.log('📐 Obteniendo planos arquitectónicos desde Firebase Storage...');
        const url = await getDownloadUrl('R05 PLANOS BASICO REFORMADO 22.pdf');
        console.log('✅ Planos arquitectónicos obtenidos desde Firebase Storage');
        return url;
    } catch (err) {
        console.error('❌ Error obteniendo planos arquitectónicos desde Firebase Storage:', err);
        throw new Error(`No se pudieron obtener los planos arquitectónicos: ${err.message}`);
    }
}

// Función para obtener URL de plano específico - SOLO FIREBASE
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
                console.error('Error cargando plano desde planoLink:', err);
                throw new Error(`Error cargando plano específico desde planoLink: ${err.message}`);
            }
        } else if (vivienda.planoLink.startsWith('http')) {
            // planoLink es una URL directa
            return vivienda.planoLink;
        }
    }
    
    // PRIORIDAD 2: Intentar cargar desde Storage usando patrón de nombres
    try {
        const plantaTexto = convertirPlanta(vivienda.planta);
        const fileName = `plano-${vivienda.bloque}-${plantaTexto}-${vivienda.letra}.pdf`;
        console.log(`📐 Buscando plano con patrón: ${fileName}`);
        return await getDownloadUrl(fileName);
    } catch (err) {
        console.error('Error cargando plano desde Storage con patrón:', err);
        throw new Error(`No se encontró el plano para la vivienda ${vivienda.bloque}-${vivienda.planta}-${vivienda.letra} en Firebase Storage: ${err.message}`);
    }
}

// ========================
// FUNCIONES BÁSICAS FIRESTORE
// ========================

// Obtiene una vivienda por su ID desde datos_web
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

// Obtiene todas las viviendas desde datos_web
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

// ========================
// FUNCIONES AVANZADAS PARA FRONTEND
// ========================

// Obtiene vivienda con información completa de cochera y trastero
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
// FUNCIONES PARA VERIFICAR ESTADO DE AUTENTICACIÓN
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
        console.error('❌ Error verificando autenticación:', error);
        return false;
    }
}

// ========================
// FUNCIONES DE UTILIDAD PARA LA UI
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
// GALERÍA DE IMÁGENES - SOLO FIREBASE
// ========================

// Lista de imágenes de la galería en Firebase Storage
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

// Función para cargar galería completamente desde Firebase
export async function cargarGaleriaFirebaseOptimizada() {
    try {
        console.log('🔥 Cargando galería completa desde Firebase Storage...');
        
        // Asegurar autenticación
        const authExitosa = await iniciarSesionAnonima();
        if (!authExitosa) {
            throw new Error('No se pudo autenticar para acceder a las imágenes');
        }
        
        // Cargar todas las imágenes desde Firebase
        const imagenesConUrl = [];
        
        for (const imagen of IMAGENES_GALERIA_FIREBASE) {
            try {
                const url = await getDownloadUrl(imagen.nombre);
                imagenesConUrl.push({
                    ...imagen,
                    url: url
                });
                console.log(`✅ Imagen cargada: ${imagen.nombre}`);
            } catch (error) {
                console.error(`❌ Error cargando imagen ${imagen.nombre}:`, error);
                // Continúar con las demás imágenes
            }
        }
        
        if (imagenesConUrl.length === 0) {
            throw new Error('No se pudieron cargar imágenes desde Firebase Storage');
        }
        
        console.log(`✅ Galería cargada: ${imagenesConUrl.length} imágenes desde Firebase Storage`);
        return imagenesConUrl;
        
    } catch (error) {
        console.error('❌ Error cargando galería desde Firebase:', error);
        throw new Error(`Error cargando galería: ${error.message}`);
    }
}

// ========================
// AUTO-INICIALIZACIÓN
// ========================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar autenticación automáticamente
    setTimeout(async () => {
        console.log('🚀 Inicializando sistema Firebase (solo Firebase)...');
        
        if (!validarEntorno()) {
            console.error('❌ Entorno no compatible con Firebase');
            return;
        }
        
        try {
            const exitosa = await iniciarSesionAnonima();
            
            if (exitosa) {
                console.log('✅ Sistema Firebase listo (solo Firebase)');
                await verificarEstadoAuth();
            } else {
                console.error('❌ Fallo en la inicialización de Firebase');
            }
        } catch (error) {
            console.error('❌ Error crítico en inicialización de Firebase:', error);
        }
    }, 1000);
});

// ========================
// EXPORTAR FUNCIONES PRINCIPALES
// ========================
export {
    iniciarSesionAnonima,
    verificarEstadoAuth,
    fetchVivienda,
    fetchAllViviendas,
    fetchViviendaCompleta,
    fetchCochera,
    fetchTrastero,
    getMemoriaCalidadesUrl,
    getPlanosArquitectonicosUrl,
    getPlanoViviendaUrl,
    cargarGaleriaFirebaseOptimizada,
    getNombreVivienda,
    formatearPrecio,
    getSubtituloVivienda
};