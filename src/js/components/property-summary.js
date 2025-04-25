/**
 * Generate the property summary HTML for reservation page
 * @param {string} title - The property title
 * @param {string} specs - The property specifications
 * @param {string} price - The property price
 * @return {string} The property summary HTML
 */
export function getPropertySummary(title, specs, price) {
  return `
  <div class="property-summary-bar">
    <div class="container">
      <div class="property-summary-container">
        <div class="property-summary-details">
          <div class="property-image" style="background-image: url('/assets/images/foto1.jpg');"></div>
          <div class="property-info">
            <h3 id="property-title">${title}</h3>
            <p id="property-specs">${specs}</p>
          </div>
        </div>
        <div class="property-price" id="property-price">${price}</div>
      </div>
    </div>
  </div>`;
}
