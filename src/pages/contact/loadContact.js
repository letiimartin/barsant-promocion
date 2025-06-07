document.addEventListener("DOMContentLoaded", () => {
    fetch('src/pages/contact/contact.html')
    .then(response => {
      if (!response.ok) {
          throw new Error("No se pudo cargar contact " + response.status);
      }
      return response.text();
      })
      .then(data => {
        const container = document.getElementById('contact-placeholder');
        if (container) container.innerHTML = data;
      })
      .catch(err => console.error("Error al cargar contact.html:", err));
  });