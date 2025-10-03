# 🚀 SIDDHI Restaurant - Repository Setup Guide

## 📋 Overview
This guide will help you set up two separate GitHub repositories for deploying SIDDHI restaurant application:
- **Backend**: Deploy to Render
- **Frontend**: Deploy to Netlify

## 🗂️ Clean Repository Structure

### Backend Repository (`siddhi-backend`)
```
siddhi-backend/
├── src/
│   ├── server.js
│   ├── lib/
│   │   ├── realtime.js
│   │   └── supabase.js
│   └── routes/
│       ├── admin-supabase.js
│       ├── admin.js
│       ├── auth.js
│       ├── coupons.js
│       ├── menu.js
│       ├── orders.js
│       └── payments.js
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── Dockerfile
├── render.yaml
├── healthcheck.js
├── package.json
├── package-lock.json
├── .env.production
├── .gitignore
├── DEPLOYMENT.md
└── README.md
```

### Frontend Repository (`siddhi-frontend`)
```
siddhi-frontend/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   ├── BottomNavigation.jsx
│   │   ├── CartDrawer.jsx
│   │   ├── CategoryFilter.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── MenuItemCard.jsx
│   │   ├── PhonePeQRPayment.jsx
│   │   ├── SearchBar.jsx
│   │   └── Sidebar.jsx
│   ├── pages/
│   │   ├── admin/
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Landing.jsx
│   │   ├── Menu.jsx
│   │   ├── OrderStatus.jsx
│   │   └── PaymentComplete.jsx
│   ├── hooks/
│   │   └── useRealtimeOrders.js
│   ├── lib/
│   │   ├── api.js
│   │   └── socket.js
│   ├── store/
│   │   └── store.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   └── qr-code.png
├── package.json
├── package-lock.json
├── vite.config.js
├── netlify.toml
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── .env.production
├── .gitignore
├── DEPLOYMENT.md
└── README.md
```

## 🔧 Setup Commands

### 1. Create Backend Repository
```bash
# Create new GitHub repository: siddhi-backend
# Clone it locally
git clone https://github.com/yourusername/siddhi-backend.git
cd siddhi-backend

# Copy files from clean-backend folder
cp -r /path/to/clean-backend/* .

# Initial commit
git add .
git commit -m "Initial backend setup for Render deployment"
git push origin main
```

### 2. Create Frontend Repository
```bash
# Create new GitHub repository: siddhi-frontend
# Clone it locally
git clone https://github.com/yourusername/siddhi-frontend.git
cd siddhi-frontend

# Copy files from clean-frontend folder
cp -r /path/to/clean-frontend/* .

# Initial commit
git add .
git commit -m "Initial frontend setup for Netlify deployment"
git push origin main
```

## 🚀 Deployment Order

1. **Deploy Backend First** (Render)
   - Follow `clean-backend/DEPLOYMENT.md`
   - Note the backend URL

2. **Deploy Frontend Second** (Netlify)
   - Follow `clean-frontend/DEPLOYMENT.md`
   - Update API URL with backend URL

3. **Update CORS Settings**
   - Update backend CORS with frontend URL
   - Redeploy backend

## 📝 Files Removed/Cleaned

### Backend Cleanup:
- ❌ Removed: `schema.sqlite.prisma` (duplicate)
- ❌ Removed: `schema.supabase.prisma` (duplicate)
- ❌ Removed: `dev.db` (local database)
- ❌ Removed: `node_modules/` (will be installed on deployment)
- ❌ Removed: `test-server.js` (development only)
- ❌ Removed: `env.example` (replaced with .env.production)

### Frontend Cleanup:
- ❌ Removed: `node_modules/` (will be installed on deployment)
- ❌ Removed: `env.example` (replaced with .env.production)

## 🔍 Verification Checklist

### Backend Repository:
- [ ] All source files in `src/`
- [ ] Prisma schema and seed file
- [ ] Dockerfile and render.yaml
- [ ] package.json with correct scripts
- [ ] .env.production with Supabase config
- [ ] .gitignore excludes sensitive files

### Frontend Repository:
- [ ] All React components and pages
- [ ] Vite configuration
- [ ] Netlify configuration
- [ ] Tailwind and PostCSS configs
- [ ] package.json with build scripts
- [ ] .env.production with API URLs
- [ ] .gitignore excludes build files

## 🎯 Final URLs
After deployment:
- **Frontend**: `https://siddhi-frontend-xxxx.netlify.app`
- **Backend**: `https://siddhi-backend-xxxx.onrender.com`
- **Admin Panel**: `https://siddhi-frontend-xxxx.netlify.app/admin`

## 🚨 Important Notes
1. **Separate Repositories**: You MUST create two separate GitHub repositories
2. **Environment Variables**: Never commit `.env` files to GitHub
3. **Database**: Supabase database is already configured
4. **CORS**: Update CORS settings after both deployments
5. **SSL**: Both Render and Netlify provide free SSL certificates
