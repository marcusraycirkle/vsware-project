# Vercel Environment Variables Setup Guide

## Overview
This guide explains how to configure sensitive environment variables in Vercel for your deployed application.

## Why Environment Variables?
- **Security**: Secrets are never exposed in git or code
- **Flexibility**: Different values for development, staging, and production
- **Best Practice**: Industry standard for managing sensitive data

## Required Environment Variables

### 1. RESEND_API_KEY
- **Purpose**: Email service authentication
- **Type**: Secret
- **Value**: Your Resend API key from https://resend.com/api-keys
- **Visibility**: Production

### 2. MONGODB_URI
- **Purpose**: Database connection string
- **Type**: Secret
- **Value**: Your MongoDB Atlas connection string
- **Visibility**: Production

### 3. JWT_SECRET
- **Purpose**: Authentication token signing
- **Type**: Secret
- **Value**: A strong random string (generate with: `openssl rand -base64 32`)
- **Visibility**: Production

### 4. NODE_ENV
- **Purpose**: Environment identifier
- **Type**: Plain
- **Value**: `production`
- **Visibility**: Production

## How to Set Environment Variables in Vercel

### Method 1: Vercel Dashboard (Web UI)

1. **Go to your project**:
   - Visit https://vercel.com/dashboard
   - Select your project: `vsware-project`

2. **Navigate to Settings**:
   - Click **Settings** tab at the top
   - Click **Environment Variables** in the left sidebar

3. **Add Variables**:
   - Click **Add New**
   - Enter the name: `RESEND_API_KEY`
   - Enter the value: Your Resend API key
   - Select which environments: **Production** (recommended for secrets)
   - Click **Save**

4. **Repeat for other variables**:
   - `MONGODB_URI` (if not already set)
   - `JWT_SECRET` (if not already set)
   - `NODE_ENV` (should be `production`)

5. **Redeploy**:
   - After setting variables, redeploy your project
   - Go to **Deployments** tab
   - Click the latest deployment or trigger a new one
   - New environment variables will be available

### Method 2: Vercel CLI (Command Line)

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Link to your project (if not already linked)
vercel link

# Add environment variables
vercel env add RESEND_API_KEY
# You'll be prompted to enter the value

# Redeploy to apply changes
vercel --prod
```

### Method 3: Environment Variables File

Create a `.vercel/project.json` file or use Vercel's CLI configuration.

## Verification

### Check Variables are Set
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify all required variables are listed
3. Variables should show only the first/last few characters (for security)

### Test the Deployment
After deployment, test that emails work:
1. Submit an enrollment to your app
2. Approve or reject it
3. Check if the email was sent
4. Verify in Resend dashboard: https://resend.com/emails

## Security Best Practices

### ✅ DO:
- Store all secrets in Vercel Environment Variables
- Use strong, random values for JWT_SECRET
- Rotate API keys regularly
- Use different keys for development and production
- Review environment variables regularly
- Document which variables are required

### ❌ DON'T:
- Commit `.env` files to git
- Share API keys via email or chat
- Use the same key for multiple services
- Hardcode secrets in code
- Log sensitive information
- Use weak passwords or secrets

## Local Development

For local development, create a `.env` file (never commit):

```bash
# .env (local development only)
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_key
NODE_ENV=development
PORT=5000
```

**Important**: `.env` is in `.gitignore` and will never be committed.

## Troubleshooting

### Emails Not Sending After Deployment
1. Check that `RESEND_API_KEY` is set in Vercel
2. Verify the key is correct in Resend dashboard
3. Check Vercel deployment logs: `vercel logs`
4. Ensure deployment shows "Ready" status

### "RESEND_API_KEY is undefined"
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify `RESEND_API_KEY` is listed
3. Check that it's assigned to "Production" environment
4. Redeploy: `vercel --prod`

### Variables Not Updating After Set
- Wait a few seconds for Vercel to save
- Ensure you click "Save" button
- Redeploy your application
- Clear browser cache if needed

### Sensitive Data Exposed in Logs
- Don't log `process.env.RESEND_API_KEY`
- Sanitize error messages before sending to client
- Use `console.log()` only in development
- Review CloudWatch/Vercel logs for accidental exposure

## Vercel Resources

- [Environment Variables Documentation](https://vercel.com/docs/projects/environment-variables)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Secrets Management Best Practices](https://vercel.com/docs/concepts/environment-variables)

## Checklist

- [ ] All required environment variables are set in Vercel
- [ ] `.env` file is in `.gitignore`
- [ ] No secrets are visible in git history
- [ ] Deployment shows "Ready" status
- [ ] Test email is received after deployment
- [ ] No sensitive data in logs or error messages
- [ ] API keys are stored in Vercel, not in code

## Support

For issues with environment variables:
1. Check Vercel Status Page: https://www.vercelstatus.com/
2. Review Vercel Documentation: https://vercel.com/docs
3. Contact Vercel Support through dashboard
