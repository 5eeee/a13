@echo off
chcp 65001 >nul
cd /d "%~dp0" || exit /b 1
title Бюро A13
if not exist "setup-and-run.ps1" (
  echo [Ошибка] В этой папке нет setup-and-run.ps1
  echo Положите файл в корень клонированного проекта.
  pause
  exit /b 1
)
echo   Бюро A13 - одна волна: npm install, API, сайт
echo   Окно можно свернуть. Закроете - остановите сервисы.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-and-run.ps1"
echo.
if errorlevel 1 (
  echo [Завершено с кодом %ERRORLEVEL%]
  pause
)
