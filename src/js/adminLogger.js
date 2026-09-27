// src/js/adminLogger.js
// Sistema de identificación de usuarios admin y cambio de estado

import { registrarCambioEstado, actualizarEstadoVivienda, actualizarPrecioVivienda, actualizarDatosVivienda } from './firebaseHistorial.js';

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

// ========================================
// EDICIÓN DE PRECIO, COCHERA Y TRASTERO
// ========================================
function parsearPrecio(valor) {
  const limpio = String(valor ?? '').trim();
  if (limpio === '') return null;
  const numero = parseFloat(limpio.replace(',', '.'));
  return isNaN(numero) ? NaN : numero;
}

function parsearCodigo(valor) {
  const limpio = String(valor ?? '').trim().toUpperCase();
  return limpio === '' ? null : limpio;
}

function mostrarModalEdicion(vivienda, usuarioId, onGuardar) {
  const modal = document.createElement('div');
  modal.id = 'modal-edicion-vivienda';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.8); z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    overflow-y: auto; padding: 16px; box-sizing: border-box;
  `;

  const estiloLabel = 'display:block; margin-bottom:6px; color:#3a3a3a; font-weight:600; font-size:0.85rem;';
  const estiloInput = 'width:100%; padding:10px 12px; border:2px solid #e0e0e0; border-radius:6px; font-size:15px; font-family:inherit; box-sizing:border-box;';
  const campo = (id, label, tipo, extra = '') => `
    <div style="flex:1; min-width:140px;">
      <label for="${id}" style="${estiloLabel}">${label}</label>
      <input id="${id}" type="${tipo}" ${extra} style="${estiloInput}" />
    </div>`;

  modal.innerHTML = `
    <div style="background:white; border-radius:12px; max-width:520px; width:100%; padding:28px; box-shadow:0 20px 60px rgba(0,0,0,0.4); font-family:'Montserrat', sans-serif; margin:auto;">
      <h3 style="margin:0 0 4px; color:#3a3a3a; font-size:1.3rem;">
        <i class="fas fa-edit"></i> Editar vivienda <span id="edit-vivienda-id"></span>
      </h3>
      <p style="margin:0 0 20px; color:#888; font-size:0.85rem;">Usuario: <span id="edit-usuario-id"></span></p>

      <div style="margin-bottom:18px;">
        ${campo('edit-precio-vivienda', 'Precio vivienda (€)', 'number', 'min="0" step="0.01"')}
      </div>

      <div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:18px;">
        ${campo('edit-cochera', 'Cochera asignada', 'text', 'placeholder="Ej: C29 (vacío = ninguna)"')}
        ${campo('edit-precio-cochera', 'Precio cochera (€)', 'number', 'min="0" step="0.01"')}
      </div>

      <div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:18px;">
        ${campo('edit-trastero', 'Trastero asignado', 'text', 'placeholder="Ej: T17 (vacío = ninguno)"')}
        ${campo('edit-precio-trastero', 'Precio trastero (€)', 'number', 'min="0" step="0.01"')}
      </div>

      <label style="display:flex; align-items:center; gap:8px; margin-bottom:18px; color:#3a3a3a; font-size:0.9rem; cursor:pointer;">
        <input id="edit-vinculado" type="checkbox" /> Cochera y trastero vinculados en pack
      </label>

      <p id="edit-error" style="display:none; color:#dc3545; font-size:0.9rem; margin:0 0 14px;"></p>

      <div style="display:flex; gap:12px; justify-content:flex-end; flex-wrap:wrap;">
        <button id="btn-cancelar-edicion" type="button" style="background-color:#6c757d; color:white; border:none; padding:12px 22px; border-radius:6px; cursor:pointer; font-size:15px;">
          Cancelar
        </button>
        <button id="btn-guardar-edicion" type="button" style="background:linear-gradient(135deg, #e0c88c 0%, #d4b876 100%); color:#3a3a3a; border:none; padding:12px 22px; border-radius:6px; cursor:pointer; font-weight:600; font-size:15px;">
          <i class="fas fa-save"></i> Guardar cambios
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Rellenar valores actuales (asignando por JS para no inyectar HTML)
  const $ = (id) => modal.querySelector(`#${id}`);
  $('edit-vivienda-id').textContent = vivienda.id;
  $('edit-usuario-id').textContent = usuarioId;
  $('edit-precio-vivienda').value = vivienda.precio_vivienda ?? '';
  $('edit-cochera').value = vivienda.cochera ?? '';
  $('edit-precio-cochera').value = vivienda.precio_cochera ?? '';
  $('edit-trastero').value = vivienda.trastero ?? '';
  $('edit-precio-trastero').value = vivienda.precio_trastero ?? '';
  $('edit-vinculado').checked = Boolean(vivienda.vinculado);

  const errorEl = $('edit-error');
  const mostrarError = (msg) => {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  };

  const cerrar = () => {
    modal.remove();
    document.removeEventListener('keydown', handleEscape);
  };
  const handleEscape = (e) => {
    if (e.key === 'Escape') cerrar();
  };
  document.addEventListener('keydown', handleEscape);
  $('btn-cancelar-edicion').addEventListener('click', cerrar);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrar();
  });

  setTimeout(() => $('edit-precio-vivienda').focus(), 100);

  $('btn-guardar-edicion').addEventListener('click', async () => {
    errorEl.style.display = 'none';

    const nuevos = {
      precio_vivienda: parsearPrecio($('edit-precio-vivienda').value),
      cochera: parsearCodigo($('edit-cochera').value),
      precio_cochera: parsearPrecio($('edit-precio-cochera').value),
      trastero: parsearCodigo($('edit-trastero').value),
      precio_trastero: parsearPrecio($('edit-precio-trastero').value),
      vinculado: $('edit-vinculado').checked
    };

    for (const campo of ['precio_vivienda', 'precio_cochera', 'precio_trastero']) {
      if (Number.isNaN(nuevos[campo]) || nuevos[campo] < 0) {
        mostrarError('Los precios deben ser números válidos (sin puntos de miles).');
        return;
      }
    }
    if (nuevos.vinculado && (!nuevos.cochera || !nuevos.trastero)) {
      mostrarError('Para vincular en pack hay que asignar cochera y trastero.');
      return;
    }
    // Sin cochera/trastero asignado no tiene sentido guardar su precio
    if (!nuevos.cochera) nuevos.precio_cochera = null;
    if (!nuevos.trastero) nuevos.precio_trastero = null;

    // Solo enviar los campos que han cambiado
    const cambios = {};
    Object.keys(nuevos).forEach(campo => {
      const anterior = campo === 'vinculado'
        ? Boolean(vivienda[campo])
        : (vivienda[campo] ?? null);
      if (nuevos[campo] !== anterior) cambios[campo] = nuevos[campo];
    });

    if (Object.keys(cambios).length === 0) {
      mostrarError('No has modificado ningún valor.');
      return;
    }

    const resumen = Object.keys(cambios)
      .map(campo => `${campo}: ${vivienda[campo] ?? '—'} → ${cambios[campo] ?? '—'}`)
      .join('\n');
    if (!confirm(`¿Confirmar cambios en ${vivienda.id}?\n\n${resumen}`)) return;

    const btnGuardar = $('btn-guardar-edicion');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    btnGuardar.disabled = true;

    try {
      await onGuardar(cambios);
      cerrar();
    } catch (error) {
      mostrarError(error.message);
      btnGuardar.innerHTML = textoOriginal;
      btnGuardar.disabled = false;
    }
  });
}

export async function editarDatosVivienda(idVivienda) {
  try {
    const userInfo = window.authUtils?.getUserInfo();
    if (!userInfo || userInfo.type !== 'admin') {
      alert('No tienes permisos para realizar esta acción.\nDebes iniciar sesión como administrador.');
      return;
    }

    const vivienda = (window.viviendas || []).find(v => v.id === idVivienda);
    if (!vivienda) {
      alert(`No se encontraron los datos de la vivienda ${idVivienda}.`);
      return;
    }

    mostrarModalIdentificacion((usuarioId) => {
      mostrarModalEdicion(vivienda, usuarioId, async (cambios) => {
        await actualizarDatosVivienda(idVivienda, cambios, vivienda, usuarioId);
        alert(`Datos actualizados correctamente\n\nCambio realizado por: ${usuarioId}`);
        window.location.reload();
      });
    });

  } catch (error) {
    console.error("Error en editarDatosVivienda:", error);
    alert("Error al iniciar la edición de la vivienda.");
  }
}

export { USUARIOS_AUTORIZADOS };