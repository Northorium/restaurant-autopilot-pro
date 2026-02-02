#!/bin/bash

echo "🚂 Railway Deployment Setup"
echo "============================"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null
then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
else
    echo "✅ Railway CLI already installed"
fi

echo ""
echo "🔐 Logging into Railway..."
railway login

echo ""
echo "🚀 Initializing Railway project..."
railway init

echo ""
echo "⚙️  Setting environment variables..."
echo ""
echo "Please set these in Railway dashboard:"
echo "  - JWT_SECRET (required)"
echo "  - NODE_ENV=production"
echo "  - FRONTEND_URL (your frontend domain)"
echo ""

read -p "Press Enter to open Railway dashboard..."
railway open

echo ""
echo "📤 Ready to deploy!"
echo "Run: railway up"
echo ""
