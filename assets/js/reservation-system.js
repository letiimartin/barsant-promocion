/**
 * Sistema de Reserva Online - Ventanilla Residencial
 * 
 * Este script gestiona el proceso de reserva online
 * para las viviendas de la promoción Ventanilla Residencial
 */

document.addEventListener('DOMContentLoaded', function() {
    // Información de la vivienda para utilizarla en la redirección
    const propertyInfo = {
        id: document.querySelector('.vivienda-title') ? document.querySelector('.vivienda-title').textContent.replace('Vivienda ', '') : '',
        price: document.querySelector('.price') ? document.querySelector('.price').textContent.replace('€', '') : '',
        specs: document.querySelector('.vivienda-subtitle') ? document.querySelector('.vivienda-subtitle').textContent : ''
    };
    
    // Botón de reserva - redirige a la página de reserva con parámetros
    const reservarBtn = document.getElementById('reservar-btn');
    if (reservarBtn) {
        reservarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const reservaUrl = '../reserva/index.html' + 
                '?property=' + encodeURIComponent(propertyInfo.id) +
                '&price=' + encodeURIComponent(propertyInfo.price) +
                '&specs=' + encodeURIComponent(propertyInfo.specs);
            window.location.href = reservaUrl;
        });
    }
    
    // Modal de garantías
    const guaranteesModal = document.getElementById('guarantees-modal');
    const moreGuaranteesBtn = document.getElementById('more-guarantees');
    const closeGuaranteeBtn = document.querySelector('.close-guarantee-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    if (moreGuaranteesBtn) {
        moreGuaranteesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            guaranteesModal.style.display = 'flex';
        });
    }
    
    if (closeGuaranteeBtn) {
        closeGuaranteeBtn.addEventListener('click', function() {
            guaranteesModal.style.display = 'none';
        });
    }
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function(e) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
});