/**
 * Sistema de autenticación para Barsant Promociones
 * Este script verifica si el usuario está autenticado y redirige a la página de login si no lo está
 */

// Función para verificar autenticación
function verificarAutenticacion() {
    // Si no está autenticado, redirigir a login
    if (sessionStorage.getItem('authenticated') !== 'true') {
        // Calcular la ruta relativa a la raíz del sitio
        const currentPath = window.location.pathname;
        const pathToRoot = currentPath.split('/').filter(Boolean).map(() => '..').join('/') || '.';
        
        // Redirigir a login.html con la ruta relativa correcta
        window.location.href = `${pathToRoot}/login.html`;
    }
}

// Función para cerrar sesión
function cerrarSesion(e) {
    if (e) e.preventDefault();
    
    // Eliminar la autenticación
    sessionStorage.removeItem('authenticated');
    
    // Calcular la ruta relativa a la raíz del sitio
    const currentPath = window.location.pathname;
    const pathToRoot = currentPath.split('/').filter(Boolean).map(() => '..').join('/') || '.';
    
    // Redirigir a login.html
    window.location.href = `${pathToRoot}/login.html`;
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
