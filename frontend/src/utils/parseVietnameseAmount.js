/**
 * Parse số tiền từ format Việt Nam về số nguyên
 * @param {string|number} amount - Số tiền cần parse
 * @returns {number} - Số nguyên đã parse
 */
export const parseVietnameseAmount = (amount) => {
  if (!amount && amount !== 0) return 0;
  
  // Convert to string
  const amountStr = amount.toString().trim();
  
  // Remove dots (thousand separators in Vietnamese format)
  // Remove any non-digit characters except dots first
  const cleanStr = amountStr
    .replace(/[^\d.]/g, '') // Keep only digits and dots
    .replace(/\./g, '');    // Remove all dots (thousand separators)
  
  // Parse as integer
  const parsed = parseInt(cleanStr);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format số tiền thành định dạng Việt Nam (dấu chấm ngăn cách hàng nghìn)
 * @param {number} amount - Số tiền
 * @returns {string} - Số tiền đã format
 */
export const formatVietnameseAmount = (amount) => {
  if (!amount && amount !== 0) return '0';
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}; 