# 🚀 CompMIS Quick Deployment Guide

## Step 1: Configure MongoDB Atlas

Run this command and enter your MongoDB Atlas password when prompted:

```bash
./setup-mongodb.sh
```

This will:
- Create `.env` file with your MongoDB connection string
- Generate a secure JWT secret
- Test the database connection

## Step 2: Deploy Backend to Cloudflare Workers

```bash
# Login to Cloudflare
wrangler login

# Create wrangler.toml configuration
cat > wrangler.toml << 'EOF'
name = "compmis-backend"
main = "worker.js"
compatibility_date = "2024-01-01"

[vars]
NODE_ENV = "production"

[[kv_namespaces]]
binding = "CACHE"
id = "your_kv_namespace_id"
EOF

# Deploy
wrangler publish
```

## Step 3: Deploy Frontend to GitHub Pages

```bash
# Update API URL in frontend/app.js with your Workers URL
# Then push to GitHub
git add .
git commit -m "Deploy CompMIS"
git push origin main

# Enable GitHub Pages:
# Go to Settings > Pages
# Select: main branch, /frontend folder
```

## Step 4: Seed Database

```bash
node seed-compmis.js
```

## 🎉 Done!

Your URLs:
- **Frontend**: https://marcusraycirkle.github.io/vsware-project/
- **Backend**: https://compmis-backend.YOUR_SUBDOMAIN.workers.dev

Test login: `principal@shannoncomp.ie` / `1234`
