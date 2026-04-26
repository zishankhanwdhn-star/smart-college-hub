@echo off
echo.
echo  ============================================
echo   Smart College Resource Hub - GPC Waidhan
echo   RGPV University
echo  ============================================
echo.

:: ── Backend ─────────────────────────────────────────────────────────────────
echo [1/4] Setting up Python backend...
cd backend

if not exist "venv" (
    echo   Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

echo   Installing dependencies...
pip install -r requirements.txt -q

if not exist ".env" (
    echo   Creating .env from example...
    copy .env.example .env
)

echo [2/4] Seeding database...
python seed_data.py

echo [3/4] Starting FastAPI backend on port 8000...
start "College Hub Backend" cmd /k "venv\Scripts\activate && uvicorn main:app --reload --port 8000"

cd ..

:: ── Frontend ─────────────────────────────────────────────────────────────────
echo [4/4] Starting React frontend...
cd frontend

if not exist "node_modules" (
    echo   Installing npm packages...
    npm install
)

echo.
echo  =============================================
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo   Admin:     admin@gpcwaidhan.ac.in / Admin@123
echo  =============================================
echo.

start "College Hub Frontend" cmd /k "npm run dev"
cd ..

echo Both servers started! Open http://localhost:5173
pause
