#!/bin/sh
set -e

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SSBS Frontend Entrypoint
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 1. CHECK FOR SOURCE CODE
if [ ! -f "package.json" ]; then
    echo " "
    echo "🛑 SSBS Frontend: 'package.json' not found in /app"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "   Container started in IDLE MODE to allow scaffolding."
    echo " "
    echo "   TO INITIALIZE THE REACT FRONTEND:"
    echo "   Run: make scaffold-frontend"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Keep container alive for 'exec' commands
    sleep infinity
fi

# 2. INSTALL DEPENDENCIES
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ] || [ ! -x "node_modules/.bin/vite" ]; then
    echo "   Installing modules (or repairing incomplete install)..."
    npm install
else
    echo "   Node modules found."
fi

# 3. START SERVER
echo "🚀 Starting Vite Dev Server..."
exec npm run dev -- --host
