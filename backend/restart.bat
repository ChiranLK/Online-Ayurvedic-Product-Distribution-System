@echo off
echo Stopping all Node.js processes...
taskkill /F /IM node.exe /T
echo All Node.js processes stopped.
echo.
echo Starting server...
npm run dev
