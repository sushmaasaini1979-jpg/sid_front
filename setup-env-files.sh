#!/bin/bash

echo "🚀 Setting up environment files for SIDDHI Food Ordering System..."

# Create backend .env file
echo "📝 Creating backend .env file..."
cat > clean-backend/.env << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:chhavi@63980@db.apbkobhfnmcqqzqeeqss.supabase.co:5432/postgres"

# JWT Secret
JWT_SECRET="siddhi-super-secret-jwt-key-2024"

# Server Configuration
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# Supabase Configuration
SUPABASE_URL="https://imhkrycglxvjlpseieqv.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGtyeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDI1NjcsImV4cCI6MjA3Mzc3ODU2N30.Lc2j8sEFCElNARu3JZet53Z6Yn50X1e3snM5yHlg36E"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGtyeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIwMjU2NywiZXhwIjoyMDczNzc4NTY3fQ.Y9V4pclXXUN3RZymOPqvGleXSUqE-NCUoDcMZQcqu6o"

# CORS
ALLOWED_ORIGINS="http://localhost:3000"
EOF

# Create frontend .env file
echo "📝 Creating frontend .env file..."
cat > clean-frontend/.env << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Supabase Configuration
VITE_SUPABASE_URL=https://imhkrycglxvjlpseieqv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGtyeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDI1NjcsImV4cCI6MjA3Mzc3ODU2N30.Lc2j8sEFCElNARu3JZet53Z6Yn50X1e3snM5yHlg36E

# App Configuration
VITE_APP_NAME=SIDDHI
VITE_APP_DESCRIPTION=BITE INTO HAPPINESS
EOF

echo "✅ Environment files created successfully!"
echo ""
echo "🔧 Next steps after restart:"
echo "1. Run: chmod +x setup-env-files.sh && ./setup-env-files.sh"
echo "2. cd clean-backend && npm install && npm run db:seed"
echo "3. cd ../clean-frontend && npm install"
echo "4. Start backend: cd clean-backend && npm run dev"
echo "5. Start frontend: cd clean-frontend && npm run dev"
echo ""
echo "🎉 Your SIDDHI system will be ready!"
