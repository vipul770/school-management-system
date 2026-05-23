-- School Management System Sample Data Seeding Script
-- Created: 2024-12-07
-- Version: 1.0
-- Description: Sample data for testing and demonstration purposes

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert sample plans
INSERT INTO plans (id, name, type, description, price_monthly, price_yearly, max_users, max_schools, max_students, max_storage_mb, features, is_active) VALUES
(uuid_generate_v4(), 'Free Plan', 'free', 'Basic features for small schools', 0.00, 0.00, 50, 1, 100, 1000, '{"attendance": true, "basic_reports": true, "student_management": true}', true),
(uuid_generate_v4(), 'Professional Plan', 'professional', 'Advanced features for growing schools', 29.99, 299.99, 500, 5, 1000, 10000, '{"attendance": true, "advanced_reports": true, "student_management": true, "fee_management": true, "exams": true, "library": true}', true),
(uuid_generate_v4(), 'Enterprise Plan', 'enterprise', 'Complete solution for large institutions', 99.99, 999.99, 5000, 50, 10000, 100000, '{"attendance": true, "advanced_reports": true, "student_management": true, "fee_management": true, "exams": true, "library": true, "transport": true, "hostel": true, "hr": true, "api_access": true}', true);

-- Insert sample tenants
INSERT INTO tenants (id, name, code, contact_email, contact_phone, address, city, state, country, postal_code, website, status, settings) VALUES
(uuid_generate_v4(), 'Riverside Academy', 'RVR123', 'admin@riverside.edu', '+1-555-0101', '123 Riverside Drive', 'Springfield', 'IL', 'USA', '62701', 'www.riverside.edu', 'active', '{"theme": "blue", "logo": "riverside_logo.png"}'),
(uuid_generate_v4(), 'Mountain View High School', 'MVH456', 'info@mountainview.edu', '+1-555-0102', '456 Mountain Road', 'Denver', 'CO', 'USA', '80202', 'www.mountainview.edu', 'active', '{"theme": "green", "logo": "mvhs_logo.png"}'),
(uuid_generate_v4(), 'Bright Future Academy', 'BFA789', 'contact@brightfuture.edu', '+1-555-0103', '789 Future Lane', 'Austin', 'TX', 'USA', '78701', 'www.brightfuture.edu', 'active', '{"theme": "purple", "logo": "bfa_logo.png"}');

-- Get tenant IDs for reference
DO $$
DECLARE
    tenant1_id UUID;
    tenant2_id UUID;
    tenant3_id UUID;
    plan_professional_id UUID;
    plan_enterprise_id UUID;
BEGIN
    SELECT id INTO tenant1_id FROM tenants WHERE code = 'RVR123';
    SELECT id INTO tenant2_id FROM tenants WHERE code = 'MVH456';
    SELECT id INTO tenant3_id FROM tenants WHERE code = 'BFA789';
    
    SELECT id INTO plan_professional_id FROM plans WHERE name = 'Professional Plan';
    SELECT id INTO plan_enterprise_id FROM plans WHERE name = 'Enterprise Plan';
    
    -- Insert sample subscriptions
    INSERT INTO subscriptions (id, tenant_id, plan_id, status, billing_cycle, trial_ends_at, current_period_start, current_period_end, auto_renew) VALUES
    (uuid_generate_v4(), tenant1_id, plan_professional_id, 'active', 'monthly', NULL, CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month' - INTERVAL '1 day', true),
    (uuid_generate_v4(), tenant2_id, plan_enterprise_id, 'active', 'yearly', NULL, CURRENT_DATE - INTERVAL '3 months', CURRENT_DATE + INTERVAL '9 months', true),
    (uuid_generate_v4(), tenant3_id, plan_professional_id, 'trial', 'monthly', CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month' - INTERVAL '1 day', false);
END $$;

-- Insert sample schools
DO $$
DECLARE
    tenant1_id UUID;
    tenant2_id UUID;
    tenant3_id UUID;
BEGIN
    SELECT id INTO tenant1_id FROM tenants WHERE code = 'RVR123';
    SELECT id INTO tenant2_id FROM tenants WHERE code = 'MVH456';
    SELECT id INTO tenant3_id FROM tenants WHERE code = 'BFA789';
    
    INSERT INTO schools (id, tenant_id, name, code, address, city, state, country, postal_code, contact_email, contact_phone, principal_name, established_date, school_type, status) VALUES
    (uuid_generate_v4(), tenant1_id, 'Riverside Elementary School', 'RVR_ELEM', '123 Riverside Drive', 'Springfield', 'IL', 'USA', '62701', 'elem@riverside.edu', '+1-555-0101', 'Dr. Sarah Johnson', '1995-08-15', 'Elementary', 'active'),
    (uuid_generate_v4(), tenant1_id, 'Riverside Middle School', 'RVR_MS', '125 Riverside Drive', 'Springfield', 'IL', 'USA', '62701', 'middle@riverside.edu', '+1-555-0102', 'Mr. Michael Chen', '2000-08-15', 'Middle', 'active'),
    (uuid_generate_v4(), tenant2_id, 'Mountain View High School', 'MV_HS', '456 Mountain Road', 'Denver', 'CO', 'USA', '80202', 'info@mountainview.edu', '+1-555-0103', 'Ms. Emily Davis', '1985-08-15', 'High', 'active'),
    (uuid_generate_v4(), tenant3_id, 'Bright Future Academy', 'BF_ACADEMY', '789 Future Lane', 'Austin', 'TX', 'USA', '78701', 'contact@brightfuture.edu', '+1-555-0104', 'Dr. Robert Wilson', '2010-08-15', 'K-12', 'active');
END $$;

-- Insert sample subjects
DO $$
DECLARE
    tenant1_id UUID;
    tenant2_id UUID;
    tenant3_id UUID;
BEGIN
    SELECT id INTO tenant1_id FROM tenants WHERE code = 'RVR123';
    SELECT id INTO tenant2_id FROM tenants WHERE code = 'MVH456';
    SELECT id INTO tenant3_id FROM tenants WHERE code = 'BFA789';
    
    -- Subjects for tenant 1
    INSERT INTO subjects (id, tenant_id, name, code, description, credits, is_elective) VALUES
    (uuid_generate_v4(), tenant1_id, 'Mathematics', 'MATH', 'Core mathematics curriculum', 5, false),
    (uuid_generate_v4(), tenant1_id, 'Science', 'SCI', 'General science', 4, false),
    (uuid_generate_v4(), tenant1_id, 'English', 'ENG', 'English language and literature', 4, false),
    (uuid_generate_v4(), tenant1_id, 'Social Studies', 'SS', 'History and geography', 3, false),
    (uuid_generate_v4(), tenant1_id, 'Physical Education', 'PE', 'Physical fitness and sports', 2, false),
    (uuid_generate_v4(), tenant1_id, 'Art', 'ART', 'Visual arts', 2, true),
    (uuid_generate_v4(), tenant1_id, 'Music', 'MUSIC', 'Music education', 2, true),
    (uuid_generate_v4(), tenant1_id, 'Computer Science', 'CS', 'Introduction to computers', 3, true);
    
    -- Subjects for tenant 2
    INSERT INTO subjects (id, tenant_id, name, code, description, credits, is_elective) VALUES
    (uuid_generate_v4(), tenant2_id, 'Algebra', 'ALG', 'Advanced algebra', 4, false),
    (uuid_generate_v4(), tenant2_id, 'Geometry', 'GEO', 'Plane and solid geometry', 4, false),
    (uuid_generate_v4(), tenant2_id, 'Biology', 'BIO', 'Life sciences', 4, false),
    (uuid_generate_v4(), tenant2_id, 'Chemistry', 'CHEM', 'Chemical sciences', 4, false),
    (uuid_generate_v4(), tenant2_id, 'Physics', 'PHY', 'Physical sciences', 4, false),
    (uuid_generate_v4(), tenant2_id, 'World History', 'WH', 'Global history', 3, false),
    (uuid_generate_v4(), tenant2_id, 'Economics', 'ECON', 'Micro and macro economics', 3, true),
    (uuid_generate_v4(), tenant2_id, 'Psychology', 'PSYCH', 'Introduction to psychology', 3, true);
    
    -- Subjects for tenant 3
    INSERT INTO subjects (id, tenant_id, name, code, description, credits, is_elective) VALUES
    (uuid_generate_v4(), tenant3_id, 'Reading', 'READ', 'Basic reading skills', 3, false),
    (uuid_generate_v4(), tenant3_id, 'Writing', 'WRITE', 'Writing fundamentals', 3, false),
    (uuid_generate_v4(), tenant3_id, 'Mathematics', 'MATH', 'Basic mathematics', 4, false),
    (uuid_generate_v4(), tenant3_id, 'Science', 'SCI', 'General science', 3, false),
    (uuid_generate_v4(), tenant3_id, 'Spanish', 'SPAN', 'Spanish language', 2, true),
    (uuid_generate_v4(), tenant3_id, 'French', 'FRENCH', 'French language', 2, true);
END $$;

-- Insert sample classrooms
DO $$
DECLARE
    tenant1_id UUID;
    tenant2_id UUID;
    tenant3_id UUID;
    school_elem_id UUID;
    school_ms_id UUID;
    school_hs_id UUID;
    school_academy_id UUID;
BEGIN
    SELECT id INTO tenant1_id FROM tenants WHERE code = 'RVR123';
    SELECT id INTO tenant2_id FROM tenants WHERE code = 'MVH456';
    SELECT id INTO tenant3_id FROM tenants WHERE code = 'BFA789';
    
    SELECT id INTO school_elem_id FROM schools WHERE code = 'RVR_ELEM';
    SELECT id INTO school_ms_id FROM schools WHERE code = 'RVR_MS';
    SELECT id INTO school_hs_id FROM schools WHERE code = 'MV_HS';
    SELECT id INTO school_academy_id FROM schools WHERE code = 'BF_ACADEMY';
    
    -- Elementary classrooms
    INSERT INTO classrooms (id, tenant_id, school_id, name, grade, section, capacity, floor, building) VALUES
    (uuid_generate_v4(), tenant1_id, school_elem_id, 'Grade 1A', '1', 'A', 25, 1, 'Main Building'),
    (uuid_generate_v4(), tenant1_id, school_elem_id, 'Grade 1B', '1', 'B', 25, 1, 'Main Building'),
    (uuid_generate_v4(), tenant1_id, school_elem_id, 'Grade 2A', '2', 'A', 25, 1, 'Main Building'),
    (uuid_generate_v4(), tenant1_id, school_elem_id, 'Grade 2B', '2', 'B', 25, 1, 'Main Building'),
    (uuid_generate_v4(), tenant1_id, school_elem_id, 'Grade 3A', '3', 'A', 30, 2, 'Main Building'),
    (uuid_generate_v4(), tenant1_id, school_elem_id, 'Grade 3B', '3', 'B', 30, 2, 'Main Building'),
    (uuid_generate_v4(), tenant1_id, school_elem_id, 'Grade 4A', '4', 'A', 30, 2, 'Main Building'),
    (uuid_generate_v4(), tenant1_id, school_elem_id, 'Grade 4B', '4', 'B', 30, 2, 'Main Building'),
    (uuid_generate_v4(), tenant1_id, school_elem_id, 'Grade 5A', '5', 'A', 30, 3, 'Main Building'),
    (uuid_generate_v4(), tenant1_id, school_elem_id, 'Grade 5B', '5', 'B', 30, 3, 'Main Building');
    
    -- Middle school classrooms
    INSERT INTO classrooms (id, tenant_id, school_id, name, grade, section, capacity, floor, building) VALUES
    (uuid_generate_v4(), tenant1_id, school_ms_id, 'Grade 6A', '6', 'A', 35, 1, 'Middle Building'),
    (uuid_generate_v4(), tenant1_id, school_ms_id, 'Grade 6B', '6', 'B', 35, 1, 'Middle Building'),
    (uuid_generate_v4(), tenant1_id, school_ms_id, 'Grade 7A', '7', 'A', 35, 2, 'Middle Building'),
    (uuid_generate_v4(), tenant1_id, school_ms_id, 'Grade 7B', '7', 'B', 35, 2, 'Middle Building'),
    (uuid_generate_v4(), tenant1_id, school_ms_id, 'Grade 8A', '8', 'A', 35, 3, 'Middle Building'),
    (uuid_generate_v4(), tenant1_id, school_ms_id, 'Grade 8B', '8', 'B', 35, 3, 'Middle Building');
    
    -- High school classrooms
    INSERT INTO classrooms (id, tenant_id, school_id, name, grade, section, capacity, floor, building) VALUES
    (uuid_generate_v4(), tenant2_id, school_hs_id, 'Grade 9A', '9', 'A', 40, 1, 'Science Building'),
    (uuid_generate_v4(), tenant2_id, school_hs_id, 'Grade 9B', '9', 'B', 40, 1, 'Science Building'),
    (uuid_generate_v4(), tenant2_id, school_hs_id, 'Grade 10A', '10', 'A', 40, 2, 'Science Building'),
    (uuid_generate_v4(), tenant2_id, school_hs_id, 'Grade 10B', '10', 'B', 40, 2, 'Science Building'),
    (uuid_generate_v4(), tenant2_id, school_hs_id, 'Grade 11A', '11', 'A', 40, 3, 'Science Building'),
    (uuid_generate_v4(), tenant2_id, school_hs_id, 'Grade 11B', '11', 'B', 40, 3, 'Science Building'),
    (uuid_generate_v4(), tenant2_id, school_hs_id, 'Grade 12A', '12', 'A', 40, 4, 'Science Building'),
    (uuid_generate_v4(), tenant2_id, school_hs_id, 'Grade 12B', '12', 'B', 40, 4, 'Science Building');
    
    -- Academy classrooms
    INSERT INTO classrooms (id, tenant_id, school_id, name, grade, section, capacity, floor, building) VALUES
    (uuid_generate_v4(), tenant3_id, school_academy_id, 'Kindergarten A', 'K', 'A', 20, 1, 'Primary Building'),
    (uuid_generate_v4(), tenant3_id, school_academy_id, 'Kindergarten B', 'K', 'B', 20, 1, 'Primary Building'),
    (uuid_generate_v4(), tenant3_id, school_academy_id, 'Grade 1A', '1', 'A', 25, 1, 'Primary Building'),
    (uuid_generate_v4(), tenant3_id, school_academy_id, 'Grade 2A', '2', 'A', 25, 2, 'Primary Building'),
    (uuid_generate_v4(), tenant3_id, school_academy_id, 'Grade 3A', '3', 'A', 30, 2, 'Primary Building'),
    (uuid_generate_v4(), tenant3_id, school_academy_id, 'Grade 4A', '4', 'A', 30, 3, 'Primary Building'),
    (uuid_generate_v4(), tenant3_id, school_academy_id, 'Grade 5A', '5', 'A', 30, 3, 'Primary Building'),
    (uuid_generate_v4(), tenant3_id, school_academy_id, 'Grade 6A', '6', 'A', 35, 1, 'Secondary Building'),
    (uuid_generate_v4(), tenant3_id, school_academy_id, 'Grade 7A', '7', 'A', 35, 2, 'Secondary Building'),
    (uuid_generate_v4(), tenant3_id, school_academy_id, 'Grade 8A', '8', 'A', 35, 3, 'Secondary Building');
END $$;

-- Insert sample users (superadmin, admin, teachers, students)
DO $$
DECLARE
    tenant1_id UUID;
    tenant2_id UUID;
    tenant3_id UUID;
    school_elem_id UUID;
    school_ms_id UUID;
    school_hs_id UUID;
    school_academy_id UUID;
    classroom_ids UUID[];
    i INTEGER;
BEGIN
    SELECT id INTO tenant1_id FROM tenants WHERE code = 'RVR123';
    SELECT id INTO tenant2_id FROM tenants WHERE code = 'MVH456';
    SELECT id INTO tenant3_id FROM tenants WHERE code = 'BFA789';
    
    SELECT id INTO school_elem_id FROM schools WHERE code = 'RVR_ELEM';
    SELECT id INTO school_ms_id FROM schools WHERE code = 'RVR_MS';
    SELECT id INTO school_hs_id FROM schools WHERE code = 'MV_HS';
    SELECT id INTO school_academy_id FROM schools WHERE code = 'BF_ACADEMY';
    
    -- Super admin
    INSERT INTO users (id, username, email, password_hash, full_name, phone, role, is_active, email_verified) VALUES
    (uuid_generate_v4(), 'superadmin', 'superadmin@schoolpro.com', crypt('admin123', gen_salt('bf')), 'Super Admin', '+1-555-0000', 'superadmin', true, true);
    
    -- Tenant admins
    INSERT INTO users (id, tenant_id, username, email, password_hash, full_name, phone, role, is_active, email_verified) VALUES
    (uuid_generate_v4(), tenant1_id, 'admin_riverside', 'admin@riverside.edu', crypt('admin123', gen_salt('bf')), 'Sarah Johnson', '+1-555-0101', 'admin', true, true),
    (uuid_generate_v4(), tenant2_id, 'admin_mountain', 'admin@mountainview.edu', crypt('admin123', gen_salt('bf')), 'Michael Chen', '+1-555-0102', 'admin', true, true),
    (uuid_generate_v4(), tenant3_id, 'admin_bright', 'admin@brightfuture.edu', crypt('admin123', gen_salt('bf')), 'Emily Davis', '+1-555-0103', 'admin', true, true);
    
    -- Sample teachers
    INSERT INTO users (id, tenant_id, school_id, username, email, password_hash, full_name, phone, role, is_active, email_verified) VALUES
    (uuid_generate_v4(), tenant1_id, school_elem_id, 'teacher1', 'teacher1@riverside.edu', crypt('teacher123', gen_salt('bf')), 'Alice Thompson', '+1-555-0111', 'teacher', true, true),
    (uuid_generate_v4(), tenant1_id, school_elem_id, 'teacher2', 'teacher2@riverside.edu', crypt('teacher123', gen_salt('bf')), 'Bob Wilson', '+1-555-0112', 'teacher', true, true),
    (uuid_generate_v4(), tenant1_id, school_ms_id, 'teacher3', 'teacher3@riverside.edu', crypt('teacher123', gen_salt('bf')), 'Carol Martinez', '+1-555-0113', 'teacher', true, true),
    (uuid_generate_v4(), tenant2_id, school_hs_id, 'teacher4', 'teacher4@mountainview.edu', crypt('teacher123', gen_salt('bf')), 'David Brown', '+1-555-0114', 'teacher', true, true),
    (uuid_generate_v4(), tenant2_id, school_hs_id, 'teacher5', 'teacher5@mountainview.edu', crypt('teacher123', gen_salt('bf')), 'Emma Davis', '+1-555-0115', 'teacher', true, true),
    (uuid_generate_v4(), tenant3_id, school_academy_id, 'teacher6', 'teacher6@brightfuture.edu', crypt('teacher123', gen_salt('bf')), 'Frank Miller', '+1-555-0116', 'teacher', true, true);
    
    -- Create teachers records
    INSERT INTO teachers (id, tenant_id, school_id, user_id, employee_id, qualification, specialization, experience_years, joining_date, salary, subjects, classrooms, is_class_teacher, status) VALUES
    (uuid_generate_v4(), tenant1_id, school_elem_id, (SELECT id FROM users WHERE username = 'teacher1'), 'T001', 'M.Ed', 'Elementary Education', 8, '2016-08-15', 45000.00, '["Mathematics", "Science"]', '["Grade 1A", "Grade 1B"]', true, 'active'),
    (uuid_generate_v4(), tenant1_id, school_elem_id, (SELECT id FROM users WHERE username = 'teacher2'), 'T002', 'M.A. Education', 'Language Arts', 6, '2018-08-15', 42000.00, '["English", "Social Studies"]', '["Grade 2A", "Grade 2B"]', false, 'active'),
    (uuid_generate_v4(), tenant1_id, school_ms_id, (SELECT id FROM users WHERE username = 'teacher3'), 'T003', 'M.Sc. Physics', 'Physical Sciences', 10, '2014-08-15', 55000.00, '["Science", "Mathematics"]', '["Grade 6A", "Grade 6B"]', true, 'active'),
    (uuid_generate_v4(), tenant2_id, school_hs_id, (SELECT id FROM users WHERE username = 'teacher4'), 'T004', 'Ph.D. Mathematics', 'Advanced Mathematics', 15, '2009-08-15', 65000.00, '["Algebra", "Geometry", "Calculus"]', '["Grade 9A", "Grade 10A"]', true, 'active'),
    (uuid_generate_v4(), tenant2_id, school_hs_id, (SELECT id FROM users WHERE username = 'teacher5'), 'T005', 'M.S. Biology', 'Life Sciences', 12, '2012-08-15', 58000.00, '["Biology", "Chemistry"]', '["Grade 11A", "Grade 12A"]', false, 'active'),
    (uuid_generate_v4(), tenant3_id, school_academy_id, (SELECT id FROM users WHERE username = 'teacher6'), 'T006', 'B.Ed. Elementary', 'Primary Education', 5, '2019-08-15', 40000.00, '["Reading", "Writing", "Mathematics"]', '["Kindergarten A", "Grade 1A"]', true, 'active');
    
    -- Sample students
    FOR i IN 1..50 LOOP
        INSERT INTO users (id, tenant_id, username, email, password_hash, full_name, phone, role, is_active, email_verified) VALUES
        (uuid_generate_v4(), tenant1_id, 'student' || i, 'student' || i || '@riverside.edu', crypt('student123', gen_salt('bf')), 'Student ' || i, '+1-555-100' || i, 'student', true, false);
        
        INSERT INTO students (id, tenant_id, school_id, classroom_id, user_id, roll_number, admission_number, date_of_birth, gender, blood_group, address, city, state, country, postal_code, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, admission_date, status) VALUES
        (uuid_generate_v4(), tenant1_id, school_elem_id, 
         (SELECT id FROM classrooms WHERE tenant_id = tenant1_id AND name LIKE 'Grade %' LIMIT 1),
         (SELECT id FROM users WHERE username = 'student' || i),
         'R' || LPAD(i::text, 4, '0'),
         'ADM' || LPAD(i::text, 6, '0'),
         '2010-01-01' + (i || ' days')::interval,
         CASE WHEN i % 2 = 0 THEN 'male' ELSE 'female' END,
         CASE WHEN i % 4 = 0 THEN 'O+' WHEN i % 4 = 1 THEN 'A+' WHEN i % 4 = 2 THEN 'B+' ELSE 'AB+' END,
         '123 Student Street',
         'Springfield',
         'IL',
         'USA',
         '62701',
         'Parent ' || i,
         '+1-555-200' || i,
         'Father',
         '2015-08-15',
         'active');
    END LOOP;
    
    FOR i IN 51..100 LOOP
        INSERT INTO users (id, tenant_id, username, email, password_hash, full_name, phone, role, is_active, email_verified) VALUES
        (uuid_generate_v4(), tenant2_id, 'student' || i, 'student' || i || '@mountainview.edu', crypt('student123', gen_salt('bf')), 'Student ' || i, '+1-555-100' || i, 'student', true, false);
        
        INSERT INTO students (id, tenant_id, school_id, classroom_id, user_id, roll_number, admission_number, date_of_birth, gender, blood_group, address, city, state, country, postal_code, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, admission_date, status) VALUES
        (uuid_generate_v4(), tenant2_id, school_hs_id,
         (SELECT id FROM classrooms WHERE tenant_id = tenant2_id AND name LIKE 'Grade %' LIMIT 1),
         (SELECT id FROM users WHERE username = 'student' || i),
         'M' || LPAD(i::text, 4, '0'),
         'ADM' || LPAD(i::text, 6, '0'),
         '2008-01-01' + (i || ' days')::interval,
         CASE WHEN i % 2 = 0 THEN 'male' ELSE 'female' END,
         CASE WHEN i % 4 = 0 THEN 'O+' WHEN i % 4 = 1 THEN 'A+' WHEN i % 4 = 2 THEN 'B+' ELSE 'AB+' END,
         '456 Mountain Road',
         'Denver',
         'CO',
         'USA',
         '80202',
         'Parent ' || i,
         '+1-555-200' || i,
         'Mother',
         '2013-08-15',
         'active');
    END LOOP;
    
    FOR i IN 101..150 LOOP
        INSERT INTO users (id, tenant_id, username, email, password_hash, full_name, phone, role, is_active, email_verified) VALUES
        (uuid_generate_v4(), tenant3_id, 'student' || i, 'student' || i || '@brightfuture.edu', crypt('student123', gen_salt('bf')), 'Student ' || i, '+1-555-100' || i, 'student', true, false);
        
        INSERT INTO students (id, tenant_id, school_id, classroom_id, user_id, roll_number, admission_number, date_of_birth, gender, blood_group, address, city, state, country, postal_code, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, admission_date, status) VALUES
        (uuid_generate_v4(), tenant3_id, school_academy_id,
         (SELECT id FROM classrooms WHERE tenant_id = tenant3_id AND name LIKE 'Grade %' LIMIT 1),
         (SELECT id FROM users WHERE username = 'student' || i),
         'B' || LPAD(i::text, 4, '0'),
         'ADM' || LPAD(i::text, 6, '0'),
         '2012-01-01' + (i || ' days')::interval,
         CASE WHEN i % 2 = 0 THEN 'male' ELSE 'female' END,
         CASE WHEN i % 4 = 0 THEN 'O+' WHEN i % 4 = 1 THEN 'A+' WHEN i % 4 = 2 THEN 'B+' ELSE 'AB+' END,
         '789 Future Lane',
         'Austin',
         'TX',
         'USA',
         '78701',
         'Parent ' || i,
         '+1-555-200' || i,
         'Guardian',
         '2017-08-15',
         'active');
    END LOOP;
END $$;

-- Insert sample attendance data
DO $$
DECLARE
    student_record RECORD;
    attendance_date DATE;
    attendance_status attendance_status;
BEGIN
    -- Generate attendance for the last 30 days
    FOR attendance_date IN (CURRENT_DATE - INTERVAL '30 days')..(CURRENT_DATE - INTERVAL '1 day') LOOP
        FOR student_record IN 
            SELECT s.id, s.tenant_id, s.classroom_id 
            FROM students s 
            WHERE s.deleted_at IS NULL 
            LIMIT 100
        LOOP
            -- Random attendance status
            attendance_status := CASE 
                WHEN random() < 0.85 THEN 'present'
                WHEN random() < 0.10 THEN 'absent'
                WHEN random() < 0.18 THEN 'late'
                ELSE 'excused'
            END;
            
            INSERT INTO attendance (id, tenant_id, student_id, classroom_id, date, status, check_in_time, check_out_time, remarks) VALUES
            (uuid_generate_v4(), student_record.tenant_id, student_record.id, student_record.classroom_id, attendance_date, attendance_status,
             CASE WHEN attendance_status = 'present' THEN '08:00' WHEN attendance_status = 'late' THEN '08:15' ELSE NULL END,
             CASE WHEN attendance_status = 'present' THEN '15:00' ELSE NULL END,
             CASE WHEN attendance_status = 'absent' THEN 'Absent without notice' ELSE NULL END)
            ON CONFLICT (student_id, date) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Insert sample fee structures
DO $$
DECLARE
    tenant1_id UUID;
    tenant2_id UUID;
    tenant3_id UUID;
    school_elem_id UUID;
    school_ms_id UUID;
    school_hs_id UUID;
    school_academy_id UUID;
BEGIN
    SELECT id INTO tenant1_id FROM tenants WHERE code = 'RVR123';
    SELECT id INTO tenant2_id FROM tenants WHERE code = 'MVH456';
    SELECT id INTO tenant3_id FROM tenants WHERE code = 'BFA789';
    
    SELECT id INTO school_elem_id FROM schools WHERE code = 'RVR_ELEM';
    SELECT id INTO school_ms_id FROM schools WHERE code = 'RVR_MS';
    SELECT id INTO school_hs_id FROM schools WHERE code = 'MV_HS';
    SELECT id INTO school_academy_id FROM schools WHERE code = 'BF_ACADEMY';
    
    -- Fee structures for elementary school
    INSERT INTO fee_structures (id, tenant_id, school_id, grade, fee_type, amount, frequency, description, is_compulsory, due_day, late_fee, late_fee_applied_after_days) VALUES
    (uuid_generate_v4(), tenant1_id, school_elem_id, '1', 'Tuition Fee', 500.00, 'monthly', 'Monthly tuition fee', true, 1, 25.00, 5),
    (uuid_generate_v4(), tenant1_id, school_elem_id, '1', 'Computer Lab', 50.00, 'monthly', 'Computer lab usage fee', true, 1, 5.00, 5),
    (uuid_generate_v4(), tenant1_id, school_elem_id, '1', 'Library', 25.00, 'monthly', 'Library usage fee', true, 1, 2.50, 5),
    (uuid_generate_v4(), tenant1_id, school_elem_id, '1', 'Sports', 30.00, 'monthly', 'Sports and activities fee', true, 1, 3.00, 5),
    (uuid_generate_v4(), tenant1_id, school_elem_id, '1', 'Transportation', 100.00, 'monthly', 'Bus transportation fee', false, 1, 10.00, 5),
    (uuid_generate_v4(), tenant1_id, school_elem_id, '1', 'Uniform', 150.00, 'yearly', 'School uniform fee', true, 1, 15.00, 30),
    
    (uuid_generate_v4(), tenant1_id, school_ms_id, '6', 'Tuition Fee', 600.00, 'monthly', 'Monthly tuition fee', true, 1, 30.00, 5),
    (uuid_generate_v4(), tenant1_id, school_ms_id, '6', 'Science Lab', 75.00, 'monthly', 'Science laboratory fee', true, 1, 7.50, 5),
    (uuid_generate_v4(), tenant1_id, school_ms_id, '6', 'Computer Lab', 60.00, 'monthly', 'Computer lab usage fee', true, 1, 6.00, 5),
    (uuid_generate_v4(), tenant1_id, school_ms_id, '6', 'Library', 30.00, 'monthly', 'Library usage fee', true, 1, 3.00, 5),
    (uuid_generate_v4(), tenant1_id, school_ms_id, '6', 'Sports', 40.00, 'monthly', 'Sports and activities fee', true, 1, 4.00, 5),
    
    (uuid_generate_v4(), tenant2_id, school_hs_id, '9', 'Tuition Fee', 800.00, 'monthly', 'Monthly tuition fee', true, 1, 40.00, 5),
    (uuid_generate_v4(), tenant2_id, school_hs_id, '9', 'Science Lab', 100.00, 'monthly', 'Science laboratory fee', true, 1, 10.00, 5),
    (uuid_generate_v4(), tenant2_id, school_hs_id, '9', 'Computer Lab', 80.00, 'monthly', 'Computer lab usage fee', true, 1, 8.00, 5),
    (uuid_generate_v4(), tenant2_id, school_hs_id, '9', 'Library', 40.00, 'monthly', 'Library usage fee', true, 1, 4.00, 5),
    (uuid_generate_v4(), tenant2_id, school_hs_id, '9', 'Sports', 50.00, 'monthly', 'Sports and activities fee', true, 1, 5.00, 5),
    (uuid_generate_v4(), tenant2_id, school_hs_id, '9', 'Transportation', 120.00, 'monthly', 'Bus transportation fee', false, 1, 12.00, 5),
    
    (uuid_generate_v4(), tenant3_id, school_academy_id, 'K', 'Tuition Fee', 400.00, 'monthly', 'Monthly tuition fee', true, 1, 20.00, 5),
    (uuid_generate_v4(), tenant3_id, school_academy_id, 'K', 'Arts & Crafts', 40.00, 'monthly', 'Arts and crafts supplies', true, 1, 4.00, 5),
    (uuid_generate_v4(), tenant3_id, school_academy_id, 'K', 'Music', 35.00, 'monthly', 'Music education fee', true, 1, 3.50, 5),
    (uuid_generate_v4(), tenant3_id, school_academy_id, 'K', 'Playground', 25.00, 'monthly', 'Playground equipment fee', true, 1, 2.50, 5),
    (uuid_generate_v4(), tenant3_id, school_academy_id, 'K', 'Snacks', 60.00, 'monthly', 'Daily snacks fee', false, 1, 6.00, 5);
END $$;

-- Insert sample fee payments
DO $$
DECLARE
    student_record RECORD;
    fee_record RECORD;
    payment_date DATE;
    payment_status fee_status;
BEGIN
    -- Generate fee payments for the last 3 months
    FOR payment_date IN (CURRENT_DATE - INTERVAL '3 months')..(CURRENT_DATE - INTERVAL '1 month') LOOP
        FOR student_record IN 
            SELECT s.id, s.tenant_id 
            FROM students s 
            WHERE s.deleted_at IS NULL 
            LIMIT 50
        LOOP
            FOR fee_record IN 
                SELECT fs.id, fs.amount, fs.due_day 
                FROM fee_structures fs 
                WHERE fs.tenant_id = student_record.tenant_id
                AND fs.deleted_at IS NULL
                LIMIT 3
            LOOP
                -- Random payment status
                payment_status := CASE 
                    WHEN random() < 0.70 THEN 'paid'
                    WHEN random() < 0.85 THEN 'pending'
                    ELSE 'overdue'
                END;
                
                INSERT INTO fee_payments (id, tenant_id, student_id, fee_structure_id, amount, payment_method, transaction_id, payment_date, due_date, status, paid_at, late_fee_applied, total_amount, receipt_number, notes) VALUES
                (uuid_generate_v4(), student_record.tenant_id, student_record.id, fee_record.id, fee_record.amount,
                 CASE WHEN payment_status = 'paid' THEN 'credit_card' ELSE 'cash' END,
                 'TXN' || LPAD((random() * 1000000)::integer::text, 6, '0'),
                 payment_date,
                 DATE_TRUNC('month', payment_date) + (fee_record.due_day - 1 || ' days')::interval,
                 payment_status,
                 CASE WHEN payment_status = 'paid' THEN payment_date ELSE NULL END,
                 CASE WHEN payment_status = 'overdue' THEN fee_record.amount * 0.10 ELSE 0 END,
                 CASE WHEN payment_status = 'overdue' THEN fee_record.amount * 1.10 ELSE fee_record.amount END,
                 'REC' || LPAD((random() * 1000000)::integer::text, 6, '0'),
                 CASE WHEN payment_status = 'overdue' THEN 'Late payment applied' ELSE 'Payment on time' END);
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Insert sample exams
DO $$
DECLARE
    tenant1_id UUID;
    tenant2_id UUID;
    tenant3_id UUID;
    school_ms_id UUID;
    school_hs_id UUID;
    exam_date DATE;
BEGIN
    SELECT id INTO tenant1_id FROM tenants WHERE code = 'RVR123';
    SELECT id INTO tenant2_id FROM tenants WHERE code = 'MVH456';
    SELECT id INTO tenant3_id FROM tenants WHERE code = 'BFA789';
    
    SELECT id INTO school_ms_id FROM schools WHERE code = 'RVR_MS';
    SELECT id INTO school_hs_id FROM schools WHERE code = 'MV_HS';
    
    -- Sample exams for middle school
    INSERT INTO exams (id, tenant_id, school_id, classroom_id, subject_id, teacher_id, title, description, exam_type, max_marks, passing_marks, duration_minutes, exam_date, start_time, end_time, venue, status) VALUES
    (uuid_generate_v4(), tenant1_id, school_ms_id, (SELECT id FROM classrooms WHERE name = 'Grade 6A'), (SELECT id FROM subjects WHERE name = 'Mathematics'), (SELECT id FROM teachers WHERE employee_id = 'T003'), 'Midterm Mathematics Exam', 'Comprehensive mathematics assessment', 'midterm', 100.00, 33.00, 90, CURRENT_DATE - INTERVAL '1 month', '09:00', '10:30', 'Room 201', 'completed'),
    (uuid_generate_v4(), tenant1_id, school_ms_id, (SELECT id FROM classrooms WHERE name = 'Grade 6A'), (SELECT id FROM subjects WHERE name = 'Science'), (SELECT id FROM teachers WHERE employee_id = 'T003'), 'Science Quiz', 'Science knowledge assessment', 'quiz', 50.00, 17.00, 45, CURRENT_DATE - INTERVAL '2 weeks', '11:00', '11:45', 'Lab 1', 'completed'),
    (uuid_generate_v4(), tenant1_id, school_ms_id, (SELECT id FROM classrooms WHERE name = 'Grade 6A'), (SELECT id FROM subjects WHERE name = 'English'), (SELECT id FROM teachers WHERE employee_id = 'T002'), 'English Essay', 'Essay writing assessment', 'assignment', 100.00, 40.00, 60, CURRENT_DATE - INTERVAL '1 week', '13:00', '14:00', 'Room 201', 'completed'),
    
    (uuid_generate_v4(), tenant1_id, school_ms_id, (SELECT id FROM classrooms WHERE name = 'Grade 7A'), (SELECT id FROM subjects WHERE name = 'Mathematics'), (SELECT id FROM teachers WHERE employee_id = 'T003'), 'Final Mathematics Exam', 'End of term mathematics assessment', 'final', 100.00, 35.00, 120, CURRENT_DATE + INTERVAL '1 week', '09:00', '11:00', 'Room 202', 'scheduled'),
    (uuid_generate_v4(), tenant1_id, school_ms_id, (SELECT id FROM classrooms WHERE name = 'Grade 7A'), (SELECT id FROM subjects WHERE name = 'Science'), (SELECT id FROM teachers WHERE employee_id = 'T003'), 'Science Practical', 'Hands-on science assessment', 'practical', 50.00, 20.00, 90, CURRENT_DATE + INTERVAL '2 weeks', '14:00', '15:30', 'Lab 2', 'scheduled');
    
    -- Sample exams for high school
    INSERT INTO exams (id, tenant_id, school_id, classroom_id, subject_id, teacher_id, title, description, exam_type, max_marks, passing_marks, duration_minutes, exam_date, start_time, end_time, venue, status) VALUES
    (uuid_generate_v4(), tenant2_id, school_hs_id, (SELECT id FROM classrooms WHERE name = 'Grade 9A'), (SELECT id FROM subjects WHERE name = 'Algebra'), (SELECT id FROM teachers WHERE employee_id = 'T004'), 'Algebra Midterm', 'Algebra concepts and problem solving', 'midterm', 100.00, 40.00, 90, CURRENT_DATE - INTERVAL '2 weeks', '08:00', '09:30', 'Math Lab', 'completed'),
    (uuid_generate_v4(), tenant2_id, school_hs_id, (SELECT id FROM classrooms WHERE name = 'Grade 9A'), (SELECT id FROM subjects WHERE name = 'Biology'), (SELECT id FROM teachers WHERE employee_id = 'T005'), 'Biology Lab Test', 'Practical biology assessment', 'practical', 50.00, 20.00, 60, CURRENT_DATE - INTERVAL '1 week', '10:00', '11:00', 'Bio Lab', 'completed'),
    (uuid_generate_v4(), tenant2_id, school_hs_id, (SELECT id FROM classrooms WHERE name = 'Grade 10A'), (SELECT id FROM subjects WHERE name = 'Physics'), (SELECT id FROM teachers WHERE employee_id = 'T004'), 'Physics Quiz', 'Physics concepts quiz', 'quiz', 30.00, 12.00, 30, CURRENT_DATE - INTERVAL '3 days', '11:00', '11:30', 'Physics Lab', 'completed'),
    
    (uuid_generate_v4(), tenant2_id, school_hs_id, (SELECT id FROM classrooms WHERE name = 'Grade 11A'), (SELECT id FROM subjects WHERE name = 'Chemistry'), (SELECT id FROM teachers WHERE employee_id = 'T005'), 'Chemistry Final', 'End of year chemistry assessment', 'final', 100.00, 35.00, 120, CURRENT_DATE + INTERVAL '2 weeks', '09:00', '11:00', 'Chem Lab', 'scheduled'),
    (uuid_generate_v4(), tenant2_id, school_hs_id, (SELECT id FROM classrooms WHERE name = 'Grade 12A'), (SELECT id FROM subjects WHERE name = 'Geometry'), (SELECT id FROM teachers WHERE employee_id = 'T004'), 'Geometry Assessment', 'Geometry and trigonometry', 'midterm', 100.00, 40.00, 90, CURRENT_DATE + INTERVAL '1 week', '13:00', '14:30', 'Math Lab', 'scheduled');
END $$;

-- Insert sample exam results
DO $$
DECLARE
    exam_record RECORD;
    student_record RECORD;
    marks_obtained DECIMAL(5,2);
    percentage DECIMAL(5,2);
    grade grade_enum;
BEGIN
    -- Generate exam results
    FOR exam_record IN 
        SELECT e.id, e.tenant_id, e.max_marks, e.passing_marks 
        FROM exams e 
        WHERE e.status = 'completed'
        LIMIT 10
    LOOP
        FOR student_record IN 
            SELECT s.id, s.tenant_id, s.classroom_id 
            FROM students s 
            WHERE s.tenant_id = exam_record.tenant_id
            AND s.classroom_id = (SELECT classroom_id FROM exams WHERE id = exam_record.id)
            LIMIT 20
        LOOP
            -- Random marks
            marks_obtained := (random() * exam_record.max_marks)::DECIMAL(5,2);
            percentage := (marks_obtained / exam_record.max_marks) * 100;
            
            -- Calculate grade
            grade := CASE
                WHEN percentage >= 97 THEN 'A+'
                WHEN percentage >= 93 THEN 'A'
                WHEN percentage >= 90 THEN 'A-'
                WHEN percentage >= 87 THEN 'B+'
                WHEN percentage >= 83 THEN 'B'
                WHEN percentage >= 80 THEN 'B-'
                WHEN percentage >= 77 THEN 'C+'
                WHEN percentage >= 73 THEN 'C'
                WHEN percentage >= 70 THEN 'C-'
                WHEN percentage >= 67 THEN 'D+'
                WHEN percentage >= 63 THEN 'D'
                WHEN percentage >= 60 THEN 'D-'
                ELSE 'F'
            END;
            
            INSERT INTO exam_results (id, tenant_id, exam_id, student_id, marks_obtained, grade, percentage, remarks) VALUES
            (uuid_generate_v4(), exam_record.tenant_id, exam_record.id, student_record.id, marks_obtained, grade, percentage,
             CASE WHEN marks_obtained >= exam_record.passing_marks THEN 'Good performance' ELSE 'Needs improvement' END)
            ON CONFLICT (exam_id, student_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Insert sample timetable entries
DO $$
DECLARE
    tenant1_id UUID;
    tenant2_id UUID;
    school_ms_id UUID;
    school_hs_id UUID;
    classroom_record RECORD;
    subject_record RECORD;
    teacher_record RECORD;
    day_of_week INTEGER;
    start_time TIME;
    end_time TIME;
BEGIN
    SELECT id INTO tenant1_id FROM tenants WHERE code = 'RVR123';
    SELECT id INTO tenant2_id FROM tenants WHERE code = 'MVH456';
    
    SELECT id INTO school_ms_id FROM schools WHERE code = 'RVR_MS';
    SELECT id INTO school_hs_id FROM schools WHERE code = 'MV_HS';
    
    -- Generate timetable for middle school
    FOR classroom_record IN 
        SELECT id, name FROM classrooms WHERE tenant_id = tenant1_id AND school_id = school_ms_id
    LOOP
        FOR day_of_week IN 1..5 LOOP
            FOR period_number IN 1..8 LOOP
                -- Random subject
                subject_record := (SELECT id, name FROM subjects WHERE tenant_id = tenant1_id ORDER BY random() LIMIT 1);
                -- Random teacher
                teacher_record := (SELECT id FROM teachers WHERE tenant_id = tenant1_id AND school_id = school_ms_id ORDER BY random() LIMIT 1);
                
                -- Calculate time
                start_time := (08:00 + (period_number - 1) * 45 || ' minutes')::time;
                end_time := start_time + '45 minutes'::interval;
                
                INSERT INTO timetable (id, tenant_id, school_id, classroom_id, subject_id, teacher_id, day_of_week, start_time, end_time, period_number, venue, academic_year, semester, is_active) VALUES
                (uuid_generate_v4(), tenant1_id, school_ms_id, classroom_record.id, subject_record.id, teacher_record.id, day_of_week, start_time, end_time, period_number, 'Room ' || classroom_record.name, '2024-2025', 'Fall', true)
                ON CONFLICT DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
    
    -- Generate timetable for high school
    FOR classroom_record IN 
        SELECT id, name FROM classrooms WHERE tenant_id = tenant2_id AND school_id = school_hs_id
    LOOP
        FOR day_of_week IN 1..5 LOOP
            FOR period_number IN 1..8 LOOP
                -- Random subject
                subject_record := (SELECT id, name FROM subjects WHERE tenant_id = tenant2_id ORDER BY random() LIMIT 1);
                -- Random teacher
                teacher_record := (SELECT id FROM teachers WHERE tenant_id = tenant2_id AND school_id = school_hs_id ORDER BY random() LIMIT 1);
                
                -- Calculate time
                start_time := (08:00 + (period_number - 1) * 45 || ' minutes')::time;
                end_time := start_time + '45 minutes'::interval;
                
                INSERT INTO timetable (id, tenant_id, school_id, classroom_id, subject_id, teacher_id, day_of_week, start_time, end_time, period_number, venue, academic_year, semester, is_active) VALUES
                (uuid_generate_v4(), tenant2_id, school_hs_id, classroom_record.id, subject_record.id, teacher_record.id, day_of_week, start_time, end_time, period_number, 'Room ' || classroom_record.name, '2024-2025', 'Fall', true)
                ON CONFLICT DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Insert sample library books
DO $$
DECLARE
    tenant1_id UUID;
    tenant2_id UUID;
    school_elem_id UUID;
    school_hs_id UUID;
    i INTEGER;
BEGIN
    SELECT id INTO tenant1_id FROM tenants WHERE code = 'RVR123';
    SELECT id INTO tenant2_id FROM tenants WHERE code = 'MVH456';
    
    SELECT id INTO school_elem_id FROM schools WHERE code = 'RVR_ELEM';
    SELECT id INTO school_hs_id FROM schools WHERE code = 'MV_HS';
    
    -- Sample books for elementary school
    FOR i IN 1..20 LOOP
        INSERT INTO library_books (id, tenant_id, school_id, title, author, isbn, publisher, category, subcategory, language, pages, publication_year, price, quantity, available_quantity, location, description) VALUES
        (uuid_generate_v4(), tenant1_id, school_elem_id, 
         'Book Title ' || i, 
         'Author ' || i, 
         'ISBN' || LPAD(i::text, 10, '0'), 
         'Publisher ' || i, 
         CASE WHEN i % 4 = 0 THEN 'Fiction' WHEN i % 4 = 1 THEN 'Science' WHEN i % 4 = 2 THEN 'History' ELSE 'Reference' END,
         CASE WHEN i % 3 = 0 THEN 'Children' WHEN i % 3 = 1 THEN 'Educational' ELSE 'Story' END,
         'English',
         100 + (i * 10),
         2010 + i,
         10.00 + i,
         5,
         5,
         'Shelf ' || (i % 4 + 1),
         'Description for book ' || i);
    END LOOP;
    
    -- Sample books for high school
    FOR i IN 1..30 LOOP
        INSERT INTO library_books (id, tenant_id, school_id, title, author, isbn, publisher, category, subcategory, language, pages, publication_year, price, quantity, available_quantity, location, description) VALUES
        (uuid_generate_v4(), tenant2_id, school_hs_id,
         'Advanced Book ' || i,
         'Academic Author ' || i,
         'ISBN' || LPAD((i + 20)::text, 10, '0'),
         'Academic Publisher ' || i,
         CASE WHEN i % 5 = 0 THEN 'Mathematics' WHEN i % 5 = 1 THEN 'Science' WHEN i % 5 = 2 THEN 'Literature' WHEN i % 5 = 3 THEN 'History' ELSE 'Reference' END,
         CASE WHEN i % 3 = 0 THEN 'Textbook' WHEN i % 3 = 1 THEN 'Reference' ELSE 'Research' END,
         'English',
         200 + (i * 15),
         2015 + i,
         25.00 + i,
         10,
         10,
         'Section ' || (i % 5 + 1),
         'Advanced academic book ' || i);
    END LOOP;
END $$;

-- Insert sample notifications
DO $$
DECLARE
    tenant1_id UUID;
    tenant2_id UUID;
    tenant3_id UUID;
    user_record RECORD;
    notification_type VARCHAR(50);
    priority VARCHAR(20);
BEGIN
    SELECT id INTO tenant1_id FROM tenants WHERE code = 'RVR123';
    SELECT id INTO tenant2_id FROM tenants WHERE code = 'MVH456';
    SELECT id INTO tenant3_id FROM tenants WHERE code = 'BFA789';
    
    -- Generate notifications for users
    FOR user_record IN 
        SELECT id, tenant_id FROM users WHERE tenant_id IN (tenant1_id, tenant2_id, tenant3_id) LIMIT 20
    LOOP
        FOR i IN 1..5 LOOP
            notification_type := CASE 
                WHEN i % 3 = 0 THEN 'info'
                WHEN i % 3 = 1 THEN 'warning'
                ELSE 'success'
            END;
            
            priority := CASE 
                WHEN i % 4 = 0 THEN 'high'
                WHEN i % 4 = 1 THEN 'normal'
                WHEN i % 4 = 2 THEN 'low'
                ELSE 'normal'
            END;
            
            INSERT INTO notifications (id, tenant_id, user_id, title, message, type, priority, data, created_at) VALUES
            (uuid_generate_v4(), user_record.tenant_id, user_record.id,
             'Notification ' || i,
             'This is a sample notification message number ' || i,
             notification_type,
             priority,
             '{"source": "system", "category": "general"}',
             CURRENT_TIMESTAMP - (i || ' hours')::interval);
        END LOOP;
    END LOOP;
END $$;

-- Insert sample system logs
DO $$
DECLARE
    tenant1_id UUID;
    tenant2_id UUID;
    tenant3_id UUID;
    user_record RECORD;
    action_type VARCHAR(255);
    resource_type VARCHAR(100);
BEGIN
    SELECT id INTO tenant1_id FROM tenants WHERE code = 'RVR123';
    SELECT id INTO tenant2_id FROM tenants WHERE code = 'MVH456';
    SELECT id INTO tenant3_id FROM tenants WHERE code = 'BFA789';
    
    -- Generate system logs
    FOR user_record IN 
        SELECT id, tenant_id FROM users WHERE tenant_id IN (tenant1_id, tenant2_id, tenant3_id) LIMIT 10
    LOOP
        FOR i IN 1..10 LOOP
            action_type := CASE 
                WHEN i % 5 = 0 THEN 'login'
                WHEN i % 5 = 1 THEN 'logout'
                WHEN i % 5 = 2 THEN 'create'
                WHEN i % 5 = 3 THEN 'update'
                ELSE 'delete'
            END;
            
            resource_type := CASE 
                WHEN i % 4 = 0 THEN 'student'
                WHEN i % 4 = 1 THEN 'exam'
                WHEN i % 4 = 2 THEN 'attendance'
                ELSE 'fee_payment'
            END;
            
            INSERT INTO system_logs (id, tenant_id, user_id, action, resource_type, resource_id, ip_address, user_agent, created_at) VALUES
            (uuid_generate_v4(), user_record.tenant_id, user_record.id,
             action_type,
             resource_type,
             uuid_generate_v4(),
             '192.168.1.' || (random() * 255)::integer,
             'Mozilla/5.0 (Sample User Agent)',
             CURRENT_TIMESTAMP - (i || ' minutes')::interval);
        END LOOP;
    END LOOP;
END $$;

-- Insert sample usage metrics
DO $$
DECLARE
    tenant1_id UUID;
    tenant2_id UUID;
    tenant3_id UUID;
    metric_date DATE;
    metric_name VARCHAR(100);
    metric_value INTEGER;
BEGIN
    SELECT id INTO tenant1_id FROM tenants WHERE code = 'RVR123';
    SELECT id INTO tenant2_id FROM tenants WHERE code = 'MVH456';
    SELECT id INTO tenant3_id FROM tenants WHERE code = 'BFA789';
    
    -- Generate usage metrics for the last 6 months
    FOR metric_date IN (CURRENT_DATE - INTERVAL '6 months')..(CURRENT_DATE - INTERVAL '1 month') LOOP
        FOR tenant_id IN ARRAY[tenant1_id, tenant2_id, tenant3_id] LOOP
            -- Various metrics
            INSERT INTO usage_metrics (id, tenant_id, metric_name, metric_value, period_start, period_end) VALUES
            (uuid_generate_v4(), tenant_id, 'api_calls', (random() * 10000)::integer, metric_date, metric_date + INTERVAL '1 month' - INTERVAL '1 day'),
            (uuid_generate_v4(), tenant_id, 'storage_mb', (random() * 1000)::integer, metric_date, metric_date + INTERVAL '1 month' - INTERVAL '1 day'),
            (uuid_generate_v4(), tenant_id, 'student_operations', (random() * 500)::integer, metric_date, metric_date + INTERVAL '1 month' - INTERVAL '1 day'),
            (uuid_generate_v4(), tenant_id, 'attendance_records', (random() * 2000)::integer, metric_date, metric_date + INTERVAL '1 month' - INTERVAL '1 day'),
            (uuid_generate_v4(), tenant_id, 'fee_transactions', (random() * 300)::integer, metric_date, metric_date + INTERVAL '1 month' - INTERVAL '1 day'),
            (uuid_generate_v4(), tenant_id, 'exam_records', (random() * 100)::integer, metric_date, metric_date + INTERVAL '1 month' - INTERVAL '1 day'),
            (uuid_generate_v4(), tenant_id, 'report_generations', (random() * 50)::integer, metric_date, metric_date + INTERVAL '1 month' - INTERVAL '1 day'),
            (uuid_generate_v4(), tenant_id, 'user_logins', (random() * 1000)::integer, metric_date, metric_date + INTERVAL '1 month' - INTERVAL '1 day');
        END LOOP;
    END LOOP;
END $$;

-- Insert sample tenant settings
DO $$
DECLARE
    tenant1_id UUID;
    tenant2_id UUID;
    tenant3_id UUID;
BEGIN
    SELECT id INTO tenant1_id FROM tenants WHERE code = 'RVR123';
    SELECT id INTO tenant2_id FROM tenants WHERE code = 'MVH456';
    SELECT id INTO tenant3_id FROM tenants WHERE code = 'BFA789';
    
    -- Settings for tenant 1
    INSERT INTO tenant_settings (id, tenant_id, key, value) VALUES
    (uuid_generate_v4(), tenant1_id, 'theme', 'blue'),
    (uuid_generate_v4(), tenant1_id, 'logo_url', 'riverside_logo.png'),
    (uuid_generate_v4(), tenant1_id, 'school_name', 'Riverside Academy'),
    (uuid_generate_v4(), tenant1_id, 'contact_email', 'admin@riverside.edu'),
    (uuid_generate_v4(), tenant1_id, 'timezone', 'America/Chicago'),
    (uuid_generate_v4(), tenant1_id, 'currency', 'USD'),
    (uuid_generate_v4(), tenant1_id, 'date_format', 'MM/DD/YYYY'),
    (uuid_generate_v4(), tenant1_id, 'language', 'en'),
    (uuid_generate_v4(), tenant1_id, 'notification_email', 'true'),
    (uuid_generate_v4(), tenant1_id, 'notification_sms', 'false'),
    (uuid_generate_v4(), tenant1_id, 'auto_backup', 'true'),
    (uuid_generate_v4(), tenant1_id, 'backup_frequency', 'daily'),
    (uuid_generate_v4(), tenant1_id, 'max_file_size', '10485760'),
    (uuid_generate_v4(), tenant1_id, 'allowed_file_types', '["pdf", "doc", "docx", "xls", "xlsx", "jpg", "png"]');
    
    -- Settings for tenant 2
    INSERT INTO tenant_settings (id, tenant_id, key, value) VALUES
    (uuid_generate_v4(), tenant2_id, 'theme', 'green'),
    (uuid_generate_v4(), tenant2_id, 'logo_url', 'mvhs_logo.png'),
    (uuid_generate_v4(), tenant2_id, 'school_name', 'Mountain View High School'),
    (uuid_generate_v4(), tenant2_id, 'contact_email', 'info@mountainview.edu'),
    (uuid_generate_v4(), tenant2_id, 'timezone', 'America/Denver'),
    (uuid_generate_v4(), tenant2_id, 'currency', 'USD'),
    (uuid_generate_v4(), tenant2_id, 'date_format', 'MM/DD/YYYY'),
    (uuid_generate_v4(), tenant2_id, 'language', 'en'),
    (uuid_generate_v4(), tenant2_id, 'notification_email', 'true'),
    (uuid_generate_v4(), tenant2_id, 'notification_sms', 'true'),
    (uuid_generate_v4(), tenant2_id, 'auto_backup', 'true'),
    (uuid_generate_v4(), tenant2_id, 'backup_frequency', 'weekly'),
    (uuid_generate_v4(), tenant2_id, 'max_file_size', '20971520'),
    (uuid_generate_v4(), tenant2_id, 'allowed_file_types', '["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "jpg", "png", "gif"]');
    
    -- Settings for tenant 3
    INSERT INTO tenant_settings (id, tenant_id, key, value) VALUES
    (uuid_generate_v4(), tenant3_id, 'theme', 'purple'),
    (uuid_generate_v4(), tenant3_id, 'logo_url', 'bfa_logo.png'),
    (uuid_generate_v4(), tenant3_id, 'school_name', 'Bright Future Academy'),
    (uuid_generate_v4(), tenant3_id, 'contact_email', 'contact@brightfuture.edu'),
    (uuid_generate_v4(), tenant3_id, 'timezone', 'America/Chicago'),
    (uuid_generate_v4(), tenant3_id, 'currency', 'USD'),
    (uuid_generate_v4(), tenant3_id, 'date_format', 'MM/DD/YYYY'),
    (uuid_generate_v4(), tenant3_id, 'language', 'en'),
    (uuid_generate_v4(), tenant3_id, 'notification_email', 'true'),
    (uuid_generate_v4(), tenant3_id, 'notification_sms', 'false'),
    (uuid_generate_v4(), tenant3_id, 'auto_backup', 'true'),
    (uuid_generate_v4(), tenant3_id, 'backup_frequency', 'daily'),
    (uuid_generate_v4(), tenant3_id, 'max_file_size', '5242880'),
    (uuid_generate_v4(), tenant3_id, 'allowed_file_types', '["pdf", "doc", "docx", "jpg", "png"]');
END $$;

COMMIT;
