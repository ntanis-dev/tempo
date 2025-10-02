@echo off
echo Setting up Tempo Dashboard Server...
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env file from example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Edit .env file with your configuration:
    echo - Database password
    echo - Admin credentials
    echo - JWT secret
    echo.
    pause
)

REM Install dependencies
echo Installing dependencies...
call npm install
echo.

echo Setup complete!
echo.
echo Next steps:
echo 1. Make sure MariaDB is installed and running
echo 2. Edit .env with your configuration
echo 3. Run: npm start (database will be created automatically)
echo.
pause