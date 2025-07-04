# ⚡ Quick Start Guide

## 🚀 One-Command Setup

```bash
# Clone and setup everything automatically
git clone https://github.com/DazKha/SE104.P28.git
cd SE104.P28
npm run setup
npm run dev
```

That's it! Your app will be running at http://localhost:5173

## 📋 Manual Setup (if auto-setup fails)

### 1. Install Dependencies
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Create Environment File
```bash
# Create .env file in backend directory
cd backend
echo "PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
DB_PATH=./data/expenses.db
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads" > .env
cd ..
```

### 3. Start the Application
```bash
npm run dev
```

## 🌐 Access Your App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 👤 Test Account

Use this account to test the application:
- **Email**: test@gmail.com
- **Password**: 123456789

Or register a new account!

## 🎯 What You Can Do

1. **Track Expenses**: Add income and expenses
2. **Set Budgets**: Create monthly spending limits
3. **Save Money**: Set savings goals
4. **Manage Loans**: Track money you owe or are owed
5. **View Reports**: See spending patterns and charts
6. **Upload Receipts**: Scan and store receipts

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports 3000 and 5173
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Permission Issues
```bash
chmod +x node_modules/.bin/*
```

### Database Issues
```bash
# Restart the backend server
cd backend
npm start
```

## 📞 Need Help?

- Check the full [README.md](README.md)
- Look at [DEPLOYMENT.md](DEPLOYMENT.md) for deployment options
- Open an issue on GitHub

---

**Happy Expense Tracking!** 💰📊 