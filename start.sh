#!/bin/bash
# SynRareAI — Quick Start Script
# Usage: bash start.sh

set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║         SynRareAI — Quick Start          ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Check dependencies ────────────────────────────────────────────────────────
command -v python3 >/dev/null 2>&1 || { echo "❌ python3 not found. Please install Python 3.11+"; exit 1; }
command -v node    >/dev/null 2>&1 || { echo "❌ node not found. Please install Node.js 18+"; exit 1; }
command -v npm     >/dev/null 2>&1 || { echo "❌ npm not found. Please install Node.js 18+"; exit 1; }

echo "✓ Python: $(python3 --version)"
echo "✓ Node:   $(node --version)"
echo ""

# ── Backend setup ─────────────────────────────────────────────────────────────
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt -q
cd ..

# Create upload directory
mkdir -p backend/data/uploads
cp data/sample_patient_data.csv backend/data/uploads/demo.csv 2>/dev/null || true

# ── Frontend setup ────────────────────────────────────────────────────────────
echo "📦 Installing frontend dependencies..."
cd frontend
npm install --silent
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Starting services..."
echo ""

# ── Start backend (background) ────────────────────────────────────────────────
echo "🚀 Starting backend at http://localhost:8000"
cd backend
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

sleep 2

# ── Start frontend ────────────────────────────────────────────────────────────
echo "🌐 Starting frontend at http://localhost:3000"
echo ""
echo "════════════════════════════════════════════"
echo "  Open http://localhost:3000 in your browser"
echo "  Press Ctrl+C to stop both servers"
echo "════════════════════════════════════════════"
echo ""

cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# ── Handle Ctrl+C ─────────────────────────────────────────────────────────────
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

wait
