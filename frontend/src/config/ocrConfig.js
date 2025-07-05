// OCR Configuration
// Update this URL whenever you restart the OCR server

export const OCR_CONFIG = {
  // Default OCR server URL - update this when you get a new ngrok URL
  SERVER_URL: 'https://5397-34-16-129-199.ngrok-free.app/ocr',
  
  // Alternative URLs (for backup or different environments)
  BACKUP_URL: 'http://localhost:5000/ocr',
  
  // Timeout settings
  TIMEOUT: 30000, // 30 seconds
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Helper function to get the current OCR URL
export const getOCRUrl = () => {
  // You can add logic here to switch between URLs based on environment
  return OCR_CONFIG.SERVER_URL;
};

// Helper function to test OCR connection
export const testOCRConnection = async () => {
  try {
    const response = await fetch(getOCRUrl().replace('/ocr', '/health'), {
      method: 'GET',
      timeout: OCR_CONFIG.TIMEOUT,
    });
    return response.ok;
  } catch (error) {
    console.error('OCR connection test failed:', error);
    return false;
  }
}; 