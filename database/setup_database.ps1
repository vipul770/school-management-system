# PostgreSQL Database Setup Script for PowerShell
# Created: 2024-12-07
# Description: Setup PostgreSQL database for School Management System

Write-Host "Setting up PostgreSQL database for School Management System..." -ForegroundColor Green

# Check if PostgreSQL is installed
try {
    psql --version 2>$null
    Write-Host "PostgreSQL client found successfully." -ForegroundColor Green
} catch {
    Write-Host "ERROR: PostgreSQL client (psql) not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL and add it to your PATH" -ForegroundColor Yellow
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Read-Host "Press any key to exit..."
    exit 1
}

# Set database connection parameters
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "postgres"
$DB_USER = "postgres"

# Get database password securely
$DB_PASSWORD = Read-Host "Please enter database password for user $DB_USER:" -AsSecureString

Write-Host ""

# Test database connection
Write-Host "Testing database connection..." -ForegroundColor Yellow
try {
    $result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT 1;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database connection successful!" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Cannot connect to PostgreSQL server!" -ForegroundColor Red
        Write-Host "Please check:" -ForegroundColor Yellow
        Write-Host "  1. PostgreSQL service is running" -ForegroundColor Yellow
        Write-Host "  2. Connection parameters are correct" -ForegroundColor Yellow
        Write-Host "  3. User exists and has proper permissions" -ForegroundColor Yellow
        Read-Host "Press any key to exit..."
        exit 1
    }
} catch {
    Write-Host "ERROR: Database connection failed!" -ForegroundColor Red
    Write-Host $_" -ForegroundColor Red
    Read-Host "Press any key to exit..."
    exit 1
}

# Create database
Write-Host ""
Write-Host "Creating database: $DB_NAME" -ForegroundColor Yellow
try {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database created successfully!" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Database might already exist or creation failed" -ForegroundColor Yellow
        Write-Host "Continuing with setup..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: Failed to create database!" -ForegroundColor Red
    Write-Host $_" -ForegroundColor Red
}

# Connect to the database and run setup scripts
Write-Host ""
Write-Host "Step 1: Creating database schema..." -ForegroundColor Yellow
try {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$PSScriptRoot\postgresql_schema.sql"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database schema created successfully!" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Failed to create database schema!" -ForegroundColor Red
        Read-Host "Press any key to exit..."
        exit 1
    }
} catch {
    Write-Host "ERROR: Failed to create database schema!" -ForegroundColor Red
    Write-Host $_" -ForegroundColor Red
    Read-Host "Press any key to exit..."
    exit 1
}

Write-Host ""
Write-Host "Step 2: Running database migrations..." -ForegroundColor Yellow
try {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$PSScriptRoot\migrations.sql"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database migrations completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Failed to run migrations!" -ForegroundColor Red
        Read-Host "Press any key to exit..."
        exit 1
    }
} catch {
    Write-Host "ERROR: Failed to run migrations!" -ForegroundColor Red
    Write-Host $_" -ForegroundColor Red
    Read-Host "Press any key to exit..."
    exit 1
}

Write-Host ""
Write-Host "Step 3: Loading sample data (optional)..." -ForegroundColor Yellow
try {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$PSScriptRoot\sample_data.sql" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Sample data loaded successfully!" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Failed to load sample data (this is optional)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "WARNING: Failed to load sample data (this is optional)" -ForegroundColor Yellow
    Write-Host $_" -ForegroundColor Yellow
}

# Verify setup
Write-Host ""
Write-Host "Verifying database setup..." -ForegroundColor Yellow
try {
    $tableCount = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database setup completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Tables created: $tableCount" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "You can now start the backend application:" -ForegroundColor Green
        Write-Host "  cd backend" -ForegroundColor White
        Write-Host "  python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload" -ForegroundColor White
    } else {
        Write-Host "ERROR: Database verification failed!" -ForegroundColor Red
        Read-Host "Press any key to exit..."
        exit 1
    }
} catch {
    Write-Host "ERROR: Database verification failed!" -ForegroundColor Red
    Write-Host $_" -ForegroundColor Red
    Read-Host "Press any key to exit..."
    exit 1
}

Write-Host ""
Write-Host "Setup completed! Press any key to exit..." -ForegroundColor Green
Read-Host
