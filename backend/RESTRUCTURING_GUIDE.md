# School Management System - Backend Restructuring Guide

## New Modular Architecture

The backend has been restructured into a clean, modular architecture with separate files for all modules.

## Directory Structure

```
backend/
├── app/
│   ├── core/              # Core functionality
│   │   ├── __init__.py
│   │   └── database.py    # Database configuration and connection
│   ├── auth/              # Authentication module
│   │   ├── __init__.py
│   │   ├── auth.py        # Authentication logic (JWT, password hashing)
│   │   └── routes.py      # Authentication API endpoints
│   ├── users/             # User management module
│   │   ├── __init__.py
│   │   ├── models.py      # User database models
│   │   ├── service.py     # User business logic
│   │   └── routes.py      # User API endpoints
│   ├── academic/          # Academic module
│   │   ├── __init__.py
│   │   ├── models.py      # Student, Teacher, Classroom models
│   │   ├── service.py     # Academic business logic
│   │   └── routes.py      # Academic API endpoints
│   ├── administrative/    # Administrative module
│   │   ├── __init__.py
│   │   ├── models.py      # Fee, Attendance, Exam models
│   │   ├── service.py     # Administrative business logic
│   │   └── routes.py      # Administrative API endpoints
│   ├── infrastructure/    # Infrastructure module
│   │   ├── __init__.py
│   │   ├── models.py      # Library, Transport, Hostel models
│   │   ├── service.py     # Infrastructure business logic
│   │   └── routes.py      # Infrastructure API endpoints
│   ├── saas/              # SaaS/Multi-tenant module
│   │   ├── __init__.py
│   │   ├── models.py      # Tenant, Plan, Subscription models
│   │   ├── service.py     # SaaS business logic
│   │   └── routes.py      # SaaS API endpoints
│   ├── config/            # Configuration module
│   │   ├── __init__.py
│   │   └── settings.py    # Application settings
│   ├── utils/             # Utility functions
│   │   ├── __init__.py
│   │   └── helpers.py     # Helper functions
│   ├── main.py            # Main application entry point
│   └── db.py              # Legacy database file (deprecated)
├── requirements.txt
└── .venv/
```

## Module Descriptions

### Core Module (`app/core/`)
- **database.py**: Database connection management, session handling, and health checks
- **Purpose**: Centralized database configuration and connection pooling

### Authentication Module (`app/auth/`)
- **auth.py**: JWT token management, password hashing, role-based access control
- **routes.py**: Login, registration, and user authentication endpoints
- **Purpose**: Security and user authentication

### User Management Module (`app/users/`)
- **models.py**: User, UserCreate, UserUpdate, UserResponse models
- **service.py**: User CRUD operations and business logic
- **routes.py**: User management API endpoints
- **Purpose**: User account management

### Academic Module (`app/academic/`)
- **models.py**: Student, Teacher, Classroom models and their variants
- **service.py**: Academic entity CRUD operations
- **routes.py**: Academic management API endpoints
- **Purpose**: Student, teacher, and classroom management

### Administrative Module (`app/administrative/`)
- **models.py**: Fee, Attendance, Exam, ExamResult models
- **service.py**: Administrative operations and business logic
- **routes.py**: Administrative API endpoints
- **Purpose**: Fees, attendance, and exam management

### Infrastructure Module (`app/infrastructure/`)
- **models.py**: Book, Vehicle, Route, Room, Hostel models
- **service.py**: Infrastructure management operations
- **routes.py**: Infrastructure API endpoints
- **Purpose**: Library, transport, and hostel management

### SaaS Module (`app/saas/`)
- **models.py**: Tenant, Plan, Subscription models
- **service.py**: Multi-tenant business logic
- **routes.py**: SaaS management API endpoints
- **Purpose**: Multi-tenant subscription management

### Configuration Module (`app/config/`)
- **settings.py**: Application-wide settings using Pydantic
- **Purpose**: Centralized configuration management

### Utils Module (`app/utils/`)
- **helpers.py**: Common utility functions (email validation, date formatting, etc.)
- **Purpose**: Reusable helper functions

## API Endpoints Structure

The new modular structure provides organized API endpoints:

- `/api/auth` - Authentication (login, register, user info)
- `/api/users` - User management
- `/api/academic` - Academic management (students, teachers, classrooms)
- `/api/administrative` - Administrative (fees, attendance, exams)
- `/api/infrastructure` - Infrastructure (library, transport, hostel)
- `/api/saas` - Multi-tenant SaaS management (tenants, plans, subscriptions)

## Migration from Old Structure

### Old Structure
- Flat file structure with all models, services, and routes mixed together
- Files like `routes.py`, `models.py`, `db.py` in the main `app/` directory
- Difficult to maintain and scale

### New Structure
- Organized into logical modules
- Each module has its own models, services, and routes
- Clear separation of concerns
- Easier to maintain and extend

### What Changed
1. **Moved authentication logic** → `app/auth/`
2. **Moved user models and routes** → `app/users/`
3. **Moved academic functionality** → `app/academic/`
4. **Moved administrative functions** → `app/administrative/`
5. **Moved infrastructure management** → `app/infrastructure/`
6. **Created SaaS module** → `app/saas/`
7. **Centralized configuration** → `app/config/`
8. **Created utilities module** → `app/utils/`
9. **Updated main.py** to use new modular imports

## Benefits of New Structure

1. **Maintainability**: Each module is self-contained and easier to maintain
2. **Scalability**: Easy to add new features or modules
3. **Testability**: Each module can be tested independently
4. **Clarity**: Clear separation of concerns
5. **Team Collaboration**: Multiple developers can work on different modules simultaneously
6. **Code Reusability**: Common utilities are centralized
7. **Easier Debugging**: Issues are isolated to specific modules

## Future Enhancements

The modular structure allows for easy addition of:
- New academic modules (courses, subjects, curriculum)
- Advanced analytics modules
- Reporting modules
- Integration modules (email, SMS, payment gateways)
- Advanced notification systems
- API versioning support

## Notes

- The old files (`routes.py`, `models.py`, `db.py`, etc.) are still present for backward compatibility
- Gradually migrate functionality from old files to new modular structure
- Update imports in other files to use the new module paths
- Test each module independently to ensure functionality

## Testing the New Structure

1. Start the backend: `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
2. Access API documentation: `http://localhost:8000/docs`
3. Test authentication endpoints
4. Test each module's endpoints
5. Verify database connections and CRUD operations

## Support

For issues or questions about the new structure, refer to the module-specific documentation in each module's `__init__.py` file.
