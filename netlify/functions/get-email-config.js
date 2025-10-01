exports.handler = async (event, context) => {
    // Solo permitir GET requests
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }
  
    // Manejar preflight CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: ''
      };
    }
  
    try {
      // Devolver las credenciales de EmailJS desde variables de entorno
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600' // Cache por 1 hora
        },
        body: JSON.stringify({
          publicKey: process.env.EMAILJS_PUBLIC_KEY,
          serviceId: process.env.EMAILJS_SERVICE_ID,
          templateId: process.env.EMAILJS_TEMPLATE_ID
        })
      };
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Failed to get email configuration' 
        })
      };
    }
  };