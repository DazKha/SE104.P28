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

    const handleProcessImage = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setError('Please select an image first');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('https://b063-34-169-178-189.ngrok-free.app/ocr', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('OCR Response:', data); // Debug log

            if (data.error) {
                throw new Error(data.error);
            }

            setResult(data);
        } catch (error) {
            console.error('Error processing image:', error);
            setError(error.message || 'Failed to process image');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        // Return the amount as is with VND suffix
        return `${amount} VND`;
    };

    const preserveDecimalFormat = (jsonStr, data) => {
        // Helper function to format number
        const formatNumber = (numberStr) => {
            // If the number doesn't have a decimal point, add .000
            if (!numberStr.includes('.')) {
                // Convert to number, divide by 1000, and format to 3 decimal places
                const num = parseFloat(numberStr) / 1000;
                return num.toFixed(3);
            }
            // If it already has a decimal point, keep it as is
            return numberStr;
        };

        // Extract numbers with their original format from JSON string
        const items = data["Mặt hàng"] || data;
        const itemsWithFormat = items.map((item, index) => {
            // Find the original number format in JSON string for this item
            const itemName = item["Tên mặt hàng"];
            const escapedName = itemName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`"Tên mặt hàng":\\s*"${escapedName}"[^}]*"Thành tiền":\\s*([0-9]+\\.?[0-9]*)`);
            const match = jsonStr.match(regex);
            const originalAmount = match ? match[1] : item["Thành tiền"].toString();
            const formattedAmount = formatNumber(originalAmount);
            
            return {
                ...item,
                formattedAmount: formattedAmount
            };
        });
        
        // Extract total format
        const totalRegex = /"Tổng số":\s*([0-9]+\.?[0-9]*)/;
        const totalMatch = jsonStr.match(totalRegex);
        const originalTotal = totalMatch ? totalMatch[1] : (data["Tổng số"] || 0).toString();
        const formattedTotal = formatNumber(originalTotal);
        
        return { items: itemsWithFormat, total: formattedTotal };
    };

    const renderReceiptDetails = () => {
        if (!result || !result.response_message) return null;

        try {
            // Remove markdown code block if present
            let jsonStr = result.response_message;
            if (jsonStr.includes('```json')) {
                jsonStr = jsonStr.replace(/```json\n|\n```/g, '');
            }
            
            let items = [];
            let total = 0;
            
            // Parse the JSON response
            const data = JSON.parse(jsonStr);
            
            // Check if data has "Mặt hàng" key (new format)
            if (data["Mặt hàng"]) {
                const formatted = preserveDecimalFormat(jsonStr, data);
                items = formatted.items;
                total = formatted.total;
            }
            // Check if response contains both array and total object (old format)
            else if (jsonStr.includes('\n]\n{')) {
                // Split the response into items array and total object
                const parts = jsonStr.split('\n]\n');
                const itemsStr = parts[0] + ']';
                const totalStr = parts[1] ? parts[1].trim() : null;
                
                // Parse items array
                items = JSON.parse(itemsStr);
                
                // Parse total amount if available
                if (totalStr) {
                    try {
                        const totalObj = JSON.parse(totalStr);
                        total = totalObj["Tổng số"] || 0;
                    } catch (e) {
                        console.warn('Could not parse total amount:', e);
                        total = 0; // Set to 0 if parsing fails
                    }
                } else {
                    total = 0; // Set to 0 if no total object
                }
            } else if (Array.isArray(data)) {
                // Response only contains items array (old format)
                items = data;
                total = 0; // Set to 0 if no total amount provided
            }

            return (
                <div className="receipt-details">
                    <h3>Chi tiết hóa đơn</h3>
                    
                    <div className="items-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>Tên mặt hàng</th>
                                    <th>Số lượng</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item["Tên mặt hàng"]}</td>
                                        <td>{item["Số lượng"]}</td>
                                        <td>{formatCurrency(item.formattedAmount || item["Thành tiền"])}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="2"><strong>Tổng tiền thanh toán:</strong></td>
                                    <td><strong>{formatCurrency(total)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            );
        } catch (error) {
            console.error('Error parsing receipt data:', error);
            return (
                <div className="error-message">
                    <p>Error parsing receipt data. Raw data:</p>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {result.response_message}
                    </pre>
                </div>
            );
        }
    };

    return (
        <div className="ocr-container">
            <h1>Receipt OCR</h1>
            <p>Upload a receipt image to extract information</p>

            <form onSubmit={handleProcessImage} className="ocr-form">
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