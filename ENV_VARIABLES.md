# GITB LMS - Environment Variables Documentation

## Required Environment Variables

These must be set for the application to start:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) | `your-secure-random-string-here` |
| `STRIPE_SECRET_KEY` | Stripe secret API key | `sk_live_xxxx` |
| `STRIPE_PUBLIC_KEY` | Stripe publishable API key | `pk_live_xxxx` |

## Optional Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_NAME` | `gitb_lms` | MongoDB database name |
| `PORT` | `8001` | Server port |
| `RESEND_API_KEY` | - | Resend API key for emails |
| `ADMIN_EMAIL` | `noreply@gitb.lt` | From address for emails |
| `FRONTEND_URL` | `https://gitb.lt` | Frontend URL for email links |
| `CORS_ORIGINS` | `*` | Allowed CORS origins |
| `APPLICATION_FEE_EUR` | `50` | Application fee amount |
| `DEFAULT_CURRENCY` | `EUR` | Default currency |
| `NODE_ENV` | `development` | Environment (production/development) |

## Hostinger Deployment Setup

1. Go to Hostinger control panel
2. Navigate to your Node.js hosting
3. Find "Environment Variables" or "Application Settings"
4. Add each variable listed above

## Security Notes

- Never commit `.env` files to Git
- Use different API keys for production and development
- Rotate JWT_SECRET periodically
- Keep STRIPE_SECRET_KEY confidential (never expose to frontend)
- Only STRIPE_PUBLIC_KEY should be accessible from frontend

## Startup Validation

The application validates required environment variables on startup.
If any are missing, it will:
1. Print an error message listing missing variables
2. Exit with code 1

Check logs if the application fails to start.
