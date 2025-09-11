/**
 * auth.js - Sistema de autenticación simple para Barsant Promociones
 * Protege las páginas verificando que el usuario esté logueado
 */

/**
 * Verifica si el usuario está autenticado
 */
function verificarAutenticacion() {
    if (sessionStorage.getItem('authenticated') !== 'true') {
        // No está autenticado, redirigir a login
        const baseUrl = window.location.origin;
        window.location.href = `${baseUrl}/login.html`;
        return false;
    }
    return true;
}

/**
 * Cierra la sesión del usuario
 */
function cerrarSesion(e) {
    if (e) e.preventDefault();
    
    // Limpiar datos de sesión
    sessionStorage.removeItem('authenticated');
    sessionStorage.removeItem('userInfo');
    
    // Redirigir al login
    const baseUrl = window.location.origin;
    window.location.href = `${baseUrl}/login.html`;
}

/**
 * Obtiene información del usuario actual
 */
function getUserInfo() {
    try {
        const userInfo = sessionStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        return null;
    }
}

/**
 * Obtiene el nombre del usuario actual
 */
function getUserName() {
    const userInfo = getUserInfo();
    return userInfo ? userInfo.name : 'Usuario';
}

/**
 * Verifica si el usuario es administrador
 */
function isAdmin() {
    const userInfo = getUserInfo();
    return userInfo && userInfo.type === 'admin';
}

/**
 * Muestra información del usuario en la interfaz
 */
function showUserInfo() {
    const userInfo = getUserInfo();
    if (!userInfo) return;

    // Agregar badge con el nombre de la empresa/usuario
    addUserBadge(userInfo.name, userInfo.type);
    
    // Si es admin, agregar botón de logout
    if (isAdmin()) {
        addLogoutButton();
    }
}

/**
 * Agrega un badge de usuario en el header
 */
function addUserBadge(text, type) {
    const header = document.querySelector('header .header-content');
    if (!header) return;

    // Evitar duplicar badges
    const existingBadge = document.querySelector('.user-badge');
    if (existingBadge) return;

    const badge = document.createElement('div');
    badge.className = 'user-badge';
    badge.textContent = text;
    badge.style.cssText = `
        position: absolute;
        top: 15px;
        right: 15px;
        background: ${type === 'admin' ? '#dc3545' : '#28a745'};
        color: white;
        padding: 6px 12px;
        border-radius: 15px;
        font-size: 12px;
        font-weight: 600;
        z-index: 1001;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    
    header.appendChild(badge);
}

/**
 * Agrega botón de logout para administradores
 */
function addLogoutButton() {
    const nav = document.querySelector('nav ul');
    if (!nav) return;

    // Evitar duplicar botón
    const existingLogout = document.querySelector('.logout-nav-item');
    if (existingLogout) return;

    const logoutItem = document.createElement('li');
    logoutItem.className = 'logout-nav-item';
    
    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión';
    logoutLink.style.cssText = `
        color: #dc3545 !important;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 5px;
    `;
    
    logoutLink.addEventListener('click', cerrarSesion);
    
    logoutItem.appendChild(logoutLink);
    nav.appendChild(logoutItem);
}

/**
 * Inicialización del sistema de autenticación
 */
function initAuth() {
    console.log('Verificando autenticación...');
    
    // Verificar si el usuario está autenticado
    if (!verificarAutenticacion()) {
        return; // Se redirigió al login
    }

    // Mostrar información del usuario
    showUserInfo();
    
    // Agregar event listeners para logout si existen botones
    const logoutBtns = document.querySelectorAll('#logout-btn, .logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', cerrarSesion);
    });

    const userInfo = getUserInfo();
    if (userInfo) {
        console.log(`Usuario autenticado: ${userInfo.name} (${userInfo.company})`);
    }
}

// Verificar autenticación cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Pequeño delay para asegurar que el header se cargue primero
    setTimeout(initAuth, 200);
});

// Exportar funciones para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        verificarAutenticacion,
        cerrarSesion,
        getUserInfo,
        getUserName,
        isAdmin
    };
}

// Hacer funciones disponibles globalmente
window.authUtils = {
    verificarAutenticacion,
    cerrarSesion,
    getUserInfo,
    getUserName,
    isAdmin,
    showUserInfo
};