/**
 * Generate the property card HTML
 * @param {Object} property - The property data
 * @return {string} The property card HTML
 */
export function getPropertyCard(property) {
  return `
  <div class="property-card">
    <div class="property-image" style="background-image: url('${property.image}');"></div>
    <div class="property-details">
      <h3>${property.title}</h3>
      <p>${property.specs}</p>
      <div class="property-price">${formatCurrency(property.price)}</div>
      <a href="/viviendas/property.html?slug=${property.url}" class="cta-button">Ver Detalles</a>
    </div>
  </div>`;
}

// Importar la función formatCurrency del módulo utils
import { formatCurrency } from '../utils/format.js';
