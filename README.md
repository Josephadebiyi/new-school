# GITB LMS - Learning Management System

## Project Structure

```
├── public_html/          # Frontend build (deploy to gitb.lt)
│   ├── index.html
│   ├── .htaccess
│   ├── static/
│   └── images/
├── backend/              # Node.js API (deploy to api subdomain or Render)
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/             # React source code
    ├── src/
    ├── package.json
    └── build/
```

## Hostinger Deployment

### For gitb.lt (Frontend)
1. Point gitb.lt to the `public_html` folder
2. Or set the deployment path to `/public_html`
3. The `.htaccess` file handles React routing

### For API (Backend)
**Option A: Use Render (Recommended)**
- Backend is already deployed at: `https://new-school-vam1.onrender.com`
- Frontend is configured to use this URL

**Option B: Hostinger Node.js Hosting**
1. Create a subdomain `api.gitb.lt`
2. Set up Node.js app pointing to `/backend` folder
3. Set startup file: `server.js`
4. Add environment variables (see backend/.env.example)

## Environment Variables

### Backend (server.js)
```
MONGO_URL=mongodb+srv://...
DB_NAME=gitb_lms
JWT_SECRET=your-secret-key
RESEND_API_KEY=re_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
FRONTEND_URL=https://gitb.lt
CORS_ORIGINS=*
```

### Frontend (already built with)
```
REACT_APP_BACKEND_URL=https://new-school-vam1.onrender.com
```

## Test Credentials
- **Admin**: taiwojos2@yahoo.com / Passw0rd@1
- **Student**: student@gitb.lt / Student123!
- **Lecturer**: lecturer@gitb.lt / Lecturer123!

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Payments**: Stripe
- **Email**: Resend
