#!/bin/bash
# School Management System Database Backup Script
# Created: 2024-12-07
# Version: 1.0
# Description: Automated database backup and restore utilities

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/../backups"
LOG_FILE="${BACKUP_DIR}/backup.log"
CONFIG_FILE="${SCRIPT_DIR}/backup.conf"

# Default configuration
DEFAULT_DB_HOST="localhost"
DEFAULT_DB_PORT="5432"
DEFAULT_DB_NAME="school_management"
DEFAULT_DB_USER="postgres"
DEFAULT_BACKUP_RETENTION_DAYS=30
DEFAULT_COMPRESS=true
DEFAULT_ENCRYPT=false

# Load configuration from file if exists
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
fi

# Use defaults if not set
DB_HOST=${DB_HOST:-$DEFAULT_DB_HOST}
DB_PORT=${DB_PORT:-$DEFAULT_DB_PORT}
DB_NAME=${DB_NAME:-$DEFAULT_DB_NAME}
DB_USER=${DB_USER:-$DEFAULT_DB_USER}
BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-$DEFAULT_BACKUP_RETENTION_DAYS}
COMPRESS=${COMPRESS:-$DEFAULT_COMPRESS}
ENCRYPT=${ENCRYPT:-$DEFAULT_ENCRYPT}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
    
    case $level in
        "ERROR")
            echo -e "${RED}${message}${NC}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}${message}${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}${message}${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}${message}${NC}"
            ;;
    esac
}

# Create backup directory
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log "INFO" "Created backup directory: $BACKUP_DIR"
    fi
    
    # Create subdirectories
    mkdir -p "$BACKUP_DIR/daily"
    mkdir -p "$BACKUP_DIR/weekly"
    mkdir -p "$BACKUP_DIR/monthly"
    mkdir -p "$BACKUP_DIR/schemas"
}

# Get database password securely
get_db_password() {
    if [ -z "$DB_PASSWORD" ]; then
        echo "Enter database password for user $DB_USER:"
        read -s DB_PASSWORD
    fi
}

# Validate database connection
validate_connection() {
    log "INFO" "Validating database connection..."
    
    if ! command -v psql &> /dev/null; then
        log "ERROR" "PostgreSQL client (psql) not found. Please install PostgreSQL client tools."
        exit 1
    fi
    
    # Test connection
    if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
        log "ERROR" "Cannot connect to database. Please check your credentials."
        exit 1
    fi
    
    log "SUCCESS" "Database connection validated successfully."
}

# Create database backup
create_backup() {
    local backup_type=$1
    local backup_filename="${backup_type}_backup_${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql"
    local backup_path="$BACKUP_DIR/${backup_type}/${backup_filename}"
    
    log "INFO" "Starting ${backup_type} backup..."
    log "INFO" "Backup file: $backup_path"
    
    # Get database password
    get_db_password
    
    # Create backup
    local start_time=$(date +%s)
    
    if [ "$backup_type" = "full" ]; then
        # Full database backup
        PGPASSWORD="$DB_PASSWORD" pg_dump \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$DB_NAME" \
            --verbose \
            --no-password \
            --format=custom \
            --compress=9 \
            --lock-wait-timeout=30000 \
            --exclude-table-data='system_logs' \
            --exclude-table-data='query_performance' \
            --exclude-table-data='api_performance' \
            --exclude-table-data='error_logs' \
            --file="$backup_path"
    else
        # Schema-only backup
        PGPASSWORD="$DB_PASSWORD" pg_dump \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$DB_NAME" \
            --verbose \
            --no-password \
            --schema-only \
            --file="$backup_path"
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Check if backup was successful
    if [ -f "$backup_path" ] && [ -s "$backup_path" ]; then
        log "SUCCESS" "Backup completed in ${duration} seconds"
        
        # Get backup file size
        local file_size=$(du -h "$backup_path" | cut -f1)
        log "INFO" "Backup file size: $file_size"
        
        # Compress backup if enabled
        if [ "$COMPRESS" = true ]; then
            log "INFO" "Compressing backup file..."
            gzip "$backup_path"
            backup_path="${backup_path}.gz"
            file_size=$(du -h "$backup_path" | cut -f1)
            log "INFO" "Compressed file size: $file_size"
        fi
        
        # Encrypt backup if enabled
        if [ "$ENCRYPT" = true ]; then
            log "INFO" "Encrypting backup file..."
            gpg --symmetric --cipher-algo AES256 --output "${backup_path}.gpg" "$backup_path"
            rm "$backup_path"
            backup_path="${backup_path}.gpg"
            log "INFO" "Backup encrypted successfully"
        fi
        
        # Create backup info file
        local info_file="${backup_path}.info"
        cat > "$info_file" << EOF
{
    "backup_type": "$backup_type",
    "database_name": "$DB_NAME",
    "backup_date": "$(date -Iseconds)",
    "backup_file": "$backup_path",
    "file_size": "$file_size",
    "duration_seconds": $duration,
    "db_host": "$DB_HOST",
    "db_port": "$DB_PORT",
    "db_user": "$DB_USER",
    "compressed": $COMPRESS,
    "encrypted": $ENCRYPT
}
EOF
        
        log "INFO" "Backup info saved to: $info_file"
        
        return 0
    else
        log "ERROR" "Backup failed or file is empty"
        return 1
    fi
}

# Restore database from backup
restore_backup() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        log "ERROR" "Please specify backup file to restore"
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log "ERROR" "Backup file not found: $backup_file"
        return 1
    fi
    
    log "WARNING" "This will restore the database from backup: $backup_file"
    log "WARNING" "All current data will be lost!"
    
    read -p "Are you sure you want to continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log "INFO" "Restore cancelled"
        return 0
    fi
    
    # Get database password
    get_db_password
    
    # Decrypt if encrypted
    local temp_file="$backup_file"
    if [[ "$backup_file" == *.gpg ]]; then
        log "INFO" "Decrypting backup file..."
        temp_file="${backup_file%.gpg}"
        gpg --decrypt --output "$temp_file" "$backup_file"
        if [ $? -ne 0 ]; then
            log "ERROR" "Failed to decrypt backup file"
            return 1
        fi
    fi
    
    # Uncompress if compressed
    if [[ "$temp_file" == *.gz ]]; then
        log "INFO" "Uncompressing backup file..."
        gunzip "$temp_file"
        temp_file="${temp_file%.gz}"
    fi
    
    log "INFO" "Starting database restore..."
    local start_time=$(date +%s)
    
    # Drop and recreate database
    log "INFO" "Dropping existing database..."
    PGPASSWORD="$DB_PASSWORD" dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" --if-exists
    
    log "INFO" "Creating new database..."
    PGPASSWORD="$DB_PASSWORD" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
    
    # Restore from backup
    log "INFO" "Restoring from backup..."
    PGPASSWORD="$DB_PASSWORD" pg_restore \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --verbose \
        --no-password \
        --clean \
        --if-exists \
        --disable-triggers \
        "$temp_file"
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Clean up temp file
    if [ "$temp_file" != "$backup_file" ]; then
        rm -f "$temp_file"
    fi
    
    log "SUCCESS" "Database restored successfully in ${duration} seconds"
    
    # Run post-restore scripts if they exist
    if [ -f "${SCRIPT_DIR}/post_restore.sql" ]; then
        log "INFO" "Running post-restore scripts..."
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "${SCRIPT_DIR}/post_restore.sql"
    fi
    
    return 0
}

# List available backups
list_backups() {
    local backup_type=${1:-"all"}
    
    log "INFO" "Available backups:"
    
    case $backup_type in
        "daily")
            find "$BACKUP_DIR/daily" -name "*.sql*" -type f -exec ls -lh {} \; | sort -r
            ;;
        "weekly")
            find "$BACKUP_DIR/weekly" -name "*.sql*" -type f -exec ls -lh {} \; | sort -r
            ;;
        "monthly")
            find "$BACKUP_DIR/monthly" -name "*.sql*" -type f -exec ls -lh {} \; | sort -r
            ;;
        "schemas")
            find "$BACKUP_DIR/schemas" -name "*.sql*" -type f -exec ls -lh {} \; | sort -r
            ;;
        "all")
            find "$BACKUP_DIR" -name "*.sql*" -type f -exec ls -lh {} \; | sort -r
            ;;
    esac
}

# Clean old backups
cleanup_old_backups() {
    log "INFO" "Cleaning up backups older than $BACKUP_RETENTION_DAYS days..."
    
    local deleted_count=0
    
    # Clean old daily backups
    while IFS= read -r -d '' file; do
        rm -f "$file"
        ((deleted_count++))
        log "INFO" "Deleted old backup: $file"
    done < <(find "$BACKUP_DIR/daily" -name "*.sql*" -type f -mtime +$BACKUP_RETENTION_DAYS -print0)
    
    # Clean old weekly backups older than 8 weeks
    while IFS= read -r -d '' file; do
        rm -f "$file"
        ((deleted_count++))
        log "INFO" "Deleted old backup: $file"
    done < <(find "$BACKUP_DIR/weekly" -name "*.sql*" -type f -mtime +56 -print0)
    
    # Clean old monthly backups older than 12 months
    while IFS= read -r -d '' file; do
        rm -f "$file"
        ((deleted_count++))
        log "INFO" "Deleted old backup: $file"
    done < <(find "$BACKUP_DIR/monthly" -name "*.sql*" -type f -mtime +365 -print0)
    
    log "SUCCESS" "Cleaned up $deleted_count old backup files"
}

# Verify backup integrity
verify_backup() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        log "ERROR" "Please specify backup file to verify"
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log "ERROR" "Backup file not found: $backup_file"
        return 1
    fi
    
    log "INFO" "Verifying backup integrity: $backup_file"
    
    # Decrypt if encrypted
    local temp_file="$backup_file"
    if [[ "$backup_file" == *.gpg ]]; then
        log "INFO" "Decrypting backup file for verification..."
        temp_file="${backup_file%.gpg}"
        gpg --decrypt --output "$temp_file" "$backup_file" 2>/dev/null
        if [ $? -ne 0 ]; then
            log "ERROR" "Failed to decrypt backup file"
            return 1
        fi
    fi
    
    # Uncompress if compressed
    if [[ "$temp_file" == *.gz ]]; then
        log "INFO" "Uncompressing backup file for verification..."
        gunzip -t "$temp_file" 2>/dev/null
        if [ $? -ne 0 ]; then
            log "ERROR" "Backup file is corrupted (invalid gzip)"
            rm -f "$temp_file" 2>/dev/null
            return 1
        fi
    fi
    
    # Check if it's a valid PostgreSQL dump
    if [[ "$temp_file" == *.sql ]]; then
        if grep -q "PostgreSQL database dump" "$temp_file" 2>/dev/null; then
            log "SUCCESS" "Backup file appears to be a valid PostgreSQL dump"
        else
            log "WARNING" "Backup file may not be a PostgreSQL dump"
        fi
    elif [[ "$temp_file" == *.dump ]]; then
        if pg_restore --list "$temp_file" &>/dev/null; then
            log "SUCCESS" "Backup file appears to be a valid PostgreSQL custom dump"
        else
            log "ERROR" "Backup file is not a valid PostgreSQL dump"
            rm -f "$temp_file" 2>/dev/null
            return 1
        fi
    else
        log "WARNING" "Unknown backup file format"
    fi
    
    # Clean up temp file
    if [ "$temp_file" != "$backup_file" ]; then
        rm -f "$temp_file"
    fi
    
    return 0
}

# Schedule automatic backups
schedule_backups() {
    local backup_type=${1:-"daily"}
    
    log "INFO" "Scheduling automatic $backup_type backups"
    
    # Create cron job
    local cron_entry="0 2 * * * $SCRIPT_DIR/backup.sh create $backup_type"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "$SCRIPT_DIR/backup.sh"; then
        log "INFO" "Cron job already exists"
    else
        # Add cron job
        (crontab -l 2>/dev/null; echo "$cron_entry") | crontab -
        log "SUCCESS" "Cron job added for automatic $backup_type backups"
    fi
    
    log "INFO" "Backups will run daily at 2:00 AM"
}

# Show backup statistics
show_stats() {
    log "INFO" "Backup Statistics:"
    
    # Total backups
    local total_backups=$(find "$BACKUP_DIR" -name "*.sql*" -type f | wc -l)
    log "INFO" "Total backups: $total_backups"
    
    # Backup sizes
    local total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
    log "INFO" "Total size: $total_size"
    
    # Latest backup
    local latest_backup=$(find "$BACKUP_DIR" -name "*.sql*" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2)
    if [ -n "$latest_backup" ]; then
        local latest_date=$(find "$BACKUP_DIR" -name "*.sql*" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f1)
        local formatted_date=$(date -d "@$latest_date" '+%Y-%m-%d %H:%M:%S')
        log "INFO" "Latest backup: $formatted_date"
        log "INFO" "Latest file: $latest_backup"
    fi
    
    # Database size
    if command -v psql &> /dev/null; then
        get_db_password
        local db_size=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" 2>/dev/null | tr -d ' ')
        if [ -n "$db_size" ]; then
            log "INFO" "Database size: $db_size"
        fi
    fi
}

# Main function
main() {
    local command=${1:-"help"}
    
    case $command in
        "create")
            local backup_type=${2:-"full"}
            create_backup_dir
            validate_connection
            create_backup "$backup_type"
            ;;
        "restore")
            restore_backup "$2"
            ;;
        "list")
            list_backups "$2"
            ;;
        "cleanup")
            cleanup_old_backups
            ;;
        "verify")
            verify_backup "$2"
            ;;
        "schedule")
            schedule_backups "$2"
            ;;
        "stats")
            show_stats
            ;;
        "health")
            validate_connection
            show_stats
            ;;
        "help"|*)
            echo "School Management System Database Backup Utility"
            echo ""
            echo "Usage: $0 [COMMAND] [OPTIONS]"
            echo ""
            echo "Commands:"
            echo "  create [full|schema]  Create a new backup (default: full)"
            echo "  restore <file>        Restore database from backup file"
            echo "  list [type]          List available backups (all|daily|weekly|monthly|schemas)"
            echo "  cleanup               Clean up old backups"
            echo "  verify <file>         Verify backup file integrity"
            echo "  schedule [type]      Schedule automatic backups (daily)"
            echo "  stats                 Show backup statistics"
            echo "  health                Check database health and statistics"
            echo "  help                  Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  DB_HOST               Database host (default: localhost)"
            echo "  DB_PORT               Database port (default: 5432)"
            echo "  DB_NAME               Database name (default: school_management)"
            echo "  DB_USER               Database user (default: postgres)"
            echo "  DB_PASSWORD           Database password"
            echo "  BACKUP_RETENTION_DAYS  Backup retention period (default: 30)"
            echo "  COMPRESS              Compress backups (default: true)"
            echo "  ENCRYPT               Encrypt backups (default: false)"
            echo ""
            echo "Examples:"
            echo "  $0 create full         # Create full backup"
            echo "  $0 restore backup.sql   # Restore from backup"
            echo "  $0 list daily          # List daily backups"
            echo "  $0 schedule daily      # Schedule daily backups"
            echo ""
            exit 0
            ;;
    esac
}

# Run main function with all arguments
main "$@"
