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

      // Perfiles de acceso
      const profiles = {
          gtorres: { name: 'Grupo Torres', type: 'inmobiliaria', company: 'Partner' },
          ivercasa: { name: 'Ivercasa', type: 'inmobiliaria', company: 'Partner' },
          admin: { name: 'Administrador', type: 'admin', company: 'Barsant' },
          barsant: { name: 'Barsant', type: 'standard', company: 'Barsant' } // Acceso estándar
      };

      // Contraseñas (variables de entorno de Netlify) -> perfil
      // GTORRES_EXTRA_PASSWORDS admite contraseñas adicionales de Grupo Torres separadas por comas
      const passwordEntries = [
          [process.env.GTORRES_PASSWORD, profiles.gtorres],
          ...(process.env.GTORRES_EXTRA_PASSWORDS || '').split(',').map(p => [p.trim(), profiles.gtorres]),
          [process.env.IVERCASA_PASSWORD, profiles.ivercasa],
          [process.env.ADMIN_PASSWORD, profiles.admin],
          [process.env.BARSANT_PASSWORD, profiles.barsant]
      ];

      // Ignorar variables no definidas o vacías (evita que "undefined" sea una contraseña válida)
      const passwords = {};
      for (const [pwd, profile] of passwordEntries) {
          if (pwd && !Object.prototype.hasOwnProperty.call(passwords, pwd)) {
              passwords[pwd] = profile;
          }
      }

      // Verificar si la contraseña es válida
      const authInfo = Object.prototype.hasOwnProperty.call(passwords, password) ? passwords[password] : null;

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