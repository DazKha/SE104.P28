#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const OCR_CONFIG_PATH = path.join(__dirname, 'frontend', 'src', 'config', 'ocrConfig.js');

console.log('🔧 OCR URL Update Tool');
console.log('=====================\n');

function updateOCRUrl(newUrl) {
  try {
    // Read the current config file
    let configContent = fs.readFileSync(OCR_CONFIG_PATH, 'utf8');
    
    // Update the SERVER_URL
    const updatedContent = configContent.replace(
      /SERVER_URL:\s*['"`][^'"`]*['"`]/,
      `SERVER_URL: '${newUrl}'`
    );
    
    // Write back to file
    fs.writeFileSync(OCR_CONFIG_PATH, updatedContent);
    
    console.log('✅ OCR URL updated successfully!');
    console.log(`📝 New URL: ${newUrl}`);
    console.log('\n🔄 You may need to restart your frontend for changes to take effect.');
    
  } catch (error) {
    console.error('❌ Error updating OCR URL:', error.message);
  }
}

function promptForURL() {
  rl.question('Enter the new OCR server URL (e.g., https://abc123.ngrok-free.app/ocr): ', (url) => {
    if (url.trim()) {
      updateOCRUrl(url.trim());
    } else {
      console.log('❌ URL cannot be empty');
    }
    rl.close();
  });
}

// Check if URL was provided as command line argument
const newUrl = process.argv[2];

if (newUrl) {
  updateOCRUrl(newUrl);
} else {
  promptForURL();
} 