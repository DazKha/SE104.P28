# OCR Service Setup Guide

## Cấu hình OCR Service

Backend đã được tích hợp để kết nối với OCR service. Để sử dụng tính năng OCR, bạn cần:

### 1. Thiết lập biến môi trường

Tạo file `.env` trong thư mục `backend/` với nội dung:

```env
# Database Configuration
DB_PATH=./database/expense_tracker.db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# OCR Service Configuration
# URL của OCR service (ví dụ: Python Flask/FastAPI service)
OCR_SERVICE_URL=http://localhost:8000/ocr

# Timeout cho OCR request (mặc định: 30000 = 30 giây)
OCR_TIMEOUT=30000
```

### 2. OCR Service Requirements

OCR service cần hỗ trợ:

**POST `/ocr`**
- Input: `multipart/form-data` với field `image`
- Output: JSON với format:
```json
{
  "amount": 150000,
  "date": "2024-01-15",
  "category": "Food & Drinks",
  "items": [
    {"name": "Coffee", "price": 50000},
    {"name": "Sandwich", "price": 100000}
  ],
  "confidence": 0.85
}
```

**GET `/health` (tuỳ chọn)**
- Endpoint để kiểm tra trạng thái service
- Output: Status 200 OK

### 3. Kiểm tra kết nối

Sử dụng endpoint health check:
```bash
GET http://localhost:3000/api/receipts/ocr-health
```

### 4. Xử lý lỗi

- Nếu OCR service không khả dụng, backend sẽ vẫn lưu ảnh và trả về dữ liệu mặc định
- Frontend sẽ nhận được cảnh báo về lỗi OCR nhưng vẫn có thể lưu transaction
- Có thể thử lại OCR sau khi service được khôi phục

### 5. Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- Giới hạn kích thước: 10MB

### 6. Example OCR Service Implementation

Ví dụ đơn giản cho OCR service bằng Python Flask:

```python
from flask import Flask, request, jsonify
import cv2
import numpy as np
from PIL import Image
import io

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/ocr', methods=['POST'])
def process_receipt():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400
        
        file = request.files['image']
        
        # Process image here with OCR library (tesseract, etc.)
        # This is a mock response
        result = {
            "amount": 150000,
            "date": "2024-01-15",
            "category": "Food & Drinks",
            "items": [],
            "confidence": 0.8
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
```

### 7. Testing

1. Khởi động OCR service trên port 8000
2. Khởi động backend: `npm run dev`
3. Test upload ảnh từ frontend
4. Kiểm tra logs để xem kết quả OCR

### 8. Troubleshooting

**OCR service không kết nối được:**
- Kiểm tra `OCR_SERVICE_URL` trong file `.env`
- Đảm bảo OCR service đang chạy
- Kiểm tra firewall/network connectivity

**OCR trả về lỗi:**
- Kiểm tra format ảnh có được hỗ trợ không
- Kiểm tra kích thước ảnh (< 10MB)
- Xem logs của OCR service để debug

**Performance issues:**
- Tăng `OCR_TIMEOUT` nếu xử lý lâu
- Optimizing ảnh trước khi gửi đến OCR
- Consider caching results 