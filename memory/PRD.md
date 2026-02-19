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
- Stripe for payments
- Resend for emails

## Key Features

### Public Pages (with Header)
- Landing Page - All sections including "Keep Growing With Us"
- Course Detail Pages - `/course/:courseId`
- School Detail Pages - `/schools/:schoolId`
- Why GITB Page - `/why-gitb`
- Apply Page - `/apply`

### Authentication
- Login with Forgot Password modal
- Reset Password page
- JWT-based auth with role-based access

### Application Flow
1. User fills application form
2. Stripe checkout for €50 fee
3. Admin reviews application
4. On approval: student account created, email sent

## Files Structure for Deployment

```
├── render.yaml           # Render auto-deploy
├── README.md             # Deployment guide
├── backend/
│   ├── server.py
│   ├── requirements.txt  # No emergentintegrations!
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
STRIPE_SECRET_KEY=sk_xxxx
RESEND_API_KEY=re_xxxx
FRONTEND_URL=https://your-frontend.com
```

### Frontend
```
REACT_APP_BACKEND_URL=https://your-backend.com
```

## Admin Credentials
- Email: taiwojos2@yahoo.com
- Password: Passw0rd@1

## Changes Made (Feb 19, 2026)
1. ✅ Removed `emergentintegrations` from requirements.txt (was causing Render deployment failure)
2. ✅ Implemented Stripe directly using `stripe` package v14.3.0
3. ✅ Created `PublicHeader.jsx` shared component
4. ✅ Added header to all public pages: CourseDetailPage, SchoolDetailPage, SchoolsPage, WhyGITBPage
5. ✅ Updated page title to "GITB - Global Institute of Tech & Business | Online Learning"
6. ✅ All countries added to application form
7. ✅ Fixed placeholder text (First Name/Last Name instead of John/Doe)
8. ✅ Created admin account

---
Last Updated: February 19, 2026
