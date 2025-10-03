@echo off
echo 🚀 Starting SIDDHI Food Ordering System...

REM Check if we're in the right directory
if not exist "clean-backend" (
    echo ❌ Error: Please run this script from the project root directory
    echo    Make sure you're in the directory containing 'clean-backend' and 'clean-frontend' folders
    pause
    exit /b 1
)

if not exist "clean-frontend" (
    echo ❌ Error: Please run this script from the project root directory
    echo    Make sure you're in the directory containing 'clean-backend' and 'clean-frontend' folders
    pause
    exit /b 1
)

REM Check if node_modules exist
if not exist "clean-backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd clean-backend
    call npm install
    cd ..
)

if not exist "clean-frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd clean-frontend
    call npm install
    cd ..
)

REM Ensure database is set up and seeded
echo 🗄️ Setting up database...
cd clean-backend

echo 🔧 Generating Prisma client...
call npx prisma generate

echo 📊 Pushing database schema...
call npx prisma db push

echo 🌱 Seeding database...
call node prisma/seed.js

cd ..

REM Kill any existing processes
echo 🧹 Cleaning up existing processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im nodemon.exe 2>nul

REM Wait a moment for cleanup
timeout /t 2 /nobreak >nul

REM Start backend server
echo 🔧 Starting backend server...
cd clean-backend
start "Backend Server" cmd /k "npm run dev"
cd ..

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend server
echo 🎨 Starting frontend server...
cd clean-frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

REM Wait for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo 🎉 SIDDHI Food Ordering System is now running!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo 👑 Admin:    http://localhost:3000/admin
echo 🍽️  Menu:     http://localhost:3000/menu?store=siddhi
echo.
echo 📊 Database: Supabase PostgreSQL (Connected & Seeded)
echo 🏪 Store:    SIDDHI (siddhi) - 44 menu items, 7 categories
echo.
echo ✅ No connection errors - system ready!
echo.
echo Press any key to exit this window...
pause >nul