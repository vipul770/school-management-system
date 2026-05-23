@echo off
REM PostgreSQL Database Setup Script for Windows
REM Created: 2024-12-07
REM Description: Setup PostgreSQL database for School Management System

echo Setting up PostgreSQL database for School Management System...
echo.

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: PostgreSQL client (psql) not found!
    echo Please install PostgreSQL and add it to your PATH
    echo Download from: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo PostgreSQL client found successfully.
echo.

REM Set database connection parameters
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=postgres
set DB_USER=postgres

REM Get database password
echo Please enter database password for user %DB_USER%:
set /p DB_PASSWORD=

echo.
echo Testing database connection...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo ERROR: Cannot connect to PostgreSQL server!
    echo Please check:
    echo   1. PostgreSQL service is running
    echo   2. Connection parameters are correct
    echo   3. User exists and has proper permissions
    pause
    exit /b 1
)

echo Database connection successful!
echo.

REM Create database
echo Creating database: %DB_NAME%
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "CREATE DATABASE %DB_NAME%;" 2>nul
if errorlevel 1 (
    echo WARNING: Database might already exist or creation failed
    echo Continuing with setup...
) else (
    echo Database created successfully!
)
echo.

REM Connect to the database and run setup scripts
echo.
echo Step 1: Creating database schema...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%~dp0\postgresql_schema.sql"
if errorlevel 1 (
    echo ERROR: Failed to create database schema!
    pause
    exit /b 1
)
echo Database schema created successfully!

echo.
echo Step 2: Running database migrations...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%~dp0\migrations.sql"
if errorlevel 1 (
    echo ERROR: Failed to run migrations!
    pause
    exit /b 1
)
echo Database migrations completed successfully!

echo.
echo Step 3: Loading sample data (optional)...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%~dp0\sample_data.sql" 2>nul
if errorlevel 1 (
    echo WARNING: Failed to load sample data (this is optional)
) else (
    echo Sample data loaded successfully!
)
echo.

REM Verify setup
echo.
echo Verifying database setup...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';" 2>nul
if not errorlevel 1 (
    echo Database setup completed successfully!
    echo.
    echo Tables created: Check above for count
    echo.
    echo You can now start the backend application:
    echo   cd backend
    echo   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
) else (
    echo ERROR: Database verification failed!
    pause
    exit /b 1
)

echo.
echo Setup completed! Press any key to exit...
pause >nul
