document.addEventListener("DOMContentLoaded", function () {
    fetch('src/pages/about/about.html')
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el about: " + response.status);
            }
            return response.text();
        })
        .then(data => {
            const placeholder = document.getElementById('about-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;
            } else {
                console.error("No se encontró el div con id 'about-placeholder'");
            }
        })
        .catch(error => console.error(error));
});