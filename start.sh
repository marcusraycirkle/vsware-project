#!/bin/bash

echo "🚀 Starting SchoolWare School Management System..."
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running!"
    echo "   Please start MongoDB first:"
    echo "   - On Linux: sudo systemctl start mongod"
    echo "   - On macOS: brew services start mongodb-community"
    echo "   - Or run: mongod"
    echo ""
    read -p "Press Enter to continue anyway or Ctrl+C to exit..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from .env.example..."
    cp .env.example .env
    echo "   Please update the .env file with your configuration"
    echo ""
fi

echo "✅ Starting server..."
echo "   API will be available at: http://localhost:5000"
echo "   Health check: http://localhost:5000/api/health"
echo ""
echo "   Press Ctrl+C to stop the server"
echo ""

npm run dev
