# Simple PostgreSQL Setup Script
Write-Host "Starting PostgreSQL database setup..." -ForegroundColor Green

# Set variables
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "postgres"
$DB_USER = "postgres"

Write-Host "Please enter database password for user $DB_USER:" -ForegroundColor Yellow
$DB_PASSWORD = Read-Host -AsSecureString

Write-Host ""
Write-Host "Step 1: Testing database connection..." -ForegroundColor Yellow
try {
    $result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT 1;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database connection successful!" -ForegroundColor Green
    } else {
        Write-Host "✗ Cannot connect to PostgreSQL server!" -ForegroundColor Red
        Write-Host "Press any key to exit..."
        Read-Host
        exit 1
    }
} catch {
    Write-Host "✗ Database connection failed!" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    Read-Host
    exit 1
}

Write-Host ""
Write-Host "Step 2: Creating school_management database..." -ForegroundColor Yellow
try {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE school_management;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database created successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠ Database might already exist" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed to create database!" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    Read-Host
    exit 1
}

Write-Host ""
Write-Host "Step 3: Creating database schema..." -ForegroundColor Yellow
try {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d school_management -f "$PSScriptRoot\postgresql_schema.sql"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database schema created successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create database schema!" -ForegroundColor Red
        Write-Host "Press any key to exit..."
        Read-Host
        exit 1
    }
} catch {
    Write-Host "✗ Failed to create database schema!" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    Read-Host
    exit 1
}

Write-Host ""
Write-Host "Step 4: Running database migrations..." -ForegroundColor Yellow
try {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d school_management -f "$PSScriptRoot\migrations.sql"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database migrations completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to run migrations!" -ForegroundColor Red
        Write-Host "Press any key to exit..."
        Read-Host
        exit 1
    }
} catch {
    Write-Host "✗ Failed to run migrations!" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    Read-Host
    exit 1
}

Write-Host ""
Write-Host "Step 5: Loading sample data (optional)..." -ForegroundColor Yellow
try {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d school_management -f "$PSScriptRoot\sample_data.sql" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Sample data loaded successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠ Failed to load sample data (this is optional)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Failed to load sample data (this is optional)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 6: Verifying setup..." -ForegroundColor Yellow
try {
    $tableCount = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d school_management -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>$null
    Write-Host "✓ Database setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Tables created: $tableCount" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 You can now start the backend application:" -ForegroundColor Green
    Write-Host "   cd backend" -ForegroundColor White
    Write-Host "   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload" -ForegroundColor White
} catch {
    Write-Host "✗ Database verification failed!" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    Read-Host
    exit 1
}

Write-Host ""
Write-Host "🎉 Setup completed! Press any key to exit..." -ForegroundColor Green
Read-Host
