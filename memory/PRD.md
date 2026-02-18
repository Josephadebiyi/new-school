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

### Date: Feb 18, 2026 - Session 6 (Current)

**School Landing Page Redesign (COMPLETED)**
- ✅ Complete redesign based on AltSchool design reference
- ✅ Green theme (emerald gradient hero, emerald accents)
- ✅ Hero section: "Africa's Best Innovative Online School" with generated student collage image
- ✅ Program Types section: Nano-Diploma, Diploma, Masterclass cards
- ✅ Partners section with company logos
- ✅ Our Schools section: Engineering, Data, Product, Creative Economy, Business
- ✅ Nano-Diploma introduction banner with generated image
- ✅ Trending courses section with course cards
- ✅ Why AltSchool section with learning benefits
- ✅ Stats section (7,980+ learners, 1M+ content, 4+ countries, 6+ courses)
- ✅ Testimonials section with student reviews
- ✅ Articles/Blog section
- ✅ Footer with all links

**Course Detail Page Redesign (COMPLETED)**
- ✅ Green gradient header with course info
- ✅ Tab navigation: Overview, Admission Requirements, Course Outline, Costs, Career Outcomes, Scholarships
- ✅ Video/Image section with course thumbnail
- ✅ About the program section
- ✅ Admission Requirements (4 points)
- ✅ Course Outline with learning outcomes
- ✅ Costs section: Quarterly ($80), Upfront ($290), Monthly ($30) with pricing cards
- ✅ Career Outcome section with professional image
- ✅ Scholarships section (4 scholarships: Tech Foundation, Women in STEM, Creative Economy Grant, Early Bird)
- ✅ Application form sidebar with document uploads

**Demo Courses Added (COMPLETED)**
- ✅ Product Management (Diploma)
- ✅ Data Analytics with Excel (Nano-Diploma)
- ✅ Backend Engineering (Diploma)
- ✅ Frontend Engineering (Diploma)
- ✅ Music Marketing & Promotion (Nano-Diploma)
- ✅ Digital Marketing (Diploma)

**Generated Images (COMPLETED)**
- ✅ Hero students collage
- ✅ Nano diploma person with phone
- ✅ Career professional
- ✅ Course thumbnails: Engineering, Data, Product, Creative, Business

**Notification Dropdown (COMPLETED)**
- ✅ Bell icon shows unread count badge
- ✅ Dropdown shows notification list
- ✅ Notifications include: title, message, time, read status
- ✅ "View all notifications" link
- ✅ Works on both admin and student dashboards
- ⚠️ MOCKED: Notifications are hardcoded sample data, not from API

### Date: Feb 18, 2026 - Session 5

**Bug Fixes (COMPLETED)**
- ✅ Fixed "Add Course" button on Student Dashboard - now navigates to /student/courses
- ✅ Added Link wrapper with hover effects and data-testid

**Admission Preview Feature (COMPLETED)**
- ✅ Preview button on Admin Admissions page for each application
- ✅ Preview modal shows: applicant info (name, email, phone, date)
- ✅ Applied program section with course and payment status
- ✅ Uploaded documents section (High School Certificate, ID)
- ✅ Action buttons (Approve/Reject) within preview modal

**Bulk Quiz Upload (ALREADY EXISTED)**
- ✅ Quiz upload dialog in Course Editor
- ✅ Download Excel template functionality
- ✅ Upload and parse Excel files using xlsx library
- ✅ Save questions to backend

### Date: Feb 13, 2026 - Session 4

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

## Test Results (Latest - Session 5)
- **Frontend Features**: 100% - All 3 features verified and working
- **Test Reports**: 
  - /app/test_reports/iteration_7.json (Current session - Bug fix + Features)
  - /app/test_reports/iteration_6.json (Mobile responsiveness)
  - /app/test_reports/iteration_5.json (Backend + UI features)

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

### P0 (Critical)
- [ ] Create notifications API endpoint to fetch real notifications from database
- [ ] Store notifications when events occur (course enrollment, assignment due, etc.)

### P1 (Next Priority)
- [ ] Canvas-confetti on course completion
- [ ] PDF certificates for completed courses
- [ ] Admin payment tracking dashboard

### P2 (Medium Priority)
- [ ] PDF template editor for admission letters
- [ ] Real-time notifications via WebSocket

### P3 (Nice to Have)
- [ ] Backend refactoring (modular routers)
- [ ] Move uploads to cloud storage (S3/Uploadcare)
- [ ] MongoDB Atlas connection (SSL issue)

## Technical Notes
- MongoDB Atlas SSL issue - using local MongoDB
- Stripe live keys configured
- School landing page: `sudo supervisorctl start school`
- Public course endpoints defined BEFORE /courses/{course_id}
- Uploaded files stored in /app/backend/uploads/
