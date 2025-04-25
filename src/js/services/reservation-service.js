/**
 * Service to handle reservation-related operations
 */
export class ReservationService {
  /**
   * Initialize the reservation service
   */
  constructor() {
    this.currentStep = 1;
    this.reservationData = {};
    this.propertyData = null;
  }

  /**
   * Advance to the next step in the reservation process
   * @param {Object} data - Data collected from the current step
   * @return {boolean} Whether advancing was successful
   */
  nextStep(data = {}) {
    // Save data from current step
    this.reservationData = { ...this.reservationData, ...data };
    
    // Validate before moving to next step
    if (!this.validateCurrentStep()) {
      return false;
    }
    
    // Move to next step if valid
    if (this.currentStep < 4) {
      this.currentStep++;
      return true;
    }
    
    return false;
  }

  /**
   * Go back to the previous step
   * @return {boolean} Whether going back was successful
   */
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      return true;
    }
    return false;
  }

  /**
   * Validate the current step data
   * @return {boolean} Whether the current step is valid
   */
  validateCurrentStep() {
    // Implement validation logic based on current step
    switch(this.currentStep) {
      case 1:
        // Personal information validation
        return true;
      case 2:
        // Contract validation
        return true;
      case 3:
        // Payment validation
        return true;
      default:
        return true;
    }
  }

  /**
   * Submit the reservation to the backend
   * @return {Promise} Promise that resolves with the reservation result
   */
  submitReservation() {
    return new Promise((resolve, reject) => {
      // Here would be the API call to submit the reservation
      // For now, we'll simulate a successful reservation
      setTimeout(() => {
        resolve({
          success: true,
          reservationId: 'RES-' + Math.floor(Math.random() * 10000),
          message: 'Reserva completada con éxito.'
        });
      }, 1500);
    });
  }

  /**
   * Get the current step number
   * @return {number} Current step number
   */
  getCurrentStep() {
    return this.currentStep;
  }

  /**
   * Get all reservation data
   * @return {Object} All reservation data
   */
  getReservationData() {
    return this.reservationData;
  }
  
  /**
   * Set property data for the reservation
   * @param {Object} property - The property data
   */
  setPropertyData(property) {
    this.propertyData = property;
  }
  
  /**
   * Get property data for the reservation
   * @return {Object} The property data
   */
  getPropertyData() {
    return this.propertyData;
  }
  
  /**
   * Update the summary with current reservation data
   */
  updateSummary() {
    // Update summary elements with the current data
    const summaryName = document.getElementById('summary-name');
    const summaryProperty = document.getElementById('summary-property');
    const summaryPrice = document.getElementById('summary-price');
    const summaryPaymentMethod = document.getElementById('summary-payment-method');
    
    if (summaryName && this.reservationData.name) {
      summaryName.textContent = this.reservationData.name;
    }
    
    if (summaryProperty && this.propertyData) {
      summaryProperty.textContent = this.propertyData.title;
    }
    
    if (summaryPrice && this.propertyData) {
      summaryPrice.textContent = new Intl.NumberFormat('es-ES', { 
        style: 'currency', 
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(this.propertyData.price);
    }
    
    if (summaryPaymentMethod && this.reservationData.payment_method) {
      const methods = {
        'transfer': 'Transferencia bancaria',
        'financing': 'Financiación hipotecaria'
      };
      summaryPaymentMethod.textContent = methods[this.reservationData.payment_method] || this.reservationData.payment_method;
    }
  }
}
