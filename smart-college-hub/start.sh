#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Smart College Resource Hub — Local Dev Startup Script
# Usage: chmod +x start.sh && ./start.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

echo -e "${BLUE}"
echo "  ╔═══════════════════════════════════════════════╗"
echo "  ║   Smart College Resource Hub — GPC Waidhan   ║"
echo "  ║   RGPV University                             ║"
echo "  ╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Backend ──────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[1/4] Setting up Python backend...${NC}"

cd backend

if [ ! -d "venv" ]; then
  echo "  Creating virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate

echo "  Installing dependencies..."
pip install -r requirements.txt -q

if [ ! -f ".env" ]; then
  echo "  Creating .env from example..."
  cp .env.example .env
fi

echo -e "${GREEN}  ✓ Backend dependencies ready${NC}"

echo -e "${YELLOW}[2/4] Seeding database...${NC}"
python seed_data.py
echo -e "${GREEN}  ✓ Database seeded${NC}"

echo -e "${YELLOW}[3/4] Starting FastAPI backend on port 8000...${NC}"
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo -e "${GREEN}  ✓ Backend started (PID: $BACKEND_PID)${NC}"

cd ..

# ── Frontend ─────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[4/4] Setting up React frontend...${NC}"

cd frontend

if [ ! -d "node_modules" ]; then
  echo "  Installing npm packages..."
  npm install
fi

echo -e "${GREEN}  ✓ Frontend dependencies ready${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎓 College Resource Hub is starting!${NC}"
echo ""
echo -e "  Frontend:  ${BLUE}http://localhost:5173${NC}"
echo -e "  Backend:   ${BLUE}http://localhost:8000${NC}"
echo -e "  API Docs:  ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo -e "  Admin:     ${YELLOW}admin@gpcwaidhan.ac.in / Admin@123${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""

npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null; echo 'Servers stopped.'" EXIT
