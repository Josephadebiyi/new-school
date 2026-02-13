# LuminaLMS - Product Requirements Document

## Original Problem Statement
Build a University LMS (LuminaLMS) with comprehensive features including:
- Dynamic white-labeling (admin can customize branding, colors, login page)
- Rigid access control with role-based permissions
- Advanced course content engine with video, PDF, and quizzes
- Graduation and student services (certificates, transcripts)
- Automated onboarding with email notifications
- Student management (enrollment, expulsion, reinstatement)
- Financial management with bank details for invoices

## Architecture

### Tech Stack
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (local instance)
- **Auth**: JWT-based authentication with RBAC
- **Email**: Resend (for notifications)
- **Media**: Uploadcare (for image uploads)

### User Roles & Permissions
| Role | Permissions |
|------|-------------|
| Student | View courses, enrollments, grades, payments |
| Lecturer | Manage assigned courses, build content, enter grades |
| Admin | Full system access, user/course management, white-labeling |
| Registrar | Academic records, transcripts, student data |

## Core Requirements (Static)

### Authentication
- Email/password login (no self-signup)
- JWT token-based sessions
- Role-based access control
- Account locking/unlocking
- Student expulsion/reinstatement

### White-Labeling
- University name, logo, favicon customization
- Primary/secondary color theming
- Login page text and image customization
- Bank details for invoices

### Student Features
- Dashboard with stats (courses, lessons, quizzes, minutes)
- Course enrollment and progress tracking
- XP/points earning system
- Grade/result viewing with CGPA calculation
- Payment history and invoices

### Lecturer Features
- Dashboard with course stats
- Course builder with modules and lessons
- Quiz creation and management
- Grade entry for enrolled students

### Admin Features
- User management (CRUD, lock/unlock, expel/reinstate)
- Course management (CRUD, lecturer assignment)
- System settings (branding, colors, bank details)
- Overview dashboard with stats

## What's Been Implemented

### Date: Feb 13, 2026 - UI Redesign Complete

**UI/UX Overhaul**
- ✅ Modern pastel-themed design (pink, blue, mint, yellow cards)
- ✅ Clean sidebar navigation with icon-based items
- ✅ Streak badge and notification counter in header
- ✅ Global search bar placeholder
- ✅ "Made with Emergent" badge removed
- ✅ Responsive layout with collapsible sidebar

**Backend Improvements**
- ✅ Added `/api/student/stats` endpoint
- ✅ Added `/api/enrollments/my` endpoint
- ✅ All 22+ API tests passing

**Frontend Fixes**
- ✅ Fixed login function (was calling with wrong parameters)
- ✅ Added Outlet for nested route rendering
- ✅ Added index routes for /student, /lecturer, /admin paths
- ✅ Fixed navigation links (billing -> payments)

### Previously Implemented
- ✅ JWT authentication with bcrypt password hashing
- ✅ User CRUD with lock/unlock/expel/reinstate
- ✅ Course management with modules and lessons
- ✅ Enrollment system with progress tracking
- ✅ Grade entry with GPA calculation
- ✅ Payment tracking with invoices
- ✅ Admin settings with tabbed interface (Branding, Login Page, Bank Details)

## Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@unilms.edu | admin123 |
| Student | student@unilms.edu | student123 |
| Lecturer | lecturer@unilms.edu | lecturer123 |

## Prioritized Backlog

### P0 (Critical) - COMPLETE
- ✅ UI/UX redesign to modern pastel theme
- ✅ All role dashboards working
- ✅ Navigation and routing fixed
- ✅ Emergent badge removed

### P1 (High Priority - Next Phase)
- Quiz system with bulk upload from Excel
- Quiz grading and attempt tracking
- Student course enrollment based on program
- Graduation features (confetti, PDF certificates)
- PDF invoice generation
- Automated onboarding with email credentials

### P2 (Medium Priority)
- Backend refactoring (break server.py into modules)
- Transcript request feature
- Course progress visualization
- Real-time notifications

### P3 (Nice to Have)
- Analytics dashboard
- Calendar integration
- Mobile app version
- Dark mode theme

## Technical Notes
- MongoDB Atlas connection has SSL certificate issues - using local MongoDB
- Uploadcare is configured for image uploads
- Resend is configured for email notifications

## Next Tasks
1. Implement quiz system backend (bulk upload, grading)
2. Add PDF generation for certificates and invoices
3. Implement canvas-confetti for course completion
4. Refactor server.py into modular routers
5. Add transcript request feature
