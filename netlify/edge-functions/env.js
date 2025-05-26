export default async (request, context) => {
  const url = new URL(request.url);
  
  // Solo inyectar variables en la página de login
  if (url.pathname === '/login.html') {
    const response = await context.next();
    const page = await response.text();
    
    // Inyectar las variables de entorno de forma segura
    const script = `
      <script>
        window.ENV = {
          SITE_PASSWORD: '${context.env.SITE_PASSWORD}'
        };
      </script>
    `;
    
    // Insertar el script justo después del tag <head>
    const modifiedPage = page.replace('</head>', script + '</head>');
    
    return new Response(modifiedPage, response);
  }
  
  return context.next();
};
