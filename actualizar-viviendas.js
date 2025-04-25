const fs = require('fs');
const path = require('path');

const viviendasDir = path.join(__dirname, 'viviendas');
const files = fs.readdirSync(viviendasDir).filter(f => f.endsWith('.html') && f !== 'a-primero-a.html' && f !== 'template.html');

function extractInfo(html, regex, fallback = '') {
    const match = html.match(regex);
    return match ? match[1].trim() : fallback;
}

files.forEach(file => {
    const filePath = path.join(viviendasDir, file);
    let html = fs.readFileSync(filePath, 'utf8');

    // Extraer datos básicos de la vivienda
    const nombre = extractInfo(html, /<h1[^>]*class="vivienda-title"[^>]*>([^<]+)<\/h1>/, file.replace('.html',''));
    const caracteristicas = extractInfo(html, /<p[^>]*class="vivienda-subtitle"[^>]*>([^<]+)<\/p>/, '');
    const precio = extractInfo(html, /<div[^>]*class="price"[^>]*>€?([\d\.,]+)<\/div>/, '0');
    const bloque = nombre.match(/Vivienda ([A-E])/i) ? nombre.match(/Vivienda ([A-E])/i)[1] : '';
    const piso = nombre.split(' ').slice(2).join(' ');

    // Eliminar bloques antiguos de modal y formulario
    html = html
        .replace(/<!-- Modal de Reserva -->[\s\S]*?<\/div>\s*<\/div>/gi, '')
        .replace(/<div class="modal" id="reserva-modal">[\s\S]*?<\/div>\s*<\/div>/gi, '')
        .replace(/<script>[\s\S]*?reservar-btn[\s\S]*?<\/script>/gi, '');

    // Reemplazar o insertar el botón de reserva
    html = html.replace(
        /<button[^>]*id="reservar-btn"[^>]*>[^<]*<\/button>/gi,
        `<button class="cta-button" id="reservar-btn">Reservar esta vivienda<\/button>`
    );
    // Si no existía, lo insertamos antes del cierre de .vivienda-info (ajusta si tu estructura es diferente)
    if (!html.includes('id="reservar-btn"')) {
        html = html.replace(/(<\/div>\s*<\/div>\s*<\/div>)/i, `<button class="cta-button" id="reservar-btn">Reservar esta vivienda<\/button>\n$1`);
    }

    // Añadir el nuevo script justo antes de </body>
    html = html.replace(
        /<\/body>/i,
        `<script>
document.getElementById('reservar-btn').addEventListener('click', function() {
    const viviendaInfo = {
        nombre: '${nombre}',
        caracteristicas: '${caracteristicas}',
        precio: '€${precio}',
        bloque: '${bloque}',
        piso: '${piso}'
    };
    const params = new URLSearchParams();
    params.append('vivienda', viviendaInfo.nombre);
    params.append('info', viviendaInfo.caracteristicas);
    params.append('precio', viviendaInfo.precio);
    params.append('bloque', viviendaInfo.bloque);
    params.append('piso', viviendaInfo.piso);
    window.location.href = '../reserva/index.html?' + params.toString();
});
<\/script>\n<\/body>`
    );

    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Actualizado: ${file}`);
});

console.log('¡Todas las viviendas han sido actualizadas!');
