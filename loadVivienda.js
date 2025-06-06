async function loadVivienda() {
    // 1. Leer el archivo firebase-config.json
    const firebaseConfigResponse = await fetch('src/firebase/firebase-credentials.json');
    const firebaseConfig = await firebaseConfigResponse.json();
  
    // 2. Cargar Firebase (módulos ESM desde CDN)
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
  
    // 3. Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
  
    // 4. Obtener ID de vivienda desde la URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
  
    if (!id) {
      document.getElementById("contenido").innerHTML = "<p>ID de vivienda no proporcionado.</p>";
      return;
    }
  
    // 5. Consultar vivienda
    const ref = doc(db, "viviendas", id);
    const snap = await getDoc(ref);
  
    if (snap.exists()) {
      const v = snap.data();
      document.getElementById("nombre").textContent = `Bloque ${v.bloque} - ${v.planta} ${v.letra}`;
      document.getElementById("precio").textContent = `${v.precio.toLocaleString()} €`;
      document.getElementById("sup_util").textContent = `${v.sup_util} m² útiles`;
      document.getElementById("sup_total").textContent = `${v.sup_total} m² construidos`;
      document.getElementById("dormitorios").textContent = `${v.dormitorios} dormitorio(s)`;
      document.getElementById("baños").textContent = `${v.baños} baño(s)`;
    } else {
      document.getElementById("contenido").innerHTML = "<p>Vivienda no encontrada.</p>";
    }
  }
  
  // Ejecutar cuando el DOM esté listo
  document.addEventListener("DOMContentLoaded", loadVivienda);