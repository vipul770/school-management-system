# Backend Structure Blueprint

The current backend is FastAPI-based, so the frontend restructure is paired with a FastAPI-friendly backend target instead of a Django-only folder shape.

Recommended evolution path:

- `backend/app/core/`: settings, middleware, auth helpers, shared permissions.
- `backend/app/domains/accounts/`: user auth, roles, tenant access.
- `backend/app/domains/schools/`: school and tenant administration.
- `backend/app/domains/students/`: student CRUD and enrollment workflows.
- `backend/app/domains/teachers/`: teacher profiles and assignments.
- `backend/app/domains/attendance/`: attendance endpoints and reporting.
- `backend/app/domains/fees/`: invoices, payments, fee structures.
- `backend/app/domains/exams/`: schedules, results, grading.
- `backend/app/domains/communications/`: announcements and messaging.
- `backend/app/shared/`: reusable schemas, dependencies, and helpers.

Suggested migration strategy:

1. Move one module at a time from flat files in `backend/app/` into domain packages.
2. Keep `app/main.py` as the composition root that includes routers.
3. Extract shared database, tenant, and permission helpers into `app/core/` first.
4. Add tests around each module before moving the next one.

This keeps the backend architecture aligned with the new frontend domains without forcing a framework change.
