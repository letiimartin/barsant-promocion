// firebase-client-service.js - Servicio Firebase para el cliente (CORREGIDO)

/**
 * Función para obtener la conexión a Firebase
 */
async function getDb() {
    try {
        const resp = await fetch('/src/firebase/firebase-client-config.json');
        if (!resp.ok) throw new Error('Configuración Firebase no encontrada');
        const config = await resp.json();
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const app = initializeApp(config);
        return getFirestore(app);
    } catch (err) {
        console.error('Error conectando a Firebase:', err);
        throw new Error('No se pudo conectar a Firebase');
    }
}

/**
 * Función para buscar cliente existente por email o DNI
 */
export async function buscarClienteExistente(email, dni) {
    try {
        const db = await getDb();
        const { collection, query, where, getDocs, or } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        
        // Crear array de condiciones solo con valores válidos
        const condiciones = [];
        if (email && email.trim()) {
            condiciones.push(where('email', '==', email.trim().toLowerCase()));
        }
        if (dni && dni.trim()) {
            condiciones.push(where('dni', '==', dni.trim().toUpperCase()));
        }
        
        if (condiciones.length === 0) {
            return null;
        }
        
        // Usar 'or' solo si hay múltiples condiciones
        const consulta = condiciones.length === 1 
            ? query(collection(db, 'clientes'), condiciones[0])
            : query(collection(db, 'clientes'), or(...condiciones));
        
        const snapshot = await getDocs(consulta);
        
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        }
        
        return null;
        
    } catch (error) {
        console.error('Error buscando cliente existente:', error);
        return null;
    }
}

/**
 * Función para limpiar datos antes de enviar a Firebase
 * Elimina valores undefined y campos vacíos
 */
function limpiarDatosFirebase(objeto) {
    const objetoLimpio = {};
    
    Object.keys(objeto).forEach(key => {
        const valor = objeto[key];
        
        // Solo incluir valores válidos (no undefined, no null, no strings vacíos)
        if (valor !== undefined && valor !== null && valor !== '') {
            // Si es string, hacer trim
            if (typeof valor === 'string') {
                const valorLimpio = valor.trim();
                if (valorLimpio !== '') {
                    objetoLimpio[key] = valorLimpio;
                }
            } else {
                objetoLimpio[key] = valor;
            }
        }
    });
    
    return objetoLimpio;
}

/**
 * Función principal para procesar los datos del paso 2
 */
export async function procesarDatosPaso2(configuracionCompleta) {
    try {
        console.log('Iniciando procesamiento de datos del paso 2...');
        
        const db = await getDb();
        const { collection, doc, setDoc, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        
        // Extraer y limpiar datos personales
        const datosPersonales = configuracionCompleta.datos_personales || {};
        
        // IMPORTANTE: Solo incluir campos que existen en el formulario simplificado
        const datosClienteLimpios = limpiarDatosFirebase({
            nombre: datosPersonales.nombre,
            apellidos: datosPersonales.apellidos,
            dni: datosPersonales.dni ? datosPersonales.dni.toUpperCase() : undefined,
            fecha_nacimiento: datosPersonales.fecha_nacimiento,
            email: datosPersonales.email ? datosPersonales.email.toLowerCase() : undefined,
            telefono: datosPersonales.telefono,
            direccion: datosPersonales.direccion,
            ciudad: datosPersonales.ciudad,
            codigo_postal: datosPersonales.codigo_postal,
            comentarios: datosPersonales.comentarios,
            fecha_creacion: serverTimestamp(),
            fecha_actualizacion: serverTimestamp()
        });
        
        console.log('Datos del cliente preparados:', datosClienteLimpios);
        
        // Verificar si es cliente existente o crear nuevo
        let clienteId;
        let esClienteExistente = false;
        
        if (configuracionCompleta.cliente_existente && configuracionCompleta.cliente_existente.id) {
            // Cliente existente - actualizar datos
            clienteId = configuracionCompleta.cliente_existente.id;
            esClienteExistente = true;
            
            console.log('Actualizando cliente existente:', clienteId);
            await setDoc(doc(db, 'clientes', clienteId), {
                ...datosClienteLimpios,
                fecha_actualizacion: serverTimestamp()
            }, { merge: true });
            
        } else {
            // Cliente nuevo
            console.log('Creando nuevo cliente...');
            const clienteRef = await addDoc(collection(db, 'clientes'), datosClienteLimpios);
            clienteId = clienteRef.id;
        }
        
        console.log(`Cliente ${esClienteExistente ? 'actualizado' : 'creado'} con ID:`, clienteId);
        
        // Preparar datos de la reserva (SIN campos financieros)
        const datosReservaLimpios = limpiarDatosFirebase({
            cliente_id: clienteId,
            vivienda_id: configuracionCompleta.vivienda_id,
            vivienda_nombre: configuracionCompleta.vivienda_nombre,
            vivienda_precio: configuracionCompleta.vivienda_precio || 0,
            precio_total: configuracionCompleta.precio_total || configuracionCompleta.vivienda_precio || 0,
            
            // Configuración de cochera y trastero
            tiene_asignados: configuracionCompleta.tiene_asignados || false,
            es_pack_vinculado: configuracionCompleta.es_pack_vinculado || false,
            incluir_cochera: configuracionCompleta.incluir_cochera || false,
            cochera_id: configuracionCompleta.cochera_id,
            incluir_trastero: configuracionCompleta.incluir_trastero || false,
            trastero_id: configuracionCompleta.trastero_id,
            descuento_pack: configuracionCompleta.descuento_pack || 0,
            
            // Estado y fechas
            estado: 'datos_completados',
            paso_actual: 2,
            importe_reserva: 6000,
            fecha_creacion: serverTimestamp(),
            fecha_actualizacion: serverTimestamp(),
            fecha_paso2: serverTimestamp()
        });
        
        console.log('Datos de la reserva preparados:', datosReservaLimpios);
        
        // Crear la reserva
        console.log('Creando reserva...');
        const reservaRef = await addDoc(collection(db, 'reservas'), datosReservaLimpios);
        const reservaId = reservaRef.id;
        
        console.log('Reserva creada con ID:', reservaId);
        
        return {
            success: true,
            cliente: {
                id: clienteId,
                esExistente: esClienteExistente,
                datos: datosClienteLimpios
            },
            reserva: {
                id: reservaId,
                datos: datosReservaLimpios
            }
        };
        
    } catch (error) {
        console.error('Error en procesarDatosPaso2:', error);
        
        // Información más específica del error
        if (error.message.includes('setDoc')) {
            console.error('Error específico con setDoc - revisar datos enviados');
        }
        if (error.message.includes('undefined')) {
            console.error('Error de valor undefined - revisar limpieza de datos');
        }
        
        return {
            success: false,
            error: error.message,
            detalles: error
        };
    }
}

/**
 * Función para actualizar el progreso de una reserva
 */
export async function actualizarProgresoReserva(reservaId, paso, datosAdicionales = {}) {
    try {
        console.log(`Actualizando progreso de reserva ${reservaId} al paso ${paso}`);
        
        const db = await getDb();
        const { doc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        
        const datosActualizacion = limpiarDatosFirebase({
            paso_actual: paso,
            [`fecha_paso${paso}`]: serverTimestamp(),
            fecha_actualizacion: serverTimestamp(),
            ...datosAdicionales
        });
        
        await updateDoc(doc(db, 'reservas', reservaId), datosActualizacion);
        
        console.log('Progreso actualizado correctamente');
        return { success: true };
        
    } catch (error) {
        console.error('Error actualizando progreso:', error);
        throw error;
    }
}

/**
 * Función para actualizar una reserva con datos adicionales
 */
export async function actualizarReserva(reservaId, datos) {
    try {
        console.log(`Actualizando reserva ${reservaId} con datos adicionales`);
        
        const db = await getDb();
        const { doc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        
        const datosLimpios = limpiarDatosFirebase({
            ...datos,
            fecha_actualizacion: serverTimestamp()
        });
        
        await updateDoc(doc(db, 'reservas', reservaId), datosLimpios);
        
        console.log('Reserva actualizada correctamente');
        return { success: true };
        
    } catch (error) {
        console.error('Error actualizando reserva:', error);
        throw error;
    }
}