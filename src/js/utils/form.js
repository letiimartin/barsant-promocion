import { validateField } from './validation.js';

/**
 * Utility function to load property data into the reservation form
 * @param {Object} elements - DOM elements for property data display
 * @param {Object} params - URL parameters containing property data
 */
export function loadPropertyData(elements = {}, params = {}) {
  const { propertyTitle, propertySpecs, propertyPrice } = elements;
  const { property, specs, price } = params;
  
  if (propertyTitle && property) propertyTitle.textContent = property;
  if (propertySpecs && specs) propertySpecs.textContent = specs;
  if (propertyPrice && price) propertyPrice.textContent = price;
}

/**
 * Utility function to handle form submission
 * @param {string} formId - The ID of the form to handle
 * @param {function} callback - The callback function to execute on successful validation
 */
export function handleFormSubmit(formId, callback) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Perform validation
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
      const fieldType = field.type === 'email' ? 'email' : 
                      field.id.includes('phone') || field.id.includes('telefono') ? 'phone' :
                      field.id.includes('dni') ? 'dni' : 'text';
      
      if (!validateField(field.id, fieldType)) {
        isValid = false;
      }
    });
    
    if (isValid && typeof callback === 'function') {
      callback();
    }
  });
}
