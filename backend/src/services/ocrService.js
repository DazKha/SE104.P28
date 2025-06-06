const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

exports.recognize = async (imagePath) => {
  const formData = new FormData();
  formData.append('image', fs.createReadStream(imagePath));

  const response = await axios.post('http://your-ocr-server/ocr', formData, {
    headers: formData.getHeaders(),
  });

  return response.data; // { amount, date, category, ... }
};