// src/js/adminLogger.js
// Sistema de identificación de usuarios admin y cambio de estado

import { registrarCambioEstado, actualizarEstadoVivienda } from './firebaseHistorial.js';

// ========================================
// CONFIGURACIÓN DE USUARIOS AUTORIZADOS
// Obtener desde variables de entorno
// ========================================
let USUARIOS_AUTORIZADOS = [];

// Cargar usuarios autorizados al inicializar
(async function cargarUsuariosAutorizados() {
  try {
    const response = await fetch('/.netlify/functions/get-admin-users');
    const { users } = await response.json();
    USUARIOS_AUTORIZADOS = users || [];
    
    if (USUARIOS_AUTORIZADOS.length === 0) {
      console.error('⚠️ No hay usuarios autorizados configurados en variables de entorno');
    } else {
      console.log('✅ Usuarios autorizados cargados:', USUARIOS_AUTORIZADOS.length);
    }
  } catch (error) {
    console.error('❌ Error cargando usuarios autorizados:', error);
    USUARIOS_AUTORIZADOS = [];
  }
})();


// ========================================
// MODAL DE IDENTIFICACIÓN DE USUARIO
// ========================================
function mostrarModalIdentificacion(callback) {
  const modal = document.createElement('div');
  modal.id = 'modal-identificacion-admin';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 12px;
      max-width: 450px;
      width: 90%;
      padding: 35px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      font-family: 'Montserrat', sans-serif;
      animation: slideUp 0.3s ease;
    ">
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #e0c88c 0%, #d4b876 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
        ">
          <i class="fas fa-user-shield" style="font-size: 24px; color: #3a3a3a;"></i>
        </div>
        <h3 style="margin: 0; color: #3a3a3a; font-size: 1.4rem;">
          Identificación de Usuario
        </h3>
      </div>
      
      <p style="color: #666; margin-bottom: 25px; text-align: center; line-height: 1.6;">
        Para registrar este cambio, ingresa tu usuario:
      </p>
      
      <div style="margin-bottom: 25px;">
        <label style="
          display: block;
          margin-bottom: 8px;
          color: #3a3a3a;
          font-weight: 600;
          font-size: 0.9rem;
        ">
          Usuario:
        </label>
        <input 
          type="text" 
          id="input-usuario-admin" 
          placeholder="Ingresa tu usuario"
          style="
            width: 100%;
            padding: 14px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 16px;
            font-family: 'Montserrat', sans-serif;
            transition: border-color 0.3s;
          "
        />
      </div>
      
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="btn-confirmar-usuario-admin" style="
          background: linear-gradient(135deg, #e0c88c 0%, #d4b876 100%);
          color: #3a3a3a;
          border: none;
          padding: 14px 28px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(224, 200, 140, 0.4);
        ">
          <i class="fas fa-check"></i> Confirmar
        </button>
        <button id="btn-cancelar-usuario-admin" style="
          background-color: #6c757d;
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 15px;
          transition: all 0.3s;
        ">
          Cancelar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Añadir estilos de animación
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    #input-usuario-admin:focus {
      border-color: #e0c88c;
      outline: none;
    }
    #btn-confirmar-usuario-admin:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(224, 200, 140, 0.5);
    }
    #btn-cancelar-usuario-admin:hover {
      background-color: #5a6268;
    }
  `;
  document.head.appendChild(style);
  
  // Event listeners
  const inputUsuario = document.getElementById('input-usuario-admin');
  const btnConfirmar = document.getElementById('btn-confirmar-usuario-admin');
  const btnCancelar = document.getElementById('btn-cancelar-usuario-admin');
  
  // Focus automático en el input
  setTimeout(() => inputUsuario.focus(), 100);
  
  // Confirmar con Enter
  inputUsuario.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      btnConfirmar.click();
    }
  });
  
  btnConfirmar.addEventListener('click', () => {
    const usuarioId = inputUsuario.value.trim().toLowerCase();
    
    if (!usuarioId) {
      inputUsuario.style.borderColor = '#dc3545';
      inputUsuario.focus();
      return;
    }
    
    // Validar que el usuario esté autorizado
    if (!USUARIOS_AUTORIZADOS.includes(usuarioId)) {
      inputUsuario.style.borderColor = '#dc3545';
      alert('⚠️ Usuario no autorizado.\n\nUsuarios válidos: ' + USUARIOS_AUTORIZADOS.join(', '));
      inputUsuario.focus();
      return;
    }
    
    modal.remove();
    callback(usuarioId);
  });
  
  btnCancelar.addEventListener('click', () => {
    modal.remove();
  });
  
  // Cerrar al hacer click fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Cerrar con ESC
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// ========================================
// FUNCIÓN PRINCIPAL PARA CAMBIAR ESTADO
// ========================================
export async function cambiarEstadoVivienda(idVivienda, estadoActual) {
  try {
    // Verificar que el usuario es admin
    const userInfo = window.authUtils?.getUserInfo();
    if (!userInfo || userInfo.type !== 'admin') {
      alert('No tienes permisos para realizar esta acción.\nDebes iniciar sesión como administrador.');
      return;
    }
    
    // Paso 1: Mostrar modal de identificación
    mostrarModalIdentificacion(async (usuarioId) => {
      try {
        const nuevoEstado = estadoActual === "Disponible" ? "Reservado" : "Disponible";
        
        // Confirmar el cambio
        const confirmar = confirm(
          `Usuario: ${usuarioId}\n\n` +
          `¿Confirmar cambio de estado?\n\n` +
          `Vivienda: ${idVivienda}\n` +
          `${estadoActual} → ${nuevoEstado}`
        );
        
        if (!confirmar) return;
        
        // Mostrar indicador de carga en el botón
        const boton = event?.target?.closest('button');
        let textoOriginal = '';
        if (boton) {
          textoOriginal = boton.innerHTML;
          boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
          boton.disabled = true;
        }
        
        // Paso 2: Actualizar estado en Firebase (usando firebaseHistorial.js)
        await actualizarEstadoVivienda(idVivienda, nuevoEstado, usuarioId);
        
        console.log(`Estado actualizado: ${idVivienda} -> ${nuevoEstado}`);
        
        // Paso 3: Registrar el cambio en el historial (usando firebaseHistorial.js)
        await registrarCambioEstado(idVivienda, estadoActual, nuevoEstado, usuarioId);
        
        // Paso 4: Mostrar éxito y recargar
        alert(`Estado cambiado exitosamente\n\nCambio realizado por: ${usuarioId}`);
        window.location.reload();
        
      } catch (error) {
        console.error("Error al actualizar el estado:", error);
        alert(`Error al cambiar el estado:\n${error.message}\n\nVerifica tu conexión e intenta de nuevo.`);
        
        // Restaurar botón si hay error
        const boton = event?.target?.closest('button');
        if (boton && textoOriginal) {
          boton.disabled = false;
          boton.innerHTML = textoOriginal;
        }
      }
    });
    
  } catch (error) {
    console.error("Error en cambiarEstadoVivienda:", error);
    alert("Error al iniciar el cambio de estado.");
  }
}

// Exportar lista de usuarios para uso externo si es necesario
export { USUARIOS_AUTORIZADOS };