@echo off
setlocal
cd /d "%~dp0"
title MotoPower - Marcimex
node -v >nul 2>&1
if errorlevel 1 (
  echo Instala Node.js antes de utilizar esta aplicacion.
  pause
  exit /b 1
)
if not exist "node_modules\express" (
  echo Faltan dependencias locales. Copia la distribucion completa del juego.
  pause
  exit /b 1
)
if not exist "dist\index.html" (
  echo Falta la version compilada del juego.
  pause
  exit /b 1
)
netstat -aon | find ":5550" | find "LISTENING" >nul
if errorlevel 1 (
  start "MotoPower - Servidor local" /min node server.cjs
  timeout /t 3 /nobreak >nul
)
start "" chrome.exe --kiosk --no-first-run http://127.0.0.1:5550
endlocal
