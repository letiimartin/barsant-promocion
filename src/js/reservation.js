/**
 * Archivo principal para la sección de reservas
 * Punto de entrada para Webpack - Página de reserva
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
  getReservationSteps,
  getPropertySummary,
  getDocumentsList
} from './components/index.js';

// Importar utilidades
import { 
  getUrlParameter, 
  validateField, 
  handleFormSubmit 
} from './utils/index.js';

// Importar servicios
import { ReservationService } from './services/reservation-service.js';
import { ApiService } from './services/api.js';

// Crear instancia del servicio de reserva
const reservationService = new ReservationService();

// Función para inicializar la página de reserva
async function initializeReservationPage() {
  // Renderizar componentes base
  renderBaseComponents();
  
  // Cargar datos de la propiedad seleccionada
  await loadPropertyData();
  
  // Mostrar el paso actual de la reserva
  showCurrentStep();
  
  // Configurar listeners para los botones de navegación
  setupNavigationButtons();
}

/**
 * Renderiza los componentes base de la página
 */
function renderBaseComponents() {
  // Renderizar el header
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    headerContainer.innerHTML = getHeader('properties');
  }
  
  // Renderizar el footer
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    footerContainer.innerHTML = getFooter();
  }
  
  // Renderizar los pasos de reserva
  const stepsContainer = document.getElementById('reservation-steps-container');
  if (stepsContainer) {
    stepsContainer.innerHTML = getReservationSteps(1);
  }
  
  // Renderizar lista de documentos si existe el contenedor
  const documentsContainer = document.getElementById('documents-container');
  if (documentsContainer) {
    documentsContainer.innerHTML = getDocumentsList();
  }
}

/**
 * Carga los datos de la propiedad desde los parámetros de URL
 */
async function loadPropertyData() {
  // Obtener ID de la propiedad desde la URL
  const propertyId = getUrlParameter('id');
  
  if (!propertyId) {
    console.error('No se ha especificado una propiedad');
    return;
  }
  
  try {
    // Obtener detalles de la propiedad desde el API
    const property = await ApiService.getPropertyById(propertyId);
    
    // Mostrar el resumen de la propiedad
    const summaryContainer = document.getElementById('property-summary-container');
    if (summaryContainer) {
      // Formatear el precio
      const formattedPrice = new Intl.NumberFormat('es-ES', { 
        style: 'currency', 
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(property.price);
      
      summaryContainer.innerHTML = getPropertySummary(
        property.title,
        property.specs,
        formattedPrice
      );
    }
    
    // Guardar datos de la propiedad en el servicio de reserva
    reservationService.setPropertyData(property);
    
    // Pre-rellenar los campos del resumen con los datos de la propiedad
    reservationService.updateSummary();
    
  } catch (error) {
    console.error('Error al cargar datos de la propiedad:', error);
    
    // Mostrar mensaje de error
    const summaryContainer = document.getElementById('property-summary-container');
    if (summaryContainer) {
      summaryContainer.innerHTML = `
        <div class="error-message">
          <p>No se ha podido cargar la información de la propiedad. <a href="/index.html#properties">Volver a viviendas</a></p>
        </div>
      `;
    }
  }
}

/**
 * Muestra el paso actual de la reserva
 */
function showCurrentStep() {
  const currentStep = reservationService.getCurrentStep();
  
  // Actualizar indicador de pasos
  const stepsContainer = document.getElementById('reservation-steps-container');
  if (stepsContainer) {
    stepsContainer.innerHTML = getReservationSteps(currentStep);
  }
  
  // Ocultar todos los contenedores de pasos
  document.querySelectorAll('.step-content').forEach(step => {
    step.style.display = 'none';
  });
  
  // Mostrar el paso actual
  const currentStepContent = document.getElementById(`step${currentStep}-content`);
  if (currentStepContent) {
    currentStepContent.style.display = 'block';
  }
  
  // Si es el paso 4 (confirmación), actualizar el resumen
  if (currentStep === 4) {
    reservationService.updateSummary();
  }
  
  // Configurar formulario del paso actual
  setupCurrentStepForm(currentStep);
}

/**
 * Configura los listeners para los botones de navegación entre pasos
 */
function setupNavigationButtons() {
  // Botón para volver al paso anterior
  const prevButtons = document.querySelectorAll('.prev-step-button');
  prevButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (reservationService.previousStep()) {
        showCurrentStep();
      }
    });
  });
}

/**
 * Configura el formulario del paso actual
 * @param {number} stepNumber - Número del paso actual
 */
function setupCurrentStepForm(stepNumber) {
  const formId = `step${stepNumber}-form`;
  const form = document.getElementById(formId);
  
  if (!form) return;
  
  handleFormSubmit(formId, () => {
    // Recopilar datos del formulario actual
    const formData = {};
    
    // Obtener todos los inputs, selects y textareas del formulario
    const formElements = form.querySelectorAll('input, select, textarea');
    formElements.forEach(element => {
      if (element.name) {
        formData[element.name] = element.value;
      }
    });
    
    // Avanzar al siguiente paso
    if (reservationService.nextStep(formData)) {
      showCurrentStep();
    }
    
    // Si es el último paso, enviar la reserva
    if (stepNumber === 4) {
      submitReservation();
    }
  });
}

/**
 * Envía la reserva al servidor
 */
async function submitReservation() {
  const confirmationContainer = document.getElementById('confirmation-content');
  if (!confirmationContainer) return;
  
  try {
    // Mostrar estado de envío
    confirmationContainer.innerHTML = `
      <div class="loading-message">
        <p>Procesando su reserva, por favor espere...</p>
      </div>
    `;
    
    // Enviar la reserva al servidor
    const response = await reservationService.submitReservation();
    
    // Mostrar confirmación
    if (response.success) {
      confirmationContainer.innerHTML = `
        <div class="success-message">
          <i class="fas fa-check-circle"></i>
          <h3>¡Reserva completada con éxito!</h3>
          <p>Su número de reserva es: <strong>${response.reservationId}</strong></p>
          <p>${response.message}</p>
          <p>Nos pondremos en contacto con usted a la mayor brevedad posible.</p>
          <div class="mt-4">
            <a href="/index.html" class="cta-button">Volver al inicio</a>
          </div>
        </div>
      `;
    } else {
      throw new Error(response.message || 'Error al procesar la reserva');
    }
    
  } catch (error) {
    console.error('Error al enviar la reserva:', error);
    
    // Mostrar mensaje de error
    confirmationContainer.innerHTML = `
      <div class="error-message">
        <h3>Ha ocurrido un error</h3>
        <p>${error.message || 'No se ha podido procesar su reserva. Por favor, inténtelo de nuevo más tarde.'}</p>
        <div class="mt-4">
          <button id="retry-button" class="cta-button">Intentar de nuevo</button>
        </div>
      </div>
    `;
    
    // Configurar botón de reintento
    const retryButton = document.getElementById('retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', submitReservation);
    }
  }
}

// Inicializar la página cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initializeReservationPage);
