# Smart Dispatcher

Full-stack application for managing field technicians and order dispatch.

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Express.js + Node.js
- **Database**: Mock Data (Google Sheets ready)
- **Bot**: Telegram Bot API
- **Map**: Leaflet + OpenStreetMap

## Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn

### Local Development

```bash
# Backend
cd backend
npm install
npm run dev    # http://localhost:3001

# Frontend
cd frontend
npm install
npm run dev    # http://localhost:5173
```

### Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Supervisor | supervisor | super123 |
| Helpdesk | helpdesk | help123 |
| Guest | guest | guest123 |

## Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Backend (Railway)
```bash
cd backend
# Push to Railway connected repo
```

## Environment Variables

### Backend (.env)
```
PORT=3001
JWT_SECRET=your-secret-key
TELEGRAM_BOT_TOKEN=your-bot-token
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.railway.app/api
```

## Features

- 🔐 JWT Authentication with Role-Based Access
- 📊 Dashboard with Real-time Stats
- 🗺️ Leaflet Map for Technician Tracking
- 📋 Order Management with Assignment
- 👷 Technician Ranking System
- 📱 Telegram Bot Integration
- 📊 Analytics & Reports

## License

MIT
