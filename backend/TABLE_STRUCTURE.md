# School Management System Table Structure

This project uses `SQLModel` models defined in `backend/app/models.py`.
The tables below reflect the current application data structure.

## Core Identity And Organisation

### `user`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Auto-increment user id |
| `username` | string |  | Login username |
| `full_name` | string nullable |  | Display name |
| `email` | string nullable |  | User email |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `role` | enum |  | `superadmin`, `admin`, `school`, `teacher`, `student`, `parent`, `accountant`, `librarian` |
| `hashed_password` | string |  | Password hash |

### `tenant`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Organisation id |
| `name` | string |  | Organisation name |
| `code` | string nullable |  | Organisation code |
| `contact_email` | string nullable |  | Organisation contact email |

### `school`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | School id |
| `name` | string |  | School name |
| `address` | string nullable |  | Address |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Parent organisation |

### `userrequest`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Request id |
| `username` | string |  | Requested username |
| `full_name` | string nullable |  | Applicant name |
| `email` | string nullable |  | Applicant email |
| `role` | enum |  | Requested role |
| `tenant_id` | integer nullable |  | Proposed organisation |
| `school_id` | integer nullable |  | Proposed school |
| `hashed_password` | string |  | Stored password hash |
| `requested_by` | integer nullable | FK -> `user.id` | Creator of request |
| `details` | string nullable |  | Notes |
| `status` | enum |  | `pending`, `approved`, `rejected` |
| `created_at` | string nullable |  | Timestamp text |

### `tenantrequest`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Request id |
| `name` | string |  | Requested organisation name |
| `contact_email` | string nullable |  | Contact email |
| `requested_by` | integer nullable | FK -> `user.id` | Request creator |
| `details` | string nullable |  | Notes |
| `status` | enum |  | `pending`, `approved`, `rejected` |
| `created_at` | string nullable |  | Timestamp text |

## Academic Structure

### `classroom`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Classroom id |
| `name` | string |  | Classroom name |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |

### `student`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Student record id |
| `user_id` | integer nullable | FK -> `user.id` | Linked user account |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |

### `admissionsapplication`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Application id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `applicant_name` | string |  | Applicant full name |
| `guardian_name` | string nullable |  | Guardian name |
| `date_of_birth` | string nullable |  | DOB text |
| `grade_applied` | string nullable |  | Target grade |
| `status` | enum |  | `submitted`, `under_review`, `approved`, `rejected` |
| `submitted_at` | string nullable |  | Timestamp text |

## Attendance

### `attendancerecord`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Attendance id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `student_id` | integer nullable | FK -> `student.id` | Student link |
| `date` | string |  | Attendance date |
| `status` | enum |  | `present`, `absent`, `late`, `excused` |
| `remarks` | string nullable |  | Notes |

## Fees

### `feeinvoice`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Invoice id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `student_id` | integer nullable | FK -> `student.id` | Student link |
| `amount` | float |  | Invoice amount |
| `currency` | string |  | Default `USD` |
| `due_date` | string nullable |  | Due date text |
| `status` | enum |  | `draft`, `issued`, `partially_paid`, `paid`, `overdue` |
| `description` | string nullable |  | Description |

### `feepayment`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Payment id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `invoice_id` | integer nullable | FK -> `feeinvoice.id` | Linked invoice |
| `amount` | float |  | Paid amount |
| `payment_date` | string nullable |  | Date text |
| `reference` | string nullable |  | Transaction reference |

## Exams

### `exam`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Exam id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `name` | string |  | Exam name |
| `term` | string nullable |  | Academic term |
| `start_date` | string nullable |  | Start date text |
| `end_date` | string nullable |  | End date text |

### `examresult`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Result id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `exam_id` | integer nullable | FK -> `exam.id` | Exam link |
| `student_id` | integer nullable | FK -> `student.id` | Student link |
| `subject` | string |  | Subject |
| `score` | float |  | Marks/score |
| `grade` | string nullable |  | Grade |

## Timetable

### `timetableentry`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Timetable row id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `class_id` | integer nullable | FK -> `classroom.id` | Classroom link |
| `subject` | string |  | Subject |
| `teacher_id` | integer nullable | FK -> `user.id` | Teacher user |
| `day_of_week` | string |  | Day name |
| `start_time` | string |  | Start time text |
| `end_time` | string |  | End time text |

## Human Resources

### `employee`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Employee id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `user_id` | integer nullable | FK -> `user.id` | Linked user |
| `position` | string nullable |  | Role/position |
| `department` | string nullable |  | Department |
| `hire_date` | string nullable |  | Hire date text |
| `salary` | float nullable |  | Salary |

### `payrollrecord`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Payroll id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `employee_id` | integer nullable | FK -> `employee.id` | Employee link |
| `period_start` | string |  | Start date |
| `period_end` | string |  | End date |
| `gross_pay` | float |  | Gross amount |
| `net_pay` | float |  | Net amount |
| `paid_date` | string nullable |  | Paid date |

### `leaverequest`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Leave request id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `employee_id` | integer nullable | FK -> `employee.id` | Employee link |
| `start_date` | string |  | Leave start |
| `end_date` | string |  | Leave end |
| `reason` | string nullable |  | Reason |
| `status` | string |  | Default `pending` |

## Transport

### `transportroute`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Route id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `name` | string |  | Route name |
| `description` | string nullable |  | Route description |

### `vehicle`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Vehicle id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `registration_no` | string |  | Vehicle registration |
| `capacity` | integer nullable |  | Seat count |
| `driver_name` | string nullable |  | Driver name |

### `transportassignment`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Assignment id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `route_id` | integer nullable | FK -> `transportroute.id` | Route link |
| `vehicle_id` | integer nullable | FK -> `vehicle.id` | Vehicle link |
| `student_id` | integer nullable | FK -> `student.id` | Student link |

## Inventory

### `inventoryitem`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Inventory item id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `name` | string |  | Item name |
| `sku` | string nullable |  | SKU/code |
| `quantity` | integer |  | Current stock |
| `location` | string nullable |  | Storage location |

### `inventorytransaction`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Transaction id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `item_id` | integer nullable | FK -> `inventoryitem.id` | Item link |
| `quantity` | integer |  | Quantity moved |
| `transaction_type` | string |  | In/out/adjustment style value |
| `transaction_date` | string nullable |  | Date text |
| `notes` | string nullable |  | Notes |

## Library

### `librarybook`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Book id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `title` | string |  | Book title |
| `author` | string nullable |  | Author |
| `isbn` | string nullable |  | ISBN |
| `copies` | integer |  | Number of copies |

### `libraryissue`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Issue id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `book_id` | integer nullable | FK -> `librarybook.id` | Book link |
| `student_id` | integer nullable | FK -> `student.id` | Student link |
| `issue_date` | string |  | Issue date |
| `due_date` | string |  | Due date |
| `return_date` | string nullable |  | Return date |
| `fine_amount` | float nullable |  | Fine |

## Hostel

### `hostelroom`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Room id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `room_no` | string |  | Room number |
| `capacity` | integer |  | Bed capacity |

### `hostelassignment`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Assignment id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `room_id` | integer nullable | FK -> `hostelroom.id` | Room link |
| `student_id` | integer nullable | FK -> `student.id` | Student link |
| `start_date` | string |  | Start date |
| `end_date` | string nullable |  | End date |

## Messaging

### `announcement`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Announcement id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `title` | string |  | Title |
| `body` | string |  | Message body |
| `posted_at` | string nullable |  | Timestamp text |
| `posted_by` | integer nullable | FK -> `user.id` | Author |

### `directmessage`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Direct message id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `sender_id` | integer nullable | FK -> `user.id` | Sender |
| `recipient_id` | integer nullable | FK -> `user.id` | Recipient |
| `body` | string |  | Message content |
| `sent_at` | string nullable |  | Timestamp text |

## Analytics

### `metricsnapshot`

| Column | Type | Key | Notes |
|---|---|---|---|
| `id` | integer | PK | Metric row id |
| `tenant_id` | integer nullable | FK -> `tenant.id` | Organisation link |
| `school_id` | integer nullable | FK -> `school.id` | School link |
| `metric_key` | string |  | Metric name |
| `metric_value` | float |  | Metric value |
| `captured_at` | string nullable |  | Timestamp text |

## Recommended Relationships

- One `tenant` can have many `school` rows.
- One `school` can have many `user`, `student`, `classroom`, and module records.
- One `user` can represent admin, school, teacher, student, parent, accountant, librarian, or superadmin access.
- One `student` may map to one `user`.
- Module tables usually include both `tenant_id` and `school_id` so data stays scoped by organisation and school.

## Suggested Future Improvements

- Add unique constraints for `user.username`, `tenant.code`, and high-signal business identifiers like `vehicle.registration_no` and `librarybook.isbn`.
- Add timestamp columns with consistent datetime types instead of plain strings.
- Add indexes on `tenant_id`, `school_id`, `student_id`, and `user_id` foreign keys.
- Consider splitting auth/request workflow into separate audit tables if approvals need history.
