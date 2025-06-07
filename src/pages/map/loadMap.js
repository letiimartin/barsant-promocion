document.addEventListener("DOMContentLoaded", () => {
    fetch('src/pages/map/map.html')
    .then(response => {
      if (!response.ok) {
          throw new Error("No se pudo cargar el mapa " + response.status);
      }
      return response.text();
      })
      .then(data => {
        const container = document.getElementById('map-placeholder');
        if (container) container.innerHTML = data;
      })
      .catch(err => console.error("Error al cargar map.html:", err));
  });