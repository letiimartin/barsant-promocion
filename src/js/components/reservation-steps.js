/**
 * Generate the reservation steps HTML
 * @param {number} activeStep - The current active step (1-4)
 * @return {string} The reservation steps HTML
 */
export function getReservationSteps(activeStep = 1) {
  return `
  <div class="progress-bar">
    <div class="progress-step ${activeStep >= 1 ? 'active' : ''}" id="step1">
      <div class="step-number">1</div>
      <div class="step-label">Información</div>
    </div>
    <div class="progress-step ${activeStep >= 2 ? 'active' : ''}" id="step2">
      <div class="step-number">2</div>
      <div class="step-label">Contrato</div>
    </div>
    <div class="progress-step ${activeStep >= 3 ? 'active' : ''}" id="step3">
      <div class="step-number">3</div>
      <div class="step-label">Pago</div>
    </div>
    <div class="progress-step ${activeStep >= 4 ? 'active' : ''}" id="step4">
      <div class="step-number">4</div>
      <div class="step-label">Confirmación</div>
    </div>
  </div>`;
}
