export default async (request, context) => {
  try {
    // Obtener la respuesta original
    const response = await context.next();
    const page = await response.text();

    // Crear el script con la variable de entorno
    const script = `<script>window.ENV={SITE_PASSWORD:"${context.env.SITE_PASSWORD}"};</script>`;

    // Insertar el script al final del head
    const modifiedPage = page.replace('</head>', `${script}</head>`);

    // Devolver la página modificada
    return new Response(modifiedPage, {
      headers: response.headers
    });
  } catch (error) {
    return new Response('Error processing page', { status: 500 });
  }
};
