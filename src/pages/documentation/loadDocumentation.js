// ========================
// LOAD DOCUMENTATION - SOLO FIREBASE
// Sin referencias a archivos locales o carpeta assets
// ========================

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

// SOLO FIREBASE: Función para crear visualizador PDF con múltiples fallbacks
function createPDFViewer(url, filename) {
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
                    <i class="fas fa-download"></i> Descargar PDF
                </a>
            </div>
            
            <!-- Contenedor principal del PDF -->
            <div class="pdf-main-container" style="position: relative; height: 600px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; background: #f8f9fa;">
                
                <!-- Visualizador PDF mediante object (más compatible que iframe) -->
                <object 
                    id="pdf-object"
                    data="${url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH" 
                    type="application/pdf"
                    width="100%" 
                    height="100%"
                    style="border: none;">
                    
                    <!-- Fallback: embed como segunda opción -->
                    <embed 
                        id="pdf-embed"
                        src="${url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH"
                        type="application/pdf"
                        width="100%" 
                        height="100%"
                        style="border: none;">
                        
                        <!-- Fallback final: mensaje y enlace directo -->
                        <div id="pdf-fallback" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 40px;">
                            <i class="fas fa-file-pdf" style="font-size: 4rem; color: #e0c88c; margin-bottom: 20px;"></i>
                            <h4 style="margin-bottom: 15px;">PDF desde Firebase Storage</h4>
                            <p style="margin-bottom: 25px; color: #666; max-width: 400px;">
                                El documento se encuentra en Firebase Storage. Su navegador no puede mostrarlo integrado debido a restricciones de seguridad.
                            </p>
                            <div style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
                                <a href="${url}" target="_blank" class="btn-primary" style="
                                    display: inline-flex;
                                    align-items: center;
                                    gap: 8px;
                                    background-color: #e0c88c;
                                    color: #3a3a3a;
                                    border: 1px solid #3a3a3a;
                                    padding: 11px 24px;
                                    border-radius: 4px;
                                    text-decoration: none;
                                    font-weight: 500;
                                ">
                                    <i class="fas fa-download"></i> Descargar
                                </a>
                            </div>
                        </div>
                    </embed>
                </object>
            </div>
            
            <div style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 4px; font-size: 12px; color: #666; text-align: center;">
                <i class="fas fa-cloud"></i>
                Documento cargado desde Firebase Storage. Si tiene problemas visualizándolo, use los botones de arriba.
            </div>
        </div>
    `;
}

// SOLO FIREBASE: Función para cargar dataService
async function loadDataService() {
    try {
        // Verificar si ya está disponible
        if (window.dataServiceFunctions) {
            return;
        }

        // Cargar el módulo de forma segura
        const dataServiceModule = await import('./src/dataService.js');
        
        // Asignar funciones disponibles
        window.dataServiceFunctions = {
            iniciarSesionAnonima: dataServiceModule.iniciarSesionAnonima,
            verificarEstadoAuth: dataServiceModule.verificarEstadoAuth,
            getMemoriaCalidadesUrl: dataServiceModule.getMemoriaCalidadesUrl,
            getPlanosArquitectonicosUrl: dataServiceModule.getPlanosArquitectonicosUrl
        };
        
        console.log('✅ DataService cargado correctamente (solo Firebase)');
        
    } catch (error) {
        console.error('❌ Error crítico cargando dataService:', error);
        throw new Error(`No se pudo cargar el sistema de documentos: ${error.message}`);
    }
}

// SOLO FIREBASE: Función principal para abrir documentos
async function openDocModal(docType) {
    const modal = document.getElementById('doc-modal');
    const modalTitle = document.getElementById('doc-modal-title');
    const modalBody = document.getElementById('doc-modal-body');
    
    // Mostrar modal inmediatamente con loading
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Configurar contenido según el tipo de documento
    switch(docType) {
        case 'memoria-calidades':
            modalTitle.textContent = 'Memoria de Calidades';
            modalBody.innerHTML = `
                <div class="loading-container" style="text-align: center; padding: 40px;">
                    <div style="
                        width: 40px; 
                        height: 40px; 
                        border: 4px solid #f3f3f3; 
                        border-top: 4px solid #e0c88c; 
                        border-radius: 50%; 
                        animation: spin 1s linear infinite;
                        margin: 0 auto 15px;
                    "></div>
                    <p>Cargando desde Firebase Storage...</p>
                    <p style="font-size: 12px; color: #666; margin-top: 10px;">
                        <i class="fas fa-cloud"></i> Conectando con Firebase Storage
                    </p>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            
            try {
                // Cargar dataService
                await loadDataService();
                
                console.log('🔐 Obteniendo memoria de calidades desde Firebase Storage...');
                
                // Autenticar primero
                await window.dataServiceFunctions.iniciarSesionAnonima();
                
                // Obtener URL del documento
                const memoriaUrl = await window.dataServiceFunctions.getMemoriaCalidadesUrl();
                console.log('✅ URL obtenida desde Firebase Storage:', memoriaUrl);
                
                // Mostrar documento
                modalBody.innerHTML = createPDFViewer(memoriaUrl, 'Memoria_Calidades_Ventanilla.pdf');
                
            } catch (error) {
                console.error('❌ Error cargando memoria de calidades:', error);
                modalBody.innerHTML = `
                    <div class="error-container" style="text-align: center; padding: 40px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #dc3545; margin-bottom: 15px;"></i>
                        <h4>Error cargando desde Firebase Storage</h4>
                        <p style="color: #666; margin-bottom: 20px;">
                            <strong>Error:</strong> ${error.message}
                        </p>
                        <p style="color: #666; margin-bottom: 20px; font-size: 14px;">
                            Verifique que:
                            <br>• El documento existe en Firebase Storage
                            <br>• La autenticación anónima está habilitada
                            <br>• Las reglas de Storage permiten acceso
                        </p>
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <button onclick="openDocModal('memoria-calidades')" class="btn-primary" style="
                                background-color: #e0c88c;
                                color: #3a3a3a;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 4px;
                                cursor: pointer;
                            ">
                                <i class="fas fa-redo"></i> Reintentar
                            </button>
                        </div>
                    </div>
                `;
            }
            break;
            
        case 'planos':
        case 'planos-arquitectonicos':
            modalTitle.textContent = 'Planos Arquitectónicos';
            modalBody.innerHTML = `
                <div class="loading-container" style="text-align: center; padding: 40px;">
                    <div style="
                        width: 40px; 
                        height: 40px; 
                        border: 4px solid #f3f3f3; 
                        border-top: 4px solid #e0c88c; 
                        border-radius: 50%; 
                        animation: spin 1s linear infinite;
                        margin: 0 auto 15px;
                    "></div>
                    <p>Cargando desde Firebase Storage...</p>
                    <p style="font-size: 12px; color: #666; margin-top: 10px;">
                        <i class="fas fa-cloud"></i> Conectando con Firebase Storage
                    </p>
                </div>
            `;
            
            try {
                // Cargar dataService
                await loadDataService();
                
                console.log('🔐 Obteniendo planos arquitectónicos desde Firebase Storage...');
                
                // Autenticar primero
                await window.dataServiceFunctions.iniciarSesionAnonima();
                
                // Obtener URL de los planos
                const planosUrl = await window.dataServiceFunctions.getPlanosArquitectonicosUrl();
                console.log('✅ URL obtenida desde Firebase Storage:', planosUrl);
                
                // Mostrar documento
                modalBody.innerHTML = createPDFViewer(planosUrl, 'Planos_Arquitectonicos_Ventanilla.pdf');
                
            } catch (error) {
                console.error('❌ Error cargando planos arquitectónicos:', error);
                modalBody.innerHTML = `
                    <div class="error-container" style="text-align: center; padding: 40px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #dc3545; margin-bottom: 15px;"></i>
                        <h4>Error cargando desde Firebase Storage</h4>
                        <p style="color: #666; margin-bottom: 20px;">
                            <strong>Error:</strong> ${error.message}
                        </p>
                        <p style="color: #666; margin-bottom: 20px; font-size: 14px;">
                            Verifique que:
                            <br>• El documento existe en Firebase Storage
                            <br>• La autenticación anónima está habilitada
                            <br>• Las reglas de Storage permiten acceso
                        </p>
                        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <button onclick="openDocModal('planos-arquitectonicos')" class="btn-primary" style="
                                background-color: #e0c88c;
                                color: #3a3a3a;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 4px;
                                cursor: pointer;
                            ">
                                <i class="fas fa-redo"></i> Reintentar
                            </button>
                        </div>
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
                        <p style="color: #666; margin-bottom: 20px;">
                            La guía de compra se cargará en Firebase Storage próximamente. 
                            Mientras tanto, puede contactar con nuestro equipo comercial 
                            para resolver cualquier duda sobre el proceso de compra.
                        </p>
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
                            <i class="fas fa-phone"></i> Contactar Ahora
                        </a>
                    </div>
                </div>
            `;
            break;
            
        default:
            modalTitle.textContent = 'Documento';
            modalBody.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-file-alt" style="font-size: 2rem; color: #e0c88c; margin-bottom: 15px;"></i>
                    <p>Tipo de documento no reconocido</p>
                    <p style="color: #666; font-size: 14px;">
                        Solo se pueden cargar documentos desde Firebase Storage
                    </p>
                </div>
            `;
    }
    
    // Animación suave del modal
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.transition = 'opacity 0.3s ease';
    }, 10);
}

function closeDocModal() {
    const modal = document.getElementById('doc-modal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

// Función para detectar capacidades del navegador
function detectBrowserCapabilities() {
    const capabilities = {
        supportsModules: 'noModule' in HTMLScriptElement.prototype,
        supportsObjectEmbed: true,
        hasFirebaseSupport: typeof fetch !== 'undefined',
        isOnline: navigator.onLine
    };
    
    // Detectar soporte para visualización de PDFs
    try {
        const testObject = document.createElement('object');
        testObject.type = 'application/pdf';
        capabilities.supportsPDFObject = true;
    } catch (e) {
        capabilities.supportsPDFObject = false;
    }
    
    console.log('🔍 Capacidades del navegador:', capabilities);
    return capabilities;
}

// Hacer las funciones globales
window.openDocModal = openDocModal;
window.closeDocModal = closeDocModal;

// Ejecutar detección de capacidades al cargar
document.addEventListener('DOMContentLoaded', () => {
    detectBrowserCapabilities();
    console.log('📄 Sistema de documentación cargado (solo Firebase Storage)');
});             