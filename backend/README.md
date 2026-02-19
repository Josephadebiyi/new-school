# GITB LMS Backend (Node.js/Express)

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URL` | MongoDB connection string |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret key for JWT tokens |
| `RESEND_API_KEY` | Resend API key for emails |
| `ADMIN_EMAIL` | From address for emails |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLIC_KEY` | Stripe public key |
| `APPLICATION_FEE_EUR` | Application fee amount |
| `DEFAULT_CURRENCY` | Default currency |
| `FRONTEND_URL` | Frontend URL for redirects |
| `PORT` | Server port (default: 8001) |
| `CORS_ORIGINS` | Allowed CORS origins |

## Render Deployment

### Web Service Settings
- **Name:** gitb-backend
- **Environment:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Root Directory:** `backend`

### Environment Variables (Add in Render Dashboard)
Add all variables from `.env.example` with your production values.

## API Endpoints

### Public
- `GET /api` - Health check
- `GET /api/system-config` - System configuration
- `GET /api/courses/public` - List all public courses
- `GET /api/courses/public/:id` - Get single course
- `POST /api/applications/create` - Submit application

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password (auth required)
- `GET /api/auth/me` - Get current user (auth required)

### Protected (Admin/Registrar)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/applications` - List applications
- `POST /api/applications/:id/approve` - Approve application
- `POST /api/applications/:id/reject` - Reject application
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create course
