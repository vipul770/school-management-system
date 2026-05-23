# School Management System

Complete multi-app school management system with:
- FastAPI backend (`backend/`) - Python 3.11+ with modern async support
- React web frontend (`frontend/`) - Vite + Material-UI + TailwindCSS
- Electron desktop app integrated with frontend (`desktop/`)
- Expo React Native mobile app (`mobile/`) - Cross-platform mobile support

## Repository Structure
- `backend/`: FastAPI API + SQLite/PostgreSQL + auth + role-based access + module APIs
- `frontend/`: React (Vite) admin and user dashboards with Material-UI
- `desktop/`: Electron host loading the React frontend
- `mobile/`: Expo mobile app with auth + school operations + Excel import upload
- `shared/`: shared types and interfaces

## Tech Stack

### Backend
- **FastAPI 0.115.6** - Modern Python web framework
- **SQLModel 0.0.22** - SQL toolkit with Pydantic models
- **PostgreSQL/SQLite** - Database support
- **Python-JOSE** - JWT authentication
- **PassLib** - Password hashing with bcrypt
- **OpenPyXL** - Excel file processing

### Frontend
- **React 18.3.1** - UI library
- **Vite 6.0.1** - Build tool and dev server
- **Material-UI 6.1.6** - React component library
- **TailwindCSS 3.4.15** - Utility-first CSS
- **React Router 6.28.0** - Client-side routing
- **React Query 3.39.3** - Server state management
- **Axios 1.7.7** - HTTP client

### Mobile
- **Expo SDK 54** - React Native platform
- **React Native 0.81.5** - Native mobile framework
- **React Navigation 6.1.18** - Navigation library

### Desktop
- **Electron 33.2.1** - Desktop app framework
- **Electron Builder 25.1.8** - App packaging

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (optional)

### Development Setup

#### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # On Windows
# .venv/bin/activate   # On Unix
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend URL: `http://127.0.0.1:8000`
API Docs: `http://127.0.0.1:8000/docs`

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://127.0.0.1:3001`

#### Desktop App
```bash
cd desktop
npm install
npm run dev  # Development with hot reload
npm run start:prod  # Production build and run
npm run dist  # Create distributable package
```

#### Mobile App
```bash
cd mobile
npm install
npm run start

# For physical device/emulator testing:
EXPO_PUBLIC_API_BASE_URL=http://<your-ip>:8000 npm run start
```

## Docker Setup

### Using Docker Compose (Recommended)
```bash
docker-compose up --build
```

This will start:
- Backend API on port 8000
- Frontend (via nginx) on port 80
- PostgreSQL database on port 5432

### Individual Services
```bash
# Backend only
docker build -t school-backend ./backend
docker run -p 8000:8000 school-backend

# Frontend only
docker build -t school-frontend ./frontend
docker run -p 80:80 school-frontend
```

## Environment Configuration

### Backend Environment (.env)
```env
DATABASE_URL=sqlite:///./data_new.db
# DATABASE_URL=postgresql://user:password@localhost:5432/school_management
ENVIRONMENT=development
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
APP_BASE_URL=http://127.0.0.1:3001
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=School Management System
SMTP_USE_TLS=true
SMTP_USE_SSL=false
```

### Frontend Environment (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=School Management System
```

### Mobile Environment (.env)
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
```

## API Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Teacher, Student, Parent)
- Multi-tenant support (schools/tenants)

### Core Modules
- **User Management**: Students, teachers, parents, staff
- **Admissions**: Application processing and enrollment
- **Attendance**: Daily attendance tracking and reporting
- **Fees**: Fee structure, payment processing, receipts
- **Exams**: Exam scheduling, grading, report cards
- **Timetable**: Class scheduling and resource management
- **HR**: Staff management, payroll, leave management
- **Transport**: School bus routes and tracking
- **Inventory**: Asset and supply management
- **Library**: Book catalog and circulation
- **Hostel**: Room allocation and management
- **Messaging**: Communication system
- **Analytics**: Reports and dashboards

### Excel Student Import
Real import pipeline is implemented:
- Download template: `GET /api/imports/students/template`
- Import: `POST /api/imports/students?school_id=<id>` (multipart file field name: `file`)

Behavior:
- Validates required headers: `username`, `full_name`, `email`
- Optional headers: `password`, `tenant_id`
- Upserts users by `username`
- Ensures `Student` record exists and is linked
- Returns row-level error report and import summary counts

## Multi-Tenant Architecture
- `tenant`: school group/organization
- `school`: campus/branch within a tenant
- users/students are linked to school and optionally tenant

## Development Notes

### Database Migrations
```bash
# Generate migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
```

### Code Quality
- ESLint configured for frontend
- Python type hints throughout backend
- Comprehensive error handling
- Input validation with Pydantic

### Security
- CORS configuration (development allows all origins)
- Password hashing with bcrypt
- JWT token authentication
- SQL injection prevention via SQLModel

## Production Deployment

### Environment Variables
- Set `ENVIRONMENT=production`
- Configure proper database connection
- Set secure `SECRET_KEY`
- Configure CORS origins for production domains

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### SSL/HTTPS
- Configure SSL certificates
- Update CORS for HTTPS
- Set secure cookie flags

## Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 8000, 3001, 5432 are available
2. **Database connection**: Check DATABASE_URL format
3. **Mobile API connection**: Use your IP address instead of localhost
4. **CORS issues**: Verify allowed origins in production

### Logs
- Backend logs: Check uvicorn output
- Frontend logs: Browser console
- Mobile logs: Expo CLI output

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
