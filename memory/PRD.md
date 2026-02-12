# University LMS - Product Requirements Document

## Original Problem Statement
Build a University LMS similar to MIVA Open University with:
- All roles (Student, Lecturer, Admin, Registrar, Finance Officer, Admissions Officer, Support)
- Full scope modules (Auth, Dashboard, Courses, Results, Payments, Admissions)
- No email service (mocked)
- Mock payments

## Architecture

### Tech Stack
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Auth**: JWT-based authentication

### User Roles & Permissions
| Role | Permissions |
|------|-------------|
| Student | View courses, enrollments, grades, payments |
| Lecturer | Manage assigned courses, enter grades |
| Admin | Full system access, user/course management |
| Registrar | Academic records, transcripts, student data |
| Finance Officer | Payment management, financial reports |
| Admissions Officer | Application review, student onboarding |
| Support | Help desk access |

## Core Requirements (Static)

### Authentication
- Email/password login (no self-signup)
- JWT token-based sessions
- Role-based access control

### Student Features
- Dashboard with GPA, payment alerts, transactions
- Course enrollment and viewing
- Grade/result viewing with CGPA calculation
- Payment history and outstanding balance

### Lecturer Features
- Dashboard with course stats
- Course content management
- Grade entry for enrolled students

### Admin Features
- User management (CRUD)
- Course management (CRUD)
- System overview dashboard

### Admissions Features
- Application review and status updates
- Automatic student account creation on acceptance

### Finance Features
- Payment tracking and reports
- Mark payments as paid

## What's Been Implemented

### Date: Feb 2026 - MVP Complete

**Backend (FastAPI)**
- ✅ JWT authentication with bcrypt password hashing
- ✅ User CRUD endpoints with role-based permissions
- ✅ Course management with lecturer assignment
- ✅ Enrollment system with completion tracking
- ✅ Grade entry with automatic GPA calculation
- ✅ Payment tracking with summary endpoints
- ✅ Admission application workflow
- ✅ Role-specific dashboard stats
- ✅ Database seeding endpoint

**Frontend (React)**
- ✅ Login page with split-screen design
- ✅ Responsive sidebar navigation
- ✅ Student dashboard with payment alerts, GPA cards
- ✅ Student courses with slanted badge design
- ✅ Student results with grade table
- ✅ Student payments with history
- ✅ Lecturer dashboard and courses
- ✅ Lecturer grade entry system
- ✅ Admin dashboard with stats
- ✅ Admin user management
- ✅ Admin course management
- ✅ Admissions dashboard with application workflow
- ✅ Finance dashboard with payment overview
- ✅ Registrar dashboard
- ✅ Support dashboard

## Mocked Features
- Email service (credentials displayed in UI on acceptance)
- Payment processing (mark as paid only, no actual gateway)

## Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@unilms.edu | admin123 |
| Student | student@unilms.edu | student123 |
| Lecturer | lecturer@unilms.edu | lecturer123 |
| Registrar | registrar@unilms.edu | registrar123 |
| Finance | finance@unilms.edu | finance123 |
| Admissions | admissions@unilms.edu | admissions123 |
| Support | support@unilms.edu | support123 |

## Prioritized Backlog

### P0 (Critical)
- All implemented ✅

### P1 (High Priority - Next Phase)
- Live class scheduling with video integration
- Assessment/quiz system
- File upload for course content
- Transcript PDF generation
- Email notifications (real integration)

### P2 (Medium Priority)
- Student profile editing
- Course search and filtering
- Attendance tracking
- Discussion forums
- Mobile responsive improvements

### P3 (Nice to Have)
- Analytics dashboard
- Bulk user import
- Calendar integration
- Push notifications
- Dark mode theme

## Next Tasks
1. Integrate payment gateway (Stripe/Paystack)
2. Add email service (SendGrid/Resend)
3. Implement live class scheduling
4. Build assessment/quiz module
5. Add file upload for course materials
