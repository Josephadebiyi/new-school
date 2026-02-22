const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const { Resend } = require("resend");
const Stripe = require("stripe");

// Load environment variables
require("dotenv").config();

// ============ ENVIRONMENT VALIDATION ============
const REQUIRED_ENV_VARS = [
  "MONGO_URL",
  "JWT_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLIC_KEY"
];

const OPTIONAL_ENV_VARS = [
  "RESEND_API_KEY",
  "FRONTEND_URL",
  "CORS_ORIGINS",
  "ADMIN_EMAIL",
  "APPLICATION_FEE_EUR",
  "DB_NAME"
];

function validateEnvironment() {
  const missing = [];
  const warnings = [];
  
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  for (const varName of OPTIONAL_ENV_VARS) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }
  
  if (missing.length > 0) {
    console.error("========================================");
    console.error("FATAL: Missing required environment variables:");
    missing.forEach(v => console.error(`  - ${v}`));
    console.error("========================================");
    console.error("Please set these variables in your .env file or hosting environment.");
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.warn("Warning: Optional environment variables not set (using defaults):");
    warnings.forEach(v => console.warn(`  - ${v}`));
  }
  
  // Validate Stripe keys format
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith("sk_")) {
    console.error("FATAL: STRIPE_SECRET_KEY must start with 'sk_'");
    process.exit(1);
  }
  
  if (process.env.STRIPE_PUBLIC_KEY && !process.env.STRIPE_PUBLIC_KEY.startsWith("pk_")) {
    console.error("FATAL: STRIPE_PUBLIC_KEY must start with 'pk_'");
    process.exit(1);
  }
  
  console.log("Environment validation passed");
}

validateEnvironment();

const app = express();

// Configuration (no fallbacks for critical secrets)
const PORT = process.env.PORT || 8001;
const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || "gitb_lms";
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://gitb.lt";
const CORS_ORIGINS = process.env.CORS_ORIGINS || "*";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "noreply@gitb.lt";
const APPLICATION_FEE = parseFloat(process.env.APPLICATION_FEE_EUR || "50");

// Initialize services
let stripe = null;
let resend = null;

try {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log("Stripe initialized successfully");
} catch (err) {
  console.error("FATAL: Stripe initialization failed:", err.message);
  process.exit(1);
}

try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log("Resend initialized successfully");
  } else {
    console.warn("Resend not configured - emails will be disabled");
  }
} catch (err) {
  console.warn("Resend initialization failed:", err.message);
}

// Middleware
app.use(cors({
  origin: CORS_ORIGINS === "*" ? "*" : CORS_ORIGINS.split(","),
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ============ ROUTE ALIASING FOR FLEXIBLE DEPLOYMENT ============
// This middleware allows routes to work with or without /api prefix
// Must be placed BEFORE all route definitions
app.use((req, res, next) => {
  const apiPatterns = [
    '/applications',
    '/auth',
    '/courses',
    '/users',
    '/dashboard',
    '/enrollments',
    '/tuition',
    '/roles',
    '/login-logs',
    '/system-config',
    '/config',
    '/admin',
    '/my-courses',
    '/webhooks'
  ];
  
  if (!req.path.startsWith('/api')) {
    for (const pattern of apiPatterns) {
      if (req.path.startsWith(pattern) || req.path === pattern) {
        req.url = '/api' + req.url;
        break;
      }
    }
  }
  next();
});

// Trust proxy for IP detection
app.set("trust proxy", true);

// Static files
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection
let db = null;
let mongoClient = null;

async function connectDB() {
  if (!MONGO_URL) {
    console.error("MONGO_URL or MONGO_URI environment variable is not set");
    return null;
  }

  try {
    mongoClient = new MongoClient(MONGO_URL);
    await mongoClient.connect();
    db = mongoClient.db(DB_NAME);
    console.log("Connected to MongoDB successfully");
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    return null;
  }
}

// Middleware to add db to request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Health check
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/api", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "GITB LMS API is running",
    database: db ? "connected" : "disconnected"
  });
});

// Public config endpoint (safe to expose)
app.get("/api/config", (req, res) => {
  res.json({
    stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
    applicationFee: APPLICATION_FEE,
    currency: process.env.DEFAULT_CURRENCY || "EUR"
  });
});

// ============ ROUTE ALIASING FOR FLEXIBLE DEPLOYMENT ============
// This middleware allows routes to work with or without /api prefix
// Useful for different hosting configurations (Hostinger, Render, etc.)
app.use((req, res, next) => {
  // If the path doesn't start with /api but matches an API route pattern, redirect internally
  const apiPatterns = [
    '/applications',
    '/auth',
    '/courses',
    '/users',
    '/dashboard',
    '/enrollments',
    '/tuition',
    '/roles',
    '/login-logs',
    '/system-config',
    '/config',
    '/admin',
    '/my-courses',
    '/webhooks'
  ];
  
  if (!req.path.startsWith('/api')) {
    for (const pattern of apiPatterns) {
      if (req.path.startsWith(pattern) || req.path === pattern) {
        req.url = '/api' + req.url;
        break;
      }
    }
  }
  next();
});

// ============ AUTH MIDDLEWARE ============
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ detail: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!db) {
      return res.status(503).json({ detail: "Database not available" });
    }

    let user = await db.collection("users").findOne(
      { id: decoded.sub },
      { projection: { password: 0 } }
    );

    if (!user) {
      try {
        user = await db.collection("users").findOne(
          { _id: new ObjectId(decoded.sub) },
          { projection: { password: 0 } }
        );
        if (user) {
          user.id = user._id.toString();
          delete user._id;
        }
      } catch (e) {}
    }

    if (!user) {
      return res.status(401).json({ detail: "User not found" });
    }

    if (user._id) {
      user.id = user.id || user._id.toString();
      delete user._id;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ detail: "Token expired" });
    }
    return res.status(401).json({ detail: "Invalid token" });
  }
};

const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ detail: "Not authenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ detail: "Insufficient permissions" });
    }
    next();
  };
};

// ============ HELPER FUNCTIONS ============
const getSystemConfig = async () => {
  if (!db) return { university_name: "GITB - Student LMS" };
  
  let config = await db.collection("system_config").findOne({}, { projection: { _id: 0 } });
  if (!config) {
    config = {
      university_name: "GITB - Student LMS",
      logo_url: "",
      favicon_url: "",
      primary_color: "#0F172A",
      secondary_color: "#D32F2F",
      support_email: "",
      support_phone: ""
    };
    await db.collection("system_config").insertOne(config);
  }
  return config;
};

const generateStudentId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `STU${year}${random}`;
};

const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const getClientIP = (req) => {
  return req.ip || 
         req.headers["x-forwarded-for"]?.split(",")[0] || 
         req.headers["x-real-ip"] || 
         req.connection?.remoteAddress || 
         "Unknown";
};

const getLocationFromIP = async (ip) => {
  try {
    // Skip for local/private IPs
    if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168") || ip.startsWith("10.") || ip === "Unknown") {
      return "Local Network";
    }
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=city,country`);
    const data = await response.json();
    if (data.city && data.country) {
      return `${data.city}, ${data.country}`;
    }
    return "Unknown Location";
  } catch (error) {
    return "Unknown Location";
  }
};

// ============ EMAIL FUNCTIONS ============
const GITB_LOGO_URL = "https://customer-assets.emergentagent.com/job_c38408f7-f182-46c6-9956-2b3ba5b9837c/artifacts/2j37347h_GITB%20Logo-04%202.png";

const getEmailHeader = (subtitle = "Global Institute of Tech and Business") => `
  <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #3d7a4a 0%, #2d5a3a 100%); border-radius: 10px 10px 0 0;">
    <img src="${GITB_LOGO_URL}" alt="GITB Logo" style="max-width: 150px; height: auto; margin-bottom: 15px;" />
    <p style="margin: 0; font-size: 14px; color: white; opacity: 0.9;">${subtitle}</p>
  </div>
`;

const sendEmail = async (to, subject, html) => {
  if (!resend) {
    console.warn("Email not sent - Resend not configured");
    return false;
  }
  try {
    await resend.emails.send({
      from: `GITB <${ADMIN_EMAIL}>`,
      to: [to],
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error("Email error:", error.message);
    return false;
  }
};

// Welcome email when application is approved
const sendWelcomeEmail = async (email, firstName, lastName, courseTitle, tempPassword, tuitionAmount = 0) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      ${getEmailHeader()}
      
      <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #3d7a4a; margin-top: 0;">Welcome to Global Institute of Tech and Business!</h2>
        
        <p>Dear ${firstName} ${lastName},</p>
        
        <p><strong>Congratulations on your admission!</strong> You've taken a bold step toward building real skills in technology and business, and we're excited to have you join our academic community.</p>
        
        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3d7a4a;">
          <h3 style="margin: 0 0 10px 0; color: #2d5a3a;">Your Program</h3>
          <p style="margin: 0; font-size: 18px; color: #333;"><strong>${courseTitle}</strong></p>
        </div>
        
        <h3 style="color: #333;">Here's what to do next:</h3>
        
        <div style="background: #fff8e1; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
          <h4 style="margin: 0 0 10px 0; color: #f57c00;">Step 1: Complete Your Tuition Payment</h4>
          <p style="margin: 0;">To unlock your course and access all learning materials, please complete your tuition payment of <strong>€${tuitionAmount || 'See dashboard'}</strong> after logging in.</p>
        </div>
        
        <p>Log in using the credentials below to access your student dashboard:</p>
        
        <div style="background: #f5f5f5; padding: 25px; border-radius: 8px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Your Login Credentials</h3>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #fff3e0; padding: 5px 10px; border-radius: 4px; color: #e65100; font-size: 16px;">${tempPassword}</code></p>
        </div>
        
        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
          <p style="margin: 0; color: #e65100;">
            <strong>Important:</strong> Please change your password after first login and complete your tuition payment to access your courses.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${FRONTEND_URL}/login" style="display: inline-block; padding: 15px 40px; background: #3d7a4a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Login & Pay Tuition
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">If you experience any difficulty accessing your account, contact the admin team immediately for assistance.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #333;"><strong>Welcome once again — your journey starts now.</strong></p>
        
        <p style="color: #666; margin-bottom: 0;">Best regards,<br><strong>GITB Admissions Team</strong></p>
      </div>
    </div>
  `;
  
  return await sendEmail(email, `Welcome to GITB - Your Admission is Confirmed!`, html);
};

// Login notification email - DISABLED per user request
// const sendLoginNotificationEmail = async (email, firstName, ip, location, timestamp) => { ... };

// Password change confirmation email
const sendPasswordChangedEmail = async (email, firstName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      ${getEmailHeader("Security Notification")}
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #3d7a4a; margin-top: 0;">Password Changed Successfully</h2>
        
        <p>Hello ${firstName},</p>
        
        <p>Your GITB account password has been successfully changed.</p>
        
        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #2e7d32; font-size: 18px;">✓ Password Updated</p>
          <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">${new Date().toLocaleString()}</p>
        </div>
        
        <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #c62828;">
            <strong>Didn't make this change?</strong><br>
            If you did not change your password, your account may be compromised. Please contact our support team immediately and reset your password.
          </p>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${FRONTEND_URL}/login" style="display: inline-block; padding: 12px 30px; background: #3d7a4a; color: white; text-decoration: none; border-radius: 5px;">
            Go to Login
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px;">For your security, never share your password with anyone.</p>
      </div>
    </div>
  `;
  
  return await sendEmail(email, `Your GITB Password Has Been Changed`, html);
};

// ============ SYSTEM CONFIG ROUTES ============
app.get("/api/system-config", async (req, res) => {
  try {
    const config = await getSystemConfig();
    res.json(config);
  } catch (error) {
    console.error("Get system config error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.put("/api/system-config", authenticate, requireRoles(["admin"]), async (req, res) => {
  try {
    const updates = req.body;
    delete updates._id;
    await db.collection("system_config").updateOne({}, { $set: updates }, { upsert: true });
    const config = await db.collection("system_config").findOne({}, { projection: { _id: 0 } });
    res.json(config);
  } catch (error) {
    console.error("Update system config error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// ============ AUTH ROUTES ============
app.post("/api/auth/login", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ detail: "Database not available" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ detail: "Email and password are required" });
    }

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(401).json({ detail: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ detail: "Invalid credentials" });
    }

    if (!user.is_active) {
      return res.status(401).json({ detail: "Account is inactive" });
    }

    const userId = user.id || user._id.toString();

    const token = jwt.sign(
      { sub: userId, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Get IP for login logging (email notification disabled)
    const clientIP = getClientIP(req);

    // Log the login
    await db.collection("login_logs").insertOne({
      user_id: userId,
      email: user.email,
      ip: clientIP,
      timestamp: new Date().toISOString(),
      user_agent: req.headers["user-agent"] || "Unknown"
    });

    const userResponse = {
      id: userId,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      permissions: user.permissions || [],
      department: user.department || null,
      program: user.program || null,
      student_id: user.student_id || null,
      phone: user.phone || null,
      is_active: user.is_active,
      account_status: user.account_status || "active",
      payment_status: user.payment_status || "unpaid",
      must_change_password: user.must_change_password || false
    };

    const systemConfig = await getSystemConfig();

    res.json({
      access_token: token,
      token_type: "bearer",
      user: userResponse,
      system_config: systemConfig
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ detail: "Database not available" });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(422).json({ detail: "Email is required" });
    }

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.json({ message: "If an account exists with that email, a reset link has been sent." });
    }

    const userId = user.id || user._id.toString();
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await db.collection("password_resets").updateOne(
      { user_id: userId },
      {
        $set: {
          user_id: userId,
          token: resetToken,
          expires_at: expiry.toISOString(),
          created_at: new Date().toISOString()
        }
      },
      { upsert: true }
    );

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${getEmailHeader("Password Reset")}
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.first_name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 15px 40px; background: #3d7a4a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p style="color: #666;">If you didn't request this, please ignore this email or contact support if you're concerned.</p>
        </div>
      </div>
    `;

    await sendEmail(email, "Password Reset Request - GITB", html);

    res.json({ message: "If an account exists with that email, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ detail: "Database not available" });
    }

    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(422).json({ detail: "Token and new password are required" });
    }

    const resetRecord = await db.collection("password_resets").findOne({ token });
    if (!resetRecord) {
      return res.status(400).json({ detail: "Invalid or expired reset token" });
    }

    const expiry = new Date(resetRecord.expires_at);
    if (new Date() > expiry) {
      await db.collection("password_resets").deleteOne({ token });
      return res.status(400).json({ detail: "Reset token has expired" });
    }

    // Find user
    let user = await db.collection("users").findOne({ id: resetRecord.user_id });
    if (!user) {
      try {
        user = await db.collection("users").findOne({ _id: new ObjectId(resetRecord.user_id) });
      } catch (e) {}
    }

    if (!user) {
      return res.status(400).json({ detail: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(new_password, 12);
    
    await db.collection("users").updateOne(
      { $or: [{ id: resetRecord.user_id }, { _id: user._id }] },
      { $set: { password: hashedPassword, must_change_password: false } }
    );

    await db.collection("password_resets").deleteOne({ token });

    // Send password changed confirmation email
    await sendPasswordChangedEmail(user.email, user.first_name);

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.post("/api/auth/change-password", authenticate, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(422).json({ detail: "Current and new password are required" });
    }

    const user = await db.collection("users").findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(current_password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ detail: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(new_password, 12);
    await db.collection("users").updateOne(
      { id: user.id },
      { $set: { password: hashedPassword, must_change_password: false } }
    );

    // Send password changed confirmation email
    await sendPasswordChangedEmail(user.email, user.first_name);

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.get("/api/auth/me", authenticate, async (req, res) => {
  try {
    const systemConfig = await getSystemConfig();

    let access = { allowed: true, reason: null, message: null };
    if (req.user.account_status === "expelled") {
      access = { allowed: false, reason: "expelled", message: "Your account has been expelled." };
    } else if (req.user.account_status === "locked") {
      access = { allowed: false, reason: "locked", message: "Limited Access: Please contact Administrator." };
    } else if (req.user.role === "student" && req.user.payment_status === "unpaid") {
      access = { allowed: false, reason: "unpaid", message: "Please complete your payment." };
    }

    res.json({
      ...req.user,
      access,
      system_config: systemConfig
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// ============ ROLES & PERMISSIONS ============
// Get available roles
app.get("/api/roles", authenticate, requireRoles(["admin"]), async (req, res) => {
  try {
    const roles = [
      { 
        id: "admin", 
        name: "Administrator", 
        description: "Full access to all features",
        permissions: ["all"]
      },
      { 
        id: "registrar", 
        name: "Registrar", 
        description: "Manage students, enrollments, and applications",
        permissions: ["view_users", "manage_students", "manage_applications", "view_courses"]
      },
      { 
        id: "lecturer", 
        name: "Lecturer", 
        description: "Manage courses and grade students",
        permissions: ["view_courses", "manage_own_courses", "grade_students", "view_students"]
      },
      { 
        id: "staff", 
        name: "Staff", 
        description: "Limited administrative access",
        permissions: ["view_users", "view_courses", "view_applications"]
      },
      { 
        id: "student", 
        name: "Student", 
        description: "Access to enrolled courses",
        permissions: ["view_own_courses", "view_own_grades"]
      }
    ];
    res.json(roles);
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Update user role and permissions
app.put("/api/users/:userId/role", authenticate, requireRoles(["admin"]), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, permissions } = req.body;

    if (!role) {
      return res.status(422).json({ detail: "Role is required" });
    }

    const validRoles = ["admin", "registrar", "lecturer", "staff", "student"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ detail: "Invalid role" });
    }

    const updateData = { role };
    if (permissions && Array.isArray(permissions)) {
      updateData.permissions = permissions;
    }

    const result = await db.collection("users").updateOne(
      { id: userId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ detail: "User not found" });
    }

    const user = await db.collection("users").findOne({ id: userId }, { projection: { password: 0, _id: 0 } });
    res.json(user);
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// ============ USER ROUTES ============
app.get("/api/users", authenticate, requireRoles(["admin", "registrar", "staff"]), async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await db.collection("users")
      .find(query, { projection: { password: 0, _id: 0 } })
      .toArray();
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.post("/api/users", authenticate, requireRoles(["admin"]), async (req, res) => {
  try {
    const { email, password, first_name, last_name, role, department, program, phone, permissions } = req.body;

    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      return res.status(400).json({ detail: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      first_name,
      last_name,
      role,
      permissions: permissions || [],
      department: department || null,
      program: program || null,
      phone: phone || null,
      is_active: true,
      account_status: "active",
      payment_status: role === "student" ? "unpaid" : "paid",
      enrolled_courses: [],
      completed_lessons: [],
      created_at: new Date().toISOString()
    };

    if (role === "student") {
      newUser.student_id = generateStudentId();
    }

    await db.collection("users").insertOne(newUser);

    delete newUser.password;
    delete newUser._id;

    res.json(newUser);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.get("/api/users/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!["admin", "registrar", "staff"].includes(req.user.role) && req.user.id !== userId) {
      return res.status(403).json({ detail: "Access denied" });
    }

    const user = await db.collection("users").findOne(
      { id: userId },
      { projection: { password: 0, _id: 0 } }
    );

    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.put("/api/users/:userId", authenticate, requireRoles(["admin", "registrar"]), async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Handle password update separately (hash it)
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12);
    }
    
    delete updates.id;
    delete updates._id;
    delete updates.email;

    const result = await db.collection("users").updateOne({ id: userId }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ detail: "User not found" });
    }

    const user = await db.collection("users").findOne({ id: userId }, { projection: { password: 0, _id: 0 } });
    res.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.put("/api/users/:userId/lock", authenticate, requireRoles(["admin"]), async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await db.collection("users").updateOne({ id: userId }, { $set: { account_status: "locked" } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ detail: "User not found" });
    }
    res.json({ message: "User account locked" });
  } catch (error) {
    console.error("Lock user error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.put("/api/users/:userId/unlock", authenticate, requireRoles(["admin"]), async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await db.collection("users").updateOne({ id: userId }, { $set: { account_status: "active" } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ detail: "User not found" });
    }
    res.json({ message: "User account unlocked" });
  } catch (error) {
    console.error("Unlock user error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.delete("/api/users/:userId", authenticate, requireRoles(["admin"]), async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await db.collection("users").deleteOne({ id: userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// ============ COURSE ROUTES ============
app.get("/api/courses", authenticate, async (req, res) => {
  try {
    const courses = await db.collection("courses").find({}, { projection: { _id: 0 } }).toArray();
    res.json(courses);
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Admin endpoint to get all courses with tuition fees
app.get("/api/admin/courses/tuition", authenticate, requireRoles(["admin"]), async (req, res) => {
  try {
    const courses = await db.collection("courses")
      .find({}, { projection: { _id: 0, id: 1, title: 1, slug: 1, price: 1, is_active: 1 } })
      .sort({ title: 1 })
      .toArray();
    
    res.json({
      courses: courses,
      total: courses.length,
      message: "Use PUT /api/courses/:courseId/tuition with {price: amount} to update"
    });
  } catch (error) {
    console.error("Get courses tuition error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.get("/api/courses/public", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ detail: "Database not available" });
    }
    const courses = await db.collection("courses").find({ is_active: true }, { projection: { _id: 0 } }).toArray();
    res.json(courses);
  } catch (error) {
    console.error("Get public courses error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.get("/api/courses/public/:courseId", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ detail: "Database not available" });
    }
    const { courseId } = req.params;

    let course = await db.collection("courses").findOne({ id: courseId, is_active: true }, { projection: { _id: 0 } });

    if (!course) {
      course = await db.collection("courses").findOne({ slug: courseId, is_active: true }, { projection: { _id: 0 } });
    }

    if (!course) {
      return res.status(404).json({ detail: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    console.error("Get public course error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.post("/api/courses", authenticate, requireRoles(["admin"]), async (req, res) => {
  try {
    const courseData = req.body;

    const newCourse = {
      id: uuidv4(),
      code: courseData.code,
      slug: courseData.slug || courseData.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: courseData.title,
      subtitle: courseData.subtitle || "",
      description: courseData.description,
      overview: courseData.overview || "",
      department: courseData.department,
      category: courseData.category || courseData.department,
      duration_value: courseData.duration_value || 3,
      duration_unit: courseData.duration_unit || "months",
      price: courseData.price || 0,
      currency: courseData.currency || "EUR",
      image_url: courseData.image_url || "",
      units: courseData.units || 0,
      semester: courseData.semester || 1,
      course_type: courseData.course_type || "DIPLOMA",
      curriculum: courseData.curriculum || [],
      outcomes: courseData.outcomes || [],
      certifications: courseData.certifications || [],
      requirements: courseData.requirements || [],
      total_lessons: courseData.total_lessons || 0,
      is_active: true,
      created_at: new Date().toISOString(),
      created_by: req.user.id
    };

    await db.collection("courses").insertOne(newCourse);
    delete newCourse._id;

    res.json(newCourse);
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.get("/api/courses/:courseId", authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;

    let course = await db.collection("courses").findOne({ id: courseId }, { projection: { _id: 0 } });

    if (!course) {
      course = await db.collection("courses").findOne({ slug: courseId }, { projection: { _id: 0 } });
    }

    if (!course) {
      return res.status(404).json({ detail: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.put("/api/courses/:courseId", authenticate, requireRoles(["admin"]), async (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = req.body;

    delete updates._id;
    delete updates.id;
    updates.updated_at = new Date().toISOString();

    // Find course by ID, slug, or title
    let course = await db.collection("courses").findOne({ id: courseId });
    if (!course) {
      course = await db.collection("courses").findOne({ slug: courseId });
    }
    if (!course) {
      course = await db.collection("courses").findOne({ 
        title: { $regex: new RegExp(`^${courseId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
    }
    
    if (!course) {
      return res.status(404).json({ detail: "Course not found" });
    }

    const result = await db.collection("courses").updateOne({ id: course.id }, { $set: updates });

    const updatedCourse = await db.collection("courses").findOne({ id: course.id }, { projection: { _id: 0 } });
    res.json(updatedCourse);
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Set tuition fee for a course (admin only)
app.put("/api/courses/:courseId/tuition", authenticate, requireRoles(["admin"]), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { price } = req.body;

    if (price === undefined || price === null) {
      return res.status(422).json({ detail: "Price is required" });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(422).json({ detail: "Price must be a positive number" });
    }

    // Find course by ID, slug, or title
    let course = await db.collection("courses").findOne({ id: courseId });
    if (!course) {
      course = await db.collection("courses").findOne({ slug: courseId });
    }
    if (!course) {
      course = await db.collection("courses").findOne({ 
        title: { $regex: new RegExp(`^${courseId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
    }
    
    if (!course) {
      return res.status(404).json({ detail: "Course not found" });
    }

    await db.collection("courses").updateOne(
      { id: course.id }, 
      { $set: { price: price, updated_at: new Date().toISOString() } }
    );

    const updatedCourse = await db.collection("courses").findOne({ id: course.id }, { projection: { _id: 0 } });
    res.json({
      message: `Tuition fee for "${updatedCourse.title}" updated to €${price}`,
      course: updatedCourse
    });
  } catch (error) {
    console.error("Update tuition error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.delete("/api/courses/:courseId", authenticate, requireRoles(["admin"]), async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await db.collection("courses").deleteOne({ id: courseId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: "Course not found" });
    }
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// ============ APPLICATION ROUTES ============
app.post("/api/applications/create", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ detail: "Database not available" });
    }

    const {
      first_name, last_name, email, phone, course_id,
      country, city, address, date_of_birth,
      identification_url, high_school_certificate_url,
      origin_url
    } = req.body;

    if (!first_name || !last_name || !email || !course_id) {
      console.log("Missing fields:", { first_name: !!first_name, last_name: !!last_name, email: !!email, course_id: !!course_id });
      return res.status(422).json({ detail: "Missing required fields" });
    }

    console.log("Looking up course:", course_id);
    let course = await db.collection("courses").findOne({ id: course_id });
    if (!course) {
      course = await db.collection("courses").findOne({ slug: course_id });
    }
    if (!course) {
      // Try case-insensitive slug search
      course = await db.collection("courses").findOne({ 
        slug: { $regex: new RegExp(`^${course_id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
    }
    if (!course) {
      // Try finding by title (case-insensitive)
      course = await db.collection("courses").findOne({ 
        title: { $regex: new RegExp(`^${course_id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
    }
    if (!course) {
      console.log("Course not found for:", course_id);
      return res.status(404).json({ detail: "Course not found" });
    }
    console.log("Found course:", course.title);

    const existingApp = await db.collection("applications").findOne({
      email,
      course_id: course.id,
      status: { $in: ["pending", "approved", "pending_payment"] }
    });

    if (existingApp) {
      return res.status(400).json({ detail: "You already have an application for this course" });
    }

    const applicationId = uuidv4();

    if (!stripe) {
      return res.status(503).json({ detail: "Payment service not available" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `Application Fee - ${course.title}`,
            description: `Application fee for ${course.title} at GITB`
          },
          unit_amount: Math.round(APPLICATION_FEE * 100)
        },
        quantity: 1
      }],
      mode: "payment",
      success_url: `${origin_url || FRONTEND_URL}/apply/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin_url || FRONTEND_URL}/apply?cancelled=true`,
      customer_email: email,
      metadata: {
        application_id: applicationId,
        course_id: course.id,
        first_name,
        last_name,
        email
      }
    });

    const application = {
      id: applicationId,
      first_name,
      last_name,
      email,
      phone: phone || null,
      course_id: course.id,
      course_title: course.title,
      country: country || null,
      city: city || null,
      address: address || null,
      date_of_birth: date_of_birth || null,
      identification_url: identification_url || null,
      high_school_certificate_url: high_school_certificate_url || null,
      status: "pending_payment",
      stripe_session_id: session.id,
      payment_status: "pending",
      payment_amount: APPLICATION_FEE,
      created_at: new Date().toISOString()
    };

    await db.collection("applications").insertOne(application);

    res.json({
      checkout_url: session.url,
      session_id: session.id,
      application_id: applicationId
    });
  } catch (error) {
    console.error("Create application error:", error);
    res.status(500).json({ detail: error.message || "Internal server error" });
  }
});

app.get("/api/applications/status/:sessionId", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ detail: "Database not available" });
    }

    const { sessionId } = req.params;

    const application = await db.collection("applications").findOne(
      { stripe_session_id: sessionId },
      { projection: { _id: 0 } }
    );

    if (!application && stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid" && session.metadata?.application_id) {
          await db.collection("applications").updateOne(
            { id: session.metadata.application_id },
            {
              $set: {
                status: "pending",
                payment_status: "paid",
                paid_at: new Date().toISOString()
              }
            }
          );

          return res.json({
            status: "pending",
            payment_status: "paid",
            message: "Application submitted successfully! Our admissions team will review your application."
          });
        }

        return res.json({ status: "pending_payment", payment_status: session.payment_status });
      } catch (e) {
        return res.status(404).json({ detail: "Application not found" });
      }
    }

    if (!application) {
      return res.status(404).json({ detail: "Application not found" });
    }

    res.json({
      status: application.status,
      payment_status: application.payment_status,
      course_title: application.course_title
    });
  } catch (error) {
    console.error("Check status error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.get("/api/applications", authenticate, requireRoles(["admin", "registrar", "staff"]), async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const applications = await db.collection("applications")
      .find(query, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .toArray();

    res.json(applications);
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.get("/api/applications/:applicationId", authenticate, requireRoles(["admin", "registrar", "staff"]), async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await db.collection("applications").findOne(
      { id: applicationId },
      { projection: { _id: 0 } }
    );

    if (!application) {
      return res.status(404).json({ detail: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    console.error("Get application error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Approve application - creates user account and sends welcome email
app.post("/api/applications/:applicationId/approve", authenticate, requireRoles(["admin", "registrar"]), async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await db.collection("applications").findOne({ id: applicationId });
    if (!application) {
      return res.status(404).json({ detail: "Application not found" });
    }

    if (application.status !== "pending") {
      return res.status(400).json({ detail: "Application is not pending" });
    }

    let existingUser = await db.collection("users").findOne({ email: application.email });

    const tempPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    let userId;

    if (existingUser) {
      userId = existingUser.id;
      await db.collection("users").updateOne(
        { email: application.email },
        {
          $set: {
            password: hashedPassword,
            must_change_password: true,
            payment_status: "unpaid" // Tuition not yet paid
          }
        }
      );
    } else {
      userId = uuidv4();
      const newUser = {
        id: userId,
        email: application.email,
        password: hashedPassword,
        first_name: application.first_name,
        last_name: application.last_name,
        role: "student",
        permissions: ["view_own_courses", "view_own_grades"],
        student_id: generateStudentId(),
        phone: application.phone,
        department: null,
        program: application.course_title,
        is_active: true,
        account_status: "active",
        payment_status: "unpaid", // Tuition not yet paid
        must_change_password: true,
        enrolled_courses: [],
        completed_lessons: [],
        created_at: new Date().toISOString()
      };

      await db.collection("users").insertOne(newUser);
    }

    // Get course info for price
    const course = await db.collection("courses").findOne({ id: application.course_id });

    // Create enrollment with pending_payment status (tuition not paid yet)
    const enrollment = {
      id: uuidv4(),
      user_id: userId,
      student_id: userId,
      course_id: application.course_id,
      course_title: application.course_title,
      application_id: applicationId,
      enrolled_at: new Date().toISOString(),
      status: "pending_payment", // Requires tuition payment
      payment_status: "unpaid",
      tuition_amount: course ? course.price : 0,
      progress: 0
    };

    await db.collection("enrollments").insertOne(enrollment);

    await db.collection("applications").updateOne(
      { id: applicationId },
      {
        $set: {
          status: "approved",
          approved_by: req.user.sub,
          approved_at: new Date().toISOString()
        }
      }
    );

    // Send welcome email with credentials and tuition info
    await sendWelcomeEmail(
      application.email,
      application.first_name,
      application.last_name,
      application.course_title,
      tempPassword,
      course ? course.price : 0
    );

    res.json({
      message: "Application approved successfully. Welcome email sent to student.",
      student_email: application.email,
      tuition_amount: course ? course.price : 0
    });
  } catch (error) {
    console.error("Approve application error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Reject application
app.post("/api/applications/:applicationId/reject", authenticate, requireRoles(["admin", "registrar"]), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;

    const application = await db.collection("applications").findOne({ id: applicationId });
    if (!application) {
      return res.status(404).json({ detail: "Application not found" });
    }

    await db.collection("applications").updateOne(
      { id: applicationId },
      {
        $set: {
          status: "rejected",
          rejection_reason: reason || null,
          rejected_by: req.user.id,
          rejected_at: new Date().toISOString()
        }
      }
    );

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${getEmailHeader("Application Update")}
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Application Update</h2>
          <p>Dear ${application.first_name},</p>
          <p>Thank you for your interest in <strong>${application.course_title}</strong> at GITB.</p>
          <p>After careful review of your application and submitted documents, we regret to inform you that we are unable to offer you admission at this time.</p>
          ${reason ? `<div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="margin: 0;"><strong>Reason:</strong> ${reason}</p></div>` : ""}
          <p>We encourage you to apply again in the future or consider our other programs.</p>
          <p>If you have any questions, please contact our admissions team.</p>
          <p>Best regards,<br><strong>GITB Admissions Team</strong></p>
        </div>
      </div>
    `;

    await sendEmail(application.email, `Application Update - ${application.course_title}`, html);

    res.json({ message: "Application rejected" });
  } catch (error) {
    console.error("Reject application error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// ============ TUITION PAYMENT ROUTES ============

// Get student's pending courses (approved but not paid tuition)
app.get("/api/my-courses", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get enrollments for this user
    const enrollments = await db.collection("enrollments")
      .find({ $or: [{ user_id: userId }, { student_id: userId }] }, { projection: { _id: 0 } })
      .toArray();

    // Get course details for each enrollment
    const courseIds = enrollments.map(e => e.course_id);
    const courses = await db.collection("courses")
      .find({ id: { $in: courseIds } }, { projection: { _id: 0 } })
      .toArray();

    // Merge enrollment status with course info
    const myCourses = enrollments.map(enrollment => {
      const course = courses.find(c => c.id === enrollment.course_id) || {};
      return {
        ...course,
        enrollment_id: enrollment.id,
        enrollment_status: enrollment.status, // 'pending_payment', 'paid', 'active'
        payment_status: enrollment.payment_status,
        enrolled_at: enrollment.created_at,
        tuition_paid_at: enrollment.tuition_paid_at
      };
    });

    res.json(myCourses);
  } catch (error) {
    console.error("Get my courses error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Create tuition payment session for a course
app.post("/api/tuition/pay", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = req.user;
    const { course_id, origin_url } = req.body;

    if (!course_id) {
      return res.status(422).json({ detail: "Course ID is required" });
    }

    // Check enrollment exists and is pending payment
    let enrollment = await db.collection("enrollments").findOne({
      $or: [{ user_id: userId }, { student_id: userId }],
      course_id: course_id
    });

    // If no enrollment, check if user has approved application for this course
    if (!enrollment) {
      const application = await db.collection("applications").findOne({
        email: user.email,
        course_id: course_id,
        status: "approved"
      });

      if (!application) {
        return res.status(400).json({ detail: "No approved application found for this course" });
      }

      // Create enrollment with pending_payment status
      enrollment = {
        id: uuidv4(),
        user_id: userId,
        course_id: course_id,
        application_id: application.id,
        status: "pending_payment",
        payment_status: "unpaid",
        created_at: new Date().toISOString()
      };
      await db.collection("enrollments").insertOne(enrollment);
    }

    if (enrollment.payment_status === "paid") {
      return res.status(400).json({ detail: "Tuition already paid for this course" });
    }

    // Get course details - try multiple lookup methods
    let course = await db.collection("courses").findOne({ id: course_id });
    if (!course) {
      course = await db.collection("courses").findOne({ slug: course_id });
    }
    if (!course) {
      course = await db.collection("courses").findOne({ 
        title: { $regex: new RegExp(`^${course_id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
    }
    if (!course) {
      return res.status(404).json({ detail: "Course not found" });
    }

    if (!stripe) {
      return res.status(503).json({ detail: "Payment service not available" });
    }

    // Create Stripe checkout session for tuition
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `Tuition Fee - ${course.title}`,
            description: `Full tuition for ${course.title} at GITB - Lifetime access`
          },
          unit_amount: Math.round(course.price * 100)
        },
        quantity: 1
      }],
      mode: "payment",
      success_url: `${origin_url || FRONTEND_URL}/dashboard/student?payment=success&course=${course_id}`,
      cancel_url: `${origin_url || FRONTEND_URL}/dashboard/student?payment=cancelled`,
      customer_email: user.email,
      metadata: {
        type: "tuition",
        enrollment_id: enrollment.id,
        course_id: course_id,
        user_id: userId,
        user_email: user.email
      }
    });

    // Update enrollment with stripe session
    await db.collection("enrollments").updateOne(
      { id: enrollment.id },
      { $set: { stripe_session_id: session.id } }
    );

    res.json({
      checkout_url: session.url,
      session_id: session.id,
      enrollment_id: enrollment.id,
      course_title: course.title,
      amount: course.price
    });
  } catch (error) {
    console.error("Create tuition payment error:", error);
    res.status(500).json({ detail: error.message || "Internal server error" });
  }
});

// Check tuition payment status
app.get("/api/tuition/status/:sessionId", authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Find enrollment by stripe session
    const enrollment = await db.collection("enrollments").findOne({ stripe_session_id: sessionId });
    
    if (!enrollment) {
      // Check Stripe directly
      if (stripe) {
        try {
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          return res.json({ 
            status: session.payment_status === "paid" ? "paid" : "pending",
            payment_status: session.payment_status
          });
        } catch (e) {
          return res.status(404).json({ detail: "Payment session not found" });
        }
      }
      return res.status(404).json({ detail: "Enrollment not found" });
    }

    // Verify payment with Stripe
    if (stripe && enrollment.stripe_session_id) {
      try {
        const session = await stripe.checkout.sessions.retrieve(enrollment.stripe_session_id);
        
        if (session.payment_status === "paid" && enrollment.payment_status !== "paid") {
          // Update enrollment to paid
          await db.collection("enrollments").updateOne(
            { id: enrollment.id },
            { 
              $set: { 
                status: "active",
                payment_status: "paid",
                tuition_paid_at: new Date().toISOString()
              }
            }
          );

          // Update user payment status
          await db.collection("users").updateOne(
            { id: enrollment.user_id },
            { $set: { payment_status: "paid" } }
          );

          // Send confirmation email
          const user = await db.collection("users").findOne({ id: enrollment.user_id });
          const course = await db.collection("courses").findOne({ id: enrollment.course_id });
          
          if (user && course) {
            const html = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                ${getEmailHeader("Enrollment Confirmed")}
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <h2 style="color: #3d7a4a; margin-top: 0;">Payment Confirmed!</h2>
                  <p>Dear ${user.first_name},</p>
                  <p>Your tuition payment for <strong>${course.title}</strong> has been successfully processed.</p>
                  <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0; color: #2e7d32; font-size: 18px;">✓ Course Unlocked</p>
                    <p style="margin: 10px 0 0 0; color: #666;">Amount: €${course.price}</p>
                  </div>
                  <p>You now have <strong>lifetime access</strong> to this course. Log in to start learning!</p>
                  <div style="text-align: center; margin: 25px 0;">
                    <a href="${FRONTEND_URL}/dashboard/student" style="display: inline-block; padding: 12px 30px; background: #3d7a4a; color: white; text-decoration: none; border-radius: 5px;">
                      Go to Dashboard
                    </a>
                  </div>
                  <p>Best regards,<br><strong>GITB Team</strong></p>
                </div>
              </div>
            `;
            await sendEmail(user.email, `Enrollment Confirmed - ${course.title}`, html);
          }

          return res.json({ 
            status: "paid",
            payment_status: "paid",
            message: "Course unlocked successfully"
          });
        }
      } catch (e) {
        console.error("Stripe check error:", e);
      }
    }

    res.json({
      status: enrollment.status,
      payment_status: enrollment.payment_status
    });
  } catch (error) {
    console.error("Check tuition status error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Stripe webhook for tuition payments
app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    if (webhookSecret && sig) {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    } else {
      // For testing without webhook secret
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata || {};

      if (metadata.type === 'tuition' && metadata.enrollment_id) {
        // Update enrollment to paid
        await db.collection("enrollments").updateOne(
          { id: metadata.enrollment_id },
          { 
            $set: { 
              status: "active",
              payment_status: "paid",
              tuition_paid_at: new Date().toISOString()
            }
          }
        );

        // Update user payment status
        if (metadata.user_id) {
          await db.collection("users").updateOne(
            { id: metadata.user_id },
            { $set: { payment_status: "paid" } }
          );
        }

        console.log(`Tuition payment completed for enrollment ${metadata.enrollment_id}`);
      } else if (metadata.application_id) {
        // Application fee payment
        await db.collection("applications").updateOne(
          { id: metadata.application_id },
          { 
            $set: { 
              status: "pending",
              payment_status: "paid",
              paid_at: new Date().toISOString()
            }
          }
        );

        console.log(`Application fee paid for ${metadata.application_id}`);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ detail: "Webhook processing failed" });
  }
});

// ============ DASHBOARD ROUTES ============
app.get("/api/dashboard/admin", authenticate, requireRoles(["admin"]), async (req, res) => {
  try {
    const [
      totalStudents,
      totalLecturers,
      totalCourses,
      activeCourses,
      pendingApplications,
      lockedAccounts,
      unpaidStudents,
      totalUsers,
      recentUsers
    ] = await Promise.all([
      db.collection("users").countDocuments({ role: "student" }),
      db.collection("users").countDocuments({ role: "lecturer" }),
      db.collection("courses").countDocuments({}),
      db.collection("courses").countDocuments({ is_active: true }),
      db.collection("applications").countDocuments({ status: "pending" }),
      db.collection("users").countDocuments({ account_status: "locked" }),
      db.collection("users").countDocuments({ role: "student", payment_status: "unpaid" }),
      db.collection("users").countDocuments({}),
      db.collection("users")
        .find({}, { projection: { password: 0, _id: 0 } })
        .sort({ created_at: -1 })
        .limit(5)
        .toArray()
    ]);

    res.json({
      total_students: totalStudents,
      total_lecturers: totalLecturers,
      total_courses: totalCourses,
      active_courses: activeCourses,
      pending_admissions: pendingApplications,
      locked_accounts: lockedAccounts,
      unpaid_students: unpaidStudents,
      total_users: totalUsers,
      recent_users: recentUsers
    });
  } catch (error) {
    console.error("Get admin dashboard error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.get("/api/dashboard/student", authenticate, async (req, res) => {
  try {
    const enrollments = await db.collection("enrollments")
      .find({ student_id: req.user.id }, { projection: { _id: 0 } })
      .toArray();

    const courseIds = enrollments.map(e => e.course_id);

    const courses = await db.collection("courses")
      .find({ id: { $in: courseIds } }, { projection: { _id: 0 } })
      .toArray();

    let totalLessons = 0;
    let completedLessons = req.user.completed_lessons?.length || 0;

    courses.forEach(c => {
      totalLessons += c.total_lessons || 0;
    });

    res.json({
      enrolled_courses: courses.length,
      total_lessons: totalLessons,
      completed_lessons: completedLessons,
      total_quizzes: 0,
      study_minutes: completedLessons * 15,
      courses: courses.map(c => ({
        ...c,
        enrollment: enrollments.find(e => e.course_id === c.id)
      })),
      streak_days: 7
    });
  } catch (error) {
    console.error("Get student dashboard error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// ============ ENROLLMENT ROUTES ============
app.get("/api/enrollments", authenticate, requireRoles(["admin", "registrar"]), async (req, res) => {
  try {
    const enrollments = await db.collection("enrollments").find({}, { projection: { _id: 0 } }).toArray();
    res.json(enrollments);
  } catch (error) {
    console.error("Get enrollments error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.get("/api/enrollments/my", authenticate, async (req, res) => {
  try {
    const enrollments = await db.collection("enrollments")
      .find({ student_id: req.user.id }, { projection: { _id: 0 } })
      .toArray();

    const courseIds = enrollments.map(e => e.course_id);
    const courses = await db.collection("courses")
      .find({ id: { $in: courseIds } }, { projection: { _id: 0 } })
      .toArray();

    const courseMap = {};
    courses.forEach(c => courseMap[c.id] = c);

    const enrichedEnrollments = enrollments.map(e => ({
      ...e,
      course: courseMap[e.course_id] || null
    }));

    res.json(enrichedEnrollments);
  } catch (error) {
    console.error("Get my enrollments error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// ============ LOGIN LOGS ============
app.get("/api/login-logs", authenticate, requireRoles(["admin"]), async (req, res) => {
  try {
    const { user_id, limit = 50 } = req.query;
    const query = user_id ? { user_id } : {};
    
    const logs = await db.collection("login_logs")
      .find(query, { projection: { _id: 0 } })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json(logs);
  } catch (error) {
    console.error("Get login logs error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// ============ ERROR HANDLING ============
// Sanitize error messages to prevent secret leakage
function sanitizeError(error) {
  const message = error.message || "Internal server error";
  // List of patterns that might contain secrets
  const secretPatterns = [
    /sk_live_[a-zA-Z0-9]+/g,
    /sk_test_[a-zA-Z0-9]+/g,
    /mongodb\+srv:\/\/[^@]+@/g,
    /re_[a-zA-Z0-9]+/g,
    /Bearer [a-zA-Z0-9._-]+/g
  ];
  
  let sanitized = message;
  for (const pattern of secretPatterns) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }
  return sanitized;
}

app.use((err, req, res, next) => {
  // Log the full error internally
  console.error("Unhandled error:", err);
  
  // Return sanitized message to client
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    detail: sanitizeError(err),
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
});

app.use((req, res) => {
  res.status(404).json({ detail: "Not found" });
});

// ============ START SERVER ============
async function startServer() {
  try {
    await connectDB();
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Database: ${db ? "connected" : "not connected"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down...");
  if (mongoClient) {
    await mongoClient.close();
  }
  process.exit(0);
});

startServer();
