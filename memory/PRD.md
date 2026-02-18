# GITB LMS - Product Requirements Document

## Project Overview
GITB (Global Institute of Technology and Business) is a white-label Learning Management System with:
1. Public-facing school website (landing pages)
2. LMS portal for authenticated users (admin, students, lecturers)

## Architecture

### Frontend Architecture
- **Main Frontend** (Port 3000): CRA + JavaScript React app
  - Landing page with all sections (Hero, PathForEveryone, PartnerLogos, OurSchools, NanoDiplomaIntro, TrendingPrograms, ReimaginingDream, Stats, Testimonials, BlogSection/Keep Growing With Us, Footer)
  - Login, Admin/Student/Lecturer dashboards
  - Reset Password page

### Backend
- FastAPI on port 8001
- MongoDB (local instance)
- Stripe integration for payments
- Resend for email

## Current Status (December 2025)

### Completed Features ✅
1. **Landing Page** - All sections implemented:
   - Hero section with "Europe's Best Innovative Online School"
   - PathForEveryone (Nano-Diploma, Diploma, Masterclass cards)
   - PartnerLogos marquee ("WHERE OUR LEARNERS WORK")
   - OurSchools (5 school cards)
   - NanoDiplomaIntro (green section)
   - TrendingPrograms (courses from API)
   - ReimaginingDream (Why GITB)
   - Stats (7,980+ learners, etc.)
   - Testimonials (3 cards)
   - BlogSection ("Keep Growing With Us" with 3 articles)
   - Footer with social links and EAHEA badge

2. **Authentication**
   - Login page with GITB branding and EAHEA badge
   - Forgot Password modal with email input
   - Password reset flow (email + reset page)
   - JWT-based auth with role-based access

3. **Email Service** (via Resend)
   - Application received email
   - Application approved email (with credentials)
   - Application rejected email
   - Forgot password email
   - Password changed confirmation

4. **LMS Features**
   - Admin dashboard with stats, quick actions
   - Student dashboard with enrolled courses
   - Lecturer dashboard with course management
   - Course builder for creating/editing courses
   - Admissions management
   - Payment integration (Stripe)

5. **Title** - "GITB - Student LMS"

### Pending Tasks 📋
1. **P1 - BLOCKED** - MongoDB Atlas connection (user provided SQL interface URL, needs standard MongoDB connection string)
2. **P1** - Backend refactoring (split server.py into modules in /routes, /services)
3. **P2** - Admin payment tracking dashboard
4. **P2** - PDF template editor for admission letters
5. **P2** - Graduation celebration (confetti on 100% completion)

### Known Issues
- Images may show broken occasionally due to Cloudflare 524 timeout (infrastructure issue, not code)
- MongoDB Atlas connection blocked - user needs to provide standard MongoDB connection string format:
  `mongodb+srv://user:password@cluster.mongodb.net/database`

## Key Files
- `/app/frontend/src/pages/LandingPage.jsx` - Landing page with all sections
- `/app/frontend/src/pages/Login.jsx` - Login with forgot password modal
- `/app/frontend/src/pages/ResetPassword.jsx` - Password reset page
- `/app/frontend/src/App.js` - All routes
- `/app/frontend/src/App.css` - Animations (marquee, fade-in)
- `/app/backend/server.py` - FastAPI backend
- `/app/backend/services/email_service.py` - Email templates

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
- Database name: gitb_lms

---
Last Updated: February 18, 2026
