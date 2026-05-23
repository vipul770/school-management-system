@echo off
REM School Management System Database Backup Script (Windows)
REM Created: 2024-12-07
REM Version: 1.0
REM Description: Automated database backup and restore utilities for Windows

setlocal enabledelayedexpansion

REM Configuration
set SCRIPT_DIR=%~dp0
set BACKUP_DIR=%SCRIPT_DIR%\..\backups
set LOG_FILE=%BACKUP_DIR%\backup.log
set CONFIG_FILE=%SCRIPT_DIR%\backup.conf

REM Default configuration
set DEFAULT_DB_HOST=localhost
set DEFAULT_DB_PORT=5432
set DEFAULT_DB_NAME=school_management
set DEFAULT_DB_USER=postgres
set DEFAULT_BACKUP_RETENTION_DAYS=30
set DEFAULT_COMPRESS=true
set DEFAULT_ENCRYPT=false

REM Load configuration from file if exists
if exist "%CONFIG_FILE%" (
    call "%CONFIG_FILE%"
)

REM Use defaults if not set
if not defined DB_HOST set DB_HOST=%DEFAULT_DB_HOST%
if not defined DB_PORT set DB_PORT=%DEFAULT_DB_PORT%
if not defined DB_NAME set DB_NAME=%DEFAULT_DB_NAME%
if not defined DB_USER set DB_USER=%DEFAULT_DB_USER%
if not defined BACKUP_RETENTION_DAYS set BACKUP_RETENTION_DAYS=%DEFAULT_BACKUP_RETENTION_DAYS%
if not defined COMPRESS set COMPRESS=%DEFAULT_COMPRESS%
if not defined ENCRYPT set ENCRYPT=%DEFAULT_ENCRYPT%

REM Colors for output
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Logging function
:log
set level=%1
set message=%*
set timestamp=%date:~0,8% %time:~0,8%
echo %timestamp% [%level%] %message% >> "%LOG_FILE%"

if "%level%"=="ERROR" (
    echo %RED%%message%%NC%
) else if "%level%"=="SUCCESS" (
    echo %GREEN%%message%%NC%
) else if "%level%"=="WARNING" (
    echo %YELLOW%%message%%NC%
) else (
    echo %BLUE%%message%%NC%
)
goto :eof

REM Create backup directory
:create_backup_dir
if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
    call :log "INFO" "Created backup directory: %BACKUP_DIR%"
)

REM Create subdirectories
if not exist "%BACKUP_DIR%\daily" mkdir "%BACKUP_DIR%\daily"
if not exist "%BACKUP_DIR%\weekly" mkdir "%BACKUP_DIR%\weekly"
if not exist "%BACKUP_DIR%\monthly" mkdir "%BACKUP_DIR%\monthly"
if not exist "%BACKUP_DIR%\schemas" mkdir "%BACKUP_DIR%\schemas"
goto :eof

REM Validate database connection
:validate_connection
call :log "INFO" "Validating database connection..."

REM Check if psql is available
psql --version >nul 2>&1
if errorlevel 1 (
    call :log "ERROR" "PostgreSQL client (psql) not found. Please install PostgreSQL client tools."
    exit /b 1
)

REM Test connection
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    call :log "ERROR" "Cannot connect to database. Please check your credentials."
    exit /b 1
)

call :log "SUCCESS" "Database connection validated successfully."
goto :eof

REM Get database password
:get_db_password
if not defined DB_PASSWORD (
    set /p DB_PASSWORD=Enter database password for user %DB_USER%: 
)
goto :eof

REM Create database backup
:create_backup
set backup_type=%1
if "%backup_type%"=="" set backup_type=full

set backup_filename=%backup_type%_backup_%DB_NAME%_%date:~0,10%_%time:~0,6%.sql
set backup_filename=%backup_filename: =%
set backup_path=%BACKUP_DIR%\%backup_type%\%backup_filename%

call :log "INFO" "Starting %backup_type% backup..."
call :log "INFO" "Backup file: %backup_path%"

REM Get database password
call :get_db_password

set start_time=%time%

if "%backup_type%"=="full" (
    REM Full database backup
    set PGPASSWORD=%DB_PASSWORD%
    pg_dump -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% --verbose --no-password --format=custom --compress=9 --lock-wait-timeout=30000 --exclude-table-data=system_logs --exclude-table-data=query_performance --exclude-table-data=api_performance --exclude-table-data=error_logs --file="%backup_path%"
) else (
    REM Schema-only backup
    set PGPASSWORD=%DB_PASSWORD%
    pg_dump -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% --verbose --no-password --schema-only --file="%backup_path%"
)

set end_time=%time%

REM Calculate duration (simplified)
call :log "SUCCESS" "Backup completed successfully"

REM Check if backup was successful
if exist "%backup_path%" (
    for %%F in ("%backup_path%") do set size=%%~zF
    call :log "INFO" "Backup file size: !size! bytes"
    
    REM Create backup info file
    set info_file=%backup_path%.info
    echo { > "%info_file%"
    echo   "backup_type": "%backup_type%", >> "%info_file%"
    echo   "database_name": "%DB_NAME%", >> "%info_file%"
    echo   "backup_date": "%date:~0,10%T%time:~0,8%", >> "%info_file%"
    echo   "backup_file": "%backup_path%", >> "%info_file%"
    echo   "file_size": "!size!", >> "%info_file%"
    echo   "db_host": "%DB_HOST%", >> "%info_file%"
    echo   "db_port": "%DB_PORT%", >> "%info_file%"
    echo   "db_user": "%DB_USER%", >> "%info_file%"
    echo   "compressed": %COMPRESS%, >> "%info_file%"
    echo   "encrypted": %ENCRYPT% >> "%info_file%"
    echo } >> "%info_file%"
    
    call :log "INFO" "Backup info saved to: %info_file%"
) else (
    call :log "ERROR" "Backup failed or file is empty"
    exit /b 1
)

goto :eof

REM Restore database from backup
:restore_backup
set backup_file=%1

if "%backup_file%"=="" (
    call :log "ERROR" "Please specify backup file to restore"
    exit /b 1
)

if not exist "%backup_file%" (
    call :log "ERROR" "Backup file not found: %backup_file%"
    exit /b 1
)

call :log "WARNING" "This will restore the database from backup: %backup_file%"
call :log "WARNING" "All current data will be lost!"

set /p confirm=Are you sure you want to continue? (yes/no): 
if not "%confirm%"=="yes" (
    call :log "INFO" "Restore cancelled"
    exit /b 0
)

REM Get database password
call :get_db_password

call :log "INFO" "Starting database restore..."

REM Drop and recreate database
call :log "INFO" "Dropping existing database..."
set PGPASSWORD=%DB_PASSWORD%
dropdb -h %DB_HOST% -p %DB_PORT% -U %DB_USER% %DB_NAME% --if-exists

call :log "INFO" "Creating new database..."
set PGPASSWORD=%DB_PASSWORD%
createdb -h %DB_HOST% -p %DB_PORT% -U %DB_USER% %DB_NAME%

REM Restore from backup
call :log "INFO" "Restoring from backup..."
set PGPASSWORD=%DB_PASSWORD%
pg_restore -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% --verbose --no-password --clean --if-exists --disable-triggers "%backup_file%"

call :log "SUCCESS" "Database restored successfully"

REM Run post-restore scripts if they exist
if exist "%SCRIPT_DIR%\post_restore.sql" (
    call :log "INFO" "Running post-restore scripts..."
    set PGPASSWORD=%DB_PASSWORD%
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%SCRIPT_DIR%\post_restore.sql"
)

goto :eof

REM List available backups
:list_backups
set backup_type=%1
if "%backup_type%"=="" set backup_type=all

call :log "INFO" "Available backups:"

if "%backup_type%"=="daily" (
    dir "%BACKUP_DIR%\daily\*.sql*" /b
) else if "%backup_type%"=="weekly" (
    dir "%BACKUP_DIR%\weekly\*.sql*" /b
) else if "%backup_type%"=="monthly" (
    dir "%BACKUP_DIR%\monthly\*.sql*" /b
) else if "%backup_type%"=="schemas" (
    dir "%BACKUP_DIR%\schemas\*.sql*" /b
) else (
    dir "%BACKUP_DIR%\*.sql*" /s /b
)

goto :eof

REM Clean old backups
:cleanup_old_backups
call :log "INFO" "Cleaning up backups older than %BACKUP_RETENTION_DAYS% days..."

REM Clean old daily backups
forfiles /p "%BACKUP_DIR%\daily" /s /m * /d -%BACKUP_RETENTION_DAYS% /c "cmd /c del @path" 2>nul

REM Clean old weekly backups (older than 8 weeks)
forfiles /p "%BACKUP_DIR%\weekly" /s /m * /d -56 /c "cmd /c del @path" 2>nul

REM Clean old monthly backups (older than 12 months)
forfiles /p "%BACKUP_DIR%\monthly" /s /m * /d -365 /c "cmd /c del @path" 2>nul

call :log "SUCCESS" "Cleaned up old backup files"
goto :eof

REM Verify backup integrity
:verify_backup
set backup_file=%1

if "%backup_file%"=="" (
    call :log "ERROR" "Please specify backup file to verify"
    exit /b 1
)

if not exist "%backup_file%" (
    call :log "ERROR" "Backup file not found: %backup_file%"
    exit /b 1
)

call :log "INFO" "Verifying backup integrity: %backup_file%"

REM Check if it's a valid PostgreSQL dump
findstr /C "PostgreSQL database dump" "%backup_file%" >nul
if errorlevel 0 (
    call :log "SUCCESS" "Backup file appears to be a valid PostgreSQL dump"
) else (
    call :log "WARNING" "Backup file may not be a PostgreSQL dump"
)

goto :eof

REM Show backup statistics
:show_stats
call :log "INFO" "Backup Statistics:"

REM Count total backups
for /f %%i in ('dir /b "%BACKUP_DIR%\*.sql*" 2^>nul ^| find /c /v ""') do set total_backups=%%i
call :log "INFO" "Total backups: %total_backups%"

REM Latest backup
for /f "delims=" %%i in ('dir /b /od "%BACKUP_DIR%\*.sql*" 2^>nul') do set latest_backup=%%i
if defined latest_backup (
    call :log "INFO" "Latest backup: %latest_backup%"
)

goto :eof

REM Main function
:main
set command=%1
if "%command%"=="" set command=help

if "%command%"=="create" (
    set backup_type=%2
    if "%backup_type%"=="" set backup_type=full
    call :create_backup_dir
    call :validate_connection
    call :create_backup %backup_type%
) else if "%command%"=="restore" (
    call :restore_backup %2
) else if "%command%"=="list" (
    call :list_backups %2
) else if "%command%"=="cleanup" (
    call :cleanup_old_backups
) else if "%command%"=="verify" (
    call :verify_backup %2
) else if "%command%"=="stats" (
    call :show_stats
) else if "%command%"=="help" (
    echo School Management System Database Backup Utility
    echo.
    echo Usage: %~nx0 [COMMAND] [OPTIONS]
    echo.
    echo Commands:
    echo   create [full^|schema]  Create a new backup (default: full)
    echo   restore ^<file^>        Restore database from backup file
    echo   list [type]          List available backups (all^|daily^|weekly^|monthly^|schemas)
    echo   cleanup               Clean up old backups
    echo   verify ^<file^>         Verify backup file integrity
    echo   stats                 Show backup statistics
    echo   help                  Show this help message
    echo.
    echo Environment Variables:
    echo   DB_HOST               Database host (default: localhost)
    echo   DB_PORT               Database port (default: 5432)
    echo   DB_NAME               Database name (default: school_management)
    echo   DB_USER               Database user (default: postgres)
    echo   DB_PASSWORD           Database password
    echo   BACKUP_RETENTION_DAYS  Backup retention period (default: 30)
    echo.
    echo Examples:
    echo   %~nx0 create full         # Create full backup
    echo   %~nx0 restore backup.sql   # Restore from backup
    echo   %~nx0 list daily          # List daily backups
) else (
    call :log "ERROR" "Unknown command: %command%"
    call :log "INFO" "Use 'help' for available commands"
    exit /b 1
)

exit /b 0

REM Run main function with all arguments
call :main %*
