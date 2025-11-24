#!/bin/bash

# CompMIS Quick Deploy Script
# This script helps you deploy the frontend and backend

echo "🎓 CompMIS Deployment Helper"
echo "================================"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found."
    echo "📦 Install it with: npm install -g @railway/cli"
    echo ""
    read -p "Install now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g @railway/cli
    else
        exit 1
    fi
fi

echo ""
echo "🔐 Step 1: MongoDB Atlas Configuration"
echo "----------------------------------------"
echo "Please enter your MongoDB Atlas password:"
read -s MONGO_PASSWORD
echo ""

if [ -z "$MONGO_PASSWORD" ]; then
    echo "❌ Password cannot be empty!"
    exit 1
fi

# Create .env file
cat > .env << EOL
MONGODB_URI=mongodb+srv://corykil78_db_user:${MONGO_PASSWORD}@cluster0.ijzedxz.mongodb.net/compmis?retryWrites=true&w=majority
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
PORT=5000
EOL

echo "✅ .env file created"
echo ""

echo "🚂 Step 2: Railway Deployment"
echo "----------------------------------------"
echo "Logging into Railway..."
railway login

echo ""
echo "Creating Railway project..."
railway init

echo ""
echo "Setting environment variables on Railway..."
railway variables set MONGODB_URI="mongodb+srv://corykil78_db_user:${MONGO_PASSWORD}@cluster0.ijzedxz.mongodb.net/compmis?retryWrites=true&w=majority"
railway variables set JWT_SECRET="$(openssl rand -base64 32)"
railway variables set NODE_ENV="production"
railway variables set PORT="5000"

echo ""
echo "Deploying to Railway..."
railway up

echo ""
echo "✅ Backend deployed!"
echo ""
echo "Getting your backend URL..."
BACKEND_URL=$(railway domain)
echo "🔗 Backend URL: $BACKEND_URL"
echo ""

echo "📝 Step 3: Update Frontend"
echo "----------------------------------------"
echo "Updating frontend/app.js with backend URL..."

# Update the API_URL in frontend/app.js
sed -i "s|const API_URL = 'http://localhost:5000/api';|const API_URL = 'https://${BACKEND_URL}/api';|g" frontend/app.js

echo "✅ Frontend updated"
echo ""

echo "🌱 Step 4: Seed Database"
echo "----------------------------------------"
read -p "Do you want to seed the database now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    export MONGODB_URI="mongodb+srv://corykil78_db_user:${MONGO_PASSWORD}@cluster0.ijzedxz.mongodb.net/compmis?retryWrites=true&w=majority"
    node seed-compmis.js
    echo "✅ Database seeded"
fi

echo ""
echo "📤 Step 5: Push to GitHub"
echo "----------------------------------------"
git add .
git commit -m "Configure CompMIS for production deployment"
git push origin main

echo ""
echo "🎉 Deployment Complete!"
echo "================================"
echo ""
echo "📝 Next Steps:"
echo "1. Go to: https://github.com/marcusraycirkle/vsware-project/settings/pages"
echo "2. Enable GitHub Pages:"
echo "   - Source: Deploy from a branch"
echo "   - Branch: main"
echo "   - Folder: /frontend"
echo "3. Wait 1-2 minutes for deployment"
echo "4. Visit: https://marcusraycirkle.github.io/vsware-project/"
echo ""
echo "🔗 Your URLs:"
echo "   Frontend: https://marcusraycirkle.github.io/vsware-project/"
echo "   Backend:  https://${BACKEND_URL}"
echo ""
echo "🧪 Test Login:"
echo "   Email: principal@shannoncomp.ie"
echo "   PIN:   1234"
echo ""
