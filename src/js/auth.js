/**
 * Sistema de autenticación para Barsant Promociones
 * Este script verifica si el usuario está autenticado y redirige a la página de login si no lo está
 */

// Función para verificar autenticación
function verificarAutenticacion() {
    // Si no está autenticado, redirigir a login
    if (sessionStorage.getItem('authenticated') !== 'true') {
        // Obtener la ruta base del sitio
        const baseUrl = window.location.origin;
        
        // Redirigir a login.html usando ruta absoluta
        window.location.href = `${baseUrl}/login.html`;
    }
}

// Función para cerrar sesión
function cerrarSesion(e) {
    if (e) e.preventDefault();
    
    // Eliminar la autenticación
    sessionStorage.removeItem('authenticated');
    
    // Obtener la ruta base del sitio
    const baseUrl = window.location.origin;
    
    // Redirigir a login.html usando ruta absoluta
    window.location.href = `${baseUrl}/login.html`;
}

// Verificar autenticación cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario está autenticado
    verificarAutenticacion();
    
    // Agregar evento al botón de logout si existe
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', cerrarSesion);
    }
});

// Exportar funciones para uso en otros archivos
export { verificarAutenticacion, cerrarSesion };
