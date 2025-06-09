import React, { useState } from 'react';
import axios from 'axios';
import './OCR.css';

const OCR = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
            setResult(null);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setError('Please select an image first');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Create FormData and append the file
            const formData = new FormData();
            formData.append('image', selectedFile);
            
            console.log('Sending request to backend...');
            // Call backend OCR endpoint
            const response = await axios.post('http://localhost:3000/api/receipts/ocr', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('OCR Response:', response.data);
            if (response.data.error) {
                throw new Error(response.data.error);
            }
            setResult(response.data);
        } catch (error) {
            console.error('OCR Error:', error);
            const errorMessage = error.response?.data?.error || 
                                error.response?.data?.details || 
                                error.message || 
                                'Failed to process image. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        // Convert string to number and multiply by 1000 to get the correct amount
        const numericAmount = parseFloat(amount) * 1000;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numericAmount);
    };

    const renderReceiptDetails = () => {
        if (!result || !result.response_message) return null;

        try {
            const receiptData = JSON.parse(result.response_message);
            const { "Danh sách món": items, "Tổng tiền thanh toán": total } = receiptData;

            return (
                <div className="receipt-details">
                    <h3>Chi tiết hóa đơn</h3>
                    
                    <div className="items-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>Tên món</th>
                                    <th>Số lượng</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item["Tên món"]}</td>
                                        <td>{item["Số lượng"]}</td>
                                        <td>{formatCurrency(item["Thành tiền"])}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="receipt-summary">
                        <div className="summary-item">
                            <span>Tổng tiền thanh toán:</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
            );
        } catch (error) {
            console.error('Error parsing receipt data:', error);
            return (
                <div className="error-message">
                    <p>Error parsing receipt data. Raw data:</p>
                    <pre>{result.response_message}</pre>
                </div>
            );
        }
    };

    return (
        <div className="ocr-container">
            <h1>Receipt OCR</h1>
            <p>Upload a receipt image to extract information</p>

            <form onSubmit={handleSubmit} className="ocr-form">
                <div className="file-input-container">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="file-input"
                    />
                    <button 
                        type="submit" 
                        className="upload-button"
                        disabled={!selectedFile || loading}
                    >
                        {loading ? 'Processing...' : 'Process Image'}
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        <h4>Error:</h4>
                        <p>{error}</p>
                    </div>
                )}

                {preview && (
                    <div className="preview-container">
                        <h3>Image Preview:</h3>
                        <img src={preview} alt="Preview" className="preview-image" />
                    </div>
                )}

                {result && renderReceiptDetails()}
            </form>
        </div>
    );
};

export default OCR; 