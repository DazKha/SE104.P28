// Format number với dấu chấm ngăn cách hàng nghìn
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '';
  
  // Chuyển về string và loại bỏ dấu chấm thập phân nếu có
  const numStr = Math.abs(amount).toString();
  
  // Thêm dấu chấm ngăn cách hàng nghìn
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Format với đơn vị VNĐ
export const formatCurrencyVND = (amount) => {
  const formatted = formatCurrency(amount);
  return formatted ? `${formatted} đ` : '0 đ';
};

// Parse số từ string có dấu chấm
export const parseCurrency = (str) => {
  if (!str) return 0;
  return parseInt(str.replace(/\./g, '')) || 0;
};

// Format với dấu âm dương
export const formatCurrencyWithSign = (amount) => {
  if (!amount && amount !== 0) return '0 đ';
  
  const formatted = formatCurrency(amount);
  const sign = amount >= 0 ? '+' : '-';
  
  return `${sign}${formatted} đ`;
}; 