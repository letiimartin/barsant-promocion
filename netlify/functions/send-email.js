const https = require('https');

exports.handler = async (event, context) => {
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

    // Determinar email destinatario según la cuenta (DESDE VARIABLES DE ENTORNO)
    let recipientEmail;
    switch (accessData.accountName) {
      case 'Grupo Torres':
        recipientEmail = process.env.EMAIL_GRUPO_TORRES;
        break;
      case 'Ivercasa':
        recipientEmail = process.env.EMAIL_IVERCASA;
        break;
      case 'Administrador':
        recipientEmail = process.env.EMAIL_ADMIN;
        break;
      default:
        recipientEmail = process.env.EMAIL_ADMIN;
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

    // Preparar parámetros del email
    const templateParams = {
      to_email: recipientEmail,
      user_name: accessData.name,
      user_email: accessData.email,
      user_phone: accessData.phone,
      account_name: accessData.accountName,
      company: accessData.company,
      access_date: formattedDate,
      access_time: formattedTime
    };

    // Enviar email via EmailJS API
    const emailData = JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      template_params: templateParams
    });

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
            resolve({ success: true });
          } else {
            reject(new Error(`EmailJS error: ${data}`));
          }
        });
      });

      req.on('error', reject);
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
        error: 'Failed to send email' 
      })
    };
  }
};