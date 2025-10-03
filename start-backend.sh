#!/bin/bash

# Start Backend Server Script
echo "🚀 Starting SIDDHI Backend Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory."
    exit 1
fi

# Navigate to backend directory
cd clean-backend

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ Created .env file from example. Please update the values."
    else
        echo "❌ env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

# Start the server
echo "🟢 Starting backend server on port 5000..."
echo "📡 Socket.IO will be available for real-time updates"
echo "🔗 Admin API: http://localhost:5000/api/admin-supabase"
echo "🔗 Menu API: http://localhost:5000/api/menu"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
