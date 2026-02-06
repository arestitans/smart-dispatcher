# FREE Deployment Guide - Smart Dispatcher

Deploy your dashboard online completely FREE using **Render.com** (backend) and **Vercel** (frontend).

## Why This Combo?

- **Vercel**: Unlimited free static deployments, auto-deploys from GitHub
- **Render.com**: Generous free tier for Node.js backend, includes free PostgreSQL if needed
- **Zero cost**: Both offer perpetual free tiers (no credit card required)
- **Auto-deploy**: Push to GitHub → Auto-buildและdeploy

---

## Prerequisites

1. **GitHub Account** (free at https://github.com)
2. **Vercel Account** (free at https://vercel.com)
3. **Render Account** (free at https://render.com)
4. Your repo pushed to GitHub

---

## Step 1: Push Your Code to GitHub (5 minutes)

If not already done, push your project to GitHub:

```bash
cd smart-dispatcher
git init
git add .
git commit -m "Initial commit for Smart Dispatcher deployment"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/smart-dispatcher.git
git push -u origin main
```

---

## Step 2: Deploy Backend to Render.com (10 minutes)

### 2.1 Create a Render Account
- Go to https://render.com and sign up (free)
- Link your GitHub account

### 2.2 Create a New Web Service
1. Click **"New +"** → **"Web Service"**
2. Select your GitHub repo (`smart-dispatcher`)
3. Fill in the details:
   - **Name**: `smart-dispatcher-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

### 2.3 Set Environment Variables
In the Render dashboard, add these environment variables for your backend:

```
PORT=3001
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=https://smart-dispatcher.vercel.app
TELEGRAM_BOT_TOKEN=(leave empty if not setup)
ADMIN_TELEGRAM_IDS=(leave empty if not setup)
```

**IMPORTANT**: Change `JWT_SECRET` to a random string like: `aSdF123KoP9mLpQxZvW2BnMqRsT5uVwX8yZ`

### 2.4 Deploy
Click **"Deploy"** and wait ~3-5 minutes. You'll get a URL like:
```
https://smart-dispatcher-backend.onrender.com
```

**Copy this URL** - you'll need it in the next step.

---

## Step 3: Deploy Frontend to Vercel (5 minutes)

### 3.1 Create a Vercel Account
- Go to https://vercel.com and sign up (free)
- Link your GitHub account

### 3.2 Import Your Project
1. Click **"New Project"** → **"Import Git Repository"**
2. Select your `smart-dispatcher` repo
3. Fill in:
   - **Root Directory**: `frontend`
   - **Framework**: `Vite`

### 3.3 Add Environment Variables
Before deploying, add environment variables:
- **Key**: `VITE_API_URL`
- **Value**: `https://smart-dispatcher-backend.onrender.com/api` (use your Render backend URL)

### 3.4 Deploy
Click **"Deploy"** and wait ~2-3 minutes. You'll get a URL like:
```
https://smart-dispatcher.vercel.app
```

---

## Step 4: Update Backend with Frontend URL (2 minutes)

1. Go back to your **Render Dashboard**
2. Find your `smart-dispatcher-backend` service
3. Go to **"Environment"** settings
4. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://smart-dispatcher.vercel.app
   ```
5. Click **"Save"** (backend will auto-redeploy)

---

## ✅ Done! Your Dashboard is Live!

**Frontend**: https://smart-dispatcher.vercel.app  
**Backend API**: https://smart-dispatcher-backend.onrender.com/api  

### Login with Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Supervisor | supervisor | super123 |
| Helpdesk | helpdesk | help123 |
| Guest | guest | guest123 |

---

## Auto-Deploy Setup

From now on, whenever you push to GitHub:
1. **Frontend** auto-deploys via Vercel
2. **Backend** auto-deploys via Render.com

No manual deployment needed!

---

## Troubleshooting

### Backend won't start
- Check Render logs: Render Dashboard → Your Service → "Logs"
- Ensure all environment variables are set correctly
- Verify `PORT=3001` is set

### "Cannot connect to backend" error
- Check if Render backend is running and healthy
- Verify `VITE_API_URL` environment variable in Vercel is correct
- Wait a few minutes after deployment

### Render spins down after 15 minutes of inactivity
- **Free tier limitation**: Your backend sleeps after 15 min
- **First request = ~30 sec startup time** (then normal)
- **Solution**: Upgrade to Render Paid ($7/month) for dedicated instance

### Frontend shows blank page
- Check browser console for errors (F12 → Console tab)
- Verify you're using correct login credentials
- Wait for Render backend to spin up if it's been idle

---

## Cost Breakdown

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel | Unlimited static sites | **$0** |
| Render | 0.5 CPU, 512MB RAM | **$0** |
| GitHub | Unlimited public repos | **$0** |
| **TOTAL** | | **$0/month** |

---

## When to Upgrade

- **Render**: Upgrade to $7/month if you need 24/7 uptime (no spin-down)
- **Vercel**: Stays free unless you need advanced features

---

## Next Steps

1. **Monitor your app**: Check Render & Vercel dashboards regularly
2. **Customize data**: Edit `backend/src/data/mockData.js`
3. **Add users**: Modify demo credentials in mock data
4. **Enable Telegram bot**: Get token from BotFather, set `TELEGRAM_BOT_TOKEN`
5. **Connect database**: Replace mock data with real DB

---

## Alternative: Self-Hosted Cheap Option

If you want even fewer restrictions, try:
- **Linode/Akamai**: $2.50/month VPS (not free, but very cheap)
- **Oracle Cloud**: Free tier VPS (if eligible)

---

**Status**: ✅ Your dashboard is now live online!

