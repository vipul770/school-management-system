# Database Setup Instructions

## PostgreSQL Database Setup for School Management System

This guide will help you set up a complete PostgreSQL database for the School Management System.

### Prerequisites

1. **PostgreSQL Server** (version 12 or higher)
2. **PostgreSQL Client Tools** (psql, pg_dump, pg_restore)
3. **Python 3.8+** with required packages
4. **Git** (for cloning the repository)

### Quick Setup

#### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**CentOS/RHEL:**
```bash
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run the installer with default settings
3. Add PostgreSQL bin directory to PATH

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

#### 2. Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside PostgreSQL shell
CREATE DATABASE school_management;
CREATE USER school_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE school_management TO school_admin;
ALTER USER school_admin CREATEDB;
\q
```

#### 3. Set Environment Variables

Create a `.env` file in the backend directory:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_management
DB_USER=school_admin
DB_PASS=your_secure_password
DB_SSL_MODE=prefer

# Connection Pool Settings
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=30
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=3600
```

#### 4. Run Database Setup

```bash
# Navigate to database directory
cd database

# Execute the schema
psql -h localhost -p 5432 -U school_admin -d school_management -f postgresql_schema.sql

# Load sample data (optional)
psql -h localhost -p 5432 -U school_admin -d school_management -f sample_data.sql

# Run migrations
psql -h localhost -p 5432 -U school_admin -d school_management -f migrations.sql
```

### Detailed Setup

#### Database Schema

The database includes the following major components:

**Core Tables:**
- `tenants` - Multi-tenant support
- `users` - User management
- `schools` - School information
- `students` - Student records
- `teachers` - Teacher records
- `classrooms` - Classroom management
- `subjects` - Subject management

**Academic Tables:**
- `attendance` - Attendance tracking
- `exams` - Exam management
- `exam_results` - Exam results
- `timetable` - Class schedules
- `fee_structures` - Fee management
- `fee_payments` - Payment tracking

**Supporting Tables:**
- `library_books` - Library management
- `transport_vehicles` - Transportation
- `hostel_buildings` - Hostel management
- `inventory_items` - Inventory tracking
- `messages` - Communication
- `notifications` - System notifications

**SaaS Tables:**
- `plans` - Subscription plans
- `subscriptions` - User subscriptions
- `usage_metrics` - Usage tracking
- `tenant_settings` - Tenant configurations

#### Features

**Multi-Tenancy:**
- Complete tenant isolation
- Tenant-specific configurations
- Usage tracking per tenant

**Performance Optimizations:**
- Comprehensive indexing strategy
- Query optimization
- Connection pooling
- Full-text search support

**Data Integrity:**
- Foreign key constraints
- Check constraints
- Triggers for automatic updates
- Soft delete functionality

**Audit Trail:**
- System logging
- Change tracking
- User activity monitoring

### Backup and Restore

#### Automated Backup Setup

**Linux/macOS:**
```bash
# Make backup script executable
chmod +x database/backup.sh

# Create configuration file
cat > database/backup.conf << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_management
DB_USER=school_admin
DB_PASSWORD=your_secure_password
BACKUP_RETENTION_DAYS=30
COMPRESS=true
ENCRYPT=false
EOF

# Test backup
./database/backup.sh create full

# Schedule daily backups (cron)
./database/backup.sh schedule daily
```

**Windows:**
```batch
REM Test backup
database\backup.bat create full

REM Schedule daily backup using Windows Task Scheduler
schtasks /create /tn "SchoolBackup" /trig "DAILY /ST 02:00" /sc daily /st 02:00 /tn "SchoolBackup" /tr "C:\path\to\database\backup.bat create full"
```

#### Manual Backup Commands

```bash
# Full backup
./database/backup.sh create full

# Schema-only backup
./database/backup.sh create schema

# List backups
./database/backup.sh list

# Restore from backup
./database/backup.sh restore /path/to/backup.sql

# Verify backup integrity
./database/backup.sh verify /path/to/backup.sql
```

### Migration Management

#### Running Migrations

```bash
# Execute all pending migrations
psql -h localhost -p 5432 -U school_admin -d school_management -f migrations.sql

# Check migration status
psql -h localhost -p 5432 -U school_admin -d school_management -c "SELECT * FROM migrations ORDER BY executed_at;"

# Get current migration version
psql -h localhost -p 5432 -U school_admin -d school_management -c "SELECT get_current_migration_version();"
```

#### Available Migrations

1. **001_initial_schema** - Core database schema
2. **002_add_audit_columns** - Audit trail columns
3. **003_add_soft_delete_indexes** - Soft delete indexes
4. **004_add_fulltext_search** - Full-text search capabilities
5. **005_add_performance_monitoring** - Performance tracking
6. **006_add_data_archiving** - Data archiving tables
7. **007_add_notification_preferences** - Notification system
8. **008_add_multilingual_support** - Multi-language support
9. **009_add_api_rate_limiting** - API rate limiting
10. **010_audit_trail_enhancements** - Enhanced audit trail

### Performance Tuning

#### PostgreSQL Configuration

Edit `postgresql.conf`:

```ini
# Memory Settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Connection Settings
max_connections = 200
listen_addresses = '*'
port = 5432

# Logging Settings
log_statement = 'none'
log_min_duration_statement = 1000
log_checkpoints = on
log_connections = on
log_disconnections = on

# Performance Settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

#### Index Optimization

```sql
-- Analyze table statistics
ANALYZE;

-- Rebuild indexes
REINDEX DATABASE school_management;

-- Check for unused indexes
SELECT schemaname, relname, indexrelname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan < 100
ORDER BY idx_scan;
```

### Security Configuration

#### User Management

```sql
-- Create read-only user
CREATE USER readonly_user WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE school_management TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_user;

-- Create backup user
CREATE USER backup_user WITH PASSWORD 'backup_password';
GRANT CONNECT ON DATABASE school_management TO backup_user;
GRANT USAGE ON SCHEMA public TO backup_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;
```

#### Row Level Security

```sql
-- Enable RLS on sensitive tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY tenant_isolation ON students
    FOR ALL TO school_admin
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

### Monitoring and Maintenance

#### Health Check

```bash
# Check database health
./database/backup.sh health

# View backup statistics
./database/backup.sh stats
```

#### Regular Maintenance

```sql
-- Update table statistics
ANALYZE;

-- Vacuum and reindex
VACUUM ANALYZE;
REINDEX DATABASE school_management;

-- Check for bloat
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename LIKE '%attendance%'
ORDER BY tablename, attname;
```

### Troubleshooting

#### Common Issues

**Connection Issues:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check listening ports
netstat -an | grep 5432

# Test connection
psql -h localhost -p 5432 -U school_admin -d school_management
```

**Performance Issues:**
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Backup Issues:**
```bash
# Check disk space
df -h

# Check backup permissions
ls -la database/backups/

# Verify backup integrity
./database/backup.sh verify /path/to/backup.sql
```

### API Integration

The backend application will automatically connect to PostgreSQL using the environment variables configured in your `.env` file. The enhanced database configuration includes:

- Connection pooling
- Automatic reconnection
- Health checks
- Performance monitoring
- Error handling

### Next Steps

1. **Start the Backend:**
   ```bash
   cd backend
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Verify Database Connection:**
   ```bash
   curl http://localhost:8000/health
   ```

3. **Test API Endpoints:**
   ```bash
   curl http://localhost:8000/api/users
   curl http://localhost:8000/api/schools
   ```

4. **Set Up Automated Backups:**
   ```bash
   ./database/backup.sh schedule daily
   ```

### Support

For additional support or questions:

1. Check the log files in `database/backups/backup.log`
2. Review PostgreSQL logs: `/var/log/postgresql/`
3. Use the health check script: `./database/backup.sh health`
4. Contact your database administrator for advanced issues

---

**Note:** Always test backup and restore procedures in a development environment before applying to production.
