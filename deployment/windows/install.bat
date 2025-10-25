@echo off
echo Discord Admin Panel - Windows Install
echo ====================================
:: Проверка Node.js
node --version >nul 2>&1 || (
  echo ERROR: Node.js required, install https://nodejs.org/
  exit /b
)
echo Installing dependencies...
cd ..\..\backend && npm install
cd ..\frontend && npm install
echo Installation complete.
pause
