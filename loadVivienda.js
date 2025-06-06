// Utilidades para inicializar Firebase y obtener datos de Firestore
async function getDb() {
  const firebaseConfigResponse = await fetch('src/firebase/firebase-credentials.json');
  const firebaseConfig = await firebaseConfigResponse.json();

  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
  const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

  const app = initializeApp(firebaseConfig);
  return getFirestore(app);
}

// Obtiene una vivienda por su ID (documento de Firestore)
export async function fetchVivienda(id) {
  if (!id) return null;

  const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
  const db = await getDb();

  const ref = doc(db, 'viviendas', id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id, ...snap.data() } : null;
}

// Obtiene todas las viviendas de la colección
export async function fetchAllViviendas() {
  const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
  const db = await getDb();

  const snapshot = await getDocs(collection(db, 'viviendas'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Si la página recibe un parámetro "id", cargar automáticamente la vivienda
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
