# GITB LMS - Render Deployment Guide

## Overview
This guide explains how to deploy the GITB LMS to Render. The application consists of:
- **Backend**: Node.js/Express API
- **Frontend**: React static site

## Prerequisites
1. A Render account (https://render.com)
2. Your MongoDB Atlas connection string
3. Stripe API keys (live or test)
4. Resend API key for emails

---

## Option 1: Quick Deploy with render.yaml (Recommended)

1. Push your code to GitHub
2. In Render Dashboard, click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect `render.yaml` and create both services
5. Add your secret environment variables in the Dashboard

---

## Option 2: Manual Deployment

### Step 1: Deploy Backend

1. In Render Dashboard, click "New" → "Web Service"
2. Connect your GitHub repo
3. Configure:
   - **Name**: `gitb-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGO_URL` | `mongodb+srv://admissions_db_user:Lkcyo060pghy5AUT@cluster0.cn1vzg7.mongodb.net/?retryWrites=true&w=majority` |
   | `DB_NAME` | `gitb_lms` |
   | `JWT_SECRET` | `lumina-lms-secure-jwt-secret-key-2025-production` |
   | `RESEND_API_KEY` | `re_8cmfKRen_Gwha2MhfgD2P1DaMLQCsUup3` |
   | `ADMIN_EMAIL` | `noreply@gitb.lt` |
   | `STRIPE_SECRET_KEY` | `sk_live_51SHqYKHwEJ5SknFT...` |
   | `STRIPE_PUBLIC_KEY` | `pk_live_51SHqYKHwEJ5SknFT...` |
   | `APPLICATION_FEE_EUR` | `50.00` |
   | `DEFAULT_CURRENCY` | `EUR` |
   | `FRONTEND_URL` | `https://gitb.lt` |
   | `CORS_ORIGINS` | `*` |

5. Click "Create Web Service"

### Step 2: Deploy Frontend

1. In Render Dashboard, click "New" → "Static Site"
2. Connect your GitHub repo
3. Configure:
   - **Name**: `gitb-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. Add Environment Variable:
   | Key | Value |
   |-----|-------|
   | `REACT_APP_BACKEND_URL` | `https://new-school-vam1.onrender.com` |

5. Add Rewrite Rule:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: Rewrite

6. Click "Create Static Site"

---

## Your Current Setup

Based on your configuration:
- **Backend URL**: `https://new-school-vam1.onrender.com`
- **Frontend URL**: `https://gitb.lt`

### Update Frontend for Production

Update `/app/frontend/.env` before deploying:
```
REACT_APP_BACKEND_URL=https://new-school-vam1.onrender.com
```

---

## Verify Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://new-school-vam1.onrender.com/api

# System config
curl https://new-school-vam1.onrender.com/api/system-config

# Public courses
curl https://new-school-vam1.onrender.com/api/courses/public

# Login test
curl -X POST https://new-school-vam1.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"taiwojos2@yahoo.com","password":"Passw0rd@1"}'
```

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | taiwojos2@yahoo.com | Passw0rd@1 |
| Student | student@gitb.lt | Student123! |
| Lecturer | lecturer@gitb.lt | Lecturer123! |
| Registrar | registrar@gitb.lt | Registrar123! |

---

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify all environment variables are set
- Ensure MongoDB Atlas allows connections from Render IPs (or use 0.0.0.0/0)

### Frontend can't connect to backend
- Verify `REACT_APP_BACKEND_URL` is correct
- Check CORS_ORIGINS includes your frontend domain
- Ensure backend is running (check /api endpoint)

### Stripe payments failing
- Verify Stripe keys are correct (live vs test)
- Check webhook is configured in Stripe Dashboard
- Ensure `FRONTEND_URL` matches your actual domain

---

## Files Structure

```
├── render.yaml           # Render blueprint
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── index.js      # Main server
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth middleware
│   │   └── services/     # Email service
│   ├── .env.example
│   └── README.md
└── frontend/
    ├── package.json
    ├── src/
    └── .env.example
```
