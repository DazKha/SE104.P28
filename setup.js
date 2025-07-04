#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Expense Management System...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  
  if (major < 16) {
    log('❌ Node.js version 16 or higher is required', 'red');
    log(`Current version: ${version}`, 'yellow');
    process.exit(1);
  }
  
  log(`✅ Node.js version: ${version}`, 'green');
}

function createEnvFile() {
  const envPath = path.join(__dirname, 'backend', '.env');
  const envExample = `# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_EXPIRES_IN=24h

# Database Configuration
DB_PATH=./data/expenses.db

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
`;

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envExample);
    log('✅ Created .env file in backend directory', 'green');
  } else {
    log('ℹ️  .env file already exists', 'blue');
  }
}

function installDependencies() {
  log('\n📦 Installing dependencies...', 'blue');
  
  try {
    // Install root dependencies
    log('Installing root dependencies...', 'yellow');
    execSync('npm install', { stdio: 'inherit' });
    
    // Install backend dependencies
    log('Installing backend dependencies...', 'yellow');
    execSync('npm install', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
    
    // Install frontend dependencies
    log('Installing frontend dependencies...', 'yellow');
    execSync('npm install', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });
    
    log('✅ All dependencies installed successfully', 'green');
  } catch (error) {
    log('❌ Error installing dependencies', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

function createDataDirectory() {
  const dataPath = path.join(__dirname, 'backend', 'data');
  
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
    log('✅ Created data directory', 'green');
  } else {
    log('ℹ️  Data directory already exists', 'blue');
  }
}

function checkPorts() {
  log('\n🔍 Checking if ports are available...', 'blue');
  
  try {
    execSync('lsof -ti:3000', { stdio: 'ignore' });
    log('⚠️  Port 3000 is in use. You may need to stop other services.', 'yellow');
  } catch {
    log('✅ Port 3000 is available', 'green');
  }
  
  try {
    execSync('lsof -ti:5173', { stdio: 'ignore' });
    log('⚠️  Port 5173 is in use. You may need to stop other services.', 'yellow');
  } catch {
    log('✅ Port 5173 is available', 'green');
  }
}

function showNextSteps() {
  log('\n🎉 Setup completed successfully!', 'green');
  log('\n📋 Next steps:', 'blue');
  log('1. Start the development servers:', 'yellow');
  log('   npm run dev', 'reset');
  log('\n2. Open your browser and go to:', 'yellow');
  log('   Frontend: http://localhost:5173', 'reset');
  log('   Backend API: http://localhost:3000', 'reset');
  log('\n3. Register a new account or use the test account:', 'yellow');
  log('   Email: test@example.com', 'reset');
  log('   Password: password', 'reset');
  log('\n📚 For more information, check the README.md file', 'blue');
}

// Main setup process
try {
  checkNodeVersion();
  createDataDirectory();
  createEnvFile();
  installDependencies();
  checkPorts();
  showNextSteps();
} catch (error) {
  log('❌ Setup failed', 'red');
  log(error.message, 'red');
  process.exit(1);
} 