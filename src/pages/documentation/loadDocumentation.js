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

// Función para crear iframe con manejo de errores
function createPDFIframe(url, filename) {
    return `
        <div class="pdf-viewer-container">
            <div class="pdf-controls" style="margin-bottom: 15px; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                <a href="${url}" target="_blank" class="btn-secondary" style="
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
                    transition: all 0.3s ease;
                " onmouseover="this.style.backgroundColor='#3a3a3a'; this.style.color='white'" onmouseout="this.style.backgroundColor='transparent'; this.style.color='#3a3a3a'">
                    <i class="fas fa-external-link-alt"></i> Abrir en nueva ventana
                </a>
                <a href="${url}" download="${filename}" class="btn-primary" style="
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
                    transition: all 0.3s ease;
                " onmouseover="this.style.backgroundColor='#d4bc80'" onmouseout="this.style.backgroundColor='#e0c88c'">
                    <i class="fas fa-download"></i> Descargar
                </a>
            </div>
            
            <div class="pdf-iframe-container" style="position: relative; height: 600px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden;">
                <iframe 
                    id="pdf-iframe"
                    src="${url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH" 
                    width="100%" 
                    height="100%" 
                    style="border: none;"
                    onload="handleIframeLoad()"
                    onerror="handleIframeError('${url}', '${filename}')">
                </iframe>
                
                <!-- Fallback content si el iframe falla -->
                <div id="iframe-fallback" style="display: none; text-align: center; padding: 40px; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: white;">
                    <i class="fas fa-file-pdf" style="font-size: 3rem; color: #dc3545; margin-bottom: 15px;"></i>
                    <h4>No se puede mostrar el PDF en el navegador</h4>
                    <p style="margin-bottom: 20px; color: #666;">
                        Su navegador no puede mostrar PDFs integrados o hay restricciones de seguridad.
                    </p>
                    <a href="${url}" target="_blank" class="btn-primary" style="
                        display: inline-block;
                        background-color: #e0c88c;
                        color: #3a3a3a;
                        padding: 12px 24px;
                        border-radius: 4px;
                        text-decoration: none;
                        font-weight: 500;
                    ">
                        <i class="fas fa-external-link-alt"></i> Abrir PDF en nueva ventana
                    </a>
                </div>
            </div>
            
            <div style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 4px; font-size: 12px; color: #666; text-align: center;">
                <i class="fas fa-info-circle" style="margin-right: 5px;"></i>
                Si el PDF no se muestra correctamente, use el botón "Abrir en nueva ventana"
            </div>
        </div>
    `;
}

// Manejar carga exitosa del iframe
function handleIframeLoad() {
    console.log('✅ PDF cargado exitosamente en iframe');
    const fallback = document.getElementById('iframe-fallback');
    if (fallback) {
        fallback.style.display = 'none';
    }
}

// Manejar error del iframe
function handleIframeError(url, filename) {
    console.warn('❌ Error cargando PDF en iframe, mostrando fallback');
    const fallback = document.getElementById('iframe-fallback');
    if (fallback) {
        fallback.style.display = 'block';
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
                    <p>Preparando autenticación y cargando documento...</p>
                </div>
            `;
            
            try {
                // ASEGURAR AUTENTICACIÓN ANTES DE CARGAR
                const { iniciarSesionAnonima, verificarEstadoAuth } = await import('../dataService.js');
                
                console.log('🔐 Verificando autenticación para documentos...');
                const authExitosa = await iniciarSesionAnonima();
                
                if (!authExitosa) {
                    throw new Error('No se pudo autenticar para acceder al documento');
                }
                
                // Verificar estado de auth
                const authVerificada = await verificarEstadoAuth();
                if (!authVerificada) {
                    throw new Error('Autenticación no verificada');
                }
                
                console.log('✅ Autenticación confirmada, cargando documento...');
                
                // Obtener URL desde Firebase Storage usando dataService
                let memoriaUrl;
                try {
                    const { getMemoriaCalidadesUrl } = await import('../dataService.js');
                    memoriaUrl = await getMemoriaCalidadesUrl();
                    console.log('✅ URL de memoria obtenida:', memoriaUrl);
                } catch (error) {
                    console.warn('Error cargando desde Firebase Storage, usando fallback:', error);
                    memoriaUrl = 'assets/docs/MEMORIA CALIDADES_VENTANILLA.pdf';
                }
                
                // Crear iframe con controles
                modalBody.innerHTML = createPDFIframe(memoriaUrl, 'Memoria_Calidades_Ventanilla.pdf');
                
                // Configurar timeout para mostrar fallback si el iframe tarda mucho
                setTimeout(() => {
                    const iframe = document.getElementById('pdf-iframe');
                    if (iframe && !iframe.contentDocument && !iframe.contentWindow) {
                        console.log('⏱️ Iframe tardando en cargar, podría haber restricciones CSP');
                        handleIframeError(memoriaUrl, 'Memoria_Calidades_Ventanilla.pdf');
                    }
                }, 5000); // 5 segundos de timeout
                
            } catch (error) {
                console.error('Error cargando memoria de calidades:', error);
                modalBody.innerHTML = `
                    <div class="error-container" style="text-align: center; padding: 40px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #dc3545; margin-bottom: 15px;"></i>
                        <h4>Error al cargar el documento</h4>
                        <p><strong>Error de autenticación:</strong> ${error.message}</p>
                        <p>No se pudo cargar la memoria de calidades. Esto puede deberse a:</p>
                        <ul style="text-align: left; margin: 20px 0;">
                            <li>Autenticación anónima no habilitada en Firebase</li>
                            <li>Reglas de Firebase Storage restrictivas</li>
                            <li>Archivo no encontrado en Storage</li>
                            <li>Políticas de seguridad del navegador (CSP)</li>
                        </ul>
                        <button onclick="openDocModal('memoria-calidades')" class="btn-primary" style="
                            background-color: #e0c88c;
                            color: #3a3a3a;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 4px;
                            cursor: pointer;
                        ">
                            Reintentar
                        </button>
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
                    <p>Preparando autenticación y cargando planos...</p>
                </div>
            `;
            
            try {
                // ASEGURAR AUTENTICACIÓN ANTES DE CARGAR
                const { iniciarSesionAnonima, verificarEstadoAuth } = await import('../dataService.js');
                
                console.log('🔐 Verificando autenticación para planos...');
                const authExitosa = await iniciarSesionAnonima();
                
                if (!authExitosa) {
                    throw new Error('No se pudo autenticar para acceder a los planos');
                }
                
                // Verificar estado de auth
                const authVerificada = await verificarEstadoAuth();
                if (!authVerificada) {
                    throw new Error('Autenticación no verificada');
                }
                
                console.log('✅ Autenticación confirmada, cargando planos...');
                
                // Obtener URL desde Firebase Storage usando dataService
                let planosUrl;
                try {
                    const { getPlanosArquitectonicosUrl } = await import('../dataService.js');
                    planosUrl = await getPlanosArquitectonicosUrl();
                    console.log('✅ URL de planos obtenida:', planosUrl);
                } catch (error) {
                    console.warn('Error cargando desde Firebase Storage, usando fallback:', error);
                    planosUrl = 'assets/docs/R05 PLANOS BASICO REFORMADO 22.pdf';
                }
                
                // Crear iframe con controles
                modalBody.innerHTML = createPDFIframe(planosUrl, 'Planos_Arquitectonicos_Ventanilla.pdf');
                
                // Configurar timeout para mostrar fallback si el iframe tarda mucho
                setTimeout(() => {
                    const iframe = document.getElementById('pdf-iframe');
                    if (iframe && !iframe.contentDocument && !iframe.contentWindow) {
                        console.log('⏱️ Iframe tardando en cargar, podría haber restricciones CSP');
                        handleIframeError(planosUrl, 'Planos_Arquitectonicos_Ventanilla.pdf');
                    }
                }, 5000); // 5 segundos de timeout
                
            } catch (error) {
                console.error('Error cargando planos arquitectónicos:', error);
                modalBody.innerHTML = `
                    <div class="error-container" style="text-align: center; padding: 40px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #dc3545; margin-bottom: 15px;"></i>
                        <h4>Error al cargar el documento</h4>
                        <p><strong>Error de autenticación:</strong> ${error.message}</p>
                        <p>No se pudieron cargar los planos arquitectónicos. Esto puede deberse a:</p>
                        <ul style="text-align: left; margin: 20px 0;">
                            <li>Autenticación anónima no habilitada en Firebase</li>
                            <li>Reglas de Firebase Storage restrictivas</li>
                            <li>Archivo no encontrado en Storage</li>
                            <li>Políticas de seguridad del navegador (CSP)</li>
                        </ul>
                        <button onclick="openDocModal('planos-arquitectonicos')" class="btn-primary" style="
                            background-color: #e0c88c;
                            color: #3a3a3a;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 4px;
                            cursor: pointer;
                        ">
                            Reintentar
                        </button>
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
window.handleIframeLoad = handleIframeLoad;
window.handleIframeError = handleIframeError;