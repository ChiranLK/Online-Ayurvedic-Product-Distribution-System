@echo off
echo Testing Admin Orders API Endpoint...
echo.

REM Check if node-fetch is installed
IF NOT EXIST "node_modules\node-fetch" (
  echo Installing required dependencies...
  call npm install node-fetch@2
  echo.
)

REM Run the test script
echo Running admin orders API test...
node test-admin-orders.js

echo.
echo Press any key to exit...
pause
