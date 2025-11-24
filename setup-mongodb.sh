#!/bin/bash
echo "🔐 MongoDB Atlas Setup"
echo "======================"
echo ""
echo "Please enter your MongoDB Atlas password:"
read -s MONGO_PASS
echo ""

cat > .env << ENVEOF
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://corykil78_db_user:${MONGO_PASS}@cluster0.ijzedxz.mongodb.net/compmis?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=30d
ENVEOF

echo "✅ MongoDB configuration saved to .env"
echo ""
echo "Testing connection..."
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('✅ Connected successfully!'); process.exit(0); }).catch(err => { console.log('❌ Connection failed:', err.message); process.exit(1); });"
