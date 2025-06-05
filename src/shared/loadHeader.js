document.addEventListener("DOMContentLoaded", function () {
    fetch('src/shared/header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el header: " + response.status);
            }
            return response.text();
        })
        .then(data => {
            const placeholder = document.getElementById('header-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;
            } else {
                console.error("No se encontró el div con id 'header-placeholder'");
            }
        })
        .catch(error => console.error(error));
});
