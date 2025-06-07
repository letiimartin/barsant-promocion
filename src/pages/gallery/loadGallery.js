document.addEventListener("DOMContentLoaded", function () {
    fetch('src/pages/gallery/gallery.html')
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el gallery: " + response.status);
            }
            return response.text();
        })
        .then(data => {
            const placeholder = document.getElementById('gallery-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;
            } else {
                console.error("No se encontró el div con id 'gallery-placeholder'");
            }
        })
        .catch(error => console.error(error));
});