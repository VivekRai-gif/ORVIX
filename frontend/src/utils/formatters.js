/**
 * Formats monetary amounts into compact Indian currency notation (e.g. ₹61.7L, ₹57.8L, ₹13.3L, ₹45.2k)
 */
export function formatCompactINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  if (Math.abs(num) >= 10000000) {
    return `₹${(num / 10000000).toFixed(1)}Cr`;
  }
  if (Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  }
  if (Math.abs(num) >= 1000) {
    return `₹${(num / 1000).toFixed(1)}k`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Formats monetary amounts into standard Indian currency format (e.g. ₹6,17,33,044)
 */
export function formatFullINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}
