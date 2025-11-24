# CompMIS Deployment Guide

## 🎯 Overview

This guide will help you deploy:
- **Frontend** → GitHub Pages (free, static hosting)
- **Backend** → Cloudflare Workers (free tier: 100,000 requests/day)
- **Database** → MongoDB Atlas (already set up)

---

## 📦 Part 1: Deploy Frontend to GitHub Pages

### Step 1: Update the API URL

Edit `frontend/app.js` line 2:

```javascript
// Change from:
const API_URL = 'http://localhost:5000/api';

// To your Cloudflare Worker URL (we'll get this in Part 2):
const API_URL = 'https://compmis.YOUR_SUBDOMAIN.workers.dev/api';
```

### Step 2: Push to GitHub

```bash
cd /workspaces/vsware-project
git add frontend/
git commit -m "Add CompMIS frontend for GitHub Pages"
git push origin main
```

### Step 3: Enable GitHub Pages

1. Go to your GitHub repository: `https://github.com/marcusraycirkle/vsware-project`
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/frontend**
4. Click **Save**

Your frontend will be live at:
**`https://marcusraycirkle.github.io/vsware-project/`**

---

## ⚡ Part 2: Deploy Backend to Cloudflare Workers

### Important Note About Cloudflare Workers

**Cloudflare Workers have limitations:**
- No native Node.js modules (can't use the current Express.js setup as-is)
- Need to rewrite the backend using Worker-compatible code
- OR use **Cloudflare Pages Functions** which supports more Node.js features

### Recommended Alternative: Railway.app

For your Express.js backend, I recommend **Railway.app** instead:
- ✅ Supports full Node.js/Express apps
- ✅ Free $5/month credit (enough for small projects)
- ✅ Easy deployment
- ✅ Automatic HTTPS
- ✅ Environment variables support

---

## 🚂 Part 2 (Recommended): Deploy to Railway.app

### Step 1: Sign up for Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. You get $5 free credit per month

### Step 2: Create `railway.json`

Already created for you! This tells Railway how to run your app.

### Step 3: Deploy

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set MONGODB_URI="mongodb+srv://corykil78_db_user:YOUR_PASSWORD@cluster0.ijzedxz.mongodb.net/compmis?retryWrites=true&w=majority"
railway variables set JWT_SECRET="$(openssl rand -base64 32)"
railway variables set NODE_ENV="production"
railway variables set PORT="5000"

# Deploy
railway up
```

### Step 4: Get Your URL

After deployment:
```bash
railway domain
```

This will give you a URL like: `https://compmis-production.up.railway.app`

### Step 5: Update Frontend

Go back to `frontend/app.js` and update:
```javascript
const API_URL = 'https://compmis-production.up.railway.app/api';
```

Then push to GitHub again.

---

## 🔧 Part 3: Enable CORS

Your backend needs to allow requests from GitHub Pages.

Edit `server.js` and update the CORS configuration:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:8000',
    'https://marcusraycirkle.github.io'  // Add this line
  ],
  credentials: true
};
```

---

## 🗄️ Part 4: Seed Production Database

Once deployed to Railway, seed your MongoDB Atlas database:

```bash
# Set MongoDB URI with your password
export MONGODB_URI="mongodb+srv://corykil78_db_user:YOUR_PASSWORD@cluster0.ijzedxz.mongodb.net/compmis?retryWrites=true&w=majority"

# Run seeding script
node seed-compmis.js
```

---

## ✅ Final Checklist

- [ ] MongoDB Atlas password added to `.env` locally
- [ ] Backend deployed to Railway.app
- [ ] Backend URL obtained from Railway
- [ ] `frontend/app.js` updated with Railway URL
- [ ] CORS configuration updated with GitHub Pages URL
- [ ] Frontend pushed to GitHub
- [ ] GitHub Pages enabled
- [ ] Production database seeded
- [ ] Test login at GitHub Pages URL

---

## 🧪 Testing

1. **Visit your GitHub Pages site:**
   `https://marcusraycirkle.github.io/vsware-project/`

2. **Test login with:**
   - Email: `principal@shannoncomp.ie`
   - PIN: `1234`

3. **Check the console for errors:**
   - Press F12 to open Developer Tools
   - Look at the Console tab
   - Check Network tab for API calls

---

## 💰 Cost Breakdown

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| MongoDB Atlas | Free M0 | **$0** | 512MB storage |
| Railway.app | Free Tier | **$0** | $5 credit/month |
| GitHub Pages | Free | **$0** | Unlimited for public repos |
| **Total** | | **$0/month** | Perfect for school use |

---

## 🆘 Troubleshooting

### Frontend can't connect to backend
- Check if Railway app is running
- Verify API_URL in `app.js` is correct
- Check CORS is enabled for GitHub Pages URL
- Open browser console for specific errors

### Database connection fails
- Verify MongoDB password is correct
- Check IP whitelist in MongoDB Atlas (use 0.0.0.0/0 for Railway)
- Ensure connection string is properly formatted

### GitHub Pages not updating
- Changes can take 1-2 minutes to appear
- Clear your browser cache
- Check GitHub Actions tab for build status

---

## 📞 Need Help?

1. Check Railway logs: `railway logs`
2. Check GitHub Pages build status in repo Actions tab
3. Review MongoDB Atlas logs
4. Open browser Developer Console for frontend errors

---

**Your CompMIS system will be live and accessible from anywhere! 🎉**
