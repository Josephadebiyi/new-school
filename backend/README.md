# GITB LMS Backend

## Deployment on Render

### Settings
- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`

### Environment Variables
Set these in Render Dashboard → Environment:

```
MONGO_URL=mongodb+srv://your_user:your_password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=gitb_lms
RESEND_API_KEY=your_resend_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
FRONTEND_URL=https://your-frontend-url.com
JWT_SECRET=your_jwt_secret_key
```

## Local Development

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```
