# GITB LMS - Learning Management System

A white-label Learning Management System for Global Institute of Technology and Business.

## Project Structure

```
├── backend/              # FastAPI Backend
│   ├── server.py         # Main API server
│   ├── requirements.txt  # Python dependencies
│   ├── services/         # Business logic
│   └── .env.example      # Environment template
├── frontend/             # React Frontend
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   └── package.json      # Node dependencies
└── render.yaml           # Render deployment config
```

## Deployment to Render

### Option 1: Blueprint (Recommended)
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Blueprint Instance
3. Connect your GitHub repository
4. Render will use `render.yaml` to deploy both services

### Option 2: Manual Setup

#### Backend Service
1. Create new Web Service on Render
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables (see backend/.env.example)

#### Frontend Service
1. Create new Static Site on Render
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `yarn install && yarn build`
   - **Publish Directory:** `build`
4. Add Environment Variable:
   - `REACT_APP_BACKEND_URL` = Your backend URL (e.g., https://gitb-backend.onrender.com)

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=gitb_lms
RESEND_API_KEY=re_xxxx
STRIPE_SECRET_KEY=sk_xxxx
FRONTEND_URL=https://your-frontend.com
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://your-backend.com
```

## Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

### Frontend
```bash
cd frontend
yarn install
yarn start
```

## Default Admin Account
- Email: taiwojos2@yahoo.com
- Password: Passw0rd@1

## Features
- Student/Lecturer/Admin dashboards
- Course management
- Application & admissions system
- Stripe payment integration
- Email notifications (Resend)
- EAHEA accreditation badges
