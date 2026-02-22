# GITB - Global Institute of Tech & Business LMS

## Original Problem Statement
Build a white-label Learning Management System (LMS) for an online educational institution. The system needs to support multiple user roles (admin, student, lecturer, registrar, staff), course management, application processing with Stripe payments, and comprehensive email notifications.

## Two-Stage Payment System (IMPLEMENTED)

### Stage 1: Registration Fee (€50)
- Student applies for a course
- Redirected to Stripe checkout for €50 registration fee
- After payment, application moves to "pending" status
- Admin reviews and approves/rejects

### Stage 2: Tuition Fee (Course Price)
- Upon approval, student receives welcome email with login credentials
- Student logs in and sees their course with "pending_payment" status
- Student clicks "Pay Tuition" → Stripe checkout for course price
- After payment, course is unlocked with **lifetime access**
- New courses require separate tuition payments

## Core Requirements

### 1. User Management & Authentication
- JWT-based authentication with role-based access control
- Multiple user roles: admin, registrar, lecturer, staff, student
- Password reset flow with email confirmation
- Login security notifications with IP/location tracking

### 2. Application Management
- Students apply for courses through a public form
- Application fee processing via Stripe (€50)
- Admin/Registrar can view, approve, or reject applications
- On approval: auto-generate password, create user account, send welcome email
- On rejection: send notification email with optional reason

### 3. Email Notifications (via Resend)
- Welcome email on application approval (with login credentials)
- Security alert on every login (IP address, location)
- Password change confirmation email
- Password reset email

### 4. Course Management
- CRUD operations for courses
- Public course listing
- Student enrollment tracking

### 5. Dashboard Features
- Admin dashboard with statistics
- Student dashboard with enrolled courses
- Login history tracking

## Technology Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Frontend:** React (pre-built)
- **Payments:** Stripe
- **Email:** Resend
- **Hosting:** Hostinger (production), Emergent Preview (development)

## User Personas
- **Admin:** Full system access, manage users, courses, applications
- **Registrar:** Manage applications and student enrollments
- **Lecturer:** Manage assigned courses and grade students
- **Staff:** Limited administrative access
- **Student:** Access enrolled courses and materials

---

## What's Been Implemented

### Backend API (100% Complete)
All endpoints are functional and tested:

#### Authentication
- `POST /api/auth/login` - Login with email/password, returns JWT
- `POST /api/auth/forgot-password` - Request password reset email
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated)
- `GET /api/auth/me` - Get current user profile

#### Applications
- `POST /api/applications/create` - Create application with Stripe payment (€50 registration fee)
- `GET /api/applications/status/:sessionId` - Check payment/application status
- `GET /api/applications` - List all applications (admin/registrar)
- `GET /api/applications/:id` - Get single application
- `POST /api/applications/:id/approve` - Approve and create user account with pending_payment enrollment
- `POST /api/applications/:id/reject` - Reject application

#### Tuition Payments (NEW)
- `GET /api/my-courses` - Get student's courses with enrollment status
- `POST /api/tuition/pay` - Create Stripe checkout for tuition fee
- `GET /api/tuition/status/:sessionId` - Check tuition payment status
- `POST /api/webhooks/stripe` - Stripe webhook for payment confirmations

#### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/role` - Update user role
- `PUT /api/users/:id/lock` - Lock user account
- `PUT /api/users/:id/unlock` - Unlock user account
- `DELETE /api/users/:id` - Delete user

#### Courses
- `GET /api/courses` - List all courses (authenticated)
- `GET /api/courses/public` - List active courses (public)
- `GET /api/courses/public/:id` - Get single course (public)
- `POST /api/courses` - Create course
- `GET /api/courses/:id` - Get course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

#### Dashboard
- `GET /api/dashboard/admin` - Admin statistics
- `GET /api/dashboard/student` - Student progress

#### Roles & Permissions
- `GET /api/roles` - List available roles

#### Other
- `GET /api/login-logs` - Login history
- `GET /api/enrollments` - All enrollments
- `GET /api/enrollments/my` - User's enrollments
- `GET /api/system-config` - System configuration
- `PUT /api/system-config` - Update system config

### Email Templates (Implemented)
1. Welcome email with temporary password
2. Login notification with IP/location
3. Password change confirmation
4. Password reset link
5. Application rejection notification

### Database Schema
- `users` - User accounts with roles and permissions
- `courses` - Course catalog
- `applications` - Student applications
- `enrollments` - Course enrollments
- `login_logs` - Login history with IP tracking
- `password_resets` - Password reset tokens
- `system_config` - System settings

---

## Pending Tasks

### P0 - Critical
- [ ] Fix "Dashboard failed to load" issue on Hostinger (investigate frontend API URL configuration)

### P1 - High Priority
- [ ] Remove "100 Level" section from application form (requires React source code)
- [ ] Admin Dashboard UI for managing applications (frontend)
- [ ] Admin role management UI (frontend)

### P2 - Medium Priority
- [ ] Admin payment tracking dashboard
- [ ] PDF admission letter generation
- [ ] Graduation features with confetti

### Backlog
- [ ] Course progress tracking
- [ ] Quiz/assessment system
- [ ] Notification center
- [ ] File upload for course materials

---

## Test Credentials
- **Admin:** taiwojos2@yahoo.com / Passw0rd@1
- **Student:** student@gitb.lt / (check DB)
- **Lecturer:** lecturer@gitb.lt / (check DB)

---

## Deployment Notes

### Hostinger Configuration
- Frontend: Static site deployment at gitb.lt
- Backend: Node.js deployment (separate or same domain with /api prefix)
- Required environment variables in backend:
  - MONGO_URL (MongoDB Atlas connection string)
  - DB_NAME=gitb_lms
  - JWT_SECRET
  - RESEND_API_KEY
  - STRIPE_SECRET_KEY
  - STRIPE_PUBLIC_KEY
  - FRONTEND_URL=https://gitb.lt
  - CORS_ORIGINS=*

### Emergent Preview Configuration
- Frontend: localhost:3000 (proxy to backend)
- Backend: localhost:8001
- Preview URL may not work due to platform routing issues

---

## Last Updated
February 22, 2026

## Session Notes
- Backend migration from Python/FastAPI to Node.js/Express completed
- All backend tests passing (100% success rate)
- Frontend is pre-built (no React source available for modifications)
- MongoDB Atlas is the production database
- **FIXED (Feb 22):** White Screen of Death on payment - changed backend response format from `{ checkout_url: ... }` to `{ data: { checkout_url: ... } }` to match frontend expectations
- **FIXED (Feb 22):** Removed fragile `safe-stripe.js` injection from `index.html`
- **FIXED (Feb 22):** Updated Stripe API key to new live key
- **FIXED (Feb 22):** Added Render/deployment stability improvements:
  - Health check endpoints (`/health`, `/api/health`)
  - MongoDB connection pooling with proper options
  - Graceful shutdown handling (SIGTERM, SIGINT)
  - Better startup logging
- **FIXED (Feb 22):** Changed enrollment text to "Now Enrolling for 2025 Cohort 2026"
- **NOTE:** Login notification email is intentionally DISABLED per user request. All other emails (welcome, password reset, password changed) are active.

## Deployment Files to Update on Hostinger/Render
After this session, deploy these updated files:
1. `/app/backend/server.js` - Contains payment fix, health checks, connection pooling
2. `/app/backend/.env` - Updated Stripe key (copy the key value, not the file)
3. `/app/index.html` - Cleaned up (removed injected scripts)
4. `/app/static/js/main.549fbcc6.js` - Updated enrollment text
