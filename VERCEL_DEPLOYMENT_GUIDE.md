# 🚀 Complete Vercel Deployment Guide for CompMIS

## Step-by-Step: Adding Your Project to Vercel

### Step 1: Initial Setup (Do this first!)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login
# This will open your browser - sign in with GitHub
```

---

### Step 2: Configure Environment Variables BEFORE Deploying

**IMPORTANT:** You need your MongoDB password ready!

Create a `.env.production` file:
```bash
cd /workspaces/vsware-project

cat > .env.production << 'EOF'
MONGODB_URI=mongodb+srv://corykil78_db_user:YOUR_MONGODB_PASSWORD@cluster0.ijzedxz.mongodb.net/compmis?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=super_secret_key_change_in_production_xyz123abc
NODE_ENV=production
PORT=5000
EOF
```

**Replace `YOUR_MONGODB_PASSWORD`** with your actual MongoDB Atlas password!

---

### Step 3: Deploy to Vercel

```bash
# From project root
cd /workspaces/vsware-project

# Deploy (this will be a preview deployment first)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? compmis-backend (or your choice)
# - Directory? ./ (press Enter)
# - Override settings? No
```

You'll get a **preview URL** like: `https://compmis-backend-abc123.vercel.app`

---

### Step 4: Add Environment Variables in Vercel Dashboard

**Via Web Dashboard (Easier):**

1. Go to https://vercel.com/dashboard
2. Click on your project (compmis-backend)
3. Go to **Settings** tab
4. Click **Environment Variables** in sidebar
5. Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://corykil78_db_user:YOUR_PASSWORD@cluster0.ijzedxz.mongodb.net/compmis?retryWrites=true&w=majority` | Production |
| `JWT_SECRET` | `super_secret_key_change_this_xyz123` | Production |
| `NODE_ENV` | `production` | Production |
| `PORT` | `5000` | Production |

**Via CLI:**
```bash
# Add environment variables
vercel env add MONGODB_URI production
# Paste your MongoDB connection string when prompted

vercel env add JWT_SECRET production
# Enter a strong secret key

vercel env add NODE_ENV production
# Enter: production

vercel env add PORT production
# Enter: 5000
```

---

### Step 5: Deploy to Production

```bash
# Deploy to production with environment variables
vercel --prod

# This will give you your final production URL
# Example: https://compmis-backend.vercel.app
```

**Save this URL!** You'll need it for the frontend.

---

### Step 6: Update Frontend with Backend URL

Edit `frontend/app.js`:

```bash
cd /workspaces/vsware-project/frontend

# Replace localhost with your Vercel URL
sed -i "s|http://localhost:5000/api|https://YOUR-PROJECT.vercel.app/api|g" app.js

# Or manually edit line 2:
nano app.js
# Change: const API_URL = 'https://YOUR-PROJECT.vercel.app/api';
```

---

### Step 7: Deploy Frontend to GitHub Pages

```bash
cd /workspaces/vsware-project

# Add all changes
git add .

# Commit
git commit -m "Deploy CompMIS to Vercel + GitHub Pages"

# Push to GitHub
git push origin main
```

**Enable GitHub Pages:**
1. Go to: https://github.com/marcusraycirkle/vsware-project/settings/pages
2. **Source:** Deploy from a branch
3. **Branch:** main
4. **Folder:** /frontend
5. Click **Save**

Wait 1-2 minutes, then visit:
**https://marcusraycirkle.github.io/vsware-project/**

---

## 🎯 Quick Commands Summary

```bash
# 1. Login
vercel login

# 2. Deploy to production
vercel --prod

# 3. Get your production URL
vercel ls

# 4. View logs (if something goes wrong)
vercel logs

# 5. Check deployment status
vercel inspect
```

---

## 🔧 Troubleshooting

### "Cannot find module 'express'"
**Solution:** Vercel auto-installs from package.json. Make sure you're deploying from project root.

### "MongoDB connection failed"
**Solution:** 
1. Check environment variables are set correctly
2. Go to MongoDB Atlas → Network Access → Add IP: `0.0.0.0/0`
3. Verify password in connection string

### "CORS error" in frontend
**Solution:** Update `server.js` CORS config:
```javascript
const corsOptions = {
  origin: [
    'https://marcusraycirkle.github.io',
    'https://YOUR-PROJECT.vercel.app'
  ],
  credentials: true
};
```
Then redeploy: `vercel --prod`

### "404 on API calls"
**Solution:** Check vercel.json routes are correct and redeploy

---

## 📊 Verify Deployment

Test your backend:
```bash
# Replace with your actual Vercel URL
curl https://YOUR-PROJECT.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"principal@shannoncomp.ie","pin":"1234"}'

# Should return JWT token
```

---

## 🎉 Final URLs

After deployment, you'll have:

- **Backend API:** `https://your-project.vercel.app`
- **Frontend:** `https://marcusraycirkle.github.io/vsware-project/`
- **MongoDB:** Already hosted on Atlas

**Test login at your GitHub Pages URL with:**
- Email: `principal@shannoncomp.ie`
- PIN: `1234`

---

## 💡 Pro Tips

1. **Custom Domain:** Add your school's domain in Vercel dashboard → Domains
2. **Automatic Deploys:** Every `git push` will trigger new deployment
3. **Preview Deployments:** Every branch gets its own preview URL
4. **Environment Variables:** Can be different for Preview vs Production
5. **Logs:** View real-time logs with `vercel logs --follow`

---

## 🔄 Making Updates

After initial deployment, updating is easy:

```bash
# Make your changes
git add .
git commit -m "Update feature"
git push

# Frontend updates automatically via GitHub Pages

# Backend updates:
vercel --prod
```

---

## ✅ Checklist

- [ ] Vercel CLI installed
- [ ] Logged into Vercel
- [ ] MongoDB Atlas password ready
- [ ] Environment variables added
- [ ] Backend deployed to Vercel
- [ ] Got production URL
- [ ] Updated frontend API_URL
- [ ] Pushed to GitHub
- [ ] Enabled GitHub Pages
- [ ] Tested login on live site

---

**Need help?** Check Vercel logs: `vercel logs`

Your CompMIS is now LIVE! 🚀
