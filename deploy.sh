#!/bin/bash

# SIDDHI Food Ordering System - Deployment Script
echo "🚀 SIDDHI Deployment Script"
echo "=========================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📁 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy SIDDHI Food Ordering System - $(date)"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Please add your GitHub repository URL:"
    echo "git remote add origin https://github.com/yourusername/siddhi-food-ordering.git"
    echo "Then run: git push -u origin main"
else
    echo "🚀 Pushing to GitHub..."
    git push origin main
fi

echo ""
echo "✅ Deployment files ready!"
echo ""
echo "📋 Next Steps:"
echo "1. Push to GitHub (if not done above)"
echo "2. Deploy Backend on Render:"
echo "   - Go to render.com"
echo "   - Create new Web Service"
echo "   - Connect GitHub repository"
echo "   - Set root directory to 'siddhi-backend'"
echo "   - Add environment variables from env.production.example"
echo ""
echo "3. Deploy Frontend on Netlify:"
echo "   - Go to netlify.com"
echo "   - Create new site from Git"
echo "   - Connect GitHub repository"
echo "   - Set base directory to 'siddhi-frontend'"
echo "   - Add environment variables from env.production.example"
echo ""
echo "📖 See DEPLOYMENT_COMPLETE_GUIDE.md for detailed instructions"
