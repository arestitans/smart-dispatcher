# Smart Dispatcher

Full-stack application for managing field technicians and order dispatch.

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Express.js + Node.js
- **Database**: Mock Data (Google Sheets ready)
- **Bot**: Telegram Bot API
- **Map**: Leaflet + OpenStreetMap

## Quick Start (Local)

### Prerequisites
- Node.js v18+
- npm or yarn

### Start Backend

```bash
cd backend
npm install
npm run dev    # http://localhost:3001
```

### Start Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

### Login with Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Supervisor | supervisor | super123 |
| Helpdesk | helpdesk | help123 |
| Guest | guest | guest123 |

## Quick Demo Mode (Skip Login)

To auto-load the dashboard without login:

1. Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_PUBLIC_MODE=true
VITE_PUBLIC_LOGIN_ROLE=admin
```

2. Restart frontend dev server

## Features

- 🔐 JWT Authentication with Role-Based Access
- 📊 Dashboard with Real-time Stats
- 🗺️ Leaflet Map for Technician Tracking
- 📋 Order Management with Assignment
- 👷 Technician Ranking System
- 📱 Telegram Bot Integration
- 📊 Analytics & Reports

## Deployment

👉 **See [DEPLOY.md](./DEPLOY.md) for production deployment steps** (Railway + Vercel, Docker, env setup)

## File Structure

```
smart-dispatcher/
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── index.js           # Server entry
│   │   ├── routes/            # API endpoints
│   │   ├── bot/               # Telegram bot
│   │   └── data/              # Mock data
│   ├── .env.example           # Backend env template
│   ├── Dockerfile             # Container build
│   └── railway.json           # Railway deployment config
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── pages/             # Dashboard, Orders, Technicians, etc.
│   │   ├── components/        # Reusable UI components
│   │   ├── services/          # API client
│   │   └── store/             # Zustand auth store
│   ├── .env.example           # Frontend env template
│   ├── Dockerfile             # Container build
│   └── vercel.json            # Vercel deployment config
├── .github/
│   └── workflows/deploy.yml   # CI/CD pipeline
├── DEPLOY.md                  # Deployment guide
└── README.md                  # This file
```

## Environment Variables

### Backend (.env.example)

```env
PORT=3001
NODE_ENV=production
JWT_SECRET=your-secret-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env.example)

```env
VITE_API_URL=http://localhost:3001/api
VITE_PUBLIC_MODE=false
VITE_PUBLIC_LOGIN_ROLE=guest
```

## License

MIT

---

**Next**: See [DEPLOY.md](./DEPLOY.md) for production deployment, Docker setup, and troubleshooting.
