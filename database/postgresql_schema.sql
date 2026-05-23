-- School Management System PostgreSQL Database Schema
-- Created: 2024-12-07
-- Version: 1.0
-- Description: Complete database schema for multi-tenant school management system

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE role_enum AS ENUM (
    'superadmin',
    'admin',
    'school',
    'teacher',
    'student',
    'parent',
    'accountant',
    'librarian',
    'transport_manager',
    'hostel_manager',
    'hr_manager'
);

CREATE TYPE subscription_status AS ENUM (
    'trial',
    'active',
    'cancelled',
    'expired',
    'suspended'
);

CREATE TYPE plan_type AS ENUM (
    'free',
    'basic',
    'professional',
    'enterprise'
);

CREATE TYPE billing_cycle AS ENUM (
    'monthly',
    'yearly'
);

CREATE TYPE user_request_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE tenant_request_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE gender_enum AS ENUM (
    'male',
    'female',
    'other'
);

CREATE TYPE attendance_status AS ENUM (
    'present',
    'absent',
    'late',
    'excused'
);

CREATE TYPE fee_status AS ENUM (
    'pending',
    'paid',
    'overdue',
    'cancelled'
);

CREATE TYPE exam_type AS ENUM (
    'quiz',
    'midterm',
    'final',
    'assignment',
    'practical'
);

CREATE TYPE grade_enum AS ENUM (
    'A+',
    'A',
    'A-',
    'B+',
    'B',
    'B-',
    'C+',
    'C',
    'C-',
    'D+',
    'D',
    'D-',
    'F'
);

-- Core Tables

-- Tenants Table (Multi-tenant support)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    website VARCHAR(255),
    logo_url TEXT,
    status VARCHAR(20) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Plans Table (Subscription plans)
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type plan_type NOT NULL DEFAULT 'free',
    description TEXT,
    price_monthly DECIMAL(10,2) DEFAULT 0.00,
    price_yearly DECIMAL(10,2) DEFAULT 0.00,
    max_users INTEGER,
    max_schools INTEGER,
    max_students INTEGER,
    max_storage_mb INTEGER DEFAULT 1000,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions Table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status subscription_status DEFAULT 'trial',
    billing_cycle billing_cycle DEFAULT 'monthly',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (Multi-tenant user management)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    school_id UUID,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    role role_enum DEFAULT 'student',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Schools Table (Within each tenant)
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    principal_name VARCHAR(255),
    established_date DATE,
    school_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ClassRooms Table
CREATE TABLE classrooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    grade VARCHAR(20),
    section VARCHAR(20),
    capacity INTEGER DEFAULT 30,
    floor VARCHAR(20),
    building VARCHAR(50),
    equipment JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Subjects Table
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    credits INTEGER DEFAULT 1,
    is_elective BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Students Table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    roll_number VARCHAR(50),
    admission_number VARCHAR(100) UNIQUE,
    date_of_birth DATE,
    gender gender_enum,
    blood_group VARCHAR(10),
    nationality VARCHAR(50),
    religion VARCHAR(50),
    mother_tongue VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relation VARCHAR(50),
    medical_conditions TEXT,
    allergies TEXT,
    previous_school VARCHAR(255),
    admission_date DATE,
    graduation_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Teachers Table
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50),
    qualification VARCHAR(255),
    specialization TEXT,
    experience_years INTEGER DEFAULT 0,
    joining_date DATE,
    salary DECIMAL(10,2),
    subjects JSONB DEFAULT '[]',
    classrooms JSONB DEFAULT '[]',
    is_class_teacher BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Parents Table
CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    occupation VARCHAR(255),
    company VARCHAR(255),
    income_range VARCHAR(50),
    education VARCHAR(255),
    relationship_to_student VARCHAR(50),
    is_primary_guardian BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Student-Parent Relationships
CREATE TABLE student_parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    relationship VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, parent_id)
);

-- Attendance Table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status attendance_status NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, date)
);

-- Exams Table
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    exam_type exam_type NOT NULL,
    max_marks DECIMAL(5,2) DEFAULT 100.00,
    passing_marks DECIMAL(5,2) DEFAULT 33.00,
    duration_minutes INTEGER DEFAULT 60,
    exam_date DATE,
    start_time TIME,
    end_time TIME,
    venue VARCHAR(255),
    instructions TEXT,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Exam Results Table
CREATE TABLE exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    marks_obtained DECIMAL(5,2),
    grade grade_enum,
    percentage DECIMAL(5,2),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, student_id)
);

-- Fee Structure Table
CREATE TABLE fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    grade VARCHAR(20),
    fee_type VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    frequency VARCHAR(50) DEFAULT 'monthly',
    description TEXT,
    is_compulsory BOOLEAN DEFAULT true,
    due_day INTEGER DEFAULT 1,
    late_fee DECIMAL(10,2) DEFAULT 0.00,
    late_fee_applied_after_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Fee Payments Table
CREATE TABLE fee_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    payment_date DATE NOT NULL,
    due_date DATE,
    status fee_status DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    late_fee_applied DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2),
    receipt_number VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Timetable Table
CREATE TABLE timetable (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    period_number INTEGER,
    venue VARCHAR(255),
    academic_year VARCHAR(20),
    semester VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Library Books Table
CREATE TABLE library_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    isbn VARCHAR(20) UNIQUE,
    publisher VARCHAR(255),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    language VARCHAR(50),
    pages INTEGER,
    publication_year INTEGER,
    price DECIMAL(10,2),
    quantity INTEGER DEFAULT 1,
    available_quantity INTEGER DEFAULT 1,
    location VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Book Issuance Table
CREATE TABLE book_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES library_books(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    issued_date DATE NOT NULL,
    due_date DATE NOT NULL,
    returned_date DATE,
    status VARCHAR(20) DEFAULT 'issued',
    fine DECIMAL(10,2) DEFAULT 0.00,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transport Vehicles Table
CREATE TABLE transport_vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50),
    capacity INTEGER NOT NULL,
    driver_name VARCHAR(255),
    driver_phone VARCHAR(50),
    driver_license VARCHAR(50),
    route_name VARCHAR(255),
    route_description TEXT,
    stops JSONB DEFAULT '[]',
    operating_hours VARCHAR(100),
    fuel_type VARCHAR(50),
    registration_number VARCHAR(50),
    insurance_expiry DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Transport Allocations Table
CREATE TABLE transport_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES transport_vehicles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    stop_name VARCHAR(255),
    pickup_time TIME,
    dropoff_time TIME,
    fee_amount DECIMAL(10,2),
    frequency VARCHAR(50) DEFAULT 'monthly',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Hostel Buildings Table
CREATE TABLE hostel_buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    contact_phone VARCHAR(50),
    warden_name VARCHAR(255),
    warden_phone VARCHAR(50),
    total_rooms INTEGER DEFAULT 0,
    capacity INTEGER DEFAULT 0,
    facilities JSONB DEFAULT '[]',
    rules TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Hostel Rooms Table
CREATE TABLE hostel_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID NOT NULL REFERENCES hostel_buildings(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    floor_number INTEGER,
    capacity INTEGER DEFAULT 2,
    occupied_count INTEGER DEFAULT 0,
    room_type VARCHAR(50),
    facilities JSONB DEFAULT '[]',
    monthly_fee DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Hostel Allocations Table
CREATE TABLE hostel_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES hostel_rooms(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    allocation_date DATE NOT NULL,
    vacate_date DATE,
    monthly_fee DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Inventory Categories Table
CREATE TABLE inventory_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    parent_id UUID REFERENCES inventory_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Inventory Items Table
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE,
    description TEXT,
    quantity INTEGER DEFAULT 0,
    unit VARCHAR(50),
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    location VARCHAR(255),
    supplier VARCHAR(255),
    purchase_date DATE,
    warranty_expiry DATE,
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Inventory Transactions Table
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    transaction_date DATE NOT NULL,
    reference_number VARCHAR(255),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'sent',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE,
    parent_message_id UUID REFERENCES messages(id),
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Announcements Table
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    announcement_type VARCHAR(50) DEFAULT 'general',
    priority VARCHAR(20) DEFAULT 'normal',
    target_audience JSONB DEFAULT '[]',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Usage Metrics Table (For SaaS tracking)
CREATE TABLE usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value INTEGER NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tenant Settings Table
CREATE TABLE tenant_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, key)
);

-- System Logs Table
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- File Attachments Table
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(255),
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    priority VARCHAR(20) DEFAULT 'normal',
    read_at TIMESTAMP WITH TIME ZONE,
    data JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance optimization
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_students_tenant_id ON students(tenant_id);
CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_students_classroom_id ON students(classroom_id);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_roll_number ON students(roll_number);

CREATE INDEX idx_attendance_tenant_id ON attendance(tenant_id);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_status ON attendance(status);

CREATE INDEX idx_exams_tenant_id ON exams(tenant_id);
CREATE INDEX idx_exams_school_id ON exams(school_id);
CREATE INDEX idx_exams_classroom_id ON exams(classroom_id);
CREATE INDEX idx_exams_subject_id ON exams(subject_id);
CREATE INDEX idx_exams_date ON exams(exam_date);

CREATE INDEX idx_exam_results_tenant_id ON exam_results(tenant_id);
CREATE INDEX idx_exam_results_exam_id ON exam_results(exam_id);
CREATE INDEX idx_exam_results_student_id ON exam_results(student_id);

CREATE INDEX idx_fee_payments_tenant_id ON fee_payments(tenant_id);
CREATE INDEX idx_fee_payments_student_id ON fee_payments(student_id);
CREATE INDEX idx_fee_payments_status ON fee_payments(status);
CREATE INDEX idx_fee_payments_payment_date ON fee_payments(payment_date);

CREATE INDEX idx_tenant_settings_tenant_id ON tenant_settings(tenant_id);
CREATE INDEX idx_tenant_settings_key ON tenant_settings(key);

CREATE INDEX idx_usage_metrics_tenant_id ON usage_metrics(tenant_id);
CREATE INDEX idx_usage_metrics_period ON usage_metrics(period_start, period_end);

CREATE INDEX idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);

-- Create foreign key constraints for data integrity
ALTER TABLE users ADD CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE users ADD CONSTRAINT fk_users_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_user FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE schools ADD CONSTRAINT fk_schools_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE classrooms ADD CONSTRAINT fk_classrooms_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE classrooms ADD CONSTRAINT fk_classrooms_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE students ADD CONSTRAINT fk_students_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE students ADD CONSTRAINT fk_students_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE students ADD CONSTRAINT fk_students_classroom FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL;
ALTER TABLE students ADD CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add check constraints
ALTER TABLE users ADD CONSTRAINT chk_users_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE students ADD CONSTRAINT chk_students_dob CHECK (date_of_birth <= CURRENT_DATE);
ALTER TABLE exam_results ADD CONSTRAINT chk_exam_results_marks CHECK (marks_obtained >= 0 AND marks_obtained <= max_marks);
ALTER TABLE fee_payments ADD CONSTRAINT chk_fee_payments_amount CHECK (amount > 0);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classrooms_updated_at BEFORE UPDATE ON classrooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_results_updated_at BEFORE UPDATE ON exam_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fee_payments_updated_at BEFORE UPDATE ON fee_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timetable_updated_at BEFORE UPDATE ON timetable
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_library_books_updated_at BEFORE UPDATE ON library_books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_issues_updated_at BEFORE UPDATE ON book_issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transport_vehicles_updated_at BEFORE UPDATE ON transport_vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transport_allocations_updated_at BEFORE UPDATE ON transport_allocations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hostel_buildings_updated_at BEFORE UPDATE ON hostel_buildings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hostel_rooms_updated_at BEFORE UPDATE ON hostel_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hostel_allocations_updated_at BEFORE UPDATE ON hostel_allocations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_transactions_updated_at BEFORE UPDATE ON inventory_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_metrics_updated_at BEFORE UPDATE ON usage_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_settings_updated_at BEFORE UPDATE ON tenant_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_logs_updated_at BEFORE UPDATE ON system_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attachments_updated_at BEFORE UPDATE ON attachments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for active users
CREATE VIEW active_users AS
SELECT 
    u.*,
    t.name as tenant_name,
    s.name as school_name
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id
LEFT JOIN schools s ON u.school_id = s.id
WHERE u.is_active = true 
  AND u.deleted_at IS NULL
  AND (t.deleted_at IS NULL OR t.deleted_at IS NULL)
  AND (s.deleted_at IS NULL OR s.deleted_at IS NULL);

-- Create view for student information
CREATE VIEW student_info AS
SELECT 
    s.*,
    u.username,
    u.email,
    u.phone,
    t.name as tenant_name,
    sc.name as school_name,
    c.name as classroom_name,
    sc.grade,
    sc.section
FROM students s
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN tenants t ON s.tenant_id = t.id
LEFT JOIN schools sc ON s.school_id = sc.id
LEFT JOIN classrooms c ON s.classroom_id = c.id
WHERE s.deleted_at IS NULL;

-- Create view for attendance summary
CREATE VIEW attendance_summary AS
SELECT 
    a.date,
    a.status,
    COUNT(*) as count,
    s.tenant_id,
    sc.name as school_name,
    c.name as classroom_name,
    COUNT(*) FILTER (WHERE a.status = 'present') as present_count,
    COUNT(*) FILTER (WHERE a.status = 'absent') as absent_count,
    COUNT(*) FILTER (WHERE a.status = 'late') as late_count,
    ROUND(COUNT(*) FILTER (WHERE a.status = 'present') * 100.0 / COUNT(*), 2) as attendance_percentage
FROM attendance a
LEFT JOIN students s ON a.student_id = s.id
LEFT JOIN schools sc ON s.school_id = sc.id
LEFT JOIN classrooms c ON a.classroom_id = c.id
WHERE a.deleted_at IS NULL
GROUP BY a.date, a.status, s.tenant_id, sc.name, c.name;

-- Create view for fee collection summary
CREATE VIEW fee_collection_summary AS
SELECT 
    fp.payment_date,
    fp.status,
    COUNT(*) as transaction_count,
    SUM(fp.amount) as total_amount,
    SUM(fp.late_fee_applied) as total_late_fee,
    fp.tenant_id,
    sc.name as school_name,
    COUNT(*) FILTER (WHERE fp.status = 'paid') as paid_count,
    COUNT(*) FILTER (WHERE fp.status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE fp.status = 'overdue') as overdue_count
FROM fee_payments fp
LEFT JOIN students s ON fp.student_id = s.id
LEFT JOIN schools sc ON s.school_id = sc.id
WHERE fp.deleted_at IS NULL
GROUP BY fp.payment_date, fp.status, fp.tenant_id, sc.name;

-- Create view for exam performance summary
CREATE VIEW exam_performance_summary AS
SELECT 
    e.title as exam_title,
    e.exam_type,
    e.max_marks,
    AVG(er.percentage) as average_percentage,
    COUNT(*) as total_students,
    COUNT(*) FILTER (WHERE er.percentage >= e.passing_marks * 100 / e.max_marks) as passed_students,
    ROUND(COUNT(*) FILTER (WHERE er.percentage >= e.passing_marks * 100 / e.max_marks) * 100.0 / COUNT(*), 2) as pass_percentage,
    e.tenant_id,
    sc.name as school_name,
    sub.name as subject_name,
    c.name as classroom_name
FROM exam_results er
LEFT JOIN exams e ON er.exam_id = e.id
LEFT JOIN students s ON er.student_id = s.id
LEFT JOIN schools sc ON s.school_id = sc.id
LEFT JOIN subjects sub ON e.subject_id = sub.id
LEFT JOIN classrooms c ON e.classroom_id = c.id
WHERE er.deleted_at IS NULL
GROUP BY e.title, e.exam_type, e.max_marks, e.tenant_id, sc.name, sub.name, c.name;

-- Create function to generate tenant code
CREATE OR REPLACE FUNCTION generate_tenant_code(name TEXT)
RETURNS TEXT AS $$
DECLARE
    base TEXT;
    suffix TEXT;
    code TEXT;
    counter INTEGER;
BEGIN
    -- Extract first 3 letters and make uppercase
    base := UPPER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z]', '', 'g'), '\s', ''));
    base := SUBSTR(base, 1, 3);
    
    -- Generate random suffix
    suffix := UPPER(encode(decode(md5(random()::text || name), 'hex'), 'hex'));
    suffix := SUBSTR(suffix, 1, 4);
    
    code := base || suffix;
    
    -- Ensure uniqueness
    counter := 0;
    LOOP
        IF EXISTS (SELECT 1 FROM tenants WHERE code = code) THEN
            counter := counter + 1;
            suffix := UPPER(encode(decode(md5(random()::text || name || counter), 'hex'), 'hex'));
            suffix := SUBSTR(suffix, 1, 4);
            code := base || suffix;
        ELSE
            EXIT;
        END IF;
        
        IF counter > 100 THEN
            RAISE EXCEPTION 'Could not generate unique tenant code after 100 attempts';
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate attendance percentage
CREATE OR REPLACE FUNCTION calculate_attendance_percentage(student_id_param UUID, start_date DATE, end_date DATE)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_classes INTEGER;
    present_classes INTEGER;
    percentage DECIMAL(5,2);
BEGIN
    -- Count total classes in the period
    SELECT COUNT(*) INTO total_classes
    FROM attendance
    WHERE student_id = student_id_param
      AND date BETWEEN start_date AND end_date;
    
    -- Count present classes
    SELECT COUNT(*) INTO present_classes
    FROM attendance
    WHERE student_id = student_id_param
      AND date BETWEEN start_date AND end_date
      AND status = 'present';
    
    -- Calculate percentage
    IF total_classes > 0 THEN
        percentage := (present_classes::DECIMAL / total_classes::DECIMAL) * 100;
    ELSE
        percentage := 0;
    END IF;
    
    RETURN percentage;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate GPA
CREATE OR REPLACE FUNCTION calculate_gpa(student_id_param UUID, academic_year VARCHAR(20))
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_points DECIMAL(10,2) := 0;
    total_credits DECIMAL(10,2) := 0;
    gpa DECIMAL(5,2);
BEGIN
    -- Calculate total points and credits
    SELECT 
        SUM(
            CASE 
                WHEN er.grade = 'A+' THEN 4.0 * sub.credits
                WHEN er.grade = 'A' THEN 4.0 * sub.credits
                WHEN er.grade = 'A-' THEN 3.7 * sub.credits
                WHEN er.grade = 'B+' THEN 3.3 * sub.credits
                WHEN er.grade = 'B' THEN 3.0 * sub.credits
                WHEN er.grade = 'B-' THEN 2.7 * sub.credits
                WHEN er.grade = 'C+' THEN 2.3 * sub.credits
                WHEN er.grade = 'C' THEN 2.0 * sub.credits
                WHEN er.grade = 'C-' THEN 1.7 * sub.credits
                WHEN er.grade = 'D+' THEN 1.3 * sub.credits
                WHEN er.grade = 'D' THEN 1.0 * sub.credits
                WHEN er.grade = 'D-' THEN 0.7 * sub.credits
                ELSE 0
            END
        ),
        SUM(sub.credits)
    INTO total_points, total_credits
    FROM exam_results er
    LEFT JOIN exams e ON er.exam_id = e.id
    LEFT JOIN subjects sub ON e.subject_id = sub.id
    LEFT JOIN students s ON er.student_id = s.id
    WHERE er.student_id = student_id_param
      AND e.academic_year = academic_year
      AND er.grade IS NOT NULL;
    
    -- Calculate GPA
    IF total_credits > 0 THEN
        gpa := total_points / total_credits;
    ELSE
        gpa := 0;
    END IF;
    
    RETURN gpa;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update available quantity in library books
CREATE OR REPLACE FUNCTION update_book_quantity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE library_books 
    SET available_quantity = quantity - (
        SELECT COUNT(*) 
        FROM book_issues 
        WHERE book_id = NEW.book_id 
          AND status = 'issued'
    )
    WHERE id = NEW.book_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_book_quantity_on_issue
    AFTER INSERT OR UPDATE OR DELETE ON book_issues
    FOR EACH ROW EXECUTE FUNCTION update_book_quantity();

-- Create trigger to automatically update occupied count in hostel rooms
CREATE OR REPLACE FUNCTION update_room_occupancy()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE hostel_rooms 
    SET occupied_count = (
        SELECT COUNT(*) 
        FROM hostel_allocations 
        WHERE room_id = NEW.room_id 
          AND status = 'active'
          AND (vacate_date IS NULL OR vacate_date > CURRENT_DATE)
    )
    WHERE id = NEW.room_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_room_occupancy_on_allocation
    AFTER INSERT OR UPDATE OR DELETE ON hostel_allocations
    FOR EACH ROW EXECUTE FUNCTION update_room_occupancy();

-- Create trigger to track inventory stock levels
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE inventory_items 
    SET quantity = (
        SELECT COALESCE(SUM(
            CASE 
                WHEN transaction_type = 'in' THEN quantity
                WHEN transaction_type = 'out' THEN -quantity
                ELSE 0
            END
        ), 0)
        FROM inventory_transactions
        WHERE item_id = NEW.item_id
    )
    WHERE id = NEW.item_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_stock_on_transaction
    AFTER INSERT OR UPDATE ON inventory_transactions
    FOR EACH ROW EXECUTE FUNCTION update_inventory_stock();

COMMIT;
