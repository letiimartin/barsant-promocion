/**
 * Generate the documents list HTML
 * @return {string} The documents list HTML
 */
export function getDocumentsList() {
  return `
  <div class="documents-section">
    <h3>Documentos disponibles:</h3>
    <ul class="documents-list">
      <li><a href="#" class="document-link"><i class="fas fa-file-pdf"></i> Memoria de calidades</a></li>
      <li><a href="#" class="document-link"><i class="fas fa-file-pdf"></i> Plano detallado</a></li>
      <li><a href="#" class="document-link"><i class="fas fa-shield-alt"></i> Garantías y seguridad</a></li>
    </ul>
  </div>`;
}
