document.addEventListener("DOMContentLoaded", function () {
    fetch('src/shared/footer.html')
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el footer: " + response.status);
            }
            return response.text();
        })
        .then(data => {
            const placeholder = document.getElementById('footer-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;
            } else {
                console.error("No se encontró el div con id 'footer-placeholder'");
            }
        })
        .catch(error => console.error(error));
});