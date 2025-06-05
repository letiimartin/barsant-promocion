// Script for dynamic property detail page

// Import styles for standalone page
import '../css/base/reset.css';
import '../css/base/variables.css';
import '../css/base/layout.css';
import '../css/components/header.css';
import '../css/components/footer.css';

// Import components and utilities
import { getHeader, getFooter } from './components/index.js';
import { ApiService } from './services/api.js';
import { formatCurrency, getUrlParameter } from './utils/index.js';

function renderBaseComponents() {
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    headerContainer.innerHTML = getHeader('properties');
  }

  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    footerContainer.innerHTML = getFooter();
  }
}

async function loadProperty() {
  const slug = getUrlParameter('slug') || getUrlParameter('id');
  if (!slug) return;

  try {
    const property = await ApiService.getPropertyById(slug);

    const titleEl = document.getElementById('property-title');
    const imageEl = document.getElementById('property-image');
    const specsEl = document.getElementById('property-specs');
    const priceEl = document.getElementById('property-price');
    const descEl = document.getElementById('property-description');
    const featuresEl = document.getElementById('property-features');

    if (titleEl) titleEl.textContent = property.title;
    if (imageEl) imageEl.style.backgroundImage = `url('${property.image}')`;
    if (specsEl) specsEl.textContent = property.specs;
    if (priceEl) priceEl.textContent = formatCurrency(property.price);
    if (descEl) descEl.textContent = property.description;
    if (featuresEl) {
      featuresEl.innerHTML = property.features.map(f => `<li>${f}</li>`).join('');
    }
  } catch (error) {
    console.error('Error al cargar la vivienda:', error);
    const container = document.getElementById('property-container');
    if (container) {
      container.innerHTML = '<p class="error-message">No se pudo cargar la información de esta vivienda.</p>';
    }
  }
}

async function initializePage() {
  renderBaseComponents();
  await loadProperty();
}

document.addEventListener('DOMContentLoaded', initializePage);
