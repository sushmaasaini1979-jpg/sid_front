# 🚀 Complete Deployment Guide - SIDDHI Food Ordering System

## 📋 Prerequisites
- GitHub account
- Render account (free tier available)
- Netlify account (free tier available)
- Supabase project (already set up)

---

## 🔧 Part 1: Backend Deployment on Render

### Step 1: Prepare Repository
1. **Create a new GitHub repository** (if not already done)
2. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/siddhi-food-ordering.git
   git push -u origin main
   ```

### Step 2: Deploy Backend on Render

#### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your GitHub account

#### 2.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your repository: `siddhi-food-ordering`

#### 2.3 Configure Backend Service
**Basic Settings:**
- **Name**: `siddhi-backend`
- **Environment**: `Node`
- **Region**: `Oregon (US West)`
- **Branch**: `main`
- **Root Directory**: `siddhi-backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npx prisma generate && npx prisma db push`
- **Start Command**: `npm start`

**Environment Variables:**
Add these environment variables in Render dashboard:

```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:chhavi@63980@db.imhkrycglxvjlpseieqv.supabase.co:5432/postgres
SUPABASE_URL=https://imhkrycglxvjlpseieqv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGtyeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDI1NjcsImV4cCI6MjA3Mzc3ODU2N30.Lc2j8sEFCElNARu3JZet53Z6Yn50X1e3snM5yHlg36E
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGtyeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIwMjU2NywiZXhwIjoyMDczNzc4NTY3fQ.Y9V4pclXXUN3RZymOPqvGleXSUqE-NCUoDcMZQcqu6o
JWT_SECRET=your-super-secret-jwt-key-for-production-change-this
PORT=10000
FRONTEND_URL=https://your-netlify-app.netlify.app
```

#### 2.4 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. Note your backend URL: `https://your-app-name.onrender.com`

---

## 🌐 Part 2: Frontend Deployment on Netlify

### Step 1: Prepare Frontend
1. **Update frontend environment** with your Render backend URL
2. **Build the frontend** locally to test:
   ```bash
   cd siddhi-frontend
   npm run build
   ```

### Step 2: Deploy Frontend on Netlify

#### 2.1 Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Connect your GitHub account

#### 2.2 Create New Site
1. Click **"New site from Git"**
2. Choose **"GitHub"**
3. Select your repository: `siddhi-food-ordering`

#### 2.3 Configure Frontend Build
**Build Settings:**
- **Base directory**: `siddhi-frontend`
- **Build command**: `npm run build`
- **Publish directory**: `siddhi-frontend/dist`
- **Node version**: `18`

**Environment Variables:**
Add these environment variables in Netlify dashboard:

```
VITE_API_URL=https://your-render-app.onrender.com/api
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
VITE_SUPABASE_URL=https://imhkrycglxvjlpseieqv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGtyeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDI1NjcsImV4cCI6MjA3Mzc3ODU2N30.Lc2j8sEFCElNARu3JZet53Z6Yn50X1e3snM5yHlg36E
VITE_APP_NAME=SIDDHI
VITE_APP_DESCRIPTION=BITE INTO HAPPINESS
```

#### 2.4 Deploy
1. Click **"Deploy site"**
2. Wait for deployment to complete (2-5 minutes)
3. Note your frontend URL: `https://your-app-name.netlify.app`

---

## 🔄 Part 3: Update Configuration

### Step 1: Update Backend with Frontend URL
1. Go to your Render dashboard
2. Update the `FRONTEND_URL` environment variable with your Netlify URL
3. Redeploy the backend

### Step 2: Update Frontend with Backend URL
1. Go to your Netlify dashboard
2. Update the `VITE_API_URL` environment variable with your Render URL
3. Redeploy the frontend

---

## 📁 Files Required for Deployment

### Backend Files (siddhi-backend/):
```
siddhi-backend/
├── src/
│   ├── server.js
│   ├── lib/
│   └── routes/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── package.json
├── package-lock.json
├── render.yaml (optional)
└── env.production.example
```

### Frontend Files (siddhi-frontend/):
```
siddhi-frontend/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── lib/
├── public/
├── package.json
├── package-lock.json
├── netlify.toml
├── vite.config.js
└── env.production.example
```

---

## 🧪 Testing Your Deployment

### Backend Testing:
1. **Health Check**: `https://your-backend.onrender.com/health`
2. **API Test**: `https://your-backend.onrender.com/api/menu?store=siddhi`

### Frontend Testing:
1. **Homepage**: `https://your-frontend.netlify.app`
2. **Admin Panel**: `https://your-frontend.netlify.app/admin`
3. **Menu**: `https://your-frontend.netlify.app/menu`

---

## 🔧 Troubleshooting

### Common Issues:

#### Backend Issues:
- **Build Fails**: Check Node version (should be 18+)
- **Database Connection**: Verify DATABASE_URL is correct
- **CORS Errors**: Check FRONTEND_URL environment variable

#### Frontend Issues:
- **API Calls Fail**: Check VITE_API_URL is correct
- **Build Fails**: Check all dependencies are in package.json
- **Environment Variables**: Ensure all VITE_ variables are set

### Debug Commands:
```bash
# Check backend logs in Render dashboard
# Check frontend build logs in Netlify dashboard

# Local testing:
cd siddhi-backend && npm start
cd siddhi-frontend && npm run build && npm run preview
```

---

## 🎉 Success Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Netlify
- [ ] Environment variables configured
- [ ] Database connection working
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] Admin panel accessible
- [ ] Real-time features working

---

## 📞 Support

If you encounter any issues:
1. Check the deployment logs in Render/Netlify dashboards
2. Verify all environment variables are set correctly
3. Test API endpoints manually
4. Check browser console for frontend errors

**Your SIDDHI Food Ordering System is now live! 🎉**
