const https = require('https');

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
    const { accessData } = JSON.parse(event.body);

    // Si es administrador, NO enviar email
    if (accessData.accountName === 'Administrador') {
      console.log('Admin login - no email notification sent');
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: true, 
          message: 'Admin login - no email sent' 
        })
      };
    }

    // Determinar email destinatario según la cuenta (DESDE VARIABLES DE ENTORNO)
    let recipientEmail;
    switch (accessData.accountName) {
      case 'Grupo Torres':
        recipientEmail = process.env.EMAIL_GRUPO_TORRES;
        break;
      case 'Ivercasa':
        recipientEmail = process.env.EMAIL_IVERCASA;
        break;
      default:
        throw new Error(`Cuenta no reconocida: ${accessData.accountName}`);
    }

    // Validar que existe el email destinatario
    if (!recipientEmail) {
      throw new Error('Email destinatario no configurado');
    }

    // Formatear fecha y hora
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Preparar parámetros del email (sanitizando para evitar problemas con JSON)
    const sanitize = (str) => {
      if (typeof str !== 'string') return str;
      return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    };

    const templateParams = {
      to_email: recipientEmail,
      user_name: sanitize(accessData.name),
      user_email: sanitize(accessData.email),
      user_phone: sanitize(accessData.phone),
      account_name: sanitize(accessData.accountName),
      company: sanitize(accessData.company),
      access_date: formattedDate,
      access_time: formattedTime
    };

    console.log(`Enviando email a ${recipientEmail} para acceso de ${accessData.accountName}`);

    // Enviar email via EmailJS API
    const emailPayload = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      template_params: templateParams
    };

    const emailData = JSON.stringify(emailPayload);

    const options = {
      hostname: 'api.emailjs.com',
      path: '/api/v1.0/email/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': emailData.length
      }
    };

    await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('Email enviado exitosamente');
            resolve({ success: true });
          } else {
            console.error(`EmailJS error: ${data}`);
            reject(new Error(`EmailJS API responded with status ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('Error en request a EmailJS:', error);
        reject(error);
      });
      
      req.write(emailData);
      req.end();
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email' 
      })
    };
  }
};