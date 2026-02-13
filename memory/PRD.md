# LuminaLMS - Product Requirements Document

## Original Problem Statement
Build a comprehensive University LMS (LuminaLMS/GITB) with:
- Dynamic white-labeling and branding
- Role-based access control (Admin, Lecturer, Student)
- Course management with materials and quizzes
- Stripe payment integration for €50 application fees
- Separate landing page for public course catalog
- Application workflow with email notifications
- PDF admission letters and certificates
- Document upload for student applications (high school certificate, identification)
- Admin course image management

## Architecture

### Tech Stack
- **Main LMS App**: React 19 + Tailwind CSS + Shadcn/UI (port 3000)
- **Landing Page**: Separate React app in `/app/school` (GITB branding, port 3001)
- **Backend**: FastAPI (Python) on port 8001
- **Database**: MongoDB (local instance)
- **Payments**: Stripe (live keys configured)
- **Email**: Resend API
- **Auth**: JWT with RBAC
- **PDF**: ReportLab for admission letters
- **File Storage**: Local uploads in /app/backend/uploads/

### Project Structure
```
/app/
├── backend/
│   ├── server.py        # Main API (~2800 lines)
│   ├── uploads/         # Uploaded documents and images
│   ├── .env             # Stripe keys, Resend, MongoDB
│   └── tests/           # pytest test files
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── admin/
│       │   │   ├── CourseEditor.jsx   # Course image upload added
│       │   │   ├── Admissions.jsx     # Application workflow
│       │   │   ├── Dashboard.jsx      # Enhanced gradient banner
│       │   │   ├── Payments.jsx       # EUR currency display
│       │   │   └── Settings.jsx       # Fees & Currency tab
│       │   └── student/
│       │       └── Dashboard.jsx      # Enhanced gradient banner with streak
│       ├── utils/
│       │   └── currency.js            # EUR formatting utility
│       └── components/ui/
│           └── dialog.jsx, etc.       # Shadcn components
├── school/                            # Separate landing page app
│   ├── src/
│   │   ├── App.js                     # Document upload in application form
│   │   └── index.css                  # Enhanced styles
│   ├── tailwind.config.js
│   └── .env
└── memory/PRD.md
```

## What's Been Implemented

### Date: Feb 13, 2026 - Session 4 (Current)

**Document Upload for Applications**
- ✅ Backend endpoint /api/upload/document for high school cert and ID
- ✅ File validation (JPG, PNG, PDF, max 5MB)
- ✅ Frontend UI with dashed upload zones in school landing page
- ✅ Application model stores document URLs

**Course Image Management**
- ✅ Backend endpoint /api/upload/course-image for admin/lecturers
- ✅ File validation (JPG, PNG, WEBP, max 5MB)
- ✅ Course Editor UI with image upload/preview
- ✅ Edit/remove image functionality

**UI/UX Beautification**
- ✅ Admin Dashboard: Emerald gradient welcome banner
- ✅ Student Dashboard: Purple gradient welcome banner with "7 Days 🔥" streak
- ✅ Enhanced stat cards with hover effects and gradient icons
- ✅ School app CSS enhancements (animations, patterns, glass effects)

### Date: Feb 13, 2026 - Session 3

**School Landing Page (FIXED & REDESIGNED)**
- ✅ Fixed Tailwind CSS configuration
- ✅ Redesigned to match "Univerz University" design spec
- ✅ School app runs on port 3001 with GITB green/orange branding

**EUR Currency Formatting (COMPLETED)**
- ✅ Applied formatCurrency() across all dashboards
- ✅ Invoice PDF generation uses €

### Previous Sessions
- User management with RBAC
- Course management with modules and lessons
- Stripe payment integration
- Email notifications via Resend
- PDF admission letters

## Test Results (Latest - Session 4)
- **Backend**: 100% (14/14 tests passed)
- **Frontend**: 100% - All features verified
- **Test Report**: /app/test_reports/iteration_5.json

## Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@unilms.edu | admin123 |
| Student | student@unilms.edu | student123 |
| Lecturer | lecturer@unilms.edu | lecturer123 |

## Key API Endpoints

### Public (No Auth Required)
- `GET /api/courses/public` - List all active courses
- `GET /api/courses/public/{course_id}` - Get course with modules
- `POST /api/applications/create` - Create application with Stripe checkout
- `GET /api/applications/status/{session_id}` - Check payment status
- `POST /api/upload/document` - Upload application documents

### Protected (Auth Required)
- `GET /api/courses` - List courses (filtered by role)
- `POST /api/upload/course-image` - Upload course cover image (admin/lecturer)
- `GET /api/applications` - List all applications
- `POST /api/applications/{id}/approve` - Approve and create user
- `GET /api/system-config` - Get system configuration

## Stripe Configuration
- Public Key: pk_live_51SHqYK... (configured)
- Secret Key: sk_live_51SHqYK... (configured)
- Application Fee: €50.00

## Remaining Tasks

### P1 (Next Priority)
- [ ] Admin approval workflow - view uploaded documents, approve/reject applications
- [ ] Bulk quiz upload from Excel
- [ ] Canvas-confetti on course completion
- [ ] PDF certificates for completed courses

### P2 (Medium Priority)
- [ ] Admin payment tracking dashboard
- [ ] Interactive course card hover effects
- [ ] PDF template editor for admission letters
- [ ] Document preview in admin admissions

### P3 (Nice to Have)
- [ ] Backend refactoring (modular routers)
- [ ] Real-time notifications
- [ ] Course change fee enforcement
- [ ] Move uploads to cloud storage (S3/Uploadcare)

## Technical Notes
- MongoDB Atlas SSL issue - using local MongoDB
- Stripe live keys configured (handle with care)
- School landing page requires supervisor to start: `sudo supervisorctl start school`
- Public course endpoints must be defined BEFORE /courses/{course_id}
- Uploaded files stored in /app/backend/uploads/
