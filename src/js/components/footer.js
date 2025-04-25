/**
 * Generate the footer HTML
 * @return {string} The footer HTML
 */
export function getFooter() {
  return `
  <footer>
    <div class="container">
      <div class="footer-content">
        <div class="footer-column">
          <h4>Barsant Promociones</h4>
          <p>Construyendo hogares de calidad en las mejores ubicaciones de Granada desde 1995.</p>
        </div>
        <div class="footer-column">
          <h4>Enlaces Rápidos</h4>
          <ul>
            <li><a href="/index.html">Inicio</a></li>
            <li><a href="/index.html#about">Sobre Nosotros</a></li>
            <li><a href="/index.html#properties">Viviendas</a></li>
            <li><a href="/index.html#gallery">Galería</a></li>
            <li><a href="/index.html#contact">Contacto</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h4>Legal</h4>
          <ul>
            <li><a href="/legal/aviso-legal.html">Aviso Legal</a></li>
            <li><a href="/legal/politica-privacidad.html">Política de Privacidad</a></li>
            <li><a href="/legal/politica-cookies.html">Política de Cookies</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h4>Contacto</h4>
          <p>Calle Gran Vía 23, 18001 Granada</p>
          <p>info@barsantpromociones.com</p>
          <p>+34 958 123 456</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} Barsant Promociones. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>`;
}
