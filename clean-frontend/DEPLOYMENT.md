# 🎨 SIDDHI Frontend - Netlify Deployment Guide

## 📋 Overview
This is the frontend repository for SIDDHI restaurant application, ready for deployment on Netlify.

## 🗂️ Repository Structure
```
siddhi-frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── lib/
├── public/
├── package.json
├── package-lock.json
├── vite.config.js
├── netlify.toml
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── .env.production
└── README.md
```

## 🌐 Deploy to Netlify

### Step 1: Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Connect your GitHub account

### Step 2: Create New Site
1. Click "New site from Git"
2. Choose GitHub
3. Select your `siddhi-frontend` repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: Leave empty

### Step 3: Set Environment Variables
Go to Site settings → Environment variables and add:
```
VITE_API_URL=https://siddhi-backend-xxxx.onrender.com/api
VITE_SUPABASE_URL=https://imhkrycglxvjlpseieqv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGtyeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDI1NjcsImV4cCI6MjA3Mzc3ODU2N30.Lc2j8sEFCElNARu3JZet53Z6Yn50X1e3snM5yHlg36E
VITE_APP_NAME=SIDDHI
VITE_APP_DESCRIPTION=BITE INTO HAPPINESS
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### Step 4: Deploy
1. Click "Deploy site"
2. Wait for deployment (2-5 minutes)
3. Note your frontend URL: `https://siddhi-frontend-xxxx.netlify.app`

## 🧪 Test Deployment
1. Visit your Netlify URL
2. Check if menu loads
3. Test admin panel at `/admin`
4. Test order placement

## 🔄 Update Backend CORS
After frontend deployment, update your Render backend environment variables:
```
FRONTEND_URL=https://siddhi-frontend-xxxx.netlify.app
CORS_ORIGIN=https://siddhi-frontend-xxxx.netlify.app
```

## 📝 Important Notes
- Update `VITE_API_URL` with your actual Render backend URL
- Never commit `.env` files to GitHub
- The app includes admin panel at `/admin` route
- All static assets are optimized for production
