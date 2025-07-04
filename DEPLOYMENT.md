# 🚀 Deployment Guide

This guide will help you deploy the Expense Management System to various platforms.

## 📋 Prerequisites

- Node.js 16+ and npm 8+
- Git
- A hosting platform account (Heroku, Vercel, Railway, etc.)

## 🌐 Deployment Options

### Option 1: Deploy to Heroku

#### Backend Deployment

1. **Create Heroku App**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login to Heroku
   heroku login
   
   # Create app
   heroku create your-expense-tracker-backend
   ```

2. **Configure Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_secure_jwt_secret
   heroku config:set FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

3. **Deploy Backend**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend deployment"
   heroku git:remote -a your-expense-tracker-backend
   git push heroku main
   ```

#### Frontend Deployment (Vercel)

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel
   ```

3. **Update API URL**
   - In `frontend/src/services/*.js`, update API_URL to your Heroku backend URL
   - Redeploy: `vercel --prod`

### Option 2: Deploy to Railway

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Railway will auto-detect the Node.js app

2. **Configure Environment**
   ```bash
   NODE_ENV=production
   JWT_SECRET=your_secure_jwt_secret
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

3. **Deploy**
   - Railway will automatically deploy when you push to main branch

### Option 3: Deploy to Vercel (Full Stack)

1. **Configure Vercel**
   - Create `vercel.json` in root:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "backend/src/app.js",
         "use": "@vercel/node"
       },
       {
         "src": "frontend/package.json",
         "use": "@vercel/static-build",
         "config": { "distDir": "dist" }
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "backend/src/app.js"
       },
       {
         "src": "/(.*)",
         "dest": "frontend/dist/$1"
       }
     ]
   }
   ```

2. **Deploy**
   ```bash
   vercel
   ```

## 🗄️ Database Setup

### For Production (PostgreSQL)

1. **Add PostgreSQL to Heroku**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

2. **Update Database Configuration**
   ```javascript
   // backend/src/database/db.js
   const { Pool } = require('pg');
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false }
   });
   ```

3. **Install PostgreSQL Driver**
   ```bash
   cd backend
   npm install pg
   ```

### For Development (Keep SQLite)

- SQLite is fine for development and small-scale production
- Database file will be created automatically

## 🔐 Environment Variables

### Required Variables

```bash
# Server
NODE_ENV=production
PORT=3000

# Security
JWT_SECRET=your_very_secure_secret_key_here
JWT_EXPIRES_IN=24h

# Database (for PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## 📝 Build Scripts

### Frontend Build
```bash
cd frontend
npm run build
```

### Backend Build
```bash
cd backend
npm start
```

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `FRONTEND_URL` is set correctly
   - Check CORS configuration in `backend/src/app.js`

2. **Database Connection**
   - Verify database URL is correct
   - Check if database exists and is accessible

3. **Build Failures**
   - Ensure all dependencies are installed
   - Check Node.js version compatibility

4. **Environment Variables**
   - Verify all required variables are set
   - Check for typos in variable names

## 📊 Monitoring

### Health Check Endpoint
```bash
GET /api/health
```

### Logs
```bash
# Heroku
heroku logs --tail

# Railway
railway logs

# Vercel
vercel logs
```

## 🔄 CI/CD Setup

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm run install:all
      
    - name: Run tests
      run: npm test
      
    - name: Deploy to Heroku
      run: |
        git push heroku main
      env:
        HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
```

## 🎯 Performance Optimization

1. **Enable Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Add Caching Headers**
   ```javascript
   app.use(express.static('public', {
     maxAge: '1d'
   }));
   ```

3. **Database Indexing**
   ```sql
   CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
   CREATE INDEX idx_budgets_user_month ON budgets(user_id, month);
   ```

## 📞 Support

If you encounter issues during deployment:

1. Check the logs: `heroku logs --tail`
2. Verify environment variables
3. Test locally first
4. Check the troubleshooting section above

---

**Note**: This deployment guide covers the most common scenarios. For specific platform requirements, refer to their official documentation. 