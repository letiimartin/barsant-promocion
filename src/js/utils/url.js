/**
 * Utility function to get URL parameters
 * @param {string} param - The parameter to get
 * @return {string} The parameter value
 */
export function getUrlParameter(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}
