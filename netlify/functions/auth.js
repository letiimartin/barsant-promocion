// netlify/functions/auth.js
// Función serverless para autenticación segura

exports.handler = async (event, context) => {
  // Solo permitir POST requests
  if (event.httpMethod !== 'POST') {
      return {
          statusCode: 405,
          headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Allow-Methods': 'POST, OPTIONS'
          },
          body: JSON.stringify({ error: 'Method not allowed' })
      };
  }

  // Manejar preflight CORS requests
  if (event.httpMethod === 'OPTIONS') {
      return {
          statusCode: 200,
          headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Allow-Methods': 'POST, OPTIONS'
          },
          body: ''
      };
  }

  try {
      // Parsear el body de la request
      const { password } = JSON.parse(event.body);

      if (!password) {
          return {
              statusCode: 400,
              headers: {
                  'Access-Control-Allow-Origin': '*',
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                  success: false, 
                  error: 'Password is required' 
              })
          };
      }

      // Obtener contraseñas de las variables de entorno
      const passwords = {
          
          [process.env.GTORRES_PASSWORD]: {
              name: 'Grupo Torres',
              type: 'inmobiliaria',
              company: 'Partner'
          },
          [process.env.IVERCASA_PASSWORD]: {
              name: 'Ivercasa',
              type: 'inmobiliaria',
              company: 'Partner'
          },
          [process.env.ADMIN_PASSWORD]: {
              name: 'Administrador',
              type: 'admin',
              company: 'Barsant'
          }
      };

      // Verificar si la contraseña es válida
      const authInfo = passwords[password];

      if (!authInfo) {
          return {
              statusCode: 401,
              headers: {
                  'Access-Control-Allow-Origin': '*',
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                  success: false, 
                  error: 'Invalid password' 
              })
          };
      }

      // Autenticación exitosa
      return {
          statusCode: 200,
          headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              success: true,
              user: {
                  name: authInfo.name,
                  type: authInfo.type,
                  company: authInfo.company
              }
          })
      };

  } catch (error) {
      console.error('Auth function error:', error);
      
      return {
          statusCode: 500,
          headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
              success: false, 
              error: 'Internal server error' 
          })
      };
  }
};