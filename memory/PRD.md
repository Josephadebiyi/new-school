# GITB LMS - Product Requirements Document

## Project Overview
GITB (Global Institute of Technology and Business) - Europe's Best Innovative Online School
- White-label Learning Management System
- Public-facing school website with program pages
- LMS portal for authenticated users

## Architecture

### Frontend
- React + Create-React-App
- Tailwind CSS + Shadcn UI
- Hosted at: gitb.lt

### Backend (Node.js - MIGRATED)
- **Runtime**: Node.js/Express
- **Database**: MongoDB Atlas
- **Deployed URL**: https://new-school-vam1.onrender.com

## Key Features

### Public Pages
- Landing Page with all sections
- Course Detail Pages - `/course/:slug`
- School Detail Pages - `/schools/:schoolId`
- Apply Page - `/apply`

### Authentication
- JWT-based authentication
- Login with Forgot Password modal
- Reset Password page
- Role-based access (admin, student, lecturer, registrar)

### Application Flow
1. User fills application form
2. Stripe checkout for EUR 50 fee
3. Admin reviews application
4. On approval: student account created, email sent

## Courses (10 in Database)

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

## User Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | taiwojos2@yahoo.com | Passw0rd@1 |
| Student | student@gitb.lt | Student123! |
| Lecturer | lecturer@gitb.lt | Lecturer123! |
| Registrar | registrar@gitb.lt | Registrar123! |

## Backend Migration (Feb 19, 2026)

### Changed
- **FROM**: Python/FastAPI
- **TO**: Node.js/Express

### Why
- Python dependency conflicts were blocking Render deployment
- Node.js provides simpler deployment with no build conflicts

### New Backend Structure
```
/app/backend/
├── package.json
├── .env
├── .env.example
├── README.md
├── src/
│   ├── index.js          # Main server
│   ├── middleware/
│   │   └── auth.js       # JWT authentication
│   ├── routes/
│   │   ├── auth.js       # Login, forgot/reset password
│   │   ├── users.js      # User CRUD
│   │   ├── courses.js    # Course CRUD
│   │   ├── applications.js # Application + Stripe
│   │   ├── enrollments.js
│   │   ├── dashboard.js
│   │   ├── modules.js
│   │   ├── grades.js
│   │   ├── transactions.js
│   │   ├── uploads.js
│   │   └── system.js
│   └── services/
│       └── email.js      # Resend email service
└── uploads/              # File uploads
```

## API Endpoints

### Public
- `GET /api` - Health check
- `GET /api/system-config` - System configuration
- `GET /api/courses/public` - List public courses
- `POST /api/applications/create` - Submit application + Stripe

### Auth
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`

### Protected
- `GET /api/users` - List users (admin)
- `GET /api/applications` - List applications (admin)
- `POST /api/applications/:id/approve`
- `POST /api/applications/:id/reject`
- `GET /api/dashboard/admin` - Admin stats
- `GET /api/dashboard/student` - Student stats

## Render Deployment

### Backend (Web Service)
- **URL**: https://new-school-vam1.onrender.com
- **Runtime**: Node
- **Build**: `npm install`
- **Start**: `npm start`
- **Root Dir**: `backend`

### Frontend (Static Site)
- **URL**: https://gitb.lt
- **Build**: `npm install && npm run build`
- **Publish**: `build`
- **Root Dir**: `frontend`

### Environment Variables (Backend)
```
MONGO_URL=mongodb+srv://...
DB_NAME=gitb_lms
JWT_SECRET=lumina-lms-secure-jwt-secret-key-2025-production
RESEND_API_KEY=re_8cmfKRen_Gwha2MhfgD2P1DaMLQCsUup3
ADMIN_EMAIL=noreply@gitb.lt
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
APPLICATION_FEE_EUR=50.00
FRONTEND_URL=https://gitb.lt
CORS_ORIGINS=*
```

### Environment Variables (Frontend)
```
REACT_APP_BACKEND_URL=https://new-school-vam1.onrender.com
REACT_APP_STRIPE_KEY=pk_live_...
```

## Completed (Feb 19, 2026)
1. ✅ Migrated backend from Python to Node.js
2. ✅ All API endpoints working
3. ✅ Stripe integration working
4. ✅ Resend email integration working
5. ✅ MongoDB connection working
6. ✅ All user logins working (admin, student, lecturer, registrar)
7. ✅ 10 courses in database
8. ✅ Render deployment configuration ready

## Files Created
- `/app/backend/package.json`
- `/app/backend/src/index.js`
- `/app/backend/src/routes/*.js`
- `/app/backend/src/middleware/auth.js`
- `/app/backend/src/services/email.js`
- `/app/render.yaml`
- `/app/RENDER_DEPLOYMENT.md`

---
Last Updated: February 19, 2026
