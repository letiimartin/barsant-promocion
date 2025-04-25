/**
 * API service to handle all remote data operations
 */
export class ApiService {
  /**
   * Base URL for API calls
   * @type {string}
   */
  static baseUrl = '/api';

  /**
   * Fetch properties from the server
   * @return {Promise<Array>} Promise resolving to array of properties
   */
  static async getProperties() {
    // In a real application, this would be an actual API call
    // For now, we'll return a mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            title: 'Ático de lujo en Centro',
            specs: '3 habitaciones · 2 baños · 120 m²',
            price: 350000,
            image: '/assets/images/property1.jpg',
            url: 'atico-lujo-centro'
          },
          {
            id: 2,
            title: 'Apartamento en Albaicín',
            specs: '2 habitaciones · 1 baño · 75 m²',
            price: 230000,
            image: '/assets/images/property2.jpg',
            url: 'apartamento-albaicin'
          },
          {
            id: 3,
            title: 'Chalet en la Zubia',
            specs: '4 habitaciones · 3 baños · 200 m²',
            price: 450000,
            image: '/assets/images/property3.jpg',
            url: 'chalet-zubia'
          }
        ]);
      }, 500);
    });
  }

  /**
   * Get property details by ID
   * @param {string} id - Property ID or URL slug
   * @return {Promise<Object>} Promise resolving to property details
   */
  static async getPropertyById(id) {
    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate API call
        const property = {
          id: 1,
          title: 'Ático de lujo en Centro',
          specs: '3 habitaciones · 2 baños · 120 m²',
          price: 350000,
          image: '/assets/images/property1.jpg',
          url: 'atico-lujo-centro',
          description: 'Amplio ático con terraza panorámica en pleno centro de Granada. Acabados de alta calidad y excelente luminosidad. Incluye plaza de garaje y trastero.',
          features: [
            'Terraza de 30m²',
            'Aire acondicionado',
            'Armarios empotrados',
            'Cocina completamente equipada',
            'Suelo radiante'
          ],
          location: {
            address: 'Calle Gran Vía 25, Granada',
            coordinates: {
              lat: 37.1773363,
              lng: -3.5985571
            }
          }
        };
        
        if (id === 'atico-lujo-centro' || id === '1') {
          resolve(property);
        } else {
          reject(new Error('Propiedad no encontrada'));
        }
      }, 300);
    });
  }

  /**
   * Submit a contact form
   * @param {Object} formData - The form data to submit
   * @return {Promise<Object>} Promise resolving to response data
   */
  static async submitContactForm(formData) {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Formulario enviado correctamente. Nos pondremos en contacto pronto.'
        });
      }, 1000);
    });
  }
}
