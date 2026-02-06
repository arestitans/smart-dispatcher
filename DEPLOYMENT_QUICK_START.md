# ⚡ QUICK START - Deploy in 15 Minutes (Completely FREE)

Your dashboard is ready to deploy. Follow these **3 simple steps**:

---

## 🔗 Your GitHub Repository

Your code is now at: **`https://github.com/YOUR_USERNAME/smart-dispatcher`**

---

## Step 1️⃣: Deploy Backend (5 minutes)

### Go to https://render.com

1. **Sign up** (free, no credit card needed)
2. Connect your GitHub account
3. Click **"New +"** → **"Web Service"**
4. Select `smart-dispatcher` repo
5. Fill in these settings:
   - **Name**: `smart-dispatcher-backend`
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

6. **Click "Create Web Service"**
7. **Add Environment Variables** (click "Advanced"):
   ```
   PORT=3001
   NODE_ENV=production
   JWT_SECRET=MySecretKey123!@#ChangeMeInProduction
   FRONTEND_URL=https://smart-dispatcher.vercel.app
   ```
8. **Click "Deploy"**

➡️ **Wait 3-5 minutes for deployment**

📝 **Copy your backend URL** (looks like: `https://smart-dispatcher-backend.onrender.com`)

---

## Step 2️⃣: Deploy Frontend (5 minutes)

### Go to https://vercel.com

1. **Sign up** (free, no credit card needed)
2. Connect your GitHub account
3. Click **"New Project"** → **"Import Git Repository"**
4. Select `smart-dispatcher`
5. Fill in these settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`

6. **Scroll to "Environment Variables"** and add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://smart-dispatcher-backend.onrender.com/api` (use YOUR backend URL from Step 1)

7. **Click "Deploy"**

➡️ **Wait 2-3 minutes for deployment**

📝 **Your frontend URL** (looks like: `https://smart-dispatcher.vercel.app`)

---

## Step 3️⃣: Update Backend with Frontend URL (1 minute)

1. Go back to **Render Dashboard** → your backend service
2. Click **"Environment"**
3. Edit `FRONTEND_URL`:
   - Old: `https://smart-dispatcher.vercel.app`
   - New: `YOUR_ACTUAL_VERCEL_URL` (from Step 2)
4. **Save** (backend auto-redeploys)

---

## ✅ DONE! Your Dashboard is LIVE!

```
🌐 Frontend: https://your-vercel-url.vercel.app
🔌 Backend API: https://your-render-url.onrender.com/api
```

---

## 🔓 Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Supervisor | supervisor | super123 |
| Helpdesk | helpdesk | help123 |
| Guest | guest | guest123 |

---

## 🎯 What Happens Next?

✅ **Auto-Deploy**: Every push to GitHub auto-deploys your app!
✅ **Render Free Tier**: Basic 24/7 availability (spins down after 15 min idle for ~30 sec)
✅ **Vercel Free Tier**: Unlimited static deployments

---

## ⚠️ Important Notes

- **Render Free Tier**: If backend is idle >15 min, it spins down. First request takes ~30 sec (then normal)
- **Production Security**: Change `JWT_SECRET` to a random string!
- **Environment Variables**: Must match between Vercel & Render

---

## 💰 Cost Analysis

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel Frontend | ✅ Unlimited | $0/month |
| Render Backend | ✅ 512MB RAM, 0.5 CPU | $0/month |
| Custom Domain (optional) | ❌ Premium | +$10/year (Namecheap) |
| **TOTAL** | | **$0/month** |

---

## 📞 Troubleshooting

**"Cannot connect to backend"**
- Wait for Render to fully deploy (check their Logs)
- Verify `VITE_API_URL` is correct in Vercel

**"Page loads but shows error"**
- Check browser console (F12 → Console)
- Open `/api/health` in browser to test backend

**"Render keeps timing out"**
- You're on Free tier - it auto-spins down after 15 min
- Upgrade to $7/month for dedicated instance (no spin-down)

---

**You're now running your Smart Dispatcher ONLINE, completely FREE!** 🎉

Next: Monitor your deployment and customize your user data!

