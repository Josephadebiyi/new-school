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

### Project Structure
```
/app/
├── backend/           # FastAPI server
│   ├── server.py      # Main API (2200+ lines)
│   └── .env           # Stripe keys, Resend, MongoDB
├── frontend/          # Main LMS React app
│   └── src/pages/     # Admin, Student, Lecturer dashboards
├── school/            # Public landing page (separate app)
│   ├── src/App.js     # Homepage, courses, application flow
│   └── .env           # API URL config
└── memory/PRD.md
```

## What's Been Implemented

### Date: Feb 13, 2026

**Landing Page (`/app/school/`) - NEW**
- ✅ Homepage with hero, stats, featured courses
- ✅ Course catalog with search functionality
- ✅ Course detail page with application form
- ✅ Stripe checkout for €50 application fee
- ✅ Application success page with payment status polling
- ✅ About and Contact pages
- ✅ Green/orange GITB branding theme
- ✅ Responsive design with Tailwind

**Stripe Integration**
- ✅ Application fee payments (€50 EUR)
- ✅ Checkout session creation
- ✅ Payment status tracking
- ✅ payment_transactions collection

**Backend API Additions**
- ✅ `/api/courses/public` - No auth required
- ✅ `/api/courses/public/{id}` - Single course
- ✅ `/api/applications/create` - Create & pay
- ✅ `/api/applications/status/{session_id}` - Check payment
- ✅ `/api/webhook/stripe` - Stripe webhooks

**Admin Users Page**
- ✅ Student Quick Stats cards (Total, Paid, Locked, Expelled)
- ✅ Export Students to Excel (names, emails)
- ✅ Action buttons all working (Edit, Lock, Expel, Delete)

**Email Notifications**
- ✅ Application received confirmation email
- ✅ GITB branded HTML templates

### Previously Implemented
- UI/UX redesign with pastel theme
- Role-based dashboards (Admin, Student, Lecturer)
- User management with lock/unlock/expel
- Course CRUD operations
- Enrollment system
- Grade management
- Admin settings (branding, login page, bank details)

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

## Prioritized Backlog

### P0 (Critical - In Progress)
- [ ] Course Builder for Admin/Lecturer (add materials, quizzes)
- [ ] Admin approval workflow for applications
- [ ] PDF admission letter generation
- [ ] Course duration settings

### P1 (High Priority)
- [ ] EUR currency display across all pages
- [ ] Personalized student dashboard ("Welcome, John!")
- [ ] Quiz system with bulk Excel upload
- [ ] Quiz grading and attempt tracking

### P2 (Medium Priority)
- [ ] Canvas-confetti on course completion
- [ ] PDF certificates and invoices
- [ ] Admin payment tracking dashboard
- [ ] Course change fee enforcement

### P3 (Nice to Have)
- [ ] Interactive course card hover effects
- [ ] Transcript PDF generation
- [ ] Backend refactoring (modular routers)

## Technical Notes
- MongoDB Atlas SSL issue - using local MongoDB
- Stripe live keys are configured (handle with care)
- School landing page is separate app for independent deployment
- Application fee prevents multiple enrollments simultaneously

## Next Development Steps
1. Build Course Editor with materials upload
2. Implement admin application approval flow
3. Generate PDF admission letters (letterhead template)
4. Add course duration settings UI
