# School Management System

Multi-tenant school platform rebuilt from [`SMS_Architecture.docx`](SMS_Architecture.docx).

## Architecture

- Django REST Framework API, PostgreSQL row-level tenant data, JWT authentication, school roles, audit log.
- React + Vite + Tailwind, Redux Toolkit/RTK Query, role-aware layouts, in-memory access tokens, cookie refresh.
- Redis + Celery queues for imports, notifications, reminders, reports, and scheduled jobs.
- Nginx static hosting and API reverse proxy; optional S3, Stripe, email/SMS provider, and Sentry integrations.

## School modules

Accounts and roles; school onboarding, settings, plans, subscriptions, and feature flags; student profiles, enrollment, documents, and CSV import; teacher profiles, subjects, and class assignments; classes and timetables; daily student/teacher attendance and reports; fee structures, invoices, transactions, accounts, and reminders; exams, timetables, results, grading scales, and report cards; assignments and submissions; notification inbox, templates, and delivery logs; report jobs; announcements and messages.

The API is versioned at `/api/v1/`. Tenant CRUD is scoped from the authenticated user's school; student and parent queries are limited to linked profiles, while teachers are limited to assigned classes.

## Local development

Keep the existing `backend/.env` or create it from `.env.example` and set the PostgreSQL credentials. From the project root:

```powershell
cd backend
python -m pip install -r requirements/development.txt
python manage.py migrate
python manage.py create_demo_user
python manage.py runserver 0.0.0.0:8000
```

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:3001/login. The login starts with the organization ID. Run Redis locally for Celery; without it, small local notification/import tasks use the development inline fallback.

The `create_demo_user` command idempotently seeds subscription plans, school settings, feature flags, and the demo account. A fresh run prints the generated demo password once; an existing password is never reset or printed.

## Docker Compose

The root `docker-compose.yml` defines PostgreSQL, Redis, Django, Celery worker/beat, and the Nginx-served Vite build on port 8080. Set the Compose variables and `backend/.env` secrets before using it. Set `SECURE_SSL_REDIRECT=true` and secure-cookie settings when TLS is terminated at a production load balancer.

Production-only integrations are configured by environment variables in `.env.example`; AWS, Stripe, Sentry, Twilio/SNS, and SMTP credentials are not included in the repository.
