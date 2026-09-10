@echo off
cd /d "%~dp0"

IF NOT EXIST .env (
  copy .env.example .env >nul
  echo.
  echo Created .env for you. Open it and paste your free Groq API key,
  echo then run start.bat again.
  echo Get a key at: https://console.groq.com  (API Keys -^> Create API Key)
  echo.
  pause
  exit /b 1
)

findstr /C:"your-free-groq-key-here" .env >nul
IF %ERRORLEVEL% EQU 0 (
  echo.
  echo .env still has the placeholder key. Open .env and paste your real
  echo Groq API key in place of 'your-free-groq-key-here', then run start.bat again.
  echo.
  pause
  exit /b 1
)

IF NOT EXIST node_modules (
  echo Installing dependencies ^(first run only^)...
  call npm install
)

echo Starting Hawk Sight...
call npm start
pause
