<p align="center">
  <a href="https://www.uit.edu.vn/" title="Trường Đại học Công nghệ Thông tin" style="border: none;">
    <img src="https://i.imgur.com/WmMnSRt.png" alt="Trường Đại học Công nghệ Thông tin | University of Information Technology">
  </a>
</p>

<h1 align="center"><b>NHẬP MÔN CÔNG NGHỆ PHẦN MỀM</b></h1>

## GIỚI THIỆU MÔN HỌC
* **Tên môn học:** Nhập môn Công nghệ phần mềm
* **Mã môn học:** SE104
* **Mã lớp:** SE104.P28
* **Năm học:** HK2 (2024-2025)
* **Giảng viên**: Ths.Đỗ Văn Tiến

## 👥 Team Members

- [Le Minh Kha - 23520664](https://github.com/DazKha) - Backend & Database Developer
- [Nguyen Hai Dang - 23520228](https://github.com/Youngboyvungtau) - Frontend Developer
- [Doan Viet Hoang - 23520515](https://github.com/VietHoagf) - OCR Integration & Image Processing

## 🚀 Expense Management System

A full-stack expense tracking application built with React (Frontend) and Node.js/Express (Backend).

### ✨ Features

- 💰 **Expense Tracking**: Add, edit, delete transactions
- 📊 **Budget Management**: Set and track monthly budgets
- 🏦 **Savings Goals**: Create and monitor savings targets
- 💸 **Loans & Debts**: Track money you owe or are owed
- 📈 **Reports & Analytics**: Visual charts and insights
- 📱 **Receipt OCR**: Upload and scan receipts
- 🔐 **User Authentication**: Secure login/register system

### 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- CSS Modules
- Axios for API calls

**Backend:**
- Node.js
- Express.js
- SQLite3
- JWT Authentication
- Multer for file uploads

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/DazKha/SE104.P28.git
   cd SE104.P28
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in backend directory
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development servers**
   ```bash
   # From the root directory
   npm run dev
   ```

### Manual Setup (Alternative)

If the root installation doesn't work, you can set up frontend and backend separately:

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 📁 Project Structure

```
SE104.P28/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Custom middlewares
│   │   ├── services/       # Business logic
│   │   └── database/       # Database setup
│   └── data/               # SQLite database files
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
└── package.json            # Root package.json for concurrent running
```

## 🔧 Available Scripts

From the root directory:

- `npm run dev` - Start both frontend and backend in development mode
- `npm run client` - Start only the frontend
- `npm run server` - Start only the backend

## 🗄️ Database

The application uses SQLite3 for data storage. The database file is automatically created at `backend/data/expenses.db` on first run.

### Sample Data
The application comes with sample data including:
- Test user account
- Sample transactions
- Pre-defined categories

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. Users can:
- Register new accounts
- Login with email/password
- Access protected routes

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Transaction Endpoints
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budget Endpoints
- `GET /api/budgets` - Get user budgets
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget

### Loans & Debts Endpoints
- `GET /api/loans_debts` - Get user loans/debts
- `POST /api/loans_debts` - Create new loan/debt
- `PUT /api/loans_debts/:id` - Update loan/debt
- `PATCH /api/loans_debts/:id/status` - Update status

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill processes on ports 3000 and 5173
   lsof -ti:3000 | xargs kill -9
   lsof -ti:5173 | xargs kill -9
   ```

2. **Permission denied for concurrently**
   ```bash
   chmod +x node_modules/.bin/*
   ```

3. **Database connection issues**
   ```bash
   # Check if database file exists
   ls backend/data/
   # If not, restart the backend server
   ```

4. **Frontend can't connect to backend**
   - Ensure backend is running on port 3000
   - Check CORS configuration in backend
   - Verify API URL in frontend services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the SE104 course at University of Information Technology.

---

**Note**: This is an educational project for SE104 - Introduction to Software Engineering course.
