/**
 * API service to handle all remote data operations
 */
import db from './firebase.js';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

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
    const querySnapshot = await getDocs(collection(db, 'viviendas'));
    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  }

  /**
   * Get property details by ID
   * @param {string} id - Property ID or URL slug
   * @return {Promise<Object>} Promise resolving to property details
   */
  static async getPropertyById(id) {
    const docRef = doc(db, 'viviendas', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }

    let q = query(collection(db, 'viviendas'), where('slug', '==', id));
    let querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const d = querySnap.docs[0];
      return { id: d.id, ...d.data() };
    }

    q = query(collection(db, 'viviendas'), where('url', '==', id));
    querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const d = querySnap.docs[0];
      return { id: d.id, ...d.data() };
    }

    throw new Error('Propiedad no encontrada');
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
