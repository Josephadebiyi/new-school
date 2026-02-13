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
- Document upload for student applications
- Admin course image management
- **Full mobile responsiveness**

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
│       ├── components/
│       │   └── DashboardLayout.jsx  # Mobile responsive sidebar
│       ├── pages/
│       │   ├── Login.jsx            # Mobile responsive
│       │   ├── admin/
│       │   │   ├── Dashboard.jsx    # Mobile responsive
│       │   │   ├── CourseEditor.jsx # Course image upload
│       │   │   └── ...
│       │   └── student/
│       │       └── Dashboard.jsx    # Mobile responsive
│       └── index.css
├── school/                          # Separate landing page app
│   ├── src/
│   │   ├── App.js                   # Mobile responsive
│   │   └── index.css
│   └── ...
└── memory/PRD.md
```

## What's Been Implemented

### Date: Feb 13, 2026 - Session 4 (Current)

**Mobile Responsiveness (COMPLETED)**
- ✅ DashboardLayout: Mobile slide-out menu with overlay
- ✅ Login page: Mobile-first form layout, hidden image panel on mobile
- ✅ Admin Dashboard: 2-column stat cards on mobile, gradient banner
- ✅ Student Dashboard: 2-column stat cards on mobile, gradient banner
- ✅ School Landing Page: Mobile hamburger menu, responsive footer
- ✅ Course Detail: 3-column stats, scrollable application form
- ✅ All pages tested at 375px and 1920px viewports

**Document Upload for Applications (COMPLETED)**
- ✅ Backend endpoint /api/upload/document for high school cert and ID
- ✅ File validation (JPG, PNG, PDF, max 5MB)
- ✅ Frontend UI with dashed upload zones
- ✅ Application model stores document URLs

**Course Image Management (COMPLETED)**
- ✅ Backend endpoint /api/upload/course-image for admin/lecturers
- ✅ Course Editor UI with image upload/preview/edit/remove

**UI/UX Beautification (COMPLETED)**
- ✅ Admin Dashboard: Emerald gradient welcome banner
- ✅ Student Dashboard: Purple gradient banner with streak indicator
- ✅ Enhanced stat cards with hover effects and gradient icons
- ✅ School app CSS enhancements

### Previous Sessions
- User management with RBAC
- Course management with modules and lessons
- Stripe payment integration
- Email notifications via Resend
- PDF admission letters
- EUR currency formatting

## Test Results (Latest - Session 4)
- **Backend**: 100% (14/14 tests passed)
- **Frontend Mobile**: 100% - All responsive features verified
- **Test Reports**: 
  - /app/test_reports/iteration_5.json (Backend + UI features)
  - /app/test_reports/iteration_6.json (Mobile responsiveness)

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
- `POST /api/upload/document` - Upload application documents

### Protected (Auth Required)
- `GET /api/courses` - List courses (filtered by role)
- `POST /api/upload/course-image` - Upload course cover image
- `GET /api/applications` - List all applications
- `GET /api/system-config` - Get system configuration

## Mobile Responsive Breakpoints
- **Mobile**: < 768px (md:)
- **Tablet**: 768px - 1024px (lg:)
- **Desktop**: > 1024px

### Mobile Menu Behavior
- Opens with hamburger button
- Contains user info, navigation items, sign out
- Closes on: X button click, overlay click, route change

## Remaining Tasks

### P1 (Next Priority)
- [ ] Admin approval workflow - view uploaded documents, approve/reject applications
- [ ] Bulk quiz upload from Excel
- [ ] Canvas-confetti on course completion
- [ ] PDF certificates for completed courses

### P2 (Medium Priority)
- [ ] Admin payment tracking dashboard
- [ ] PDF template editor for admission letters
- [ ] Document preview in admin admissions

### P3 (Nice to Have)
- [ ] Backend refactoring (modular routers)
- [ ] Real-time notifications
- [ ] Move uploads to cloud storage (S3/Uploadcare)

## Technical Notes
- MongoDB Atlas SSL issue - using local MongoDB
- Stripe live keys configured
- School landing page: `sudo supervisorctl start school`
- Public course endpoints defined BEFORE /courses/{course_id}
- Uploaded files stored in /app/backend/uploads/
