# 🚀 Complete Deployment Guide - FREE Hosting Options

## ✅ Backend Hosting Options (FREE)

### Option 1: Vercel (RECOMMENDED for Node.js)

**Pros:**
- ✅ FREE (100GB bandwidth, 100 serverless functions)
- ✅ Supports Node.js/Express with zero config
- ✅ Automatic HTTPS & CDN
- ✅ GitHub integration
- ✅ Very fast deployment
- ✅ Great for APIs

**Setup:**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Create vercel.json in project root
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF

# 3. Deploy
vercel login
vercel

# 4. Set environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add NODE_ENV

# 5. Deploy to production
vercel --prod
```

**Your backend will be at:** `https://your-project.vercel.app`

---

### Option 2: Render.com

**Pros:**
- ✅ FREE (750 hours/month)
- ✅ Full Node.js support
- ✅ Auto-deploy from GitHub
- ✅ Persistent storage option
- ✅ PostgreSQL database included

**Setup:**
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   - Name: compmis-backend
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
6. Add environment variables:
   - MONGODB_URI
   - JWT_SECRET
   - NODE_ENV=production
7. Click "Create Web Service"

---

### Option 3: Railway.app

**Pros:**
- ✅ $5 free credit/month
- ✅ Full Node.js/Express support
- ✅ MongoDB addon available
- ✅ Simple deployment

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

---

### Option 4: Cyclic.sh

**Pros:**
- ✅ Completely FREE
- ✅ No credit card required
- ✅ Unlimited apps
- ✅ Auto-deploy from GitHub

**Setup:**
1. Go to https://cyclic.sh
2. Sign in with GitHub
3. Click "Deploy Now"
4. Select your repository
5. Add environment variables
6. Deploy!

---

### Option 5: Glitch.com

**Pros:**
- ✅ FREE forever
- ✅ Online code editor
- ✅ Auto-restart
- ✅ Great for demos

**Note:** App sleeps after 5 minutes of inactivity

---

## 🎨 Frontend Hosting (GitHub Pages)

**Already configured!** Just push and enable:

```bash
git add .
git commit -m "Deploy CompMIS"
git push origin main
```

Then:
1. Go to repo **Settings** → **Pages**
2. Source: **main branch**
3. Folder: **/frontend**
4. Click **Save**

Your site: `https://marcusraycirkle.github.io/vsware-project/`

---

## 🔥 QUICKEST SETUP: Vercel (5 minutes)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Create vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [{"src": "server.js", "use": "@vercel/node"}],
  "routes": [{"src": "/(.*)", "dest": "server.js"}]
}
EOF

# 3. Login and deploy
vercel login
vercel

# 4. Add environment variables (in Vercel dashboard)
# Go to: Project Settings → Environment Variables
# Add:
# - MONGODB_URI = your_connection_string
# - JWT_SECRET = random_secret_key
# - NODE_ENV = production
# - PORT = 5000

# 5. Deploy to production
vercel --prod

# 6. Get your URL
vercel domains
```

---

## 📝 Update Frontend with Backend URL

After deploying backend, edit `frontend/app.js` line 2:

```javascript
const API_URL = 'https://your-project.vercel.app/api';
```

Then push to GitHub for frontend update.

---

## 🆚 Comparison Table

| Service | Free Tier | Node.js | MongoDB | Sleep? | Speed |
|---------|-----------|---------|---------|--------|-------|
| **Vercel** | 100GB/mo | ✅ Full | Via Atlas | ❌ No | ⚡⚡⚡ |
| **Render** | 750hrs/mo | ✅ Full | Via Atlas | ✅ Yes | ⚡⚡ |
| **Railway** | $5/mo | ✅ Full | ✅ Built-in | ❌ No | ⚡⚡⚡ |
| **Cyclic** | Unlimited | ✅ Full | Via Atlas | ✅ Yes | ⚡⚡ |
| **Glitch** | Unlimited | ✅ Full | Via Atlas | ✅ Yes | ⚡ |

**Recommendation: Vercel for best performance & reliability!**

---

## ⚙️ MongoDB Atlas Setup

1. Log in to https://cloud.mongodb.com
2. Go to your cluster
3. Click **Connect** → **Connect your application**
4. Copy connection string
5. Replace `<password>` with your actual password
6. Add to your hosting service's environment variables

---

## 🧪 Test Your Deployment

Once deployed, test:

```bash
# Test backend
curl https://your-backend-url.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"principal@shannoncomp.ie","pin":"1234"}'

# Should return JWT token
```

Open frontend URL and login with:
- Email: `principal@shannoncomp.ie`
- PIN: `1234`

---

## 🎯 RECOMMENDED SETUP

**Backend:** Vercel (fastest, most reliable)
**Frontend:** GitHub Pages (free, simple)
**Database:** MongoDB Atlas (already configured)

**Total Cost:** $0/month
**Setup Time:** 10 minutes
**Performance:** Production-ready ⚡

---

## 🆘 Troubleshooting

### CORS Errors
Add your frontend URL to `server.js` CORS config:
```javascript
const corsOptions = {
  origin: [
    'https://marcusraycirkle.github.io',
    'https://your-backend.vercel.app'
  ],
  credentials: true
};
```

### MongoDB Connection Failed
- Check IP whitelist (use 0.0.0.0/0 for allow all)
- Verify password in connection string
- Check environment variable is set correctly

### App Won't Start
- Check logs: `vercel logs` or in service dashboard
- Verify all environment variables are set
- Check Node version compatibility

---

## 📞 Need Help?

Check service-specific docs:
- Vercel: https://vercel.com/docs
- Render: https://render.com/docs
- Railway: https://docs.railway.app
- Cyclic: https://docs.cyclic.sh

Your CompMIS is ready to go live! 🚀
