#!/bin/bash
# MongoDB Atlas Configuration for Vercel

echo "🔧 MongoDB Atlas Configuration Guide"
echo "===================================="
echo ""
echo "📝 Step 1: Get your MongoDB Atlas connection string"
echo "   1. Go to: https://www.mongodb.com/cloud/atlas/register"
echo "   2. Create a FREE account (no credit card required)"
echo "   3. Create a new cluster (select M0 FREE tier)"
echo "   4. Wait for cluster to deploy (~5 minutes)"
echo "   5. Click 'Connect' button"
echo "   6. Select 'Connect your application'"
echo "   7. Copy the connection string"
echo ""
echo "⚠️  Your connection string should look like:"
echo "   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/schoolware?retryWrites=true&w=majority"
echo ""
echo "📝 Step 2: Replace <password> in the connection string"
echo "   - Replace <password> with your actual database password"
echo "   - Replace <username> if needed"
echo ""
echo "📝 Step 3: Set environment variables in Vercel"
echo ""

# Check if connection string is provided
if [ -z "$1" ]; then
    echo "Usage: ./configure-mongodb.sh \"your-mongodb-connection-string\""
    echo ""
    echo "Example:"
    echo "./configure-mongodb.sh \"mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/schoolware\""
    echo ""
    echo "Or set manually:"
    echo "vercel env add MONGODB_URI production"
    exit 1
fi

MONGODB_URI="$1"

echo "🚀 Setting MONGODB_URI in Vercel..."
echo "$MONGODB_URI" | vercel env add MONGODB_URI production --force

echo ""
echo "✅ MongoDB URI configured!"
echo ""
echo "📝 Step 4: Seed the database with initial data"
echo "   Run: node seed.js"
echo ""
echo "📝 Step 5: Redeploy to Vercel"
echo "   Run: vercel --prod"
echo ""
echo "✨ Done! Your app will now connect to MongoDB Atlas"
