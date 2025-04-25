/**
 * Archivo principal para la web de Barsant Promociones
 * Punto de entrada para Webpack
 */

// Importar estilos
import '../css/base/reset.css';
import '../css/base/variables.css';
import '../css/base/layout.css';
import '../css/components/header.css';
import '../css/components/footer.css';

// Importar componentes
import { 
  getHeader, 
  getFooter, 
  getPropertyCard,
  getPropertyCardsContainer
} from './components/index.js';

// Importar utilidades
import { 
  formatCurrency, 
  validateField, 
  handleFormSubmit 
} from './utils/index.js';

// Importar servicios
import { ApiService } from './services/api.js';

// Función para inicializar la página
async function initializePage() {
  // Renderizar componentes base (header y footer)
  renderBaseComponents();
  
  // Cargar propiedades y renderizarlas
  await loadAndRenderProperties();
  
  // Inicializar mapa de ubicación
  initializeMap();
  
  // Configurar el formulario de contacto
  setupContactForm();
}

/**
 * Renderiza los componentes base de la página (header y footer)
 */
function renderBaseComponents() {
  // Renderizar el header
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    headerContainer.innerHTML = getHeader('home');
  }
  
  // Renderizar el footer
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    footerContainer.innerHTML = getFooter();
  }
}

/**
 * Carga las propiedades desde el API y las renderiza en la página
 */
async function loadAndRenderProperties() {
  const propertiesContainer = document.getElementById('property-cards-container');
  if (!propertiesContainer) return;
  
  try {
    // Mostrar mensaje de carga
    propertiesContainer.innerHTML = '<div class="loading">Cargando propiedades...</div>';
    
    // Cargar propiedades desde el API
    const properties = await ApiService.getProperties();
    
    // Limpiar el contenedor
    propertiesContainer.innerHTML = '';
    
    // Renderizar las propiedades (limitamos a 3 en la página principal)
    const propertiesToShow = properties.slice(0, 3);
    
    // Usar el componente para generar todas las tarjetas
    propertiesContainer.innerHTML = getPropertyCardsContainer(propertiesToShow);
    
  } catch (error) {
    console.error('Error al cargar propiedades:', error);
    propertiesContainer.innerHTML = '<div class="error">Error al cargar las propiedades. Por favor, inténtelo de nuevo más tarde.</div>';
  }
}

/**
 * Inicializa el mapa de ubicación
 */
function initializeMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;
  
  // Aquí iría la lógica para inicializar el mapa con tu API de mapas preferida
  // Por ejemplo, Google Maps, Leaflet, etc.
  
  // Placeholder temporal para el mapa
  mapElement.innerHTML = `
    <div class="map-placeholder">
      <p>Calle Ventanilla, s/n - Granada</p>
      <p><small>El mapa interactivo se cargará cuando esté disponible la API de mapas.</small></p>
    </div>
  `;
}

/**
 * Configura el formulario de contacto
 */
function setupContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;
  
  handleFormSubmit('contact-form', async () => {
    // Obtener los datos del formulario
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      interest: document.getElementById('interest').value,
      message: document.getElementById('message').value
    };
    
    try {
      // Mostrar estado de envío
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';
      
      // Enviar formulario mediante la API
      const response = await ApiService.submitContactForm(formData);
      
      // Mostrar mensaje de éxito
      contactForm.innerHTML = `
        <div class="success-message">
          <i class="fas fa-check-circle"></i>
          <h3>¡Mensaje enviado correctamente!</h3>
          <p>${response.message}</p>
        </div>
      `;
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      
      // Mostrar mensaje de error
      const errorElement = document.createElement('div');
      errorElement.className = 'form-error';
      errorElement.textContent = 'Ha ocurrido un error al enviar el formulario. Por favor, inténtelo de nuevo.';
      
      contactForm.prepend(errorElement);
      
      // Restablecer botón
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}

// Inicializar la página cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initializePage);
