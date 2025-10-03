# 🚀 SIDDHI Restaurant - Local Development Setup Commands

## 📋 Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git (for version control)

## 🔧 Step-by-Step Setup Commands

### 1. Navigate to Project Directory
```bash
cd "/Users/ankitsaini/Desktop/pro copy 4  copy"
```

### 2. Setup Backend (Terminal 1)

#### Install Dependencies
```bash
cd clean-backend
npm install
```

#### Setup Environment Variables
```bash
# Copy production env to development env
cp .env.production .env

# Edit the .env file for local development
# Change these values:
# PORT=5000
# NODE_ENV="development" 
# FRONTEND_URL="http://localhost:5173"
```

#### Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed the database with initial data
npm run db:seed
```

#### Start Backend Server
```bash
npm run dev
```
**Backend will run on**: `http://localhost:5000`

### 3. Setup Frontend (Terminal 2)

#### Install Dependencies
```bash
cd clean-frontend
npm install
```

#### Setup Environment Variables
```bash
# Copy production env to development env
cp .env.production .env

# Edit the .env file for local development
# Change this value:
# VITE_API_URL=http://localhost:5000/api
```

#### Start Frontend Server
```bash
npm run dev
```
**Frontend will run on**: `http://localhost:5173`

## 🧪 Test Your Setup

### 1. Test Backend
```bash
# Health check
curl http://localhost:5000/health

# Test menu API
curl http://localhost:5000/api/menu?store=siddhi
```

### 2. Test Frontend
- Open browser: `http://localhost:5173`
- Check if menu loads
- Test admin panel: `http://localhost:5173/admin`

## 📝 Environment Variables to Update

### Backend (.env)
```env
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🗂️ Project Structure
```
pro copy 4 copy/
├── clean-backend/          # Backend application
│   ├── src/               # Source code
│   ├── prisma/            # Database schema
│   ├── package.json       # Dependencies
│   └── .env              # Environment variables
├── clean-frontend/         # Frontend application
│   ├── src/               # React components
│   ├── public/            # Static assets
│   ├── package.json       # Dependencies
│   └── .env              # Environment variables
└── [deployment guides]    # Documentation
```

## 🚨 Important Notes

1. **Two Terminals Required**: Run backend and frontend in separate terminals
2. **Database**: Uses Supabase PostgreSQL (already configured)
3. **Ports**: Backend (5000), Frontend (5173)
4. **Environment**: Update .env files for local development
5. **Dependencies**: Install in both folders before running

## 🔧 Troubleshooting

### Backend Issues
```bash
# If Prisma issues:
npx prisma generate
npx prisma db push

# If port already in use:
# Change PORT in .env file
```

### Frontend Issues
```bash
# If build issues:
npm install
npm run dev

# If API connection issues:
# Check VITE_API_URL in .env
```

## 🎯 Expected Results

After setup:
- **Backend**: `http://localhost:5000` ✅
- **Frontend**: `http://localhost:5173` ✅
- **Admin Panel**: `http://localhost:5173/admin` ✅
- **Database**: Connected to Supabase ✅

## 🚀 Next Steps

Once local development is working:
1. Test all features
2. Create GitHub repositories
3. Deploy to Render (backend)
4. Deploy to Netlify (frontend)
5. Update CORS settings

Your SIDDHI restaurant application will be ready for production! 🎉
