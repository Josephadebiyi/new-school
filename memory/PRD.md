# GITB LMS - Product Requirements Document

## Project Overview
GITB (Global Institute of Technology and Business) is a white-label Learning Management System with:
1. Public-facing school website (landing pages)
2. LMS portal for authenticated users (admin, students, lecturers)

## Architecture

### Frontend Architecture
- **School App** (Port 3001): Vite + TypeScript React app - User's uploaded design
  - Landing page, Schools, Why GITB, Course details, Apply
- **LMS App** (Port 3000): CRA + JavaScript React app
  - Login, Admin/Student/Lecturer dashboards

### Routing Configuration
NGINX reverse proxy configured at `/etc/nginx/sites-enabled/default`:
- `/api/*` → Backend (port 8001)
- `/login, /student/*, /lecturer/*, /admin/*, /billing, /limited-access` → LMS App (port 3000)
- `/*` (all other routes) → School App (port 3001)

### Backend
- FastAPI on port 8001
- MongoDB (local instance)
- Stripe integration for payments

## Current Status

### Completed Features ✅
1. **School Landing Pages** (User's design)
   - Home page with hero, schools section, programs, stats, footer
   - Schools page with 6 schools (Engineering, Data, Product, Business, Creative, Security)
   - Why GITB page with "Reimagining the African Dream"
   - Course detail pages with curriculum, certifications, requirements
   - Apply page with 3-step wizard (Personal Info, Documents, Payment)

2. **LMS Features**
   - Admin dashboard with stats, quick actions
   - Student dashboard with enrolled courses
   - Lecturer dashboard with course management
   - Course builder for creating/editing courses
   - Admissions management with preview feature
   - Notification system
   - EAHEA accreditation branding throughout

3. **Authentication**
   - JWT-based auth with role-based access
   - Login page with GITB branding and EAHEA badge
   - "Back to Website" link on login page

### Pending Tasks 📋
1. **P1** - Admin application approval/rejection with admission letter email
2. **P1** - PDF template editor for admission letters
3. **P1** - Admin payment tracking dashboard
4. **P2** - Graduation celebration (confetti on 100% completion)
5. **P2** - Backend refactoring (split server.py into modules)
6. **P2** - MongoDB Atlas connection (SSL certificate issue)

## Key Files
- `/app/school/` - School landing pages (Vite/TypeScript)
- `/app/frontend/` - LMS portal (CRA/JavaScript)
- `/app/backend/server.py` - FastAPI backend
- `/etc/nginx/sites-enabled/default` - NGINX routing config
- `/etc/supervisor/conf.d/` - Service configurations

## Credentials
- Admin: admin@unilms.edu / admin123
- Student: student@unilms.edu / student123
- Lecturer: lecturer@unilms.edu / lecturer123

## 3rd Party Integrations
- Stripe (payments)
- Resend (email)
- Uploadcare (media hosting)
- xlsxwriter (Excel export)
- reportlab (PDF generation)

## Database
- MongoDB local instance: mongodb://localhost:27017
- Database name: lumina_lms

---
Last Updated: December 2025
