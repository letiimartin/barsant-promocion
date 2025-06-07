document.addEventListener("DOMContentLoaded", () => {
    fetch('src/pages/properties/properties.html')
    .then(response => {
      if (!response.ok) {
          throw new Error("No se pudo cargar properties " + response.status);
      }
      return response.text();
      })
      .then(data => {
        const container = document.getElementById('properties-placeholder');
        if (container) container.innerHTML = data;
      })
      .catch(err => console.error("Error al cargar properties.html:", err));
  });