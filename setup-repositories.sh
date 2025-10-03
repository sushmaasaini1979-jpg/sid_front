#!/bin/bash

# SIDDHI Restaurant - Repository Setup Script
# This script helps you prepare separate repositories for deployment

echo "🚀 SIDDHI Restaurant - Repository Setup"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}This script will help you create separate repositories for deployment.${NC}"
echo ""

# Check if we're in the right directory
if [ ! -d "siddhi-backend" ] || [ ! -d "siddhi-frontend" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    echo "Expected structure:"
    echo "  project-root/"
    echo "  ├── siddhi-backend/"
    echo "  └── siddhi-frontend/"
    exit 1
fi

echo -e "${YELLOW}📋 Prerequisites:${NC}"
echo "1. Create TWO new GitHub repositories:"
echo "   - siddhi-backend"
echo "   - siddhi-frontend"
echo ""
echo "2. Have your GitHub username ready"
echo ""

read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${RED}❌ GitHub username is required${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Setting up Backend Repository...${NC}"

# Create backend directory
mkdir -p ../siddhi-backend-deploy
cd ../siddhi-backend-deploy

# Copy backend files
cp -r ../pro\ copy\ 4\ \ copy/siddhi-backend/* .

# Remove unnecessary files
rm -rf node_modules
rm -f .env

echo -e "${GREEN}✅ Backend files copied${NC}"

# Initialize git repository
git init
git add .
git commit -m "Initial backend setup for Render deployment"

echo -e "${YELLOW}📝 Backend repository ready!${NC}"
echo "Next steps:"
echo "1. Create GitHub repository: siddhi-backend"
echo "2. Run these commands:"
echo "   git remote add origin https://github.com/$GITHUB_USERNAME/siddhi-backend.git"
echo "   git push -u origin main"
echo ""

cd ../pro\ copy\ 4\ \ copy

echo -e "${BLUE}🎨 Setting up Frontend Repository...${NC}"

# Create frontend directory
mkdir -p ../siddhi-frontend-deploy
cd ../siddhi-frontend-deploy

# Copy frontend files
cp -r ../pro\ copy\ 4\ \ copy/siddhi-frontend/* .

# Remove unnecessary files
rm -rf node_modules
rm -f .env

echo -e "${GREEN}✅ Frontend files copied${NC}"

# Initialize git repository
git init
git add .
git commit -m "Initial frontend setup for Netlify deployment"

echo -e "${YELLOW}📝 Frontend repository ready!${NC}"
echo "Next steps:"
echo "1. Create GitHub repository: siddhi-frontend"
echo "2. Run these commands:"
echo "   git remote add origin https://github.com/$GITHUB_USERNAME/siddhi-frontend.git"
echo "   git push -u origin main"
echo ""

cd ../pro\ copy\ 4\ \ copy

echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📁 Created directories:${NC}"
echo "  - ../siddhi-backend-deploy/ (for backend)"
echo "  - ../siddhi-frontend-deploy/ (for frontend)"
echo ""
echo -e "${YELLOW}📖 Next Steps:${NC}"
echo "1. Create GitHub repositories"
echo "2. Push code to GitHub"
echo "3. Follow DEPLOYMENT_GUIDE.md for deployment"
echo ""
echo -e "${BLUE}🔗 Quick Commands:${NC}"
echo ""
echo "Backend:"
echo "  cd ../siddhi-backend-deploy"
echo "  git remote add origin https://github.com/$GITHUB_USERNAME/siddhi-backend.git"
echo "  git push -u origin main"
echo ""
echo "Frontend:"
echo "  cd ../siddhi-frontend-deploy"
echo "  git remote add origin https://github.com/$GITHUB_USERNAME/siddhi-frontend.git"
echo "  git push -u origin main"
echo ""
echo -e "${GREEN}Happy Deploying! 🚀${NC}"
