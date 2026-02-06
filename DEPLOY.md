# Smart Dispatcher - Deployment & Quick Start Guide

This guide walks you through deploying the Smart Dispatcher to production (Vercel + Railway) and running it locally.

## Table of Contents
1. [Local Development](#local-development)
2. [Public/Demo Mode (Optional)](#publicdemo-mode-optional)
3. [Production Deployment](#production-deployment)
4. [Environment Setup](#environment-setup)

---

## Local Development

### Prerequisites
- **Node.js** v18+ and npm/yarn
- Backend runs on **port 3001**
- Frontend dev server runs on **port 5173**

### 1. Start Backend

```bash
cd backend
npm install
npm run dev
# Backend will be available at http://localhost:3001/api
```

### 2. Start Frontend (in a new terminal)

```bash
cd frontend
npm install
npm run dev
# Frontend will be available at http://localhost:5173
```

### 3. Login to Dashboard

Navigate to http://localhost:5173/login and use demo credentials:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Supervisor | supervisor | super123 |
| Helpdesk | helpdesk | help123 |
| Guest | guest | guest123 |

### 4. Run UI Tests (Optional)

To validate that all pages load correctly without console errors:

```bash
cd frontend
npx playwright install chromium
node scripts/ui_check.cjs
```

Expected output:
```
✅ All pages loaded (status 200)
✅ Navigation successful across:
   - / (Login)
   - /dashboard (Dashboard)
   - /orders (Orders)
   - /technicians (Technicians)
   - /claims (Claims)
   - /reports (Reports)
   - /import (Spreadsheet Import)
✅ No console errors detected
```

---

## Public/Demo Mode (Optional)

To **skip login and auto-load the dashboard** (useful for demos):

### 1. Create `.env` in `frontend/`:

```env
VITE_API_URL=http://localhost:3001/api
VITE_PUBLIC_MODE=true
VITE_PUBLIC_LOGIN_ROLE=admin
```

### 2. Restart frontend dev server

The dashboard will bypass login and auto-sign in as the specified role.

**WARNING**: Only enable public mode for **local/demo environments**. Do not deploy publicly with `VITE_PUBLIC_MODE=true`.

---

## Production Deployment

### Option 1: Railway (Backend) + Vercel (Frontend)

#### Backend Deployment (Railway)

1. Push repo to GitHub (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Create a **Railway project**:
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub"
   - Select your `smart-dispatcher` repo
   - Railway will auto-detect `backend/` and start building

3. Set environment variables in Railway dashboard:
   ```
   PORT=3001
   NODE_ENV=production
   JWT_SECRET=<generate-a-strong-random-secret>
   TELEGRAM_BOT_TOKEN=<your-telegram-bot-token>  # (optional)
   FRONTEND_URL=https://<your-vercel-url>  # (set after deploying frontend)
   ```

4. Deploy. Your backend URL will be something like:
   ```
   https://<your-project>-production.up.railway.app
   ```

#### Frontend Deployment (Vercel)

1. Create `.env.production` in `frontend/`:
   ```env
   VITE_API_URL=https://<your-railway-backend-url>/api
   ```

2. Deploy to Vercel:
   - Go to https://vercel.com
   - Click "New Project" → "Import Git Repository"
   - Select your repo, and set **"Root Directory"** to `frontend`
   - In "Environment Variables", add:
     ```
     VITE_API_URL=https://<your-railway-backend-url>/api
     ```
   - Deploy

3. Update backend's `FRONTEND_URL` in Railway dashboard:
   ```
   https://<your-vercel-url>
   ```

### Option 2: Docker (Self-Hosted)

#### Build & Run with Docker Compose

1. Create `docker-compose.yml` in the root:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      PORT: 3001
      NODE_ENV: production
      JWT_SECRET: your-secret-key
      FRONTEND_URL: http://localhost:80

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

2. Run:
   ```bash
   docker-compose up
   ```

Your app will be available at `http://localhost`

---

## Environment Setup

### Backend (.env)

Copy `backend/.env.example` to `backend/.env`:

```env
# Server
PORT=3001
NODE_ENV=production

# Security (change in production!)
JWT_SECRET=your-super-secret-jwt-key

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
ADMIN_TELEGRAM_IDS=123456,789012  # Comma-separated chat IDs
SUPERVISOR_TELEGRAM_IDS=

# Frontend URL for CORS
FRONTEND_URL=https://your-frontend.vercel.app

# Google Sheets (optional)
GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

### Frontend (.env)

Copy `frontend/.env.example` to `frontend/.env`:

```env
# API endpoint
VITE_API_URL=http://localhost:3001/api

# Optional: enable public/demo mode (local only!)
# VITE_PUBLIC_MODE=true
# VITE_PUBLIC_LOGIN_ROLE=guest
```

---

## Features

✅ **Role-Based Access Control**: Admin, Supervisor, Helpdesk, Guest  
✅ **Live Technician Tracking**: Leaflet map with real-time locations  
✅ **Order Management**: Create, assign, track, and update orders  
✅ **Technician Ranking**: Performance metrics and SLA compliance  
✅ **Telegram Integration**: Auto-notify technicians of new orders  
✅ **Analytics & Reports**: Dashboard with trends and insights  
✅ **Firebase/Google Sheets Ready**: Connect your own database  

---

## Troubleshooting

**"Cannot connect to backend"**
- Ensure backend is running: `npm run dev` in `backend/`
- Check `VITE_API_URL` matches backend URL
- Verify CORS headers in `backend/src/index.js`

**"Blank dashboard / 401 Unauthorized"**
- In public mode, ensure `VITE_PUBLIC_MODE=true` is set
- Otherwise, login with demo credentials (see above)

**"Telegram bot not working"**
- Set `TELEGRAM_BOT_TOKEN` in `.env`
- Ensure Telegram chat IDs are valid in `ADMIN_TELEGRAM_IDS`

---

## Next Steps

1. **Customize demo users**: Edit `backend/src/data/mockData.js`
2. **Connect a database**: Replace mock data with real DB queries
3. **Set up Google Sheets sync**: Configure OAuth credentials
4. **Enable Telegram bot**: Get token from BotFather
5. **Deploy to production**: Follow "Production Deployment" section

---

## Support

For issues or questions, please open an issue in the repository.

---

**License**: MIT
