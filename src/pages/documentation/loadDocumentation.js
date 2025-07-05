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

async function openDocModal(docType) {
    const modal = document.getElementById('doc-modal');
    const modalTitle = document.getElementById('doc-modal-title');
    const modalBody = document.getElementById('doc-modal-body');
    
    // Configurar contenido según el tipo de documento
    switch(docType) {
        case 'memoria-calidades':
            modalTitle.textContent = 'Memoria de Calidades';
            modalBody.innerHTML = `
                <div class="loading-container" style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #e0c88c; margin-bottom: 15px;"></i>
                    <p>Cargando memoria de calidades...</p>
                </div>
            `;
            
            try {
                // Obtener URL desde Firebase Storage usando dataService
                let memoriaUrl;
                try {
                    const { getMemoriaCalidadesUrl } = await import('../dataService.js');
                    memoriaUrl = await getMemoriaCalidadesUrl();
                } catch (error) {
                    console.warn('Error cargando desde Firebase Storage, usando fallback:', error);
                    memoriaUrl = 'assets/docs/MEMORIA CALIDADES_VENTANILLA.pdf';
                }
                
                modalBody.innerHTML = `
                    <div class="pdf-viewer">
                        <div class="plano-actions" style="margin-bottom: 15px; text-align: center;">
                            <a href="${memoriaUrl}" target="_blank" class="btn-secondary" style="
                                display: inline-flex;
                                align-items: center;
                                gap: 8px;
                                background-color: transparent;
                                color: #3a3a3a;
                                border: 1px solid #3a3a3a;
                                padding: 10px 20px;
                                border-radius: 4px;
                                text-decoration: none;
                                font-weight: 500;
                                margin-right: 10px;
                            ">
                                <i class="fas fa-external-link-alt"></i> Abrir en nueva ventana
                            </a>
                            <a href="${memoriaUrl}" download="Memoria_Calidades_Ventanilla.pdf" class="btn-primary" style="
                                display: inline-flex;
                                align-items: center;
                                gap: 8px;
                                background-color: #e0c88c;
                                color: #3a3a3a;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 4px;
                                text-decoration: none;
                                font-weight: 500;
                            ">
                                <i class="fas fa-download"></i> Descargar
                            </a>
                        </div>
                        <iframe src="${memoriaUrl}" 
                                width="100%" 
                                height="600px" 
                                style="border: none; border-radius: 4px;">
                            <div style="text-align: center; padding: 40px;">
                                <i class="fas fa-file-pdf" style="font-size: 3rem; color: #dc3545; margin-bottom: 15px;"></i>
                                <p>Su navegador no puede mostrar PDFs.</p>
                                <a href="${memoriaUrl}" target="_blank" class="btn-primary">
                                    Abrir PDF en nueva ventana
                                </a>
                            </div>
                        </iframe>
                    </div>
                `;
            } catch (error) {
                console.error('Error cargando memoria de calidades:', error);
                modalBody.innerHTML = `
                    <div class="error-container" style="text-align: center; padding: 40px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #dc3545; margin-bottom: 15px;"></i>
                        <h4>Error al cargar el documento</h4>
                        <p>No se pudo cargar la memoria de calidades. Por favor, intente más tarde.</p>
                    </div>
                `;
            }
            break;
            
        case 'planos':
        case 'planos-arquitectonicos':
            modalTitle.textContent = 'Planos Arquitectónicos';
            modalBody.innerHTML = `
                <div class="loading-container" style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #e0c88c; margin-bottom: 15px;"></i>
                    <p>Cargando planos arquitectónicos...</p>
                </div>
            `;
            
            try {
                // Obtener URL desde Firebase Storage usando dataService
                let planosUrl;
                try {
                    const { getPlanosArquitectonicosUrl } = await import('../dataService.js');
                    planosUrl = await getPlanosArquitectonicosUrl();
                } catch (error) {
                    console.warn('Error cargando desde Firebase Storage, usando fallback:', error);
                    planosUrl = 'assets/docs/R05 PLANOS BASICO REFORMADO 22.pdf';
                }
                
                modalBody.innerHTML = `
                    <div class="pdf-viewer">
                        <div class="plano-actions" style="margin-bottom: 15px; text-align: center;">
                            <a href="${planosUrl}" target="_blank" class="btn-secondary" style="
                                display: inline-flex;
                                align-items: center;
                                gap: 8px;
                                background-color: transparent;
                                color: #3a3a3a;
                                border: 1px solid #3a3a3a;
                                padding: 10px 20px;
                                border-radius: 4px;
                                text-decoration: none;
                                font-weight: 500;
                                margin-right: 10px;
                            ">
                                <i class="fas fa-external-link-alt"></i> Abrir en nueva ventana
                            </a>
                            <a href="${planosUrl}" download="Planos_Arquitectonicos_Ventanilla.pdf" class="btn-primary" style="
                                display: inline-flex;
                                align-items: center;
                                gap: 8px;
                                background-color: #e0c88c;
                                color: #3a3a3a;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 4px;
                                text-decoration: none;
                                font-weight: 500;
                            ">
                                <i class="fas fa-download"></i> Descargar
                            </a>
                        </div>
                        <iframe src="${planosUrl}" 
                                width="100%" 
                                height="600px" 
                                style="border: none; border-radius: 4px;">
                            <div style="text-align: center; padding: 40px;">
                                <i class="fas fa-file-pdf" style="font-size: 3rem; color: #dc3545; margin-bottom: 15px;"></i>
                                <p>Su navegador no puede mostrar PDFs.</p>
                                <a href="${planosUrl}" target="_blank" class="btn-primary">
                                    Abrir PDF en nueva ventana
                                </a>
                            </div>
                        </iframe>
                    </div>
                `;
            } catch (error) {
                console.error('Error cargando planos arquitectónicos:', error);
                modalBody.innerHTML = `
                    <div class="error-container" style="text-align: center; padding: 40px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #dc3545; margin-bottom: 15px;"></i>
                        <h4>Error al cargar el documento</h4>
                        <p>No se pudieron cargar los planos arquitectónicos. Por favor, intente más tarde.</p>
                    </div>
                `;
            }
            break;
            
        case 'guia-compra':
            modalTitle.textContent = 'Guía de Compra';
            modalBody.innerHTML = `
                <div class="doc-content">
                    <div class="coming-soon" style="text-align: center; padding: 40px;">
                        <i class="fas fa-clock" style="font-size: 2rem; color: #e0c88c; margin-bottom: 15px;"></i>
                        <h4>Documento en preparación</h4>
                        <p>La guía de compra estará disponible próximamente. 
                           Mientras tanto, puede contactar con nuestro equipo comercial 
                           para resolver cualquier duda sobre el proceso de compra.</p>
                        <a href="#contact" class="btn-primary" onclick="closeDocModal()" style="
                            display: inline-block;
                            background-color: #e0c88c;
                            color: #3a3a3a;
                            padding: 12px 24px;
                            border-radius: 4px;
                            text-decoration: none;
                            font-weight: 500;
                            margin-top: 20px;
                        ">
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
    
    // Añadir animación suave
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

// Hacer las funciones globales para que puedan ser llamadas desde HTML
window.openDocModal = openDocModal;
window.closeDocModal = closeDocModal;