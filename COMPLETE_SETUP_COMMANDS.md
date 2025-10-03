# 🚀 SIDDHI Restaurant - Complete Local Setup Commands

## 📋 Prerequisites
- Node.js 18+ installed
- Two terminal windows/tabs

## 🔧 Complete Setup Commands

### **TERMINAL 1 - Backend Setup**

```bash
# Navigate to project directory
cd "/Users/ankitsaini/Desktop/pro copy 4  copy/clean-backend"

# Install dependencies
npm install

# Create local environment file
echo 'DATABASE_URL="postgresql://postgres:chhavi@63980@db.imhkrycglxvjlpseieqv.supabase.co:5432/postgres"
SUPABASE_URL="https://imhkrycglxvjlpseieqv.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGtyeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDI1NjcsImV4cCI6MjA3Mzc3ODU2N30.Lc2j8sEFCElNARu3JZet53Z6Yn50X1e3snM5yHlg36E"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGtyeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIwMjU2NywiZXhwIjoyMDczNzc4NTY3fQ.Y9V4pclXXUN3RZymOPqvGleXSUqE-NCUoDcMZQcqu6o"
JWT_SECRET="your-super-secret-jwt-key-for-development"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"' > .env

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database with store data
npm run db:seed

# Start backend server
npm run dev
```

**Backend will run on**: `http://localhost:5000`

### **TERMINAL 2 - Frontend Setup**

```bash
# Navigate to project directory (new terminal)
cd "/Users/ankitsaini/Desktop/pro copy 4  copy/clean-frontend"

# Install dependencies
npm install

# Create local environment file
echo 'VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://imhkrycglxvjlpseieqv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGtyeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDI1NjcsImV4cCI6MjA3Mzc3ODU2N30.Lc2j8sEFCElNARu3JZet53Z6Yn50X1e3snM5yHlg36E
VITE_APP_NAME=SIDDHI
VITE_APP_DESCRIPTION=BITE INTO HAPPINESS
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id' > .env

# Start frontend server
npm run dev
```

**Frontend will run on**: `http://localhost:3000` (or the port shown in terminal)

## 🧪 Test Your Setup

### **Test Backend API**
```bash
# Health check
curl "http://localhost:5000/health"

# Test menu API
curl "http://localhost:5000/api/menu?store=siddhi"
```

### **Test Frontend**
- Open browser: `http://localhost:3000` (or port shown in terminal)
- Admin panel: `http://localhost:3000/admin`

## 📝 Expected Results

After running these commands:
- ✅ Backend: `http://localhost:5000` (with seeded database)
- ✅ Frontend: `http://localhost:3000` (or shown port)
- ✅ Database: Connected to Supabase with store data
- ✅ No "Store Not Found" error
- ✅ Menu displays correctly

## 🚨 Important Notes

1. **Two terminals required** - run backend and frontend separately
2. **Port consistency** - Backend on 5000, Frontend connects to 5000
3. **Database seeded** - Store "siddhi" and menu items created
4. **Environment files** - Properly configured for local development

## 🔧 Troubleshooting

### If Backend Port Issues:
```bash
# Check if port 5000 is available
lsof -i :5000

# If occupied, change PORT in backend .env file
```

### If Frontend Port Issues:
```bash
# Vite will automatically find available port
# Check terminal output for actual port
```

## 🎯 Final URLs

- **Frontend**: `http://localhost:3000` (or shown port)
- **Backend**: `http://localhost:5000`
- **Admin Panel**: `http://localhost:3000/admin`
- **API Health**: `http://localhost:5000/health`

Your SIDDHI restaurant application will be running perfectly! 🎉
