# 🔧 MongoDB Configuration Guide for Vercel

## Quick Start

### Option 1: Use MongoDB Atlas (Recommended - FREE)

1. **Create MongoDB Atlas Account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up for FREE (no credit card required)

2. **Create a Cluster**
   - Click "Build a Database"
   - Select **M0 FREE** tier
   - Choose a cloud provider and region (closest to your users)
   - Click "Create Cluster"
   - Wait ~5 minutes for deployment

3. **Configure Database Access**
   - Go to "Database Access" in left menu
   - Click "Add New Database User"
   - Username: `vsware_admin`
   - Password: Generate a strong password (save it!)
   - User Privileges: "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in left menu
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in left menu
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string

   It will look like:
   ```
   mongodb+srv://vsware_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. **Update Connection String**
   - Replace `<password>` with your actual password
   - Add database name after `.net/`: `/schoolware`
   
   Final string:
   ```
   mongodb+srv://vsware_admin:YourPassword123@cluster0.xxxxx.mongodb.net/schoolware?retryWrites=true&w=majority
   ```

7. **Set Environment Variable in Vercel**
   
   **Method A: Using Vercel CLI** (in terminal)
   ```bash
   vercel env add MONGODB_URI production
   # Paste your connection string when prompted
   ```

   **Method B: Using Vercel Dashboard**
   - Go to: https://vercel.com
   - Open your project: `vsware-project`
   - Go to Settings > Environment Variables
   - Add variable:
     - Name: `MONGODB_URI`
     - Value: `mongodb+srv://vsware_admin:YourPassword123@cluster0.xxxxx.mongodb.net/schoolware?retryWrites=true&w=majority`
     - Environment: Production

8. **Seed the Database**
   
   Update the `.env` file locally with your MongoDB Atlas URI:
   ```bash
   echo 'MONGODB_URI=mongodb+srv://vsware_admin:YourPassword123@cluster0.xxxxx.mongodb.net/schoolware?retryWrites=true&w=majority' > .env
   echo 'JWT_SECRET=your-secret-key-change-in-production' >> .env
   echo 'NODE_ENV=production' >> .env
   echo 'PORT=5000' >> .env
   ```

   Then seed:
   ```bash
   npm install
   node seed.js
   ```

9. **Redeploy to Vercel**
   ```bash
   vercel --prod
   ```

---

## Option 2: Quick Setup Script

Use the provided script:

```bash
./configure-mongodb.sh "mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/schoolware"
```

---

## Verify Configuration

After deployment, check Vercel logs:
```bash
vercel logs --follow
```

You should see:
```
✅ MongoDB connected successfully
```

---

## Test the API

Once deployed, test an endpoint:
```bash
curl https://vsware-project.vercel.app/api/students
```

---

## Troubleshooting

### Error: "MongoServerError: Authentication failed"
- Check your password is correct in the connection string
- Verify database user exists in MongoDB Atlas

### Error: "MongooseServerSelectionError: connection timed out"
- Check Network Access allows 0.0.0.0/0 in MongoDB Atlas
- Verify connection string is correct

### Error: "Server error 500"
- Check Vercel logs: `vercel logs`
- Verify MONGODB_URI environment variable is set
- Ensure database is seeded with data

---

## Environment Variables Needed

Set these in Vercel (Production environment):

| Variable | Example Value |
|----------|---------------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/schoolware` |
| `JWT_SECRET` | `super-secret-key-change-me-in-production-12345` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

---

## Current Status

Run this to check environment variables:
```bash
vercel env ls
```

---

## Need Help?

If you have your MongoDB Atlas connection string, I can set it up for you. Just provide:
```
mongodb+srv://username:password@cluster.xxxxx.mongodb.net/schoolware
```
