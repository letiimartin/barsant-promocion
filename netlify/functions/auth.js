const crypto = require('crypto');

// Comparación en tiempo constante para no filtrar información por tiempos de respuesta
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || b.length === 0) return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Contraseñas válidas:
 * - SITE_PASSWORD: contraseña general del sitio.
 * - EXTRA_PASSWORDS: contraseñas adicionales separadas por comas (p. ej. "torres").
 * Ambas se configuran como variables de entorno en Netlify, nunca en el repositorio.
 */
function getValidPasswords() {
  const extra = (process.env.EXTRA_PASSWORDS || '')
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);
  return [process.env.SITE_PASSWORD, ...extra].filter(Boolean);
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
    const { password } = JSON.parse(event.body || '{}');
    const valid = getValidPasswords().some(p => safeEqual(password, p));

    if (valid) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    }

    return {
      statusCode: 401,
      body: JSON.stringify({ success: false, error: 'Contraseña incorrecta' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
};
