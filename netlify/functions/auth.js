const crypto = require('crypto');

/**
 * Usuarios con contraseña propia.
 * La contraseña de cada usuario se lee de una variable de entorno de Netlify,
 * nunca se guarda en el repositorio.
 * Para añadir un usuario nuevo: añadir aquí su nombre y la variable correspondiente.
 */
const USERS = {
  torres: 'USER_TORRES_PASSWORD'
};

// Comparación en tiempo constante para no filtrar información por tiempos de respuesta
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || b.length === 0) return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

exports.handler = async function(event, context) {
  // Solo aceptar peticiones POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { username, password } = JSON.parse(event.body || '{}');
    const user = typeof username === 'string' ? username.trim().toLowerCase() : '';

    let valid = false;
    if (user) {
      // Acceso con usuario: usar la contraseña propia de ese usuario
      const envVar = Object.prototype.hasOwnProperty.call(USERS, user) ? USERS[user] : null;
      valid = envVar ? safeEqual(password, process.env[envVar]) : false;
    } else {
      // Acceso sin usuario: contraseña general del sitio
      valid = safeEqual(password, process.env.SITE_PASSWORD);
    }

    if (valid) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, user: user || null })
      };
    }

    return {
      statusCode: 401,
      body: JSON.stringify({ success: false, error: 'Usuario o contraseña incorrectos' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
};
