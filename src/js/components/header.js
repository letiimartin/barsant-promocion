/**
 * Generate the header HTML
 * @param {string} activePage - The current active page for navigation highlighting
 * @return {string} The header HTML
 */
export function getHeader(activePage = '') {
  return `
  <header>
    <div class="container">
      <div class="header-content">
        <a href="/index.html" class="logo">
          <img src="/assets/images/logo.jpg" alt="Barsant Promociones Logo">
          <span>Barsant Promociones</span>
        </a>
        <nav>
          <ul>
            <li><a href="/index.html" class="${activePage === 'home' ? 'active' : ''}">Inicio</a></li>
            <li><a href="/index.html#about" class="${activePage === 'about' ? 'active' : ''}">Sobre Nosotros</a></li>
            <li><a href="/index.html#properties" class="${activePage === 'properties' ? 'active' : ''}">Viviendas</a></li>
            <li><a href="/index.html#gallery" class="${activePage === 'gallery' ? 'active' : ''}">Galería</a></li>
            <li><a href="/index.html#contact" class="${activePage === 'contact' ? 'active' : ''}">Contacto</a></li>
          </ul>
        </nav>
      </div>
    </div>
  </header>`;
}
