exports.handler = async (event, context) => {
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
      const users = process.env.USUARIOS_AUTORIZADOS 
        ? process.env.USUARIOS_AUTORIZADOS.split(',').map(u => u.trim())
        : [];
  
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600'
        },
        body: JSON.stringify({ users })
      };
    } catch (error) {
      console.error('Error obteniendo usuarios admin:', error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Failed to get admin users',
          users: []
        })
      };
    }
};