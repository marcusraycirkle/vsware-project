#!/bin/bash
# Secure Environment Setup Script

echo "🔒 MISpal Security Setup"
echo "======================="
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists"
    read -p "Do you want to regenerate it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled"
        exit 0
    fi
fi

echo "🔑 Generating secure JWT secret..."
JWT_SECRET=$(openssl rand -base64 32)

echo ""
echo "📝 MongoDB Configuration:"
echo "1. Go to: https://cloud.mongodb.com"
echo "2. Get your connection string"
echo ""
read -p "Enter your MongoDB URI: " MONGODB_URI

if [ -z "$MONGODB_URI" ]; then
    echo "❌ MongoDB URI is required"
    exit 1
fi

# Create .env file
cat > .env << EOF
# MongoDB Atlas Connection
MONGODB_URI=$MONGODB_URI

# JWT Secret (Auto-generated)
JWT_SECRET=$JWT_SECRET

# Environment
NODE_ENV=production

# Port
PORT=5000
EOF

echo ""
echo "✅ .env file created successfully!"
echo ""
echo "🔐 Vercel Setup:"
echo "Set these environment variables in Vercel:"
echo ""
echo "vercel env add MONGODB_URI production"
echo "vercel env add JWT_SECRET production"
echo ""
echo "Or use the Vercel dashboard:"
echo "https://vercel.com → Your Project → Settings → Environment Variables"
echo ""
echo "⚠️  IMPORTANT: Never commit .env to git!"
echo "✅ .env is already in .gitignore"
