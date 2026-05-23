-- Simplified PostgreSQL-ready database design
-- Generated from the current School Management System domain model.
-- Focus:
-- 1. clean relational structure
-- 2. practical foreign keys and indexes
-- 3. PostgreSQL-native types for production use

BEGIN;

CREATE TYPE user_role AS ENUM (
    'superadmin',
    'admin',
    'school',
    'teacher',
    'student',
    'parent',
    'accountant',
    'librarian'
);

CREATE TYPE request_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE admission_status AS ENUM (
    'submitted',
    'under_review',
    'approved',
    'rejected'
);

CREATE TYPE attendance_status AS ENUM (
    'present',
    'absent',
    'late',
    'excused'
);

CREATE TYPE fee_status AS ENUM (
    'draft',
    'issued',
    'partially_paid',
    'paid',
    'overdue'
);

CREATE TABLE tenants (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE,
    contact_email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE schools (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE SET NULL,
    school_id BIGINT REFERENCES schools(id) ON DELETE SET NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(200),
    email VARCHAR(255),
    role user_role NOT NULL DEFAULT 'student',
    hashed_password TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tenant_requests (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(255),
    requested_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    details TEXT,
    status request_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_requests (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(255),
    role user_role NOT NULL,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE SET NULL,
    school_id BIGINT REFERENCES schools(id) ON DELETE SET NULL,
    hashed_password TEXT NOT NULL,
    requested_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    details TEXT,
    status request_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE classrooms (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    admission_no VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admissions_applications (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    applicant_name VARCHAR(200) NOT NULL,
    guardian_name VARCHAR(200),
    date_of_birth DATE,
    grade_applied VARCHAR(50),
    status admission_status NOT NULL DEFAULT 'submitted',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE attendance_records (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status attendance_status NOT NULL DEFAULT 'present',
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fee_invoices (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    student_id BIGINT REFERENCES students(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    due_date DATE,
    status fee_status NOT NULL DEFAULT 'draft',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fee_payments (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    invoice_id BIGINT REFERENCES fee_invoices(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    payment_date DATE,
    reference VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exams (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    term VARCHAR(50),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exam_results (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    exam_id BIGINT REFERENCES exams(id) ON DELETE CASCADE,
    student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    score NUMERIC(8,2) NOT NULL,
    grade VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE timetable_entries (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    classroom_id BIGINT REFERENCES classrooms(id) ON DELETE SET NULL,
    teacher_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    subject VARCHAR(100) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    position VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    salary NUMERIC(12,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payroll_records (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    gross_pay NUMERIC(12,2) NOT NULL,
    net_pay NUMERIC(12,2) NOT NULL,
    paid_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE leave_requests (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE transport_routes (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vehicles (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    registration_no VARCHAR(50) NOT NULL UNIQUE,
    capacity INTEGER,
    driver_name VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE transport_assignments (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    route_id BIGINT REFERENCES transport_routes(id) ON DELETE SET NULL,
    vehicle_id BIGINT REFERENCES vehicles(id) ON DELETE SET NULL,
    student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory_items (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(80),
    quantity INTEGER NOT NULL DEFAULT 0,
    location VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory_transactions (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    item_id BIGINT REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,
    transaction_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE library_books (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(200),
    isbn VARCHAR(30),
    copies INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE library_issues (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    book_id BIGINT REFERENCES library_books(id) ON DELETE CASCADE,
    student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    fine_amount NUMERIC(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hostel_rooms (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    room_no VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hostel_assignments (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    room_id BIGINT REFERENCES hostel_rooms(id) ON DELETE CASCADE,
    student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE announcements (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    posted_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE direct_messages (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    sender_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    recipient_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE metric_snapshots (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
    metric_key VARCHAR(100) NOT NULL,
    metric_value NUMERIC(14,2) NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_schools_tenant_id ON schools(tenant_id);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_classrooms_school_id ON classrooms(school_id);
CREATE INDEX idx_attendance_school_student ON attendance_records(school_id, student_id, attendance_date);
CREATE INDEX idx_fee_invoices_student_id ON fee_invoices(student_id);
CREATE INDEX idx_exam_results_exam_student ON exam_results(exam_id, student_id);
CREATE INDEX idx_timetable_school_classroom ON timetable_entries(school_id, classroom_id);
CREATE INDEX idx_employees_school_id ON employees(school_id);
CREATE INDEX idx_transport_assignments_student_id ON transport_assignments(student_id);
CREATE INDEX idx_inventory_transactions_item_id ON inventory_transactions(item_id);
CREATE INDEX idx_library_issues_student_id ON library_issues(student_id);
CREATE INDEX idx_hostel_assignments_student_id ON hostel_assignments(student_id);
CREATE INDEX idx_announcements_school_id ON announcements(school_id);
CREATE INDEX idx_direct_messages_sender_recipient ON direct_messages(sender_id, recipient_id);
CREATE INDEX idx_metric_snapshots_school_key ON metric_snapshots(school_id, metric_key);

COMMIT;
