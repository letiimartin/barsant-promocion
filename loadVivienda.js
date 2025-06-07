// Utilidades para cargar viviendas desde Firebase o datos locales

export function getViviendaId(v) {
    const planta = (v.piso || v.planta || '').toString().toLowerCase().replace(/\s+/g, '-');
    const letra = (v.letra || '').toString().toLowerCase();
    return v.id || [v.bloque, planta, letra].filter(Boolean).join('-');
  }
  
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
async function getLocalViviendas() {
    const res = await fetch('/data/viviendas.json');
    const data = await res.json();
    return data.map(v => ({ ...v, id: getViviendaId(v) }));
  }
  
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
        console.warn('Fallo Firebase, se lee local:', err);
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

// Carga una vivienda en la página según la URL
export async function loadViviendaFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const vivienda = await fetchVivienda(id);
  if (!vivienda) {
    const cont = document.getElementById('contenido');
    if (cont) cont.innerHTML = '<p>Vivienda no encontrada.</p>';
    return;
  }
  document.getElementById('nombre').textContent = `Bloque ${vivienda.bloque} - ${vivienda.planta} ${vivienda.letra}`;
  document.getElementById('precio').textContent = `${vivienda.precio.toLocaleString()} €`;
  document.getElementById('sup_util').textContent = `${vivienda.sup_util} m² útiles`;
  document.getElementById('sup_total').textContent = `${vivienda.sup_total} m² construidos`;
  document.getElementById('dormitorios').textContent = `${vivienda.dormitorios} dormitorio(s)`;
  document.getElementById('baños').textContent = `${vivienda.baños} baño(s)`;
}
// // Obtiene una vivienda por su ID (documento de Firestore)
// export async function fetchVivienda(id) {
//   if (!id) return null;

//   const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
//   const db = await getDb();

//   const ref = doc(db, 'viviendas', id);
//   const snap = await getDoc(ref);
//   return snap.exists() ? { id, ...snap.data() } : null;
// }

// // Obtiene todas las viviendas de la colección
// export async function fetchAllViviendas() {
//   const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
//   const db = await getDb();

//   const snapshot = await getDocs(collection(db, 'viviendas'));
//   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// }

// // Si la página recibe un parámetro "id", cargar automáticamente la vivienda
// export async function loadViviendaFromUrl() {
//   const params = new URLSearchParams(window.location.search);
//   const id = params.get('id');
//   const vivienda = await fetchVivienda(id);

//   if (!vivienda) {
//     const cont = document.getElementById('contenido');
//     if (cont) cont.innerHTML = '<p>Vivienda no encontrada.</p>';
//     return;
//   }

//   document.getElementById('nombre').textContent = `Bloque ${vivienda.bloque} - ${vivienda.planta} ${vivienda.letra}`;
//   document.getElementById('precio').textContent = `${vivienda.precio.toLocaleString()} €`;
//   document.getElementById('sup_util').textContent = `${vivienda.sup_util} m² útiles`;
//   document.getElementById('sup_total').textContent = `${vivienda.sup_total} m² construidos`;
//   document.getElementById('dormitorios').textContent = `${vivienda.dormitorios} dormitorio(s)`;
//   document.getElementById('baños').textContent = `${vivienda.baños} baño(s)`;
// }
