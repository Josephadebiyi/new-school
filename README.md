# GITB LMS - Learning Management System

## Project Structure

```
/ (root)
├── index.html          # Frontend entry point
├── .htaccess           # Apache routing for SPA
├── static/             # CSS & JavaScript
├── images/             # Image assets
├── school/             # School pages
└── backend/            # Node.js API (for Render)
    ├── server.js
    ├── package.json
    └── .env.example
```

## Deployment Setup

### Hostinger (gitb.lt) - Frontend
- **Type**: Static/Web Hosting (NOT Node.js)
- **Document Root**: `/` (root folder)
- **Index file**: `index.html`

The root folder contains pre-built React static files.

### Render (new-school-vam1.onrender.com) - Backend
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node

Add these environment variables in Render:
- `MONGO_URL` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `STRIPE_SECRET_KEY` - Stripe secret
- `RESEND_API_KEY` - Resend API key
- `FRONTEND_URL` - https://gitb.lt

## Test Credentials
- **Admin**: taiwojos2@yahoo.com / Passw0rd@1
- **Student**: student@gitb.lt / Student123!
