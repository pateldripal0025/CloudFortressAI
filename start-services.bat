@echo off
title CloudFortress AI Service Orchestrator
echo ====================================================================
echo   🛡️  CloudFortress AI: Elite Service Orchestrator
echo ====================================================================
echo.

echo [1/3] Ensuring MongoDB is running...
net start MongoDB >nul 2>&1
echo   [OK] MongoDB start command executed.

echo.
echo [2/3] Ensuring Redis is running...
net start redis >nul 2>&1
echo   [OK] Redis start command executed.

echo.
echo [3/3] Seeding the MongoDB database with sample data...
cd backend-express
node seed.js
cd ..

echo.
echo ====================================================================
echo   🚀 Launching Frontend, Express Backend, and Python AI Engine...
echo ====================================================================
echo.
npm run dev
