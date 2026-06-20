@echo off
title Ourside Fast Preview
cd /d "%~dp0"

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 75; Start-Process 'http://localhost:3000'"
npm run preview

echo.
echo Ourside server stopped. Press any key to close this window.
pause >nul
