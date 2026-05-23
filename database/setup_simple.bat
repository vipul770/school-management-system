@echo off
echo Starting PostgreSQL database setup...

set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=postgres
set DB_USER=postgres

echo Please enter database password for user %DB_USER%:
set /p DB_PASSWORD=

echo.
echo Testing database connection...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo ERROR: Cannot connect to PostgreSQL server!
    pause
    exit /b 1
)

echo Database connection successful!
echo.

echo Creating school_management database...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "CREATE DATABASE school_management;" >nul 2>&1
if errorlevel 1 (
    echo WARNING: Database might already exist
) else (
    echo Database created successfully!
)

echo.
echo Running database schema...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d school_management -f postgresql_schema.sql
if errorlevel 1 (
    echo ERROR: Failed to create database schema!
    pause
    exit /b 1
)
echo Database schema created successfully!

echo.
echo Running database migrations...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d school_management -f migrations.sql
if errorlevel 1 (
    echo ERROR: Failed to run migrations!
    pause
    exit /b 1
)
echo Database migrations completed successfully!

echo.
echo Loading sample data...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d school_management -f sample_data.sql >nul 2>&1
if errorlevel 1 (
    echo WARNING: Failed to load sample data
) else (
    echo Sample data loaded successfully!
)

echo.
echo Verifying setup...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d school_management -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';" >nul 2>&1
if not errorlevel 1 (
    echo Database setup completed successfully!
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
