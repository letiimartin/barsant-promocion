document.addEventListener("DOMContentLoaded", function () {
    fetch('src/pages/inicio/inicio.html')
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el inicio: " + response.status);
            }
            return response.text();
        })
        .then(data => {
            const placeholder = document.getElementById('inicio-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;
            } else {
                console.error("No se encontró el div con id 'inicio-placeholder'");
            }
        })
        .catch(error => console.error(error));
});