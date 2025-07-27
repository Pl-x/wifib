#!/bin/bash

# Legion Connections Backend Setup Script
echo "🚀 Setting up Legion Connections Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env 2>/dev/null || {
        echo "📝 Creating .env file with default values..."
        cat > .env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=legion_connections
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Daraja API Configuration (Safaricom M-Pesa)
DARAJA_CONSUMER_KEY=your_daraja_consumer_key
DARAJA_CONSUMER_SECRET=your_daraja_consumer_secret
DARAJA_BASE_URL=https://sandbox.safaricom.co.ke
DARAJA_PASSKEY=your_daraja_passkey
DARAJA_SHORTCODE=your_daraja_shortcode
DARAJA_CALLBACK_URL=http://localhost:5000/api/payments/mpesa/callback

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    }
    echo "⚠️  Please edit .env file with your database credentials and other settings."
else
    echo "✅ .env file already exists."
fi

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads

# Check if MySQL is running
echo "🗄️  Checking MySQL connection..."
if command -v mysql &> /dev/null; then
    echo "✅ MySQL client found."
    echo "⚠️  Please ensure MySQL server is running and create the database:"
    echo "   CREATE DATABASE legion_connections;"
else
    echo "⚠️  MySQL client not found. Please install MySQL and create the database."
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your database credentials"
echo "2. Create MySQL database: CREATE DATABASE legion_connections;"
echo "3. Start the server: npm run dev"
echo ""
echo "🔗 API will be available at: http://localhost:5000"
echo "📊 Health check: http://localhost:5000/health"
echo "💳 M-Pesa endpoints: http://localhost:5000/api/payments/mpesa/*"
echo ""
echo "📚 For more information, see README.md" 