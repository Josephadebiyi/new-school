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
- **Landing Page**: Separate React app in `/app/school` (GITB branding)
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
│   ├── server.py        # Main API (2500+ lines)
│   ├── .env             # Stripe keys, Resend, MongoDB
│   └── tests/           # pytest test files
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── admin/
│       │   │   ├── CourseEditor.jsx   # NEW - Full course management
│       │   │   ├── Admissions.jsx     # UPDATED - Application workflow
│       │   │   └── ...
│       └── components/ui/
│           ├── dialog.jsx             # FIXED - bg-white
│           └── ...
├── school/                            # NEW - Separate landing page app
│   ├── src/App.js                     # Homepage, courses, application
│   └── .env
└── memory/PRD.md
```

## What's Been Implemented

### Date: Feb 13, 2026 - Session 2

**UI/UX Fixes**
- ✅ Fixed transparent dialog/popup backgrounds (bg-background → bg-white)
- ✅ Fixed alert-dialog, dropdown-menu, select components
- ✅ All action buttons in dropdown menus working correctly

**Course Builder/Editor (NEW)**
- ✅ Full course editing UI at `/admin/courses/:id/edit`
- ✅ Course information section (code, title, description, department, lecturer)
- ✅ Duration settings (weeks/months/years dropdown)
- ✅ Course settings panel (level, semester, type, image URL)
- ✅ Course Content section with module accordion
- ✅ Add Module dialog
- ✅ Add Lesson dialog (video, PDF, text, quiz types)
- ✅ Upload Quiz from Excel with template download

**Student Management (Enhanced)**
- ✅ Student Quick Stats cards (Total, Paid, Locked, Expelled)
- ✅ Export Students to Excel (names, emails, student IDs)
- ✅ xlsx library integration for Excel generation

**Applications & Admissions (NEW)**
- ✅ Applications table with filtering
- ✅ Stats: Pending Payment, Pending Review, Approved, Rejected, Total Revenue
- ✅ EUR (€) currency display throughout
- ✅ Approve/Reject application buttons
- ✅ Auto-create student account on approval
- ✅ Send admission email with credentials
- ✅ PDF admission letter generation (ReportLab)

**Landing Page (`/app/school/`) - NEW**
- ✅ Homepage with hero, stats, featured courses
- ✅ Course catalog with search
- ✅ Course detail page with application form
- ✅ Stripe checkout for €50 application fee
- ✅ Application success page with payment polling
- ✅ About and Contact pages
- ✅ Green/orange GITB branding

**Backend API Additions**
- ✅ `/api/courses/public` - Public course listing
- ✅ `/api/applications/create` - Create application with Stripe
- ✅ `/api/applications` - List all applications
- ✅ `/api/applications/{id}/approve` - Approve & create user
- ✅ `/api/applications/{id}/reject` - Reject application
- ✅ `/api/applications/{id}/admission-letter` - PDF download
- ✅ `/api/modules/{id}/lessons` - Add lesson to module
- ✅ `/api/modules/{id}/quiz` - Upload quiz from Excel

### Test Results
- **Backend**: 100% (31/31 tests passing)
- **Frontend**: 100% (all features verified)

## Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@unilms.edu | admin123 |
| Student | student@unilms.edu | student123 |
| Lecturer | lecturer@unilms.edu | lecturer123 |

## Stripe Configuration
- Public Key: pk_live_51SHqYK... (configured)
- Secret Key: sk_live_51SHqYK... (configured)
- Application Fee: €50.00

## Completed Features Summary
1. ✅ Dialog/popup transparency fix
2. ✅ All action buttons working (Edit, Lock, Unlock, Expel, Delete)
3. ✅ Student list with Excel export
4. ✅ Course Builder with modules, lessons, quiz upload
5. ✅ Course duration settings (weeks/months/years)
6. ✅ EUR currency display
7. ✅ Admin approval workflow for applications
8. ✅ PDF admission letter generation
9. ✅ Stripe payment integration
10. ✅ Landing page (separate app in /school)
11. ✅ Application flow with Stripe payment
12. ✅ Welcome emails with credentials

## Remaining Tasks

### P1 (Next Priority)
- [ ] Canvas-confetti on course completion
- [ ] PDF certificates for completed courses
- [ ] PDF invoices for payments
- [ ] Personalized student welcome ("Welcome, John!")
- [ ] Run and test the /school landing page build

### P2 (Medium Priority)
- [ ] Admin payment tracking dashboard
- [ ] Interactive course card hover effects
- [ ] Course change fee enforcement

### P3 (Nice to Have)
- [ ] Transcript PDF generation
- [ ] Backend refactoring (modular routers)
- [ ] Real-time notifications

## Technical Notes
- MongoDB Atlas SSL issue - using local MongoDB
- Stripe live keys configured (handle with care)
- School landing page requires `npm start` in /app/school
- ReportLab installed for PDF generation
- xlsx library for Excel export
