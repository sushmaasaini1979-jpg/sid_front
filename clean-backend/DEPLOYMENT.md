# 🚀 SIDDHI Backend - Render Deployment Guide

## 📋 Overview
This is the backend repository for SIDDHI restaurant application, ready for deployment on Render.

## 🗂️ Repository Structure
```
siddhi-backend/
├── src/
│   ├── server.js
│   ├── lib/
│   └── routes/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── Dockerfile
├── render.yaml
├── healthcheck.js
├── package.json
├── package-lock.json
├── .env.production
└── README.md
```

## 🌐 Deploy to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your GitHub account

### Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your `siddhi-backend` repository
3. Configure settings:
   - **Name**: `siddhi-backend`
   - **Environment**: `Docker`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Dockerfile Path**: `Dockerfile`

### Step 3: Set Environment Variables
Go to Environment tab and add:
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres:chhavi@63980@db.imhkrycglxvjlpseieqv.supabase.co:5432/postgres
SUPABASE_URL=https://imhkrycglxvjlpseieqv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGtyeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDI1NjcsImV4cCI6MjA3Mzc3ODU2N30.Lc2j8sEFCElNARu3JZet53Z6Yn50X1e3snM5yHlg36E
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGtyeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIwMjU2NywiZXhwIjoyMDczNzc4NTY3fQ.Y9V4pclXXUN3RZymOPqvGleXSUqE-NCUoDcMZQcqu6o
FRONTEND_URL=https://your-netlify-app.netlify.app
CORS_ORIGIN=https://your-netlify-app.netlify.app
JWT_SECRET=your-super-secret-jwt-key-for-production-change-this
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://siddhi-backend-xxxx.onrender.com`

## 🧪 Test Deployment
```bash
curl https://siddhi-backend-xxxx.onrender.com/health
curl https://siddhi-backend-xxxx.onrender.com/api/menu?store=siddhi
```

## 🔧 Database Setup
After deployment, run these commands locally to seed your Supabase database:
```bash
npx prisma db push
npx prisma db seed
```

## 📝 Important Notes
- Update `FRONTEND_URL` and `CORS_ORIGIN` with your actual Netlify URL after frontend deployment
- Never commit `.env` files to GitHub
- The database is already configured for Supabase PostgreSQL
