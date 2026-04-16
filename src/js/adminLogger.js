// src/js/adminLogger.js
// Sistema de identificación de usuarios admin y cambio de estado

import { registrarCambioEstado, actualizarEstadoVivienda, actualizarPrecioVivienda } from './firebaseHistorial.js';

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
  
  const inputUsuario = document.getElementById('input-usuario-admin');
  const btnConfirmar = document.getElementById('btn-confirmar-usuario-admin');
  const btnCancelar = document.getElementById('btn-cancelar-usuario-admin');
  
  setTimeout(() => inputUsuario.focus(), 100);
  
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
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
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
    const userInfo = window.authUtils?.getUserInfo();
    if (!userInfo || userInfo.type !== 'admin') {
      alert('No tienes permisos para realizar esta acción.\nDebes iniciar sesión como administrador.');
      return;
    }
    
    mostrarModalIdentificacion(async (usuarioId) => {
      let boton = null;
      let textoOriginal = '';
      
      try {
        const nuevoEstado = estadoActual === "Disponible" ? "Reservado" : "Disponible";
        
        const confirmar = confirm(
          `Usuario: ${usuarioId}\n\n` +
          `¿Confirmar cambio de estado?\n\n` +
          `Vivienda: ${idVivienda}\n` +
          `${estadoActual} → ${nuevoEstado}`
        );
        
        if (!confirmar) return;
        
        boton = event?.target?.closest('button');
        if (boton) {
          textoOriginal = boton.innerHTML;
          boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
          boton.disabled = true;
        }
        
        // Actualizar estado en Firebase
        await actualizarEstadoVivienda(idVivienda, nuevoEstado, usuarioId);
        console.log(`Estado actualizado: ${idVivienda} -> ${nuevoEstado}`);
        
        // Intentar registrar en historial (no crítico)
        try {
          await registrarCambioEstado(idVivienda, estadoActual, nuevoEstado, usuarioId);
        } catch (historialError) {
          console.warn('No se pudo registrar en historial (el cambio se aplicó correctamente):', historialError);
        }
        
        alert(`Estado cambiado exitosamente\n\nCambio realizado por: ${usuarioId}`);
        window.location.reload();
        
      } catch (error) {
        console.error("Error al actualizar el estado:", error);
        alert(`Error al cambiar el estado:\n${error.message}\n\nVerifica tu conexión e intenta de nuevo.`);
        
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

// ========================================
// FUNCIÓN PRINCIPAL PARA CAMBIAR PRECIO
// ========================================
export async function cambiarPrecioVivienda(idVivienda, precioActual) {
  try {
    const userInfo = window.authUtils?.getUserInfo();
    if (!userInfo || userInfo.type !== 'admin') {
      alert('No tienes permisos para realizar esta acción.\nDebes iniciar sesión como administrador.');
      return;
    }
    
    mostrarModalIdentificacion(async (usuarioId) => {
      let textoOriginal = '';
      let targetElement = event?.target;
      let boton = targetElement?.closest('button') || targetElement;
      
      try {
        const nuevoPrecioStr = prompt(`Usuario: ${usuarioId}\n\nVivienda: ${idVivienda}\nPrecio actual: ${precioActual}\n\nIngresa el nuevo precio (solo números):`, precioActual ? precioActual.toString().replace(/[^\d.-]/g, '') : '');
        
        if (nuevoPrecioStr === null) return; // Cancelado
        
        const nuevoPrecio = parseFloat(nuevoPrecioStr.replace(/[^\d.-]/g, ''));
        
        if (isNaN(nuevoPrecio)) {
            alert('Por favor ingresa un número válido.');
            return;
        }

        const confirmar = confirm(
          `¿Confirmar cambio de precio?\n\n` +
          `Vivienda: ${idVivienda}\n` +
          `${precioActual} → €${nuevoPrecio.toLocaleString('es-ES')}`
        );
        
        if (!confirmar) return;
        
        if (boton) {
          textoOriginal = boton.innerHTML;
          boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
          boton.disabled = true;
        }
        
        // Actualizar precio en Firebase
        await actualizarPrecioVivienda(idVivienda, nuevoPrecio, usuarioId);
        console.log(`Precio actualizado: ${idVivienda} -> ${nuevoPrecio}`);
        
        alert(`Precio cambiado exitosamente\n\nCambio realizado por: ${usuarioId}`);
        window.location.reload();
        
      } catch (error) {
        console.error("Error al actualizar el precio:", error);
        alert(`Error al cambiar el precio:\n${error.message}\n\nVerifica tu conexión e intenta de nuevo.`);
        
        if (boton && textoOriginal) {
          boton.disabled = false;
          boton.innerHTML = textoOriginal;
        }
      }
    });
    
  } catch (error) {
    console.error("Error en cambiarPrecioVivienda:", error);
    alert("Error al iniciar el cambio de precio.");
  }
}

export { USUARIOS_AUTORIZADOS };