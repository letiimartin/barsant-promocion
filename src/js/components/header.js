/**
 * Generate the header HTML
 * @param {string} activePage - The current active page for navigation highlighting
 * @return {string} The header HTML
 */
export function getHeader(activePage = '') {
  return `<header>
  <div class="container">
      <div class="header-content">
          <a href="../index.html" class="logo">
              <img src="assets/images/logo (3).png" alt="Barsant Promociones Logo">
          </a>
          <nav>
              <ul>
                  <li><a href="#home" class="active">Inicio</a></li>
                  <li><a href="#about">La Promoción</a></li>
                  <li><a href="#properties">Viviendas</a></li>
                  <li><a href="#location">Ubicación</a></li>
                  <li><a href="#gallery">Galería</a></li>
                  <li><a href="#documentation">Documentación</a></li>
                  <li><a href="#contact">Contacto</a></li>
              </ul>
          </nav>
          <a href="#contact" class="cta-button">Solicitar Información</a>
      </div>
  </div>
</header>`;
}
