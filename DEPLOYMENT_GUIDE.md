# 🚀 SIDDHI Restaurant - Complete Deployment Guide

## 📋 Overview
This guide will help you deploy your SIDDHI restaurant application to:
- **Backend**: Render (Node.js/Express)
- **Frontend**: Netlify (React/Vite)
- **Database**: Supabase (PostgreSQL)

## 🗂️ Repository Structure Required

You need **TWO separate GitHub repositories**:

### 1. Backend Repository (`siddhi-backend`)
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
├── package.json
├── package-lock.json
├── .env.production
└── README.md
```

### 2. Frontend Repository (`siddhi-frontend`)
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
├── .env.production
└── README.md
```

## 🔧 Step 1: Prepare Backend for Render

### 1.1 Create Backend Repository
```bash
# Create new GitHub repository: siddhi-backend
# Clone it locally
git clone https://github.com/yourusername/siddhi-backend.git
cd siddhi-backend
```

### 1.2 Copy Backend Files
Copy these files from your current project to the new repository:
- `src/` folder
- `prisma/` folder
- `Dockerfile`
- `package.json`
- `package-lock.json`
- `.env.production`

### 1.3 Update package.json (if needed)
Ensure your `package.json` has:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### 1.4 Push to GitHub
```bash
git add .
git commit -m "Initial backend setup for Render deployment"
git push origin main
```

## 🌐 Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your GitHub account

### 2.2 Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your `siddhi-backend` repository
3. Configure settings:
   - **Name**: `siddhi-backend`
   - **Environment**: `Docker`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Dockerfile Path**: `Dockerfile`

### 2.3 Set Environment Variables in Render
Go to Environment tab and add:
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:chhavi%4063980@db.imhkrycglxvjlpseieqv.supabase.co:5432/postgres
SUPABASE_URL=https://imhkrycglxvjlpseieqv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGtyeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDI1NjcsImV4cCI6MjA3Mzc3ODU2N30.Lc2j8sEFCElNARu3JZet53Z6Yn50X1e3snM5yHlg36E
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGtyeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImiYXQiOjE3NTgyMDI1NjcsImV4cCI6MjA3Mzc3ODU2N30.Y9V4pclXXUN3RZymOPqvGleXSUqE-NCUoDcMZQcqu6o
FRONTEND_URL=https://your-netlify-app.netlify.app
CORS_ORIGIN=https://your-netlify-app.netlify.app
```

### 2.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://siddhi-backend-xxxx.onrender.com`

## 🎨 Step 3: Prepare Frontend for Netlify

### 3.1 Create Frontend Repository
```bash
# Create new GitHub repository: siddhi-frontend
# Clone it locally
git clone https://github.com/yourusername/siddhi-frontend.git
cd siddhi-frontend
```

### 3.2 Copy Frontend Files
Copy these files from your current project:
- `src/` folder
- `public/` folder
- `package.json`
- `package-lock.json`
- `vite.config.js`
- `netlify.toml`
- `tailwind.config.js`
- `postcss.config.js`
- `.env.production`

### 3.3 Update .env.production
Update the API URL with your actual Render backend URL:
```
VITE_API_URL=https://siddhi-backend-xxxx.onrender.com/api
```

### 3.4 Push to GitHub
```bash
git add .
git commit -m "Initial frontend setup for Netlify deployment"
git push origin main
```

## 🌐 Step 4: Deploy Frontend to Netlify

### 4.1 Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Connect your GitHub account

### 4.2 Create New Site
1. Click "New site from Git"
2. Choose GitHub
3. Select your `siddhi-frontend` repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: Leave empty

### 4.3 Set Environment Variables in Netlify
Go to Site settings → Environment variables and add:
```
VITE_API_URL=https://siddhi-backend-xxxx.onrender.com/api
VITE_SUPABASE_URL=https://imhkrycglxvjlpseieqv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGtyeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDI1NjcsImV4cCI6MjA3Mzc3ODU2N30.Lc2j8sEFCElNARu3JZet53Z6Yn50X1e3snM5yHlg36E
VITE_APP_NAME=SIDDHI
VITE_APP_DESCRIPTION=BITE INTO HAPPINESS
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### 4.4 Deploy
1. Click "Deploy site"
2. Wait for deployment (2-5 minutes)
3. Note your frontend URL: `https://siddhi-frontend-xxxx.netlify.app`

## 🔄 Step 5: Update Cross-References

### 5.1 Update Backend CORS
1. Go to Render dashboard
2. Update environment variables:
   ```
   FRONTEND_URL=https://siddhi-frontend-xxxx.netlify.app
   CORS_ORIGIN=https://siddhi-frontend-xxxx.netlify.app
   ```
3. Redeploy backend

### 5.2 Update Frontend API URL
1. Go to Netlify dashboard
2. Update environment variable:
   ```
   VITE_API_URL=https://siddhi-backend-xxxx.onrender.com/api
   ```
3. Redeploy frontend

## 🧪 Step 6: Test Deployment

### 6.1 Test Backend
```bash
curl https://siddhi-backend-xxxx.onrender.com/health
curl https://siddhi-backend-xxxx.onrender.com/api/menu?store=siddhi
```

### 6.2 Test Frontend
1. Visit your Netlify URL
2. Check if menu loads
3. Test admin panel
4. Test order placement

## 🔧 Step 7: Database Seeding (Important!)

### 7.1 Seed Production Database
Run this command locally to seed your Supabase database:
```bash
cd siddhi-backend
npx prisma db push
npx prisma db seed
```

## 📝 Files That Will Change

### Backend Changes:
1. **New files created**:
   - `.env.production` - Production environment variables
   - `DEPLOYMENT_GUIDE.md` - This guide

2. **Files to copy to new repository**:
   - All files in `siddhi-backend/` folder

### Frontend Changes:
1. **New files created**:
   - `.env.production` - Production environment variables

2. **Files to copy to new repository**:
   - All files in `siddhi-frontend/` folder

3. **Files that need updates**:
   - `.env.production` - Update API URL after backend deployment

## 🚨 Important Notes

1. **Separate Repositories**: You MUST create two separate GitHub repositories
2. **Environment Variables**: Never commit `.env` files to GitHub
3. **Database**: Your Supabase database will work with both local and production
4. **CORS**: Update CORS settings after both deployments are complete
5. **SSL**: Both Render and Netlify provide free SSL certificates

## 🎯 Final URLs

After deployment, you'll have:
- **Frontend**: `https://siddhi-frontend-xxxx.netlify.app`
- **Backend**: `https://siddhi-backend-xxxx.onrender.com`
- **Admin Panel**: `https://siddhi-frontend-xxxx.netlify.app/admin`

## 🔍 Troubleshooting

### Common Issues:
1. **CORS Errors**: Update CORS_ORIGIN in Render
2. **API Not Found**: Check VITE_API_URL in Netlify
3. **Database Connection**: Verify DATABASE_URL in Render
4. **Build Failures**: Check Node.js version compatibility

### Support:
- Render: [render.com/docs](https://render.com/docs)
- Netlify: [docs.netlify.com](https://docs.netlify.com)
- Supabase: [supabase.com/docs](https://supabase.com/docs)