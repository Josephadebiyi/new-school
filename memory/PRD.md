# GITB LMS - Product Requirements Document

## Project Overview
GITB (Global Institute of Technology and Business) - Europe's Best Innovative Online School
- White-label Learning Management System
- Public-facing school website with program pages
- LMS portal for authenticated users

## Architecture

### Frontend (Port 3000)
- React + Create-React-App
- Tailwind CSS + Shadcn UI
- Public pages with shared header component

### Backend (Port 8001)
- FastAPI + Python
- MongoDB Atlas database
- Stripe for payments (live keys configured)
- Resend for emails (API key configured)

## Key Features

### Public Pages (with Header)
- Landing Page - All sections including "Keep Growing With Us"
- Course Detail Pages - `/course/:slug`
- School Detail Pages - `/schools/:schoolId`
- Why GITB Page - `/why-gitb`
- Apply Page - `/apply`

### Authentication
- Login with Forgot Password modal
- Reset Password page
- JWT-based auth with role-based access

### Application Flow
1. User fills application form
2. Stripe checkout for EUR 50 fee
3. Admin reviews application
4. On approval: student account created, email sent

## Courses in Database

All 10 courses are now stored in MongoDB with complete information:

| Course | Category | Duration | Price |
|--------|----------|----------|-------|
| UI/UX & Webflow Design | Design | 3 months | €1,200 |
| KYC & Compliance | Finance | 2 months | €900 |
| Cyber-Security Vulnerability Tester | Security | 4 months | €1,800 |
| French \| Spanish \| Lithuanian | Languages | 3 months | €800 |
| Identity & Access Management (IAM) | Security | 3 months | €1,400 |
| Data Analytics | Data | 4 months | €1,500 |
| Product Management | Product | 3 months | €1,600 |
| Digital Marketing | Marketing | 3 months | €1,100 |
| Software Engineering | Engineering | 6 months | €2,500 |
| Business Strategy | Business | 3 months | €1,800 |

Each course includes:
- Full curriculum (8 modules)
- Learning outcomes
- Certifications awarded
- Requirements/prerequisites
- Category badges
- Duration and pricing

## Files Structure for Deployment

```
├── render.yaml           # Render auto-deploy
├── README.md             # Deployment guide
├── backend/
│   ├── server.py
│   ├── requirements.txt  # Clean, minimal dependencies
│   └── .env.example
└── frontend/
    ├── package.json
    ├── src/
    │   └── components/
    │       └── PublicHeader.jsx  # Shared header
    └── .env.example
```

## Render Deployment Settings

### Backend Service
- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`

### Frontend Service
- **Root Directory:** `frontend`
- **Build Command:** `yarn install && yarn build`
- **Publish Directory:** `build`

## Environment Variables

### Backend
```
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=gitb_lms
STRIPE_SECRET_KEY=sk_live_xxxx
STRIPE_PUBLIC_KEY=pk_live_xxxx
RESEND_API_KEY=re_xxxx
ADMIN_EMAIL=noreply@gitb.lt
FRONTEND_URL=https://your-frontend.com
APPLICATION_FEE_EUR=50.00
DEFAULT_CURRENCY=EUR
```

### Frontend
```
REACT_APP_BACKEND_URL=https://your-backend.com
```

## Admin Credentials
- Email: taiwojos2@yahoo.com
- Password: Passw0rd@1

## What's Been Implemented (Feb 19, 2026)

### Completed Features
1. Full landing page with all sections (Hero, Programs, Testimonials, Blog, etc.)
2. Authentication system (Login, Forgot Password, Reset Password)
3. Admin dashboard with course management
4. Application form with Stripe payment integration
5. Email notifications via Resend
6. Public course/school detail pages
7. Shared header component across all public pages
8. **All 10 courses seeded in database with complete information**

### Technical Fixes Applied
1. Cleaned `requirements.txt` - removed all unnecessary packages, minimal dependencies only
2. Fixed user authentication to handle both `id` and `_id` fields from MongoDB
3. Stripe integration using official `stripe` SDK (v11.4.1)
4. MongoDB Atlas connection with proper SSL/TLS handling

### Verified Working (100% Test Pass Rate)
- All 21 backend API endpoints tested
- Frontend landing page, login, and admin dashboard
- Stripe checkout session creation (live keys)
- Admin login with taiwojos2@yahoo.com
- All courses displayed from database

## API Endpoints

### Public (No Auth)
- `GET /api/system-config` - System configuration
- `GET /api/courses/public` - List all public courses (10 courses)
- `GET /api/courses/public/{id}` - Single course details
- `POST /api/applications/create` - Submit application (creates Stripe checkout)
- `GET /api/applications/status/{session_id}` - Check application status

### Auth
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated)
- `GET /api/auth/me` - Current user info

### Admin Protected
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `GET /api/applications` - List applications
- `POST /api/applications/{id}/approve` - Approve application
- `POST /api/applications/{id}/reject` - Reject application

## Remaining/Future Tasks

### P1 - High Priority
- Backend refactoring: Move endpoint logic from monolithic `server.py` into `/app/backend/routes/` directory

### P2 - Medium Priority
- Admin Payment Tracking dashboard
- PDF Generation enhancements (admin interface for admission letter template)
- Graduation Features (confetti on course completion)

---
Last Updated: February 19, 2026
