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

### Project Structure
```
/app/
├── backend/
│   ├── server.py        # Main API (~2800 lines)
│   ├── .env             # Stripe keys, Resend, MongoDB
│   └── tests/           # pytest test files
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── admin/
│       │   │   ├── CourseEditor.jsx   # Full course management
│       │   │   ├── Admissions.jsx     # Application workflow
│       │   │   ├── Payments.jsx       # EUR currency display
│       │   │   └── Settings.jsx       # Fees & Currency tab
│       │   └── student/
│       │       └── Dashboard.jsx      # Student dashboard
│       ├── utils/
│       │   └── currency.js            # EUR formatting utility
│       └── components/ui/
│           └── dialog.jsx, etc.       # Shadcn components
├── school/                            # Separate landing page app
│   ├── src/
│   │   ├── App.js                     # Homepage, courses, application form
│   │   └── index.css                  # Tailwind CSS + custom styles
│   ├── tailwind.config.js
│   └── .env
└── memory/PRD.md
```

## What's Been Implemented

### Date: Feb 13, 2026 - Session 3 (Current)

**School Landing Page (FIXED & WORKING)**
- ✅ Fixed Tailwind CSS configuration - installed v3.4 and fixed postcss.config.js syntax
- ✅ Fixed route ordering - moved /courses/public before /courses/{course_id}
- ✅ School app runs on port 3001 with GITB green/orange branding
- ✅ Homepage with hero section, statistics, featured courses
- ✅ Course catalog page with search functionality
- ✅ Course detail page with application form
- ✅ Application form with €50 fee display and Stripe checkout
- ✅ Application success page with payment status polling

**EUR Currency Formatting (COMPLETED)**
- ✅ Applied formatCurrency() to Admin Payments page (€500,365.00, €315.00, etc.)
- ✅ Admin Admissions page shows EUR format
- ✅ Invoice PDF generation updated from $ to €
- ✅ Backend system config returns EUR as default currency

### Date: Feb 13, 2026 - Session 2

**UI/UX Fixes**
- ✅ Fixed transparent dialog/popup backgrounds (bg-background → bg-white)
- ✅ Fixed alert-dialog, dropdown-menu, select components
- ✅ All action buttons in dropdown menus working correctly

**Course Builder/Editor**
- ✅ Full course editing UI at `/admin/courses/:id/edit`
- ✅ Duration settings (weeks/months/years dropdown)
- ✅ Course Content section with module accordion
- ✅ Add Module and Lesson dialogs

**Student Management**
- ✅ Student Quick Stats cards
- ✅ Export Students to Excel (names, emails, student IDs)

**Applications & Admissions**
- ✅ Applications table with filtering
- ✅ Approve/Reject application buttons
- ✅ Auto-create student account on approval
- ✅ Send admission email with credentials
- ✅ PDF admission letter generation

## Test Results (Latest)
- **Backend**: 100% (13/13 tests passed)
- **Frontend**: 100% - All features verified
- **Test Report**: /app/test_reports/iteration_4.json

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

### Protected (Auth Required)
- `GET /api/courses` - List courses (filtered by role)
- `GET /api/applications` - List all applications
- `POST /api/applications/{id}/approve` - Approve and create user
- `GET /api/system-config` - Get system configuration
- `GET /api/users` - List users

## Stripe Configuration
- Public Key: pk_live_51SHqYK... (configured)
- Secret Key: sk_live_51SHqYK... (configured)
- Application Fee: €50.00

## Remaining Tasks

### P1 (Next Priority)
- [ ] Canvas-confetti on course completion
- [ ] PDF certificates for completed courses
- [ ] Personalized student welcome ("Welcome, John!")
- [ ] Bulk quiz upload from Excel

### P2 (Medium Priority)
- [ ] Admin payment tracking dashboard
- [ ] Interactive course card hover effects
- [ ] PDF template editor for admission letters

### P3 (Nice to Have)
- [ ] Backend refactoring (modular routers)
- [ ] Real-time notifications
- [ ] Course change fee enforcement

## Technical Notes
- MongoDB Atlas SSL issue - using local MongoDB
- Stripe live keys configured (handle with care)
- School landing page requires `yarn start` in /app/school OR build for production
- Public course endpoints must be defined BEFORE /courses/{course_id} to avoid route conflicts
