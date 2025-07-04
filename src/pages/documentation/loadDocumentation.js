document.addEventListener("DOMContentLoaded", function () {
    fetch('src/pages/documentation/documentation.html')
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar la documentación: " + response.status);
            }
            return response.text();
        })
        .then(data => {
            const placeholder = document.getElementById('documentation-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;
                initDocumentation();
            } else {
                console.error("No se encontró el div con id 'documentation-placeholder'");
            }
        })
        .catch(error => console.error(error));
});
/* // Event listener para cerrar al hacer clic fuera del modal
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('doc-modal');
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeDocModal();
            }
        });
        
        // Cerrar con tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeDocModal();
            }
        });
    }
}); 
*/

// Funciones para manejar los modales de documentación
function initDocumentation() {
    // Cerrar modal al hacer clic fuera de él
    window.onclick = function(event) {
        const modal = document.getElementById('doc-modal');
        if (event.target === modal) {
            closeDocModal();
        }
    }
}

function openDocModal(docType) {
    const modal = document.getElementById('doc-modal');
    const modalTitle = document.getElementById('doc-modal-title');
    const modalBody = document.getElementById('doc-modal-body');
    
    // Configurar contenido según el tipo de documento
    switch(docType) {
        case 'memoria-calidades':
            modalTitle.textContent = 'Memoria de Calidades';
            modalBody.innerHTML = `
                <div class="pdf-viewer">
                    <iframe src="assets/docs/MEMORIA CALIDADES_VENTANILLA.pdf" 
                            width="100%" 
                            height="600px" 
                            style="border: none;">
                        <p>Su navegador no puede mostrar PDFs. 
                           <a href="assets/docs/MEMORIA CALIDADES_VENTANILLA.pdf" target="_blank">
                               Haga clic aquí para descargar el PDF
                           </a>
                        </p>
                    </iframe>
                </div>
            `;
            break;
        case 'planos':
            modalTitle.textContent = 'Planos Arquitectónicos';
            modalBody.innerHTML = `
                <div class="pdf-viewer">
                    <iframe src="assets/docs/PLANOS FIRMADOS.pdf" 
                            width="100%" 
                            height="600px" 
                            style="border: none;">
                        <p>Su navegador no puede mostrar PDFs. 
                           <a href="assets/docs/PLANOS FIRMADOS.pdf" target="_blank">
                               Haga clic aquí para descargar el PDF
                           </a>
                        </p>
                    </iframe>
                </div>
            `;
            break;
        case 'guia-compra':
            modalTitle.textContent = 'Guía de Compra';
            modalBody.innerHTML = `
                <div class="doc-content">
                    <div class="coming-soon">
                        <i class="fas fa-clock"></i>
                        <h4>Documento en preparación</h4>
                        <p>La guía de compra estará disponible próximamente. 
                           Mientras tanto, puede contactar con nuestro equipo comercial 
                           para resolver cualquier duda sobre el proceso de compra.</p>
                        <a href="#contact" class="btn-primary" onclick="closeDocModal()">
                            Contactar Ahora
                        </a>
                    </div>
                </div>
            `;
            break;
        default:
            modalTitle.textContent = 'Documento';
            modalBody.innerHTML = '<p>Contenido no disponible</p>';
    }
    
    // Mostrar el modal usando flexbox para centrar
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Añadir animación suave (opcional)
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.transition = 'opacity 0.3s ease';
    }, 10);
}





function closeDocModal() {
    const modal = document.getElementById('doc-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}
