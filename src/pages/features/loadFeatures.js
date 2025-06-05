document.addEventListener("DOMContentLoaded", function () {
    fetch('src/pages/features/features.html')
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el features: " + response.status);
            }
            return response.text();
        })
        .then(data => {
            const placeholder = document.getElementById('features-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;
            } else {
                console.error("No se encontró el div con id 'features-placeholder'");
            }
        })
        .catch(error => console.error(error));
});