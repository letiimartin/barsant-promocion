/* Components module for Barsant website
 * This file contains reusable HTML components to maintain consistency
 * across the website and reduce code duplication
 */

class BarsantComponents {
  /**
   * Generate the header HTML
   * @param {string} activePage - The current active page for navigation highlighting
   * @return {string} The header HTML
   */
  static getHeader(activePage = '') {
    return `
    <header>
      <div class="container">
        <div class="header-content">
          <a href="../index.html" class="logo">
            <img src="../assets/images/logo (3).png" alt="Barsant Promociones Logo">
            <span>Barsant Promociones</span>
          </a>
          <nav>
            <ul>
              <li><a href="../index.html" class="${activePage === 'home' ? 'active' : ''}">Inicio</a></li>
              <li><a href="../index.html#about" class="${activePage === 'about' ? 'active' : ''}">Sobre Nosotros</a></li>
              <li><a href="../index.html#properties" class="${activePage === 'properties' ? 'active' : ''}">Viviendas</a></li>
              <li><a href="../index.html#gallery" class="${activePage === 'gallery' ? 'active' : ''}">Galería</a></li>
              <li><a href="../index.html#contact" class="${activePage === 'contact' ? 'active' : ''}">Contacto</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>`;
  }

  /**
   * Generate the footer HTML
   * @return {string} The footer HTML
   */
  static getFooter() {
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
              <li><a href="../index.html">Inicio</a></li>
              <li><a href="../index.html#about">Sobre Nosotros</a></li>
              <li><a href="../index.html#properties">Viviendas</a></li>
              <li><a href="../index.html#gallery">Galería</a></li>
              <li><a href="../index.html#contact">Contacto</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h4>Legal</h4>
            <ul>
              <li><a href="../legal/aviso-legal.html">Aviso Legal</a></li>
              <li><a href="../legal/politica-privacidad.html">Política de Privacidad</a></li>
              <li><a href="../legal/politica-cookies.html">Política de Cookies</a></li>
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

  /**
   * Generate the property card HTML
   * @param {Object} property - The property data
   * @return {string} The property card HTML
   */
  static getPropertyCard(property) {
    return `
    <div class="property-card">
      <div class="property-image" style="background-image: url('${property.image}');"></div>
      <div class="property-details">
        <h3>${property.title}</h3>
        <p>${property.specs}</p>
        <div class="property-price">${window.barsantUtils.formatCurrency(property.price)}</div>
        <a href="/viviendas/${property.url}" class="cta-button">Ver Detalles</a>
      </div>
    </div>`;
  }

  /**
   * Generate the reservation steps HTML
   * @param {number} activeStep - The current active step (1-4)
   * @return {string} The reservation steps HTML
   */
  static getReservationSteps(activeStep = 1) {
    return `
    <div class="progress-bar">
      <div class="progress-step ${activeStep >= 1 ? 'active' : ''}" id="step1">
        <div class="step-number">1</div>
        <div class="step-label">Información</div>
      </div>
      <div class="progress-step ${activeStep >= 2 ? 'active' : ''}" id="step2">
        <div class="step-number">2</div>
        <div class="step-label">Contrato</div>
      </div>
      <div class="progress-step ${activeStep >= 3 ? 'active' : ''}" id="step3">
        <div class="step-number">3</div>
        <div class="step-label">Pago</div>
      </div>
      <div class="progress-step ${activeStep >= 4 ? 'active' : ''}" id="step4">
        <div class="step-number">4</div>
        <div class="step-label">Confirmación</div>
      </div>
    </div>`;
  }

  /**
   * Generate the property summary HTML for reservation page
   * @param {string} title - The property title
   * @param {string} specs - The property specifications
   * @param {string} price - The property price
   * @return {string} The property summary HTML
   */
  static getPropertySummary(title, specs, price) {
    // Verificar si el precio ya incluye el símbolo €
    const formattedPrice = price.includes('€') ? price : `€${price}`;
    
    return `
    <div class="property-summary-bar">
      <div class="container">
        <div class="property-summary-container">
          <div class="property-summary-details">
            <div class="property-image" style="background-image: url('../assets/images/foto1.jpg');"></div>
            <div class="property-info">
              <h3 id="property-title">${title}</h3>
              <p id="property-specs">${specs}</p>
            </div>
          </div>
          <div class="property-price" id="property-price">${formattedPrice}</div>
        </div>
      </div>
    </div>`;
  }

  /**
   * Generate the documents list HTML
   * @return {string} The documents list HTML
   */
  static getDocumentsList() {
    return `
    <div class="documents-section">
      <h3>Documentos disponibles:</h3>
      <ul class="documents-list">
        <li><a href="#" class="document-link"><i class="fas fa-file-pdf"></i> Memoria de calidades</a></li>
        <li><a href="#" class="document-link"><i class="fas fa-file-pdf"></i> Plano detallado</a></li>
        <li><a href="#" class="document-link"><i class="fas fa-shield-alt"></i> Garantías y seguridad</a></li>
      </ul>
    </div>`;
  }
}

// Make components available globally
window.BarsantComponents = BarsantComponents;
