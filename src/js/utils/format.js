/**
 * Utility function to format currency values
 * @param {number} value - The value to format
 * @param {string} currency - The currency symbol (default: €)
 * @return {string} Formatted currency string
 */
export function formatCurrency(value, currency = '€') {
  return currency + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
