-- School Management System Database Migration Scripts
-- Created: 2024-12-07
-- Version: 1.0
-- Description: Migration scripts for database version control

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Migration version tracking table
CREATE TABLE IF NOT EXISTS migrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER,
    checksum VARCHAR(64)
);

-- Function to check if migration has been executed
CREATE OR REPLACE FUNCTION is_migration_executed(version_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM migrations WHERE version = version_param
    );
END;
$$ LANGUAGE plpgsql;

-- Function to record migration execution
CREATE OR REPLACE FUNCTION record_migration(version_param TEXT, description_param TEXT, execution_time_param INTEGER, checksum_param TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO migrations (version, description, execution_time_ms, checksum)
    VALUES (version_param, description_param, execution_time_param, checksum_param);
END;
$$ LANGUAGE plpgsql;

-- Migration 001: Initial schema setup
-- Version: 001_initial_schema
-- Description: Create initial database schema with all core tables

-- This migration is handled by the main schema file
-- The schema file includes all tables, indexes, triggers, and functions

-- Migration 002: Add audit columns to existing tables
-- Version: 002_add_audit_columns
-- Description: Add created_by, updated_by, and deleted_by columns to major tables

DO $$
BEGIN
    IF NOT is_migration_executed('002_add_audit_columns') THEN
        -- Add audit columns to major tables (using INTEGER to match existing model structure)
        -- Only add columns if tables exist
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants' AND table_schema = 'public') THEN
            ALTER TABLE tenants ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
            ALTER TABLE tenants ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);
            ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schools' AND table_schema = 'public') THEN
            ALTER TABLE schools ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
            ALTER TABLE schools ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);
            ALTER TABLE schools ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students' AND table_schema = 'public') THEN
            ALTER TABLE students ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teachers' AND table_schema = 'public') THEN
            ALTER TABLE teachers ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
            ALTER TABLE teachers ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);
            ALTER TABLE teachers ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exams' AND table_schema = 'public') THEN
            ALTER TABLE exams ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
            ALTER TABLE exams ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);
            ALTER TABLE exams ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id);
        END IF;
        
        -- Record migration
        PERFORM record_migration('002_add_audit_columns', 'Add audit columns to major tables', 0, 'checksum_002');
    END IF;
END $$;

-- Migration 003: Add soft delete indexes
-- Version: 003_add_soft_delete_indexes
-- Description: Add indexes for soft delete functionality

DO $$
BEGIN
    IF NOT is_migration_executed('003_add_soft_delete_indexes') THEN
        -- Add indexes for deleted_at columns (only if both table and column exist)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'deleted_at' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_tenants_deleted_at ON tenants(deleted_at);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schools' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schools' AND column_name = 'deleted_at' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_schools_deleted_at ON schools(deleted_at);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'deleted_at' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_students_deleted_at ON students(deleted_at);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teachers' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teachers' AND column_name = 'deleted_at' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_teachers_deleted_at ON teachers(deleted_at);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'classrooms' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classrooms' AND column_name = 'deleted_at' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_classrooms_deleted_at ON classrooms(deleted_at);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subjects' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subjects' AND column_name = 'deleted_at' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_subjects_deleted_at ON subjects(deleted_at);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exams' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'deleted_at' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_exams_deleted_at ON exams(deleted_at);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attendance' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'deleted_at' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_attendance_deleted_at ON attendance(deleted_at);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fee_payments' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fee_payments' AND column_name = 'deleted_at' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_fee_payments_deleted_at ON fee_payments(deleted_at);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'library_books' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'library_books' AND column_name = 'deleted_at' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_library_books_deleted_at ON library_books(deleted_at);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transport_vehicles' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transport_vehicles' AND column_name = 'deleted_at' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_transport_vehicles_deleted_at ON transport_vehicles(deleted_at);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hostel_buildings' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostel_buildings' AND column_name = 'deleted_at' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_hostel_buildings_deleted_at ON hostel_buildings(deleted_at);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_items' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'deleted_at' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_inventory_items_deleted_at ON inventory_items(deleted_at);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'deleted_at' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_messages_deleted_at ON messages(deleted_at);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'announcements' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'deleted_at' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_announcements_deleted_at ON announcements(deleted_at);
        END IF;
        
        -- Record migration
        PERFORM record_migration('003_add_soft_delete_indexes', 'Add indexes for soft delete functionality', 0, 'checksum_003');
    END IF;
END $$;

-- Migration 004: Add full-text search indexes
-- Version: 004_add_fulltext_search
-- Description: Add full-text search indexes for better search performance

DO $$
BEGIN
    IF NOT is_migration_executed('004_add_fulltext_search') THEN
        -- Create full-text search configuration
        CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS school_config (COPY = english);
        
        -- Add full-text search indexes (only if tables and columns exist)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'full_name' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_students_fulltext ON students USING gin(
                to_tsvector('school_config', 
                    COALESCE(full_name, '') || ' ' || 
                    COALESCE(roll_number, '') || ' ' || 
                    COALESCE(admission_number, '') || ' ' || 
                    COALESCE(address, '')
                )
            );
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schools' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schools' AND column_name = 'name' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_schools_fulltext ON schools USING gin(
                to_tsvector('school_config', 
                    COALESCE(name, '') || ' ' || 
                    COALESCE(address, '') || ' ' || 
                    COALESCE(city, '') || ' ' || 
                    COALESCE(state, '')
                )
            );
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'library_books' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'library_books' AND column_name = 'title' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_library_books_fulltext ON library_books USING gin(
                to_tsvector('school_config', 
                    COALESCE(title, '') || ' ' || 
                    COALESCE(author, '') || ' ' || 
                    COALESCE(description, '') || ' ' || 
                    COALESCE(publisher, '')
                )
            );
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name' AND table_schema = 'public') THEN
            CREATE INDEX IF NOT EXISTS idx_users_fulltext ON users USING gin(
                to_tsvector('school_config', 
                    COALESCE(full_name, '') || ' ' || 
                    COALESCE(email, '') || ' ' || 
                    COALESCE(username, '')
                )
            );
        END IF;
        
        -- Record migration
        PERFORM record_migration('004_add_fulltext_search', 'Add full-text search indexes', 0, 'checksum_004');
    END IF;
END $$;

-- Migration 005: Add performance monitoring tables
-- Version: 005_add_performance_monitoring
-- Description: Add tables for performance monitoring and analytics

DO $$
BEGIN
    IF NOT is_migration_executed('005_add_performance_monitoring') THEN
        -- Performance monitoring tables
        CREATE TABLE IF NOT EXISTS query_performance (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
            query_hash VARCHAR(64),
            query_text TEXT,
            execution_time_ms INTEGER,
            rows_affected INTEGER,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            user_id INTEGER REFERENCES users(id),
            ip_address INET,
            user_agent TEXT
        );
        
        -- API performance table
        CREATE TABLE IF NOT EXISTS api_performance (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
            endpoint VARCHAR(255),
            method VARCHAR(10),
            status_code INTEGER,
            response_time_ms INTEGER,
            request_size BIGINT,
            response_size BIGINT,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            user_id INTEGER REFERENCES users(id),
            ip_address INET,
            user_agent TEXT
        );
        
        -- Error logs table
        CREATE TABLE IF NOT EXISTS error_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
            error_type VARCHAR(100),
            error_message TEXT,
            stack_trace TEXT,
            context JSONB DEFAULT '{}',
            user_id INTEGER REFERENCES users(id),
            ip_address INET,
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Add indexes
        CREATE INDEX IF NOT EXISTS idx_query_performance_tenant_id ON query_performance(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_query_performance_executed_at ON query_performance(executed_at);
        CREATE INDEX IF NOT EXISTS idx_query_performance_query_hash ON query_performance(query_hash);
        
        CREATE INDEX IF NOT EXISTS idx_api_performance_tenant_id ON api_performance(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_api_performance_executed_at ON api_performance(executed_at);
        CREATE INDEX IF NOT EXISTS idx_api_performance_endpoint ON api_performance(endpoint);
        CREATE INDEX IF NOT EXISTS idx_api_performance_status_code ON api_performance(status_code);
        
        CREATE INDEX IF NOT EXISTS idx_error_logs_tenant_id ON error_logs(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
        
        -- Record migration
        PERFORM record_migration('005_add_performance_monitoring', 'Add performance monitoring tables', 0, 'checksum_005');
    END IF;
END $$;

-- Migration 006: Add data archiving tables
-- Version: 006_add_data_archiving
-- Description: Add tables for data archiving and retention

DO $$
BEGIN
    IF NOT is_migration_executed('006_add_data_archiving') THEN
        -- Archive tables for old data
        CREATE TABLE IF NOT EXISTS attendance_archive (
            LIKE attendance INCLUDING ALL
        );
        
        CREATE TABLE IF NOT EXISTS exam_results_archive (
            LIKE exam_results INCLUDING ALL
        );
        
        CREATE TABLE IF NOT EXISTS fee_payments_archive (
            LIKE fee_payments INCLUDING ALL
        );
        
        CREATE TABLE IF NOT EXISTS system_logs_archive (
            LIKE system_logs INCLUDING ALL
        );
        
        -- Archive configuration table
        CREATE TABLE IF NOT EXISTS archive_configuration (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
            table_name VARCHAR(255) NOT NULL,
            archive_after_days INTEGER DEFAULT 365,
            delete_after_days INTEGER DEFAULT 1095,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Archive jobs table
        CREATE TABLE IF NOT EXISTS archive_jobs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
            table_name VARCHAR(255) NOT NULL,
            records_archived INTEGER DEFAULT 0,
            status VARCHAR(50) DEFAULT 'pending',
            started_at TIMESTAMP WITH TIME ZONE,
            completed_at TIMESTAMP WITH TIME ZONE,
            error_message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Add indexes
        CREATE INDEX IF NOT EXISTS idx_archive_configuration_tenant_id ON archive_configuration(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_archive_configuration_table_name ON archive_configuration(table_name);
        
        CREATE INDEX IF NOT EXISTS idx_archive_jobs_tenant_id ON archive_jobs(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_archive_jobs_status ON archive_jobs(status);
        CREATE INDEX IF NOT EXISTS idx_archive_jobs_created_at ON archive_jobs(created_at);
        
        -- Record migration
        PERFORM record_migration('006_add_data_archiving', 'Add data archiving tables', 0, 'checksum_006');
    END IF;
END $$;

-- Migration 007: Add notification preferences
-- Version: 007_add_notification_preferences
-- Description: Add notification preferences for users

DO $$
BEGIN
    IF NOT is_migration_executed('007_add_notification_preferences') THEN
        -- Notification preferences table
        CREATE TABLE IF NOT EXISTS notification_preferences (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            notification_type VARCHAR(100) NOT NULL,
            email_enabled BOOLEAN DEFAULT true,
            sms_enabled BOOLEAN DEFAULT false,
            push_enabled BOOLEAN DEFAULT true,
            in_app_enabled BOOLEAN DEFAULT true,
            frequency VARCHAR(50) DEFAULT 'immediate',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(tenant_id, user_id, notification_type)
        );
        
        -- Notification templates table
        CREATE TABLE IF NOT EXISTS notification_templates (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(100) NOT NULL,
            subject_template TEXT,
            body_template TEXT,
            variables JSONB DEFAULT '[]',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Add indexes
        CREATE INDEX IF NOT EXISTS idx_notification_preferences_tenant_id ON notification_preferences(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
        CREATE INDEX IF NOT EXISTS idx_notification_preferences_type ON notification_preferences(notification_type);
        
        CREATE INDEX IF NOT EXISTS idx_notification_templates_tenant_id ON notification_templates(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);
        
        -- Insert default notification preferences for existing users
        INSERT INTO notification_preferences (tenant_id, user_id, notification_type, email_enabled, sms_enabled, push_enabled, in_app_enabled, frequency)
        SELECT DISTINCT 
            u.tenant_id, 
            u.id, 
            nt.type,
            true,  -- email_enabled
            false, -- sms_enabled
            true,  -- push_enabled
            true,  -- in_app_enabled
            'immediate'
        FROM users u
        CROSS JOIN (VALUES 
            ('attendance'), ('exams'), ('fees'), ('announcements'), ('system'), ('security')
        ) AS nt(type)
        WHERE u.deleted_at IS NULL
        ON CONFLICT (tenant_id, user_id, notification_type) DO NOTHING;
        
        -- Record migration
        PERFORM record_migration('007_add_notification_preferences', 'Add notification preferences', 0, 'checksum_007');
    END IF;
END $$;

-- Migration 008: Add multi-language support
-- Version: 008_add_multilingual_support
-- Description: Add support for multiple languages

DO $$
BEGIN
    IF NOT is_migration_executed('008_add_multilingual_support') THEN
        -- Languages table
        CREATE TABLE IF NOT EXISTS languages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            code VARCHAR(10) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            native_name VARCHAR(100),
            is_active BOOLEAN DEFAULT true,
            is_default BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Translations table
        CREATE TABLE IF NOT EXISTS translations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
            language_code VARCHAR(10) REFERENCES languages(code),
            key VARCHAR(255) NOT NULL,
            value TEXT NOT NULL,
            context VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(tenant_id, language_code, key, context)
        );
        
        -- Add language preference to users table
        ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';
        
        -- Add language preference to tenant settings
        INSERT INTO tenant_settings (id, tenant_id, key, value)
        SELECT DISTINCT 
            uuid_generate_v4(),
            t.id,
            'default_language',
            'en'
        FROM tenants t
        WHERE NOT EXISTS (
            SELECT 1 FROM tenant_settings ts 
            WHERE ts.tenant_id = t.id AND ts.key = 'default_language'
        );
        
        -- Insert default languages
        INSERT INTO languages (code, name, native_name, is_active, is_default) VALUES
        ('en', 'English', 'English', true, true),
        ('es', 'Spanish', 'Español', true, false),
        ('fr', 'French', 'Français', true, false),
        ('de', 'German', 'Deutsch', true, false),
        ('it', 'Italian', 'Italiano', true, false),
        ('pt', 'Portuguese', 'Português', true, false),
        ('ru', 'Russian', 'Pycckij', true, false),
        ('zh', 'Chinese', 'Chinese', true, false),
        ('ja', 'Japanese', 'Japanese', true, false),
        ('ar', 'Arabic', 'Arabic', true, false)
        ON CONFLICT (code) DO NOTHING;
        
        -- Add indexes
        CREATE INDEX IF NOT EXISTS idx_translations_tenant_id ON translations(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_translations_language_code ON translations(language_code);
        CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(key);
        
        -- Record migration
        PERFORM record_migration('008_add_multilingual_support', 'Add multi-language support', 0, 'checksum_008');
    END IF;
END $$;

-- Migration 009: Add API rate limiting tables
-- Version: 009_add_api_rate_limiting
-- Description: Add tables for API rate limiting

DO $$
BEGIN
    IF NOT is_migration_executed('009_add_api_rate_limiting') THEN
        -- Rate limits table
        CREATE TABLE IF NOT EXISTS rate_limits (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
            endpoint VARCHAR(255) NOT NULL,
            method VARCHAR(10) NOT NULL,
            requests_per_minute INTEGER DEFAULT 60,
            requests_per_hour INTEGER DEFAULT 1000,
            requests_per_day INTEGER DEFAULT 10000,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(tenant_id, endpoint, method)
        );
        
        -- Rate limit usage table
        CREATE TABLE IF NOT EXISTS rate_limit_usage (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
            endpoint VARCHAR(255) NOT NULL,
            method VARCHAR(10) NOT NULL,
            window_start TIMESTAMP WITH TIME ZONE NOT NULL,
            window_type VARCHAR(20) NOT NULL,
            request_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Add indexes
        CREATE INDEX IF NOT EXISTS idx_rate_limits_tenant_id ON rate_limits(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_rate_limits_endpoint ON rate_limits(endpoint);
        CREATE INDEX IF NOT EXISTS idx_rate_limits_method ON rate_limits(method);
        
        CREATE INDEX IF NOT EXISTS idx_rate_limit_usage_tenant_id ON rate_limit_usage(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_rate_limit_usage_window_start ON rate_limit_usage(window_start);
        CREATE INDEX IF NOT EXISTS idx_rate_limit_usage_window_type ON rate_limit_usage(window_type);
        
        -- Insert default rate limits for all tenants
        INSERT INTO rate_limits (tenant_id, endpoint, method, requests_per_minute, requests_per_hour, requests_per_day)
        SELECT DISTINCT 
            t.id,
            '/*',
            'GET',
            60,
            1000,
            10000
        FROM tenants t
        WHERE NOT EXISTS (
            SELECT 1 FROM rate_limits rl 
            WHERE rl.tenant_id = t.id AND rl.endpoint = '/*' AND rl.method = 'GET'
        );
        
        -- Record migration
        PERFORM record_migration('009_add_api_rate_limiting', 'Add API rate limiting tables', 0, 'checksum_009');
    END IF;
END $$;

-- Migration 010: Add audit trail enhancements
-- Version: 010_audit_trail_enhancements
-- Description: Enhance audit trail with more detailed tracking

DO $$
BEGIN
    IF NOT is_migration_executed('010_audit_trail_enhancements') THEN
        -- Add session tracking to system logs
        ALTER TABLE system_logs ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);
        ALTER TABLE system_logs ADD COLUMN IF NOT EXISTS request_id VARCHAR(255);
        ALTER TABLE system_logs ADD COLUMN IF NOT EXISTS correlation_id VARCHAR(255);
        
        -- Add IP geolocation data
        ALTER TABLE system_logs ADD COLUMN IF NOT EXISTS country VARCHAR(2);
        ALTER TABLE system_logs ADD COLUMN IF NOT EXISTS city VARCHAR(100);
        ALTER TABLE system_logs ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
        ALTER TABLE system_logs ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
        
        -- Add device information
        ALTER TABLE system_logs ADD COLUMN IF NOT EXISTS device_type VARCHAR(50);
        ALTER TABLE system_logs ADD COLUMN IF NOT EXISTS browser VARCHAR(100);
        ALTER TABLE system_logs ADD COLUMN IF NOT EXISTS os VARCHAR(100);
        
        -- Create audit trail summary table
        CREATE TABLE IF NOT EXISTS audit_trail_summary (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            total_actions INTEGER DEFAULT 0,
            unique_users INTEGER DEFAULT 0,
            top_actions JSONB DEFAULT '[]',
            top_resources JSONB DEFAULT '[]',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(tenant_id, date)
        );
        
        -- Create function to update audit trail summary
        CREATE OR REPLACE FUNCTION update_audit_trail_summary()
RETURNS TRIGGER AS $$
BEGIN
            INSERT INTO audit_trail_summary (tenant_id, date, total_actions, unique_users, top_actions, top_resources)
            SELECT 
                NEW.tenant_id,
                NEW.created_at::DATE,
                1,
                1,
                jsonb_build_object(NEW.action, 1),
                jsonb_build_object(NEW.resource_type, 1)
            ON CONFLICT (tenant_id, date) 
            DO UPDATE SET 
                total_actions = audit_trail_summary.total_actions + 1,
                unique_users = (
                    SELECT COUNT(DISTINCT user_id) 
                    FROM system_logs 
                    WHERE tenant_id = NEW.tenant_id 
                    AND created_at::DATE = NEW.created_at::DATE
                ),
                top_actions = (
                    SELECT jsonb_object_agg(action, count)
                    FROM (
                        SELECT action, COUNT(*) as count
                        FROM system_logs
                        WHERE tenant_id = NEW.tenant_id 
                        AND created_at::DATE = NEW.created_at::DATE
                        GROUP BY action
                    ) t
                ),
                top_resources = (
                    SELECT jsonb_object_agg(resource_type, count)
                    FROM (
                        SELECT resource_type, COUNT(*) as count
                        FROM system_logs
                        WHERE tenant_id = NEW.tenant_id 
                        AND created_at::DATE = NEW.created_at::DATE
                        GROUP BY resource_type
                    ) t
                );
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Create trigger for audit trail summary
        DROP TRIGGER IF EXISTS update_audit_summary_trigger ON system_logs;
        CREATE TRIGGER update_audit_summary_trigger
            AFTER INSERT ON system_logs
            FOR EACH ROW
            EXECUTE FUNCTION update_audit_trail_summary();
        
        -- Add indexes
        CREATE INDEX IF NOT EXISTS idx_system_logs_session_id ON system_logs(session_id);
        CREATE INDEX IF NOT EXISTS idx_system_logs_request_id ON system_logs(request_id);
        CREATE INDEX IF NOT EXISTS idx_system_logs_correlation_id ON system_logs(correlation_id);
        CREATE INDEX IF NOT EXISTS idx_system_logs_country ON system_logs(country);
        CREATE INDEX IF NOT EXISTS idx_system_logs_device_type ON system_logs(device_type);
        
        CREATE INDEX IF NOT EXISTS idx_audit_trail_summary_tenant_id ON audit_trail_summary(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_audit_trail_summary_date ON audit_trail_summary(date);
        
        -- Record migration
        PERFORM record_migration('010_audit_trail_enhancements', 'Enhance audit trail with detailed tracking', 0, 'checksum_010');
    END IF;
END $$;

-- Function to run all pending migrations
CREATE OR REPLACE FUNCTION run_migrations()
RETURNS TABLE(version TEXT, description TEXT, executed_at TIMESTAMP WITH TIME ZONE) AS $$
DECLARE
    migration_record RECORD;
BEGIN
    -- This function would typically be called by the application
    -- to run all pending migrations in order
    
    -- For now, return an empty result set
    RETURN QUERY SELECT ''::TEXT, ''::TEXT, NULL::TIMESTAMP WITH TIME ZONE LIMIT 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get current migration version
CREATE OR REPLACE FUNCTION get_current_migration_version()
RETURNS TEXT AS $$
DECLARE
    current_version TEXT;
BEGIN
    SELECT version INTO current_version 
    FROM migrations 
    ORDER BY executed_at DESC 
    LIMIT 1;
    
    RETURN COALESCE(current_version, '000_initial');
END;
$$ LANGUAGE plpgsql;

-- Function to check database health
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS TABLE(check_name TEXT, status TEXT, details TEXT) AS $$
BEGIN
    -- Check table counts
    RETURN QUERY
    SELECT 'table_count'::TEXT, 
           CASE WHEN COUNT(*) >= 20 THEN 'OK' ELSE 'WARNING' END,
           'Found ' || COUNT(*) || ' tables'
    FROM information_schema.tables 
    WHERE table_schema = 'public';
    
    -- Check index counts
    RETURN QUERY
    SELECT 'index_count'::TEXT,
           CASE WHEN COUNT(*) >= 30 THEN 'OK' ELSE 'WARNING' END,
           'Found ' || COUNT(*) || ' indexes'
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    -- Check foreign key constraints
    RETURN QUERY
    SELECT 'foreign_key_count'::TEXT,
           CASE WHEN COUNT(*) >= 15 THEN 'OK' ELSE 'WARNING' END,
           'Found ' || COUNT(*) || ' foreign key constraints'
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_schema = 'public';
    
    -- Check migration status
    RETURN QUERY
    SELECT 'migration_status'::TEXT,
           CASE WHEN COUNT(*) >= 5 THEN 'OK' ELSE 'WARNING' END,
           'Found ' || COUNT(*) || ' migrations executed'
    FROM migrations;
END;
$$ LANGUAGE plpgsql;

COMMIT;
