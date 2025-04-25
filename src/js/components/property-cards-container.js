/**
 * Componente contenedor de tarjetas de propiedades
 * @param {Array} properties - Lista de propiedades a mostrar
 * @return {string} HTML del contenedor con las tarjetas de propiedades
 */

import { getPropertyCard } from './property-card.js';

export function getPropertyCardsContainer(properties = []) {
  if (!properties.length) {
    return '<div class="no-properties">No hay propiedades disponibles actualmente.</div>';
  }

  return `
  <div class="property-grid">
    ${properties.map(property => getPropertyCard(property)).join('')}
  </div>`;
}
