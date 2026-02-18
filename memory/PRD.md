# GITB LMS - Product Requirements Document

## Project Overview
GITB (Global Institute of Technology and Business) is a white-label Learning Management System with:
1. Public-facing school website (landing pages)
2. LMS portal for authenticated users (admin, students, lecturers)

## Architecture

### Frontend Architecture
- **Main Frontend** (Port 3000): CRA + JavaScript React app
  - Landing page with all sections
  - Login, Forgot Password, Reset Password
  - Admin/Student/Lecturer dashboards
  - School detail pages
  - Course detail pages

### Backend
- FastAPI on port 8001
- MongoDB (local instance - Atlas needs IP whitelisting)
- Stripe integration for payments
- Resend for email

## Current Status (February 2026)

### Completed Features ✅
1. **Landing Page** - All sections implemented:
   - Hero, PathForEveryone, PartnerLogos, OurSchools
   - NanoDiplomaIntro, TrendingPrograms, ReimaginingDream
   - Stats, Testimonials, BlogSection ("Keep Growing With Us"), Footer

2. **School & Course Navigation**
   - School cards are clickable → `/schools/:schoolId`
   - Course cards are clickable → `/course/:courseId`
   - SchoolDetailPage shows programs per school
   - CourseDetailPage shows full course info (10 courses)

3. **Authentication**
   - Login page with GITB branding
   - Forgot Password modal
   - Reset Password page
   - JWT-based auth with role-based access

4. **Email Service** (via Resend)
   - Application received, approved, rejected emails
   - Forgot password email
   - Password changed confirmation

5. **Images Saved**
   - gitb-logo.png (uploaded by user)
   - eahea-badge.png (uploaded by user)
   - eu-flag.png (uploaded by user)
   - Course images (IMG_1522.JPG, IMG_1529.JPG, etc.)

6. **Title** - "GITB - Student LMS"

### Known Issues ⚠️
1. **Intermittent Cloudflare 524 Timeouts** - Infrastructure issue, not code
2. **Images sometimes show alt text** - Related to Cloudflare timeouts

### Pending Tasks 📋
1. **MongoDB Atlas Connection** - BLOCKED: Need to whitelist IP `34.16.56.64` in MongoDB Atlas Network Access
2. **Backend Refactoring** - Split server.py into modular routes
3. **Admin Payment Tracking** - Dashboard for viewing Stripe payments

## Key Files
- `/app/frontend/src/pages/LandingPage.jsx` - Landing page
- `/app/frontend/src/pages/SchoolDetailPage.jsx` - School programs
- `/app/frontend/src/pages/CourseDetailPage.jsx` - Course details (10 courses)
- `/app/frontend/src/pages/Login.jsx` - Login with forgot password
- `/app/frontend/src/pages/ResetPassword.jsx` - Password reset
- `/app/frontend/public/images/` - All images

## Available Courses
1. UI/UX & Webflow Design (ui-ux-webflow)
2. KYC & Compliance (kyc-compliance)
3. Cyber-Security Vulnerability Tester (cybersecurity-vulnerability)
4. French | Spanish | Lithuanian (languages-french-spanish)
5. Identity & Access Management (identity-access-management)
6. Data Analytics (data-analytics)
7. Product Management (product-management)
8. Digital Marketing (digital-marketing)
9. Software Engineering (software-engineering)
10. Business Strategy (business-strategy)

## Schools
1. Engineering - Software, DevOps, Cloud
2. Data - Analytics, Science, AI
3. Product - Management, Design, UX
4. Creative Economy - Marketing, Content, Media
5. Business - Strategy, Operations, Finance

## Credentials
- Admin: admin@unilms.edu / admin123
- Student: student@unilms.edu / student123
- Lecturer: lecturer@unilms.edu / lecturer123

## 3rd Party Integrations
- Stripe (payments)
- Resend (email)
- Uploadcare (media hosting)

## Database
- Currently using: mongodb://localhost:27017
- Database name: gitb_lms
- MongoDB Atlas: Requires IP whitelisting (34.16.56.64)

## Backend Root Directory
`/app/backend`

---
Last Updated: February 18, 2026
