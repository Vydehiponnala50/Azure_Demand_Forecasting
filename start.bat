@echo off
echo Starting Azure MLOps Full Project...
echo ==============================================

echo [1] Checking and Installing Python Backend Dependencies...
python -m pip install -r requirements.txt

echo [2] Starting FastAPI Backend...
start cmd /k "uvicorn app.main:app --host 0.0.0.0 --port 10000 --reload"

echo [3] Checking and Installing Frontend NextJS/React Dependencies...
cd frontend
call npm install

echo [4] Starting Frontend UI Demo...
start cmd /k "npm run dev"

echo ==============================================
echo Project is fully working! 
echo Frontend is launching shortly at: http://localhost:5173
echo Backend API is running at: http://localhost:10000
echo ==============================================
pause
