// Common utility functions for the Barsant website
// This file centralizes shared functionality across the site

/**
 * Utility function to format currency values
 * @param {number} value - The value to format
 * @param {string} currency - The currency symbol (default: €)
 * @return {string} Formatted currency string
 */
function formatCurrency(value, currency = '€') {
  return currency + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Utility function to validate form fields
 * @param {string} fieldId - The ID of the field to validate
 * @param {string} fieldType - The type of validation to perform
 * @return {boolean} Whether the field is valid
 */
function validateField(fieldId, fieldType) {
  const field = document.getElementById(fieldId);
  if (!field) return false;
  
  const value = field.value.trim();
  
  // Basic required field validation
  if (value === '') {
    field.classList.add('error');
    return false;
  }
  
  // Type-specific validation
  switch(fieldType) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        field.classList.add('error');
        return false;
      }
      break;
    case 'phone':
      const phoneRegex = /^\d{9,}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        field.classList.add('error');
        return false;
      }
      break;
    case 'dni':
      const dniRegex = /^[0-9]{8}[A-Z]$/;
      const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;
      if (!dniRegex.test(value) && !nieRegex.test(value)) {
        field.classList.add('error');
        return false;
      }
      break;
  }
  
  field.classList.remove('error');
  return true;
}

/**
 * Utility function to get URL parameters
 * @param {string} param - The parameter to get
 * @return {string} The parameter value
 */
function getUrlParameter(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Utility function to load property data into the reservation form
 */
function loadPropertyData() {
  const propertyTitle = document.getElementById('property-title');
  const propertySpecs = document.getElementById('property-specs');
  const propertyPrice = document.getElementById('property-price');
  
  if (propertyTitle && propertySpecs && propertyPrice) {
    const property = getUrlParameter('property');
    const price = getUrlParameter('price');
    const specs = getUrlParameter('specs');
    
    if (property) propertyTitle.textContent = property;
    if (specs) propertySpecs.textContent = specs;
    if (price) propertyPrice.textContent = formatCurrency(price);
  }
}

/**
 * Utility function to handle form submission
 * @param {string} formId - The ID of the form to handle
 * @param {function} callback - The callback function to execute on successful validation
 */
function handleFormSubmit(formId, callback) {
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

// Export functions for use in other scripts
window.barsantUtils = {
  formatCurrency,
  validateField,
  getUrlParameter,
  loadPropertyData,
  handleFormSubmit
};
