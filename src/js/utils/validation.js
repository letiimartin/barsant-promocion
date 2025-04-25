/**
 * Utility function to validate form fields
 * @param {string} fieldId - The ID of the field to validate
 * @param {string} fieldType - The type of validation to perform
 * @return {boolean} Whether the field is valid
 */
export function validateField(fieldId, fieldType) {
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
