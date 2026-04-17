const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const fs = require("fs");

// Multer storage config for document uploads
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf', '.webp', '.mp4', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('File type not allowed. Please upload an image, PDF, or common video format.'));
  }
});
const { Resend } = require("resend");
const Stripe = require("stripe");
const PDFDocument = require("pdfkit");

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

// System Settings Cache (simple)
let systemSettings = {
  application_fee: APPLICATION_FEE,
  admission_fee: 2500,
  admission_letter_template: "Dear {{name}},\n\nCongratulations! You have been accepted into {{course}} at GITB Academy.\n\nBest regards,\nGITB Admissions",
  bank_name: "Luminor Bank AS",
  bank_account_name: "Global Institute of Technology and Business",
  bank_iban: "LT12 3456 7890 1234 5678",
  bank_swift: "AGBLLT2X",
  bank_address: "Konstitucijos pr. 21A, Vilnius, Lithuania"
};

const refreshSystemSettings = async () => {
  if (!db) return;
  const settings = await db.collection("system_settings").findOne({ type: "config" });
  if (settings) {
    systemSettings = { ...systemSettings, ...settings };
  } else {
    await db.collection("system_settings").insertOne({ type: "config", ...systemSettings });
  }
};

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

// Stripe webhook MUST be registered before express.json() so it receives the raw body buffer.
// stripe.webhooks.constructEvent() requires the raw bytes to verify the signature.
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
      } else if (metadata.type === "application_fee" && metadata.application_id) {
        // Stripe-first flow: Application record does NOT exist yet — create it now.
        // Idempotency check: skip if already created (webhook may fire twice).
        const exists = await db.collection("applications").findOne({ id: metadata.application_id });
        if (!exists) {
          await db.collection("applications").insertOne({
            id: metadata.application_id,
            first_name: metadata.first_name || "",
            last_name: metadata.last_name || "",
            email: metadata.email || "",
            phone: metadata.phone || null,
            course_id: metadata.course_id || null,
            course_title: metadata.course_title || null,
            country: metadata.country || null,
            city: metadata.city || null,
            address: metadata.address || null,
            date_of_birth: metadata.date_of_birth || null,
            identification_url: metadata.identification_url || null,
            high_school_certificate_url: metadata.high_school_certificate_url || null,
            motivation: metadata.motivation || null,
            status: "pending",
            payment_status: "paid",
            stripe_session_id: session.id,
            payment_amount: APPLICATION_FEE,
            created_at: new Date().toISOString(),
            paid_at: new Date().toISOString(),
          });
          console.log(`Application created for ${metadata.email} → course ${metadata.course_id} (id: ${metadata.application_id})`);

          // Send confirmation email to the applicant
          if (metadata.email && metadata.first_name) {
            const courseTitle = metadata.course_title ||
              (await db.collection("courses").findOne({ id: metadata.course_id }))?.title ||
              "your chosen programme";
            await sendApplicationReceivedEmail(metadata.email, metadata.first_name, courseTitle);
            console.log(`Confirmation email sent to ${metadata.email}`);
          }
        } else {
          console.log(`Duplicate webhook for application ${metadata.application_id} — skipping`);
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ detail: "Webhook processing failed" });
  }
});

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
    '/webhooks',
    '/upload',
    '/public'
  ];

  if (!req.path.startsWith('/api')) {
    // Prevent rewriting browser navigation requests (HTML requests)
    const isHtmlRequest = req.headers.accept && req.headers.accept.includes('text/html');

    if (!isHtmlRequest) {
      for (const pattern of apiPatterns) {
        if (req.path.startsWith(pattern) || req.path === pattern) {
          console.log(`Rewriting ${req.path} to /api${req.url}`);
          req.url = '/api' + req.url;
          break;
        }
      }
    }
  }
  if (req.method === 'POST') console.log(`POST Request to: ${req.url}`);
  next();
});

// Trust proxy for IP detection
app.set("trust proxy", true);

// Static files (uploads)
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// Generic File Upload Endpoint
app.post("/api/upload", documentUpload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ detail: "No file uploaded" });
    const fileUrl = `${req.protocol}://${req.get('host')}/api/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.filename });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

// ============ DOCUMENT UPLOAD ENDPOINT (Legacy Support) ============
app.post("/api/upload/document", documentUpload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: "No file uploaded" });
    }
    const fileUrl = `/api/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.filename });
  } catch (error) {
    console.error("Document upload error:", error);
    res.status(500).json({ detail: error.message || "Upload failed" });
  }
});

// Serve static frontend from the static directory
app.use(express.static(path.join(__dirname, "..", "static")));
// Also handle /static requests from index.html
app.use("/static", express.static(path.join(__dirname, "..", "static")));
// Serve images directory (now moved inside static)
app.use("/images", express.static(path.join(__dirname, "..", "static", "images")));

// Database connection with connection pooling
let db = null;
let mongoClient = null;

async function connectDB() {
  if (!MONGO_URL) {
    console.error("MONGO_URL or MONGO_URI environment variable is not set");
    return null;
  }

  try {
    // MongoDB connection with pooling options for stability
    mongoClient = new MongoClient(MONGO_URL, {
      maxPoolSize: 10,           // Maximum connections in pool
      minPoolSize: 2,            // Minimum connections to keep open
      maxIdleTimeMS: 30000,      // Close idle connections after 30 seconds
      connectTimeoutMS: 10000,   // Connection timeout
      socketTimeoutMS: 45000,    // Socket timeout
      serverSelectionTimeoutMS: 10000,  // Server selection timeout
      retryWrites: true,
      retryReads: true
    });
    await mongoClient.connect();
    db = mongoClient.db(DB_NAME);
    console.log("Connected to MongoDB successfully with connection pooling");
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

// Health check endpoint for Render/deployment platforms
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: db ? "connected" : "disconnected",
    uptime: process.uptime()
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: db ? "connected" : "disconnected",
    uptime: process.uptime()
  });
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
      } catch (e) { }
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
    console.error("Auth error:", error);
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
const generateAcceptanceLetter = (firstName, lastName, courseTitle, tuitionAmount = 0) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = 595.28, H = 841.89;
    const darkGreen = '#0B3B2C';
    const midGreen  = '#5a8a00';
    const margin    = 52;
    const contentW  = W - margin * 2;
    const dateStr   = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const refNo     = `GITB/ADM/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceNo = `GITB/INV/${new Date().getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`;
    const startDate = '2026-09-01';
    const bank = systemSettings;

    // ── Background ────────────────────────────────────────────────
    doc.rect(0, 0, W, H).fill('white');

    // Dot grid top-right
    const dotSz = 3.2, dotGap = 8;
    for (let row = 0; row < 24; row++) {
      for (let col = 0; col < 24; col++) {
        const x = W - 220 + col * dotGap, y = 6 + row * dotGap;
        if (x > W - 6) continue;
        const dist = Math.sqrt(Math.pow(col - 23, 2) + Math.pow(row, 2));
        doc.rect(x, y, dotSz, dotSz).fillOpacity(Math.max(0.03, 0.38 - dist * 0.014)).fill('#8ab84a');
      }
    }
    // Dot grid bottom-left
    for (let row = 0; row < 14; row++) {
      for (let col = 0; col < 14; col++) {
        const x = 6 + col * dotGap, y = H - 220 + row * dotGap;
        const dist = Math.sqrt(Math.pow(col, 2) + Math.pow(row - 13, 2));
        doc.rect(x, y, dotSz, dotSz).fillOpacity(Math.max(0.03, 0.30 - dist * 0.018)).fill('#8ab84a');
      }
    }
    doc.fillOpacity(1);

    // Green curve bottom-right
    doc.save().moveTo(W-140,H-55).bezierCurveTo(W-75,H-145,W,H-95,W,H-35).lineTo(W,H).lineTo(W-140,H).closePath().fill(darkGreen).restore();

    // Footer bar
    doc.rect(0, H-38, W, 38).fill(midGreen);
    doc.fillColor('white').fontSize(8.5).font('Helvetica');
    doc.text('\u2709  admissions@gitb.lt', 30, H-25);
    doc.text('\u25CF  https://www.gitb.lt', 210, H-25);
    doc.text(`Ref: ${refNo}`, W-200, H-25, { width: 170, align: 'right' });

    // Logo
    const logoPath = path.join(__dirname, '../static/images/gitb-logo-full.png');
    if (fs.existsSync(logoPath)) doc.image(logoPath, margin, 26, { width: 160 });
    else doc.fillColor(darkGreen).fontSize(22).font('Helvetica-Bold').text('GITB', margin, 32);

    // Header right block
    doc.fillColor('#444').fontSize(9).font('Helvetica');
    doc.text('Global Institute of Technology and Business', margin, 30, { width: contentW, align: 'right' });
    doc.text('Konstitucijos pr. 21A, Vilnius, Lithuania', margin, 42, { width: contentW, align: 'right' });
    doc.text(`Date: ${dateStr}`, margin, 54, { width: contentW, align: 'right' });
    doc.text(`Ref: ${refNo}`, margin, 66, { width: contentW, align: 'right' });
    doc.text(`Invoice No: ${invoiceNo}`, margin, 78, { width: contentW, align: 'right' });

    // Divider
    doc.rect(margin, 112, contentW, 2.5).fill(darkGreen);
    doc.rect(margin, 116, contentW, 0.6).fill(midGreen);

    // Title
    doc.fillColor(darkGreen).fontSize(16).font('Helvetica-Bold');
    doc.text('CONDITIONAL ACCEPTANCE LETTER', margin, 128, { width: contentW, align: 'center' });
    doc.rect(W/2 - 120, 150, 240, 3).fill(midGreen);

    // Addressee
    let y = 164;
    doc.fillColor('#222').fontSize(11).font('Helvetica-Bold').text(`${firstName} ${lastName}`, margin, y);
    doc.font('Helvetica').fillColor('#555').fontSize(10).text('Applicant', margin, y + 14);

    // Salutation & body
    y = 204;
    doc.fillColor('#1a1a1a').fontSize(10.5).font('Helvetica');
    doc.text(`Dear ${firstName} ${lastName},`, margin, y, { width: contentW });
    y = doc.y + 10;

    doc.text(
      `We are writing to inform you that based on the information you provided during your application process, the Admission Committee has decided that you have met the minimum academic requirements for conditional acceptance to the following full-time study programme at the Global Institute of Technology and Business (GITB):`,
      margin, y, { width: contentW, lineGap: 2 }
    );
    y = doc.y + 10;

    // Programme box
    doc.rect(margin, y, contentW, 44).fill('#f0f9f0');
    doc.rect(margin, y, 5, 44).fill(darkGreen);
    doc.fillColor('#555').fontSize(9).font('Helvetica').text('PROGRAMME OF STUDY  (Study Language: English)', margin+16, y+8, { width: contentW-20 });
    doc.fillColor(darkGreen).fontSize(13).font('Helvetica-Bold').text(courseTitle, margin+16, y+22, { width: contentW-20 });
    y = y + 44 + 10;

    doc.fillColor('#1a1a1a').fontSize(10.5).font('Helvetica');
    doc.text(
      `Studies will start on ${startDate}, but international students are advised to plan their arrival 1 or 2 weeks earlier to settle and participate in student orientation events and/or language courses.`,
      margin, y, { width: contentW, lineGap: 2 }
    );
    y = doc.y + 10;

    doc.text(
      `In order to confirm your acceptance, you are required to pay in full the invoice below, covering your first-year tuition fee. Once your payment is complete, you will receive your formal Acceptance Letter and will be able to start preparations for your arrival in Lithuania.`,
      margin, y, { width: contentW, lineGap: 2 }
    );
    y = doc.y + 14;

    // ── Invoice section ───────────────────────────────────────────
    // Invoice header bar
    doc.rect(margin, y, contentW, 26).fill(darkGreen);
    doc.fillColor('white').fontSize(11).font('Helvetica-Bold');
    doc.text('TUITION FEE INVOICE', margin + 14, y + 7, { width: contentW - 100 });
    doc.fontSize(9).font('Helvetica').text(`Invoice No: ${invoiceNo}`, margin, y + 9, { width: contentW - 14, align: 'right' });
    y = y + 26;

    // Invoice table
    const rowH = 22;
    const col1 = margin, col2 = margin + 310, col3 = margin + 420;
    const colW1 = 260, colW2 = 110, colW3 = contentW - 370;

    // Table header
    doc.rect(margin, y, contentW, rowH).fill('#e8f0e8');
    doc.fillColor(darkGreen).fontSize(9).font('Helvetica-Bold');
    doc.text('Description', col1 + 8, y + 6);
    doc.text('Period', col2 + 4, y + 6);
    doc.text('Amount (EUR)', col3, y + 6, { width: colW3, align: 'right' });
    y = y + rowH;

    // Row 1
    doc.rect(margin, y, contentW, rowH).fill('#fafcfa');
    doc.rect(margin, y, contentW, rowH).stroke('#e0e8e0');
    doc.fillColor('#222').fontSize(9.5).font('Helvetica');
    doc.text(`First-Year Tuition — ${courseTitle}`, col1 + 8, y + 6, { width: colW1 });
    doc.text('Academic Year 2026/27', col2 + 4, y + 6, { width: colW2 });
    doc.text(`€ ${Number(tuitionAmount).toLocaleString('en-EU', { minimumFractionDigits: 2 })}`, col3, y + 6, { width: colW3, align: 'right' });
    y = y + rowH;

    // Total row
    doc.rect(margin, y, contentW, rowH).fill('#0B3B2C');
    doc.fillColor('white').fontSize(10).font('Helvetica-Bold');
    doc.text('TOTAL DUE', col1 + 8, y + 6);
    doc.text(`€ ${Number(tuitionAmount).toLocaleString('en-EU', { minimumFractionDigits: 2 })}`, col3, y + 6, { width: colW3, align: 'right' });
    y = y + rowH + 12;

    // Bank details box
    doc.rect(margin, y, contentW, 78).fill('#f7f9f7');
    doc.rect(margin, y, 4, 78).fill(midGreen);
    doc.fillColor(darkGreen).fontSize(9.5).font('Helvetica-Bold').text('Payment Details', margin + 14, y + 8);
    doc.fillColor('#333').fontSize(9).font('Helvetica');
    const bk = [
      ['Bank Name', bank.bank_name || 'Luminor Bank AS'],
      ['Account Name', bank.bank_account_name || 'Global Institute of Technology and Business'],
      ['IBAN', bank.bank_iban || 'LT12 3456 7890 1234 5678'],
      ['SWIFT/BIC', bank.bank_swift || 'AGBLLT2X'],
      ['Reference', `${firstName} ${lastName} — ${invoiceNo}`],
    ];
    bk.forEach(([label, val], i) => {
      doc.font('Helvetica-Bold').text(`${label}:`, margin + 14, y + 24 + i * 11, { continued: true, width: 90 });
      doc.font('Helvetica').text(`  ${val}`, { width: contentW - 110 });
    });
    y = y + 78 + 14;

    // Closing paragraph
    doc.fillColor('#1a1a1a').fontSize(10.5).font('Helvetica');
    doc.text(
      `On behalf of the entire GITB academic community, I want to extend a warm welcome to you and thank you for choosing GITB as a guarantee of your successful future career. Feel free to contact us with any questions or concerns. We are looking forward to meeting you soon in Vilnius.`,
      margin, y, { width: contentW, lineGap: 2 }
    );
    y = doc.y + 14;

    // Sign-off
    doc.text('Sincerely,', margin, y);
    y = doc.y + 10;

    // Signature block left
    doc.moveTo(margin, y + 28).lineTo(margin + 145, y + 28).strokeColor('#bbb').lineWidth(0.6).stroke();
    doc.fillColor('#1a1a1a').fontSize(10).font('Helvetica-Bold').text('Dr. Aremu, MSc, PhD', margin, y + 32);
    doc.font('Helvetica').fillColor('#555').fontSize(9.5);
    doc.text('Head of Admissions', margin, y + 46);
    doc.text('Global Institute of Technology and Business', margin, y + 59);
    doc.text('Vilnius, Lithuania', margin, y + 72);

    // Blue stamp beside signature
    const stampBlue = '#1a3a8f', stampLightBlue = '#2a5abf';
    const stampX = margin + 235, stampY = y, stampR = 46;
    doc.save();
    doc.circle(stampX, stampY+stampR, stampR).lineWidth(2.8).strokeColor(stampBlue).stroke();
    doc.circle(stampX, stampY+stampR, stampR-8).lineWidth(0.8).strokeColor(stampBlue).stroke();
    const topText = 'GLOBAL INSTITUTE OF TECHNOLOGY AND BUSINESS';
    const topTextAngle = Math.PI * 0.72;
    doc.fillColor(stampBlue).fontSize(5.5).font('Helvetica-Bold');
    topText.split('').forEach((ch, i) => {
      const angle = -Math.PI/2 - topTextAngle/2 + (i/(topText.length-1))*topTextAngle;
      const r = stampR - 14;
      doc.save().translate(stampX + r*Math.cos(angle), stampY+stampR + r*Math.sin(angle)).rotate((angle+Math.PI/2)*(180/Math.PI)).text(ch,-3,-3).restore();
    });
    const botText = 'VILNIUS  ·  LITHUANIA', botTextAngle = Math.PI * 0.48;
    botText.split('').forEach((ch, i) => {
      const angle = Math.PI/2 - botTextAngle/2 + (i/(botText.length-1))*botTextAngle;
      const r = stampR - 14;
      doc.save().translate(stampX + r*Math.cos(angle), stampY+stampR + r*Math.sin(angle)).rotate((angle-Math.PI/2)*(180/Math.PI)).text(ch,-3,-3).restore();
    });
    doc.fillColor(stampBlue).fontSize(14).font('Helvetica-Bold').text('GITB', stampX-16, stampY+stampR-12, { width:32, align:'center' });
    doc.fillColor(stampLightBlue).fontSize(6).font('Helvetica').text('OFFICIAL', stampX-18, stampY+stampR+4, { width:36, align:'center' });
    doc.restore();

    doc.end();
  });
};

const getEmailHeader = (subtitle = "Global Institute of Tech and Business") => `
  <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #0C4E3A 0%, #0a3d2d 100%); border-radius: 10px 10px 0 0;">
    <img src="https://gitb.lt/images/email.jpg" alt="GITB" style="max-width: 350px; height: auto; display: block; margin: 0 auto 8px;" />
    <p style="margin: 0; font-size: 13px; color: #D4F542; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">${subtitle}</p>
  </div>
`;

const sendEmail = async (to, subject, html, attachments = []) => {
  if (!resend) {
    console.warn("Email not sent - Resend not configured");
    return false;
  }
  try {
    const payload = { from: `GITB <${ADMIN_EMAIL}>`, to: [to], subject, html };
    if (attachments.length > 0) payload.attachments = attachments;
    await resend.emails.send(payload);
    return true;
  } catch (error) {
    console.error("Email error:", error.message);
    return false;
  }
};

// Welcome email when application is approved
const sendWelcomeEmail = async (email, firstName, lastName, courseTitle, tempPassword, tuitionAmount = 0) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#f0f4f0;">
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:28px 16px;">

    <!-- ── HEADER ─────────────────────────────────────── -->
    <div style="background:linear-gradient(160deg,#0B3B2C 0%,#0f5040 100%);border-radius:14px 14px 0 0;padding:0;overflow:hidden;">

      <!-- Logo bar -->
      <div style="padding:28px 36px 0;text-align:center;">
        <img src="https://gitb.lt/images/email.jpg"
             alt="GITB — Global Institute of Technology and Business"
             style="max-width:300px;width:100%;height:auto;display:block;margin:0 auto;" />
      </div>

      <!-- Green accent band -->
      <div style="background:#D4F542;margin:20px 0 0;padding:10px 36px;">
        <p style="margin:0;color:#0B3B2C;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;">
          Official Admission Confirmation &nbsp;·&nbsp; Admissions Office
        </p>
      </div>
    </div>

    <!-- ── BODY ───────────────────────────────────────── -->
    <div style="background:#ffffff;padding:40px 36px;border-radius:0 0 14px 14px;box-shadow:0 6px 24px rgba(0,0,0,0.09);">

      <!-- Greeting -->
      <h1 style="color:#0B3B2C;margin:0 0 4px;font-size:26px;font-weight:bold;">
        Welcome to GITB, ${firstName}! 🎓
      </h1>
      <p style="color:#5a9a6a;margin:0 0 28px;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1.2px;">
        Your admission is officially confirmed
      </p>

      <p style="color:#333;font-size:15px;line-height:1.8;margin:0 0 16px;">
        Dear <strong>${firstName} ${lastName}</strong>,
      </p>
      <p style="color:#444;font-size:14px;line-height:1.85;margin:0 0 16px;">
        On behalf of the entire faculty and staff at the <strong>Global Institute of Technology and Business</strong>,
        it is our absolute pleasure to welcome you into our academic community. Your application has been carefully
        reviewed by our Admissions Board and we are delighted to confirm that you have been officially accepted.
      </p>
      <p style="color:#444;font-size:14px;line-height:1.85;margin:0 0 28px;">
        This is the beginning of an exciting journey — one filled with learning, growth, and opportunity.
        We believe in your potential and are committed to providing you with every resource and support
        you need to thrive. <strong>Welcome to the GITB family.</strong>
      </p>

      <!-- Programme -->
      <div style="background:#f0f9f2;border-left:5px solid #0B3B2C;border-radius:0 8px 8px 0;padding:16px 20px;margin:0 0 28px;">
        <p style="margin:0 0 4px;font-size:11px;color:#5a9a6a;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Your Programme of Study</p>
        <p style="margin:0;font-size:19px;color:#0B3B2C;font-weight:bold;">${courseTitle}</p>
      </div>

      <!-- Credentials card -->
      <div style="background:#0B3B2C;border-radius:12px;padding:26px 28px;margin:0 0 24px;">
        <p style="margin:0 0 18px;color:#D4F542;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;">
          🔐 Your Student Account
        </p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;color:#8abca0;font-size:13px;width:150px;vertical-align:top;">Login Email</td>
            <td style="padding:10px 0;color:#ffffff;font-size:14px;font-weight:bold;">${email}</td>
          </tr>
          <tr>
            <td style="padding:10px 0 4px;color:#8abca0;font-size:13px;vertical-align:top;">Temporary Password</td>
            <td style="padding:10px 0 4px;">
              <span style="background:#1a5c40;color:#D4F542;padding:7px 16px;border-radius:7px;font-size:17px;font-weight:bold;letter-spacing:2px;font-family:Courier,monospace;display:inline-block;">
                ${tempPassword}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0 0;color:#8abca0;font-size:13px;vertical-align:top;">Student Portal</td>
            <td style="padding:10px 0 0;">
              <a href="${FRONTEND_URL}/student-login" style="color:#D4F542;font-size:13px;text-decoration:underline;">${FRONTEND_URL}/student-login</a>
            </td>
          </tr>
        </table>
      </div>

      <!-- Warning -->
      <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:14px 18px;margin:0 0 28px;">
        <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">
          <strong>⚠ Important:</strong> Your password above is temporary. You will be asked to change it on first login.
          Please keep your credentials private and do not share them with anyone.
        </p>
      </div>

      <!-- Steps -->
      <h3 style="color:#0B3B2C;margin:0 0 16px;font-size:16px;font-weight:bold;">Getting started — 4 simple steps</h3>
      <table style="width:100%;border-collapse:collapse;margin:0 0 28px;">
        ${[
          ['1', `<strong>Log in</strong> to the Student Portal using the credentials above.`],
          ['2', `<strong>Change your password</strong> when prompted on first login.`],
          ['3', `<strong>Complete tuition payment</strong> of <strong style="color:#0B3B2C;">€${tuitionAmount || 'see dashboard'}</strong> from your dashboard to unlock all course materials.`],
          ['4', `<strong>Save your acceptance letter</strong> — it is attached to this email as a PDF for your records.`],
        ].map(([n, text]) => `
        <tr>
          <td style="vertical-align:top;padding:8px 14px 8px 0;width:38px;">
            <div style="background:#0B3B2C;color:#D4F542;width:28px;height:28px;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:bold;">${n}</div>
          </td>
          <td style="vertical-align:middle;padding:8px 0;color:#444;font-size:14px;line-height:1.7;">${text}</td>
        </tr>`).join('')}
      </table>

      <!-- CTA -->
      <div style="text-align:center;margin:0 0 32px;">
        <a href="${FRONTEND_URL}/student-login"
           style="display:inline-block;padding:15px 48px;background:#0B3B2C;color:#D4F542;text-decoration:none;border-radius:10px;font-weight:bold;font-size:15px;letter-spacing:0.5px;">
          Access Student Portal →
        </a>
      </div>

      <hr style="border:none;border-top:1px solid #e8ede8;margin:0 0 24px;" />

      <!-- Closing -->
      <p style="color:#444;font-size:14px;line-height:1.8;margin:0 0 20px;">
        We wish you every success in your studies and beyond. Should you need any help at any point,
        our team is always here for you — simply reach out to
        <a href="mailto:admissions@gitb.lt" style="color:#0B3B2C;font-weight:bold;">admissions@gitb.lt</a>.
      </p>
      <p style="color:#333;font-size:14px;margin:0;">
        Warmest regards,<br>
        <strong style="font-size:15px;">Dr. Aremu, MSc, PhD</strong><br>
        <span style="color:#5a9a6a;font-size:13px;">Director of Admissions</span><br>
        <span style="color:#888;font-size:12px;">Global Institute of Technology and Business · Vilnius, Lithuania</span>
      </p>
    </div>

    <!-- ── FOOTER ──────────────────────────────────────── -->
    <div style="text-align:center;padding:20px 0 8px;">
      <p style="margin:0 0 6px;color:#888;font-size:11px;">
        © ${new Date().getFullYear()} Global Institute of Technology and Business
      </p>
      <p style="margin:0;font-size:11px;">
        <a href="https://gitb.lt" style="color:#5a9a6a;text-decoration:none;">gitb.lt</a>
        &nbsp;·&nbsp;
        <a href="mailto:admissions@gitb.lt" style="color:#5a9a6a;text-decoration:none;">admissions@gitb.lt</a>
      </p>
    </div>

  </div>
  </body>
  </html>
  `;

  try {
    const pdfBuffer = await generateAcceptanceLetter(firstName, lastName, courseTitle, tuitionAmount);
    const attachments = [{
      filename: `GITB_Acceptance_Letter_${firstName}_${lastName}.pdf`,
      content: pdfBuffer.toString('base64'),
    }];
    return await sendEmail(email, `Welcome to GITB - Your Admission is Confirmed!`, html, attachments);
  } catch (pdfErr) {
    console.error("PDF generation failed, sending email without attachment:", pdfErr.message);
    return await sendEmail(email, `Welcome to GITB - Your Admission is Confirmed!`, html);
  }
};

// Login notification email - DISABLED per user request
// const sendLoginNotificationEmail = async (email, firstName, ip, location, timestamp) => { ... };

// Application received confirmation email (sent after payment of application fee)
const sendApplicationReceivedEmail = async (email, firstName, courseTitle) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      ${getEmailHeader("Application Received")}
      <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #3d7a4a; margin-top: 0;">We've Received Your Application!</h2>
        <p>Dear ${firstName},</p>
        <p>Thank you for applying to <strong>${courseTitle}</strong> at the Global Institute of Tech and Business. Your application fee has been received and your application is now under review by our admissions team.</p>
        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3d7a4a;">
          <h3 style="margin: 0 0 8px 0; color: #2d5a3a;">What Happens Next?</h3>
          <ol style="margin: 0; padding-left: 20px; color: #444; line-height: 1.8;">
            <li>Our admissions team will review your application and documents.</li>
            <li>You will receive a decision by email within <strong>3–5 working days</strong>.</li>
            <li>If approved, you'll receive your login credentials and next steps by email.</li>
          </ol>
        </div>
        <p style="color: #555;">If you have any questions in the meantime, please don't hesitate to reach out to our admissions team at <a href="mailto:admissions@gitb.lt" style="color: #3d7a4a;">admissions@gitb.lt</a>.</p>
        <p style="color: #333;">Best regards,<br><strong>GITB Admissions Team</strong></p>
      </div>
    </div>
  `;
  return await sendEmail(email, `Application Received – ${courseTitle} | GITB`, html);
};

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

const sendStaffWelcomeEmail = async (email, firstName, lastName, role, password) => {
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const loginUrl = role === 'admin' ? `${FRONTEND_URL}/admin` : `${FRONTEND_URL}/login`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      ${getEmailHeader(`${roleLabel} Account Created`)}
      <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #0B3B2C; margin-top: 0;">Welcome to GITB, ${firstName}!</h2>
        <p>Dear ${firstName} ${lastName},</p>
        <p>An account has been created for you at the <strong>Global Institute of Technology and Business</strong> with the role of <strong>${roleLabel}</strong>.</p>
        <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0B3B2C;">
          <h3 style="margin: 0 0 15px 0; color: #0B3B2C;">Your Login Credentials</h3>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Password:</strong> <code style="background: #fff3e0; padding: 4px 10px; border-radius: 4px; color: #e65100; font-size: 15px;">${password}</code></p>
          <p style="margin: 5px 0;"><strong>Role:</strong> ${roleLabel}</p>
        </div>
        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
          <p style="margin: 0; color: #e65100;"><strong>Action required:</strong> Please log in and change your password immediately for security.</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="display: inline-block; padding: 15px 40px; background: #0B3B2C; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Login to GITB Portal
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">If you did not expect this email, please contact <a href="mailto:admissions@gitb.lt" style="color: #0B3B2C;">admissions@gitb.lt</a> immediately.</p>
        <p style="color: #666; margin-bottom: 0;">Best regards,<br><strong>GITB Administration</strong></p>
      </div>
    </div>
  `;
  return await sendEmail(email, `Welcome to GITB — Your ${roleLabel} Account`, html);
};

const sendCourseAssignmentEmail = async (teacher, course) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      ${getEmailHeader("Course Assignment")}
      <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #0B3B2C; margin-top: 0;">You have been assigned to a course</h2>
        <p>Dear ${teacher.first_name} ${teacher.last_name},</p>
        <p>You have been assigned as the instructor for the following course on the GITB platform:</p>
        <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0B3B2C;">
          <h3 style="margin: 0 0 10px 0; color: #0B3B2C;">${course.title}</h3>
          ${course.description ? `<p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${course.description}</p>` : ''}
          ${course.duration ? `<p style="margin: 8px 0 0 0; color: #555;"><strong>Duration:</strong> ${course.duration}</p>` : ''}
        </div>
        <p>You can now view enrolled students, upload course materials, manage quizzes, and more from your instructor portal.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${FRONTEND_URL}/teacher/dashboard" style="display: inline-block; padding: 15px 40px; background: #0B3B2C; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Open Instructor Portal
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Questions? Contact <a href="mailto:admissions@gitb.lt" style="color: #0B3B2C;">admissions@gitb.lt</a></p>
        <p style="color: #666; margin-bottom: 0;">Best regards,<br><strong>GITB Administration</strong></p>
      </div>
    </div>
  `;
  return await sendEmail(teacher.email, `Course Assignment — ${course.title} | GITB`, html);
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

// ============ NEWSLETTER ROUTES ============
app.post("/api/newsletter/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: "Valid email required" });
    }
    await db.collection("newsletter").updateOne(
      { email },
      { $set: { email, subscribed_at: new Date() } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    res.status(500).json({ error: "Internal server error" });
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

    const emailSent = await sendEmail(email, "Password Reset Request - GITB", html);

    if (!emailSent) {
      console.error(`Failed to send password reset email to ${email}`);
    } else {
      console.log(`Password reset email sent successfully to ${email}`);
    }

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
      } catch (e) { }
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

// ============ ACTIVITY LOGGING ============
async function logActivity(adminId, adminName, action, targetType, targetId, targetName, details = '') {
  try {
    await db.collection("activity_logs").insertOne({
      id: uuidv4(),
      admin_id: adminId,
      admin_name: adminName,
      action,           // e.g. "deleted_user", "created_user", "approved_application"
      target_type: targetType, // e.g. "user", "application", "course"
      target_id: targetId,
      target_name: targetName,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch { /* non-blocking */ }
}

// Get activity log (admin only)
app.get("/api/admin/activity", authenticate, requireRoles(["admin", "super_admin"]), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await db.collection("activity_logs")
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
    res.json(logs.map(({ _id, ...l }) => l));
  } catch (err) {
    res.status(500).json({ detail: err.message });
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

    // Store plain password for email before hashing
    const plainPassword = password;
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

    logActivity(
      req.user.id,
      `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.email,
      'created_user',
      'user',
      newUser.id,
      `${first_name} ${last_name} (${email})`,
      `Role: ${role}`
    );

    // Send welcome email with credentials using plain password
    try {
      await sendStaffWelcomeEmail(email, first_name, last_name, role, plainPassword);
      console.log(`Welcome email sent successfully to ${email}`);
    } catch (emailError) {
      console.error("Staff welcome email failed:", emailError.message);
      // Continue even if email fails - user is already created
    }

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
    // Fetch target user before deleting so we can log their name/role
    const target = await db.collection("users").findOne({ id: userId }, { projection: { first_name: 1, last_name: 1, email: 1, role: 1 } });
    if (!target) return res.status(404).json({ detail: "User not found" });
    const result = await db.collection("users").deleteOne({ id: userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: "User not found" });
    }
    // Log the deletion
    logActivity(
      req.user.id,
      `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.email,
      'deleted_user',
      'user',
      userId,
      `${target.first_name} ${target.last_name} (${target.email})`,
      `Role: ${target.role}`
    );
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// ============ COURSE ROUTES ============
app.get("/api/courses", authenticate, async (req, res) => {
  try {
    const courses = await db.collection("courses").find({}).toArray();
    const result = courses.map(c => {
      const { _id, ...rest } = c;
      return { ...rest, id: c.id || _id.toString() };
    });
    res.json(result);
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
    const raw = await db.collection("courses").find({ is_active: true }).toArray();
    // Always return a usable `id` — use the uuid `id` field if present, else stringify _id
    const courses = raw.map(({ _id, ...rest }) => ({
      ...rest,
      id: rest.id || _id.toString(),
    }));
    res.json(courses);
  } catch (error) {
    console.error("Get public courses error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

app.get("/api/public/stats", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ detail: "Database not available" });
    const studentsCount = await db.collection("users").countDocuments({ role: "student" });
    const coursesCount = await db.collection("courses").countDocuments({ is_active: true });
    res.json({ graduates: studentsCount, countries: 27, courses: coursesCount });
  } catch (error) {
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
    logActivity(
      req.user.id,
      `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.email,
      'created_course', 'course', newCourse.id, newCourse.title, ''
    );
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
    const targetCourse = await db.collection("courses").findOne({ id: courseId }, { projection: { title: 1 } });
    let result = await db.collection("courses").deleteOne({ id: courseId });
    if (result.deletedCount === 0) {
      try { result = await db.collection("courses").deleteOne({ _id: new ObjectId(courseId) }); } catch { }
    }
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: "Course not found" });
    }
    logActivity(
      req.user.id,
      `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.email,
      'deleted_course', 'course', courseId, targetCourse?.title || courseId, ''
    );
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Clear all unpaid/abandoned applications (admin housekeeping)
app.delete("/api/admin/applications/unpaid", authenticate, requireRoles(["admin", "registrar", "super_admin"]), async (req, res) => {
  console.log(`Clearing unpaid applications via ${req.path}`);
  try {
    const result = await db.collection("applications").deleteMany({
      $or: [
        { status: "pending_payment" },
        { payment_status: { $exists: false } },
        { payment_status: null },
        { payment_status: "pending" },
        { payment_status: { $nin: ["paid", "refunded"] } },
      ],
    });
    console.log(`Successfully cleared ${result.deletedCount} items`);
    res.json({ deleted: result.deletedCount, message: `Cleared ${result.deletedCount} unpaid/abandoned applications` });
  } catch (error) {
    console.error("Clear unpaid applications error:", error);
    res.status(500).json({ detail: error.message });
  }
});

// Wipe ALL applications (super admin nuclear option)
app.delete("/api/admin/applications/all", authenticate, requireRoles(["admin", "super_admin"]), async (req, res) => {
  try {
    const result = await db.collection("applications").deleteMany({});
    res.json({ deleted: result.deletedCount, message: `Deleted all ${result.deletedCount} applications` });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

// Wipe ALL enrollments (super admin nuclear option)
app.delete("/api/admin/enrollments/all", authenticate, requireRoles(["admin", "super_admin"]), async (req, res) => {
  try {
    const result = await db.collection("enrollments").deleteMany({});
    res.json({ deleted: result.deletedCount, message: `Deleted all ${result.deletedCount} enrollments` });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

// ============ COURSE MATERIALS ROUTES ============
app.get("/api/courses/:courseId/materials", authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const materials = await db.collection("course_materials")
      .find({ course_id: courseId })
      .sort({ created_at: -1 })
      .toArray();
    res.json(materials);
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

app.post("/api/courses/:courseId/materials", authenticate, requireRoles(["admin", "lecturer", "teacher"]), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, type, url, description, week } = req.body;

    if (!title || !type || !url) {
      return res.status(400).json({ detail: "Missing required fields" });
    }

    const material = {
      id: uuidv4(),
      course_id: courseId,
      title,
      type, // 'video', 'pdf', 'document', 'link'
      url,
      description: description || "",
      week: week ?? 1,
      created_at: new Date().toISOString(),
      created_by: req.user.id
    };

    await db.collection("course_materials").insertOne(material);
    res.json(material);
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

// ============ APPLICATION ROUTES ============
// STRIPE-FIRST FLOW: Application is only stored in DB after payment confirmed by webhook.
// This prevents "already applied" loops and keeps admissions table clean.
app.post("/api/applications/create", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ detail: "Database not available" });
    if (!stripe) return res.status(503).json({ detail: "Payment service not available. Please contact admissions@gitb.lt" });

    const {
      first_name, last_name, email, phone, course_id,
      country, city, address, date_of_birth,
      identification_url, high_school_certificate_url,
      motivation, origin_url
    } = req.body;

    if (!first_name || !last_name || !email || !course_id) {
      return res.status(422).json({ detail: "Missing required fields: first_name, last_name, email, course_id" });
    }

    // Find the course (by UUID id, slug, or title)
    let course = await db.collection("courses").findOne({ id: course_id });
    if (!course) course = await db.collection("courses").findOne({ slug: course_id });
    if (!course) {
      const escaped = course_id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      course = await db.collection("courses").findOne({ slug: { $regex: new RegExp(`^${escaped}$`, 'i') } })
        || await db.collection("courses").findOne({ title: { $regex: new RegExp(`^${escaped}$`, 'i') } });
    }
    if (!course) {
      console.error("Course not found for id:", course_id);
      return res.status(404).json({ detail: "Course not found. Please select a valid programme." });
    }

    // Block only if a PAID application already exists — never block on pending/failed
    const paidApp = await db.collection("applications").findOne({
      email: email.toLowerCase().trim(),
      course_id: course.id,
      payment_status: "paid",
    });
    if (paidApp) {
      return res.status(400).json({ detail: "You have already paid the application fee for this course. Please contact admissions@gitb.lt if you believe this is an error." });
    }

    // Generate a unique application ID to embed in Stripe metadata
    const applicationId = uuidv4();
    const frontendBase = origin_url || FRONTEND_URL || 'https://gitb.lt';

    // Create Stripe Checkout Session — NO DB write until webhook confirms payment
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: {
              name: `Application Fee — ${course.title}`,
              description: `One-time non-refundable application fee for ${course.title} at GITB`,
            },
            unit_amount: Math.round(APPLICATION_FEE * 100),
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${frontendBase}/apply/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendBase}/apply?cancelled=true`,
        customer_email: email,
        metadata: {
          type: "application_fee",
          application_id: applicationId,
          course_id: course.id,
          course_title: course.title,
          first_name,
          last_name,
          email: email.toLowerCase().trim(),
          phone: phone || "",
          country: country || "",
          city: city || "",
          address: address || "",
          date_of_birth: date_of_birth || "",
          identification_url: identification_url || "",
          high_school_certificate_url: high_school_certificate_url || "",
          motivation: (motivation || "").slice(0, 500), // Stripe metadata values max 500 chars
        },
      });
    } catch (stripeErr) {
      console.error("Stripe session creation failed:", stripeErr.message, stripeErr.type);
      return res.status(502).json({
        detail: `Payment session could not be created: ${stripeErr.message}. Please try again or contact admissions@gitb.lt`,
      });
    }

    console.log(`Stripe session created for ${email} → ${course.title} (session: ${session.id})`);

    // Return checkout URL — application will be created in DB by webhook on payment success
    res.json({
      data: {
        checkout_url: session.url,
        session_id: session.id,
        application_id: applicationId,
      },
    });
  } catch (error) {
    console.error("Create application error:", error);
    res.status(500).json({ detail: "An unexpected error occurred. Please try again." });
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
    // Only show applications where the admission fee was actually paid.
    // pending_payment entries are abandoned/incomplete checkout sessions.
    const query = {
      payment_status: "paid",
      ...(status ? { status } : {}),
    };

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
          approved_by: req.user.id,
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

    logActivity(
      req.user.id,
      `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.email,
      'approved_application',
      'application',
      applicationId,
      `${application.first_name} ${application.last_name} (${application.email})`,
      `Course: ${application.course_title}`
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
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        ${getEmailHeader("Admissions Decision")}
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">An Update on Your Application</h2>
          <p>Dear ${application.first_name},</p>
          <p>Thank you sincerely for taking the time to apply to <strong>${application.course_title}</strong> at the <strong>Global Institute of Tech and Business</strong>. We truly appreciate your interest in furthering your education with us, and we know that applying to a programme takes real effort and courage.</p>
          <p>After careful review of your application and the documents you submitted, our admissions committee has given your file thorough consideration. It is with deep regret that we must inform you that we are <strong>unable to offer you a place on this programme at this time</strong>.</p>
          ${reason ? `
          <div style="background: #fff8e1; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
            <h4 style="margin: 0 0 8px 0; color: #f57c00;">Reason for this decision:</h4>
            <p style="margin: 0; color: #555;">${reason}</p>
          </div>` : ""}
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">What You Can Do Next</h3>
            <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.9;">
              <li>You are welcome to <strong>reapply in the next intake</strong> after strengthening your application.</li>
              <li>Explore our other programmes — there may be a better fit for your goals and background.</li>
              <li>Reach out to our admissions team for personalised guidance on next steps.</li>
            </ul>
          </div>
          <p style="color: #555;">Please know that this decision does not diminish your potential or your value. Many successful people have faced setbacks and gone on to achieve great things. We genuinely hope this is not the end of your journey with GITB, and we encourage you to keep pursuing your ambitions.</p>
          <p style="color: #555;">If you would like feedback on your application or wish to discuss alternative options, please don't hesitate to contact us at <a href="mailto:admissions@gitb.lt" style="color: #3d7a4a;">admissions@gitb.lt</a>.</p>
          <p style="color: #555;">We wish you every success in your future endeavours.</p>
          <p style="color: #333;">Warm regards,<br><strong>GITB Admissions Team</strong><br><em>Global Institute of Tech and Business</em></p>
        </div>
      </div>
    `;

    await sendEmail(application.email, `Application Update - ${application.course_title}`, html);

    logActivity(
      req.user.id,
      `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.email,
      'rejected_application',
      'application',
      applicationId,
      `${application.first_name} ${application.last_name} (${application.email})`,
      `Course: ${application.course_title}${reason ? ` — Reason: ${reason}` : ''}`
    );

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

// Student self-service: add a course to dashboard (creates unpaid enrollment)
app.post("/api/student/add-course", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { course_id } = req.body;
    if (!course_id) return res.status(422).json({ detail: "course_id is required" });

    let course = await db.collection("courses").findOne({ id: course_id });
    if (!course) {
      try { course = await db.collection("courses").findOne({ _id: new ObjectId(course_id) }); } catch { }
    }
    if (!course) return res.status(404).json({ detail: "Course not found" });

    const existing = await db.collection("enrollments").findOne({
      $or: [{ user_id: userId }, { student_id: userId }],
      course_id: course.id || course._id.toString(),
    });
    if (existing) return res.status(400).json({ detail: "Already added to your dashboard" });

    const enrollment = {
      id: uuidv4(),
      user_id: userId,
      course_id: course.id || course._id.toString(),
      status: "pending_payment",
      payment_status: "unpaid",
      self_enrolled: true,
      created_at: new Date().toISOString(),
    };
    await db.collection("enrollments").insertOne(enrollment);
    res.json({ success: true, enrollment_id: enrollment.id, course_title: course.title });
  } catch (error) {
    console.error("Add course error:", error);
    res.status(500).json({ detail: error.message || "Internal server error" });
  }
});

// Create tuition payment session for a course
app.post("/api/tuition/pay", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = req.user;
    const { course_id, origin_url, payment_plan } = req.body;

    if (!course_id) {
      return res.status(422).json({ detail: "Course ID is required" });
    }

    // Check enrollment exists and is pending payment
    let enrollment = await db.collection("enrollments").findOne({
      $or: [{ user_id: userId }, { student_id: userId }],
      course_id: course_id
    });

    // If no enrollment exists, create one automatically.
    // Students can add any course directly from their dashboard and pay tuition.
    if (!enrollment) {
      const application = await db.collection("applications").findOne({
        email: user.email,
        course_id: course_id,
        status: "approved"
      });

      enrollment = {
        id: uuidv4(),
        user_id: userId,
        course_id: course_id,
        application_id: application ? application.id : null,
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


    const isMonthly = payment_plan === 'monthly';

    // Safely extract numeric price — course.price may be a number, an object {monthly,upfront}, or null/undefined
    const rawUpfront =
      typeof course.price === 'number' ? course.price
      : typeof course.price === 'object' && course.price !== null
        ? Number(course.price.upfront ?? course.price.monthly ?? 0)
        : Number(course.price) || 0;
    const rawMonthly = Number(course.monthly_price) || 0;

    const upfrontAmount = rawUpfront;
    const monthlyAmount = rawMonthly || (rawUpfront > 0 ? Math.ceil(rawUpfront / 12) : 0);
    const chargeAmount = isMonthly ? monthlyAmount : upfrontAmount;

    if (!chargeAmount || chargeAmount <= 0 || isNaN(chargeAmount)) {
      return res.status(422).json({
        detail: `Tuition fee for "${course.title}" has not been set. Please contact admissions@gitb.lt`
      });
    }

    const paymentDescription = isMonthly
      ? `Monthly installment 1 of 12 - ${course.title}`
      : `Full tuition - ${course.title}`;

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
            description: paymentDescription
          },
          unit_amount: Math.round(chargeAmount * 100)
        },
        quantity: 1
      }],
      mode: "payment",
      success_url: `${origin_url || FRONTEND_URL}/student/dashboard?payment=success&course=${course_id}`,
      cancel_url: `${origin_url || FRONTEND_URL}/student/dashboard?payment=cancelled`,
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
      { $set: { stripe_session_id: session.id, payment_plan: isMonthly ? 'monthly' : 'one_time', installments_paid: isMonthly ? 1 : null, total_installments: isMonthly ? 12 : null } }
    );

    // Wrap in `data` object - frontend expects response.data.checkout_url
    res.json({
      data: {
        checkout_url: session.url,
        session_id: session.id,
        enrollment_id: enrollment.id,
        course_title: course.title,
        amount: chargeAmount,
        payment_plan: isMonthly ? 'monthly' : 'one_time'
      }
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

// Stripe webhook is registered before express.json() — see top of middleware section.

// ============ DASHBOARD ROUTES ============
app.get("/api/dashboard/admin", authenticate, requireRoles(["admin", "super_admin", "sub_admin", "staff"]), async (req, res) => {
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
      recentUsers,
      appFeeRevenue,
      tuitionRevenue
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
        .toArray(),
      db.collection("applications").aggregate([
        { $match: { payment_status: "paid" } },
        { $group: { _id: null, total: { $sum: "$payment_amount" } } }
      ]).toArray(),
      db.collection("enrollments").aggregate([
        { $match: { payment_status: "paid" } },
        { $group: { _id: null, total: { $sum: "$payment_amount" } } }
      ]).toArray()
    ]);

    const totalRevenue = (appFeeRevenue[0]?.total || 0) + (tuitionRevenue[0]?.total || 0);

    res.json({
      total_students: totalStudents,
      total_lecturers: totalLecturers,
      total_courses: totalCourses,
      active_courses: activeCourses,
      pending_admissions: pendingApplications,
      locked_accounts: lockedAccounts,
      unpaid_students: unpaidStudents,
      total_users: totalUsers,
      recent_users: recentUsers,
      total_revenue: totalRevenue
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

// Admin manually enroll a student in a course
app.post("/api/enrollments", authenticate, requireRoles(["admin", "registrar"]), async (req, res) => {
  try {
    const { user_id, course_id } = req.body;
    if (!user_id || !course_id) return res.status(400).json({ detail: "user_id and course_id are required" });

    // Multi-step course lookup: UUID id → ObjectId _id → slug
    let course = await db.collection("courses").findOne({ id: course_id });
    if (!course) {
      try { course = await db.collection("courses").findOne({ _id: new ObjectId(course_id) }); } catch { }
    }
    if (!course) course = await db.collection("courses").findOne({ slug: course_id });
    if (!course) return res.status(404).json({ detail: "Course not found" });

    const student = await db.collection("users").findOne({ id: user_id });
    if (!student) return res.status(404).json({ detail: "Student not found" });

    const normalizedCourseId = course.id || course._id.toString();

    const existing = await db.collection("enrollments").findOne({
      $or: [
        { user_id, course_id: normalizedCourseId },
        { student_id: user_id, course_id: normalizedCourseId }
      ]
    });
    if (existing) return res.status(400).json({ detail: "Student is already enrolled in this course" });

    const enrollment = {
      id: uuidv4(),
      user_id,
      student_id: user_id,
      course_id: normalizedCourseId,
      course_title: course.title,
      enrolled_at: new Date().toISOString(),
      status: "active",
      payment_status: "paid",
      enrolled_by: req.user.id,
      created_at: new Date().toISOString()
    };

    await db.collection("enrollments").insertOne(enrollment);
    res.json(enrollment);
  } catch (err) {
    console.error("Manual enroll error:", err);
    res.status(500).json({ detail: "Failed to create enrollment" });
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

// ============ SYSTEM SETTINGS ENDPOINTS ============
app.get("/api/system/settings", authenticate, requireRoles(["admin", "super_admin"]), async (req, res) => {
  try {
    await refreshSystemSettings();
    res.json(systemSettings);
  } catch (err) {
    res.status(500).json({ detail: "Failed to fetch settings" });
  }
});

app.put("/api/system/settings", authenticate, requireRoles(["admin", "super_admin"]), async (req, res) => {
  try {
    const updates = req.body;
    await db.collection("system_settings").updateOne(
      { type: "config" },
      { $set: updates },
      { upsert: true }
    );
    await refreshSystemSettings();
    res.json({ message: "Settings updated", settings: systemSettings });
  } catch (err) {
    res.status(500).json({ detail: "Failed to update settings" });
  }
});

app.post("/api/users/profile", authenticate, async (req, res) => {
  try {
    const { first_name, last_name, profilePicture, phone } = req.body;
    await db.collection("users").updateOne(
      { id: req.user.id },
      { $set: { first_name, last_name, profilePicture, phone } }
    );
    const updatedUser = await db.collection("users").findOne({ id: req.user.id }, { projection: { password: 0 } });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ detail: "Failed to update profile" });
  }
});


// ============ QUIZ ROUTES ============

// Get quizzes for a course
app.get("/api/courses/:courseId/quizzes", authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const quizzes = await db.collection("quizzes").find({
      course_id: courseId,
      is_active: true
    }, { projection: { questions: 0 } }).toArray();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ detail: "Failed to fetch quizzes" });
  }
});

// Admin: get all quizzes for a course (with questions)
app.get("/api/admin/courses/:courseId/quizzes", authenticate, requireRoles(["admin", "super_admin", "teacher", "lecturer"]), async (req, res) => {
  try {
    const { courseId } = req.params;
    const quizzes = await db.collection("quizzes").find({ course_id: courseId }).toArray();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ detail: "Failed to fetch quizzes" });
  }
});

// Admin: create quiz
app.post("/api/admin/quizzes", authenticate, requireRoles(["admin", "super_admin", "teacher", "lecturer"]), async (req, res) => {
  try {
    const { course_id, title, description, questions, time_limit_minutes } = req.body;
    if (!course_id || !title || !questions || !Array.isArray(questions)) {
      return res.status(422).json({ detail: "course_id, title, and questions array required" });
    }
    const quiz = {
      id: uuidv4(),
      course_id,
      title,
      description: description || "",
      time_limit_minutes: time_limit_minutes || 30,
      questions: questions.map((q, idx) => ({
        id: uuidv4(),
        order: idx + 1,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        points: q.points || 1
      })),
      total_points: questions.reduce((sum, q) => sum + (q.points || 1), 0),
      is_active: true,
      created_at: new Date().toISOString(),
      created_by: req.user.id
    };
    await db.collection("quizzes").insertOne(quiz);
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ detail: "Failed to create quiz" });
  }
});

// Admin: update quiz
app.put("/api/admin/quizzes/:quizId", authenticate, requireRoles(["admin", "super_admin", "teacher", "lecturer"]), async (req, res) => {
  try {
    const { quizId } = req.params;
    const update = req.body;
    if (update.questions) {
      update.questions = update.questions.map((q, idx) => ({
        id: q.id || uuidv4(),
        order: idx + 1,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        points: q.points || 1
      }));
      update.total_points = update.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    }
    update.updated_at = new Date().toISOString();
    await db.collection("quizzes").updateOne({ id: quizId }, { $set: update });
    const quiz = await db.collection("quizzes").findOne({ id: quizId });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ detail: "Failed to update quiz" });
  }
});

// Admin: delete quiz
app.delete("/api/admin/quizzes/:quizId", authenticate, requireRoles(["admin", "super_admin"]), async (req, res) => {
  try {
    const { quizId } = req.params;
    await db.collection("quizzes").updateOne({ id: quizId }, { $set: { is_active: false } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ detail: "Failed to delete quiz" });
  }
});

// Get quiz for taking (hides correct answers)
app.get("/api/quizzes/:quizId", authenticate, async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await db.collection("quizzes").findOne({ id: quizId, is_active: true });
    if (!quiz) return res.status(404).json({ detail: "Quiz not found" });
    // Strip correct answers for student view
    const safeQuiz = {
      ...quiz,
      questions: quiz.questions.map(q => ({
        id: q.id,
        order: q.order,
        question: q.question,
        options: q.options,
        points: q.points
      }))
    };
    res.json(safeQuiz);
  } catch (err) {
    res.status(500).json({ detail: "Failed to fetch quiz" });
  }
});

// Submit quiz answers
app.post("/api/quizzes/:quizId/submit", authenticate, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // [{ question_id, selected_answer }]
    const userId = req.user.id;

    // Check if already submitted
    const existing = await db.collection("quiz_results").findOne({ user_id: userId, quiz_id: quizId });
    if (existing) {
      return res.status(400).json({ detail: "Quiz already submitted", result: existing });
    }

    const quiz = await db.collection("quizzes").findOne({ id: quizId, is_active: true });
    if (!quiz) return res.status(404).json({ detail: "Quiz not found" });

    // Grade answers
    let score = 0;
    const gradedAnswers = (answers || []).map(a => {
      const question = quiz.questions.find(q => q.id === a.question_id);
      if (!question) return { ...a, is_correct: false, correct_answer: null, points_earned: 0 };
      const is_correct = a.selected_answer === question.correct_answer;
      if (is_correct) score += question.points || 1;
      return {
        question_id: a.question_id,
        question_text: question.question,
        selected_answer: a.selected_answer,
        correct_answer: question.correct_answer,
        is_correct,
        points_earned: is_correct ? (question.points || 1) : 0
      };
    });

    const total_points = quiz.total_points || quiz.questions.length;
    const percentage = total_points > 0 ? Math.round((score / total_points) * 100) : 0;

    const result = {
      id: uuidv4(),
      user_id: userId,
      quiz_id: quizId,
      course_id: quiz.course_id,
      quiz_title: quiz.title,
      score,
      total_points,
      percentage,
      passed: percentage >= 60,
      answers: gradedAnswers,
      submitted_at: new Date().toISOString()
    };
    await db.collection("quiz_results").insertOne(result);
    res.json(result);
  } catch (err) {
    console.error("Submit quiz error:", err);
    res.status(500).json({ detail: "Failed to submit quiz" });
  }
});

// Get student's all quiz results
app.get("/api/my-quiz-results", authenticate, async (req, res) => {
  try {
    const results = await db.collection("quiz_results")
      .find({ user_id: req.user.id })
      .sort({ submitted_at: -1 })
      .toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ detail: "Failed to fetch results" });
  }
});

// Get result for specific quiz
app.get("/api/my-quiz-results/:quizId", authenticate, async (req, res) => {
  try {
    const result = await db.collection("quiz_results").findOne({
      user_id: req.user.id,
      quiz_id: req.params.quizId
    });
    if (!result) return res.status(404).json({ detail: "No result found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ detail: "Failed to fetch result" });
  }
});

// ============ PROGRESS ROUTES ============

// Mark a material/lesson as complete
app.post("/api/progress/complete", authenticate, async (req, res) => {
  try {
    const { course_id, material_id } = req.body;
    if (!course_id || !material_id) {
      return res.status(422).json({ detail: "course_id and material_id required" });
    }
    const key = `${course_id}::${material_id}`;
    await db.collection("users").updateOne(
      { id: req.user.id },
      { $addToSet: { completed_lessons: key } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ detail: "Failed to update progress" });
  }
});

// Get progress for a course
app.get("/api/progress/:courseId", authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = await db.collection("users").findOne({ id: req.user.id }, { projection: { completed_lessons: 1 } });
    const completedLessons = (user?.completed_lessons || [])
      .filter(k => k.startsWith(`${courseId}::`))
      .map(k => k.split("::")[1]);

    const materials = await db.collection("course_materials").find({ course_id: courseId }).toArray();
    const total = materials.length;
    const completed = completedLessons.length;

    res.json({
      course_id: courseId,
      completed_lesson_ids: completedLessons,
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    });
  } catch (err) {
    res.status(500).json({ detail: "Failed to fetch progress" });
  }
});

// ============ ENROLLMENT ROUTES ============

// Get student's enrollments with payment details
app.get("/api/my-enrollments", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const enrollments = await db.collection("enrollments").find({
      $or: [{ user_id: userId }, { student_id: userId }]
    }).toArray();

    const enriched = await Promise.all(enrollments.map(async (e) => {
      const course = await db.collection("courses").findOne({ id: e.course_id });
      return {
        ...e,
        course_title: course?.title || "Unknown Course",
        course_img: course?.image_url || null,
        course_price: course?.price || 0,
        monthly_price: course?.monthly_price || Math.ceil((course?.price || 0) / 12)
      };
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ detail: "Failed to fetch enrollments" });
  }
});

// ============ TEACHER / INSTRUCTOR ROUTES ============

const TEACHER_ROLES = ["admin", "teacher", "lecturer", "staff"];

// Generate employment contract HTML
function generateEmploymentContract(teacher, signedAt) {
  const date = new Date(signedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #222;">
  <div style="text-align:center; border-bottom: 2px solid #0B3B2C; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="color:#0B3B2C; margin:0;">GITB — Global Institute of Technology and Business</h1>
    <p style="color:#555; margin:5px 0;">Vilnius, Lithuania · admissions@gitb.lt</p>
    <h2 style="color:#0B3B2C; margin-top:20px;">Instructor/Staff Employment Agreement</h2>
  </div>
  <p>This Agreement is entered into on <strong>${date}</strong> between:</p>
  <ul>
    <li><strong>GITB — Global Institute of Technology and Business</strong> ("the Institution"), and</li>
    <li><strong>${teacher.first_name} ${teacher.last_name}</strong> (Email: ${teacher.email}) ("the Instructor")</li>
  </ul>
  <h3 style="color:#0B3B2C;">1. Role and Responsibilities</h3>
  <p>The Instructor agrees to fulfil the role of <strong>${(teacher.role || "Instructor").toUpperCase()}</strong> and shall:</p>
  <ul>
    <li>Deliver course content as assigned by the Administration</li>
    <li>Upload learning materials, assessments, and resources via the GITB Instructor Portal</li>
    <li>Grade student work fairly and within agreed timeframes</li>
    <li>Maintain accurate records of student attendance and progress</li>
    <li>Communicate professionally with students and staff at all times</li>
    <li>Attend scheduled meetings and training sessions as required</li>
  </ul>
  <h3 style="color:#0B3B2C;">2. Confidentiality</h3>
  <p>The Instructor agrees to maintain strict confidentiality regarding all student data, institutional data, and any proprietary materials shared by GITB. Student personal information shall not be disclosed to any third party under any circumstances.</p>
  <h3 style="color:#0B3B2C;">3. Intellectual Property</h3>
  <p>All course materials, assessments, and content created by the Instructor in the course of their duties remain the intellectual property of GITB. The Instructor grants GITB a perpetual, royalty-free licence to use any materials they create for institutional purposes.</p>
  <h3 style="color:#0B3B2C;">4. Code of Conduct</h3>
  <p>The Instructor agrees to uphold GITB's Code of Conduct, which includes professional conduct toward students, zero tolerance for discrimination or harassment, and commitment to academic integrity. Violations may result in immediate termination of this agreement.</p>
  <h3 style="color:#0B3B2C;">5. Data Protection</h3>
  <p>The Instructor acknowledges their obligations under the GDPR (Regulation (EU) 2016/679) and agrees to process student data only for legitimate educational purposes and in accordance with GITB's data protection policies.</p>
  <h3 style="color:#0B3B2C;">6. Termination</h3>
  <p>Either party may terminate this agreement with 14 days written notice. GITB reserves the right to terminate immediately in cases of gross misconduct, breach of confidentiality, or failure to meet performance standards.</p>
  <h3 style="color:#0B3B2C;">7. Governing Law</h3>
  <p>This Agreement is governed by the laws of the Republic of Lithuania.</p>
  <div style="margin-top:40px; padding:20px; background:#f0fdf4; border:1px solid #0B3B2C; border-radius:8px;">
    <p><strong>Digital Signature:</strong> ${teacher.first_name} ${teacher.last_name}</p>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Email:</strong> ${teacher.email}</p>
    <p><strong>IP Timestamp:</strong> ${new Date(signedAt).toISOString()}</p>
    <p style="color:#0B3B2C; font-size:12px;">This document was digitally signed via the GITB Instructor Portal. This constitutes a legally binding electronic signature under EU Regulation No 910/2014 (eIDAS).</p>
  </div>
</body>
</html>`;
}

// Get teacher's assigned courses (or all if none assigned)
app.get("/api/teacher/courses", authenticate, requireRoles(TEACHER_ROLES), async (req, res) => {
  try {
    const teacher = await db.collection("users").findOne({ id: req.user.id });
    const assignedIds = teacher?.assigned_courses || [];
    const query = assignedIds.length > 0 ? { id: { $in: assignedIds } } : {};
    const courses = await db.collection("courses").find(query, { projection: { _id: 0 } }).toArray();
    res.json(courses);
  } catch (err) { res.status(500).json({ detail: "Failed to fetch courses" }); }
});

// Get students enrolled in a course
app.get("/api/teacher/courses/:courseId/students", authenticate, requireRoles(TEACHER_ROLES), async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollments = await db.collection("enrollments").find({ course_id: courseId }).toArray();
    const userIds = enrollments.map(e => e.user_id || e.student_id);
    const students = await db.collection("users").find(
      { id: { $in: userIds } },
      { projection: { _id: 0, password: 0 } }
    ).toArray();
    const enriched = students.map(s => {
      const enr = enrollments.find(e => e.user_id === s.id || e.student_id === s.id);
      return { ...s, enrollment: enr || null };
    });
    res.json(enriched);
  } catch (err) { res.status(500).json({ detail: "Failed to fetch students" }); }
});

// Get all students across all teacher's courses (for messaging/groups)
app.get("/api/teacher/students", authenticate, requireRoles(TEACHER_ROLES), async (req, res) => {
  try {
    const teacher = await db.collection("users").findOne({ id: req.user.id });
    const assignedIds = teacher?.assigned_courses || [];
    const query = assignedIds.length > 0 ? { course_id: { $in: assignedIds } } : {};
    const enrollments = await db.collection("enrollments").find(query).toArray();
    const userIds = [...new Set(enrollments.map(e => e.user_id || e.student_id))];
    const students = await db.collection("users").find(
      { id: { $in: userIds } },
      { projection: { _id: 0, password: 0 } }
    ).toArray();
    const enriched = students.map(s => ({
      ...s,
      enrollments: enrollments.filter(e => e.user_id === s.id || e.student_id === s.id)
    }));
    res.json(enriched);
  } catch (err) { res.status(500).json({ detail: "Failed to fetch students" }); }
});

// Update student grade
app.put("/api/teacher/grades", authenticate, requireRoles(TEACHER_ROLES), async (req, res) => {
  try {
    const { user_id, course_id, grade, grade_notes } = req.body;
    if (!user_id || !course_id) return res.status(400).json({ detail: "user_id and course_id required" });
    await db.collection("enrollments").updateOne(
      { $or: [{ user_id, course_id }, { student_id: user_id, course_id }] },
      { $set: { grade, grade_notes, graded_by: req.user.id, graded_at: new Date().toISOString() } }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ detail: "Failed to update grade" }); }
});

// Create student group
app.post("/api/teacher/groups", authenticate, requireRoles(TEACHER_ROLES), async (req, res) => {
  try {
    const { name, course_id, student_ids, description } = req.body;
    if (!name) return res.status(400).json({ detail: "Group name is required" });
    const group = {
      id: uuidv4(),
      name,
      description: description || "",
      course_id: course_id || null,
      student_ids: student_ids || [],
      created_by: req.user.id,
      created_at: new Date().toISOString()
    };
    await db.collection("teacher_groups").insertOne(group);
    res.json(group);
  } catch (err) { res.status(500).json({ detail: "Failed to create group" }); }
});

// List teacher's groups
app.get("/api/teacher/groups", authenticate, requireRoles(TEACHER_ROLES), async (req, res) => {
  try {
    const groups = await db.collection("teacher_groups").find(
      { created_by: req.user.id }, { projection: { _id: 0 } }
    ).sort({ created_at: -1 }).toArray();
    res.json(groups);
  } catch (err) { res.status(500).json({ detail: "Failed to fetch groups" }); }
});

// Update group (rename / add/remove students)
app.put("/api/teacher/groups/:groupId", authenticate, requireRoles(TEACHER_ROLES), async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, student_ids, description, course_id } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (student_ids !== undefined) update.student_ids = student_ids;
    if (course_id !== undefined) update.course_id = course_id;
    await db.collection("teacher_groups").updateOne({ id: groupId, created_by: req.user.id }, { $set: update });
    const updated = await db.collection("teacher_groups").findOne({ id: groupId }, { projection: { _id: 0 } });
    res.json(updated);
  } catch (err) { res.status(500).json({ detail: "Failed to update group" }); }
});

// Delete group
app.delete("/api/teacher/groups/:groupId", authenticate, requireRoles(TEACHER_ROLES), async (req, res) => {
  try {
    await db.collection("teacher_groups").deleteOne({ id: req.params.groupId, created_by: req.user.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ detail: "Failed to delete group" }); }
});

// Send bulk email to course students / group
app.post("/api/teacher/bulk-email", authenticate, requireRoles(TEACHER_ROLES), async (req, res) => {
  try {
    const { subject, body, course_id, group_id, student_ids } = req.body;
    if (!subject || !body) return res.status(400).json({ detail: "Subject and body required" });

    let recipients = [];
    if (student_ids?.length) {
      const users = await db.collection("users").find({ id: { $in: student_ids } }, { projection: { email: 1, first_name: 1 } }).toArray();
      recipients = users;
    } else if (group_id) {
      const group = await db.collection("teacher_groups").findOne({ id: group_id });
      if (group?.student_ids?.length) {
        const users = await db.collection("users").find({ id: { $in: group.student_ids } }, { projection: { email: 1, first_name: 1 } }).toArray();
        recipients = users;
      }
    } else if (course_id) {
      const enrollments = await db.collection("enrollments").find({ course_id }).toArray();
      const ids = enrollments.map(e => e.user_id || e.student_id);
      const users = await db.collection("users").find({ id: { $in: ids } }, { projection: { email: 1, first_name: 1 } }).toArray();
      recipients = users;
    }

    if (!recipients.length) return res.status(400).json({ detail: "No recipients found" });

    const teacher = await db.collection("users").findOne({ id: req.user.id });
    const senderName = `${teacher.first_name} ${teacher.last_name}`;
    let sent = 0;
    for (const r of recipients) {
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          ${getEmailHeader("Message from your Instructor")}
          <div style="background:white;padding:30px;border-radius:0 0 10px 10px;">
            <p>Dear ${r.first_name || "Student"},</p>
            <div style="background:#f9f9f9;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #0B3B2C;">
              ${body.replace(/\n/g, '<br>')}
            </div>
            <p style="color:#666;font-size:13px;">— ${senderName}, GITB Instructor</p>
          </div>
        </div>`;
      const ok = await sendEmail(r.email, subject, html);
      if (ok) sent++;
    }
    res.json({ sent, total: recipients.length });
  } catch (err) { res.status(500).json({ detail: "Failed to send emails" }); }
});

// Get teacher contract status
app.get("/api/teacher/contract", authenticate, requireRoles(TEACHER_ROLES), async (req, res) => {
  try {
    const teacher = await db.collection("users").findOne({ id: req.user.id }, { projection: { _id: 0, password: 0 } });
    res.json({ has_agreed_terms: teacher?.has_agreed_terms || false, terms_agreed_at: teacher?.terms_agreed_at || null });
  } catch (err) { res.status(500).json({ detail: "Failed to fetch contract status" }); }
});

// Sign employment contract
app.post("/api/teacher/contract/sign", authenticate, requireRoles(TEACHER_ROLES), async (req, res) => {
  try {
    const { signature } = req.body;
    if (!signature) return res.status(400).json({ detail: "Digital signature required" });
    const teacher = await db.collection("users").findOne({ id: req.user.id });
    if (!teacher) return res.status(404).json({ detail: "User not found" });
    const signedAt = new Date().toISOString();
    const contractHtml = generateEmploymentContract(teacher, signedAt);
    await db.collection("users").updateOne(
      { id: req.user.id },
      { $set: { has_agreed_terms: true, terms_agreed_at: signedAt, contract_signature: signature } }
    );
    await db.collection("teacher_contracts").insertOne({
      id: uuidv4(), teacher_id: req.user.id, signature, signed_at: signedAt,
      contract_html: contractHtml, created_at: signedAt
    });
    // Email copy to teacher
    const emailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;">
        ${getEmailHeader("Your Employment Agreement")}
        <div style="background:white;padding:30px;border-radius:0 0 10px 10px;">
          <h2 style="color:#0B3B2C;">Employment Agreement — Signed Copy</h2>
          <p>Dear ${teacher.first_name},</p>
          <p>Thank you for signing your GITB Instructor Employment Agreement. Please find your signed copy below for your records.</p>
          <div style="background:#f9f9f9;padding:20px;border-radius:8px;margin:20px 0;border:1px solid #e0e0e0;">
            ${contractHtml}
          </div>
          <p style="color:#666;font-size:13px;">This is an automated record of your digital signature. Keep this email for your records.</p>
        </div>
      </div>`;
    await sendEmail(teacher.email, "Your GITB Employment Agreement — Signed Copy", emailHtml);
    res.json({ success: true, signed_at: signedAt });
  } catch (err) { console.error("Contract sign error:", err); res.status(500).json({ detail: "Failed to sign contract" }); }
});

// Update teacher professional profile
app.put("/api/teacher/profile", authenticate, requireRoles(TEACHER_ROLES), async (req, res) => {
  try {
    const { first_name, last_name, phone, bio, education, professional_experience, specializations, profilePicture, linkedin_url } = req.body;
    await db.collection("users").updateOne(
      { id: req.user.id },
      { $set: { first_name, last_name, phone, bio, education, professional_experience, specializations, profilePicture, linkedin_url, updated_at: new Date().toISOString() } }
    );
    const updated = await db.collection("users").findOne({ id: req.user.id }, { projection: { _id: 0, password: 0 } });
    res.json(updated);
  } catch (err) { res.status(500).json({ detail: "Failed to update profile" }); }
});

// Bulk quiz upload (JSON array of quizzes)
app.post("/api/teacher/quiz-bulk", authenticate, requireRoles(TEACHER_ROLES), async (req, res) => {
  try {
    const { course_id, quizzes } = req.body;
    if (!course_id || !Array.isArray(quizzes) || !quizzes.length)
      return res.status(400).json({ detail: "course_id and quizzes array required" });
    const created = [];
    for (const q of quizzes) {
      if (!q.title || !Array.isArray(q.questions)) continue;
      const quiz = {
        id: uuidv4(), course_id, title: q.title,
        description: q.description || "",
        time_limit_minutes: q.time_limit_minutes || 30,
        questions: (q.questions || []).map(qq => ({ ...qq, id: qq.id || uuidv4() })),
        created_by: req.user.id, created_at: new Date().toISOString()
      };
      await db.collection("quizzes").insertOne(quiz);
      created.push(quiz);
    }
    res.json({ created: created.length, quizzes: created });
  } catch (err) { res.status(500).json({ detail: "Failed to bulk upload quizzes" }); }
});

// Delete material (teacher)
app.delete("/api/courses/:courseId/materials/:materialId", authenticate, requireRoles(TEACHER_ROLES), async (req, res) => {
  try {
    await db.collection("course_materials").deleteOne({ id: req.params.materialId, course_id: req.params.courseId });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ detail: "Failed to delete material" }); }
});

// Assign a course to a teacher/lecturer
app.post("/api/admin/teachers/:teacherId/assign-course", authenticate, requireRoles(["admin"]), async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { course_id } = req.body;
    if (!course_id) return res.status(400).json({ detail: "course_id is required" });

    const teacher = await db.collection("users").findOne({ id: teacherId });
    if (!teacher) return res.status(404).json({ detail: "Teacher not found" });

    let course = await db.collection("courses").findOne({ id: course_id });
    if (!course) {
      try { course = await db.collection("courses").findOne({ _id: new ObjectId(course_id) }); } catch { }
    }
    if (!course) return res.status(404).json({ detail: "Course not found" });

    const courseIdStr = course.id || course._id.toString();
    const assigned = teacher.assigned_courses || [];
    if (!assigned.includes(courseIdStr)) {
      assigned.push(courseIdStr);
      await db.collection("users").updateOne({ id: teacherId }, { $set: { assigned_courses: assigned } });
    }

    sendCourseAssignmentEmail(teacher, course).catch(e => console.error("Assignment email error:", e));
    res.json({ success: true, assigned_courses: assigned, course_title: course.title });
  } catch (err) {
    console.error("Assign course error:", err);
    res.status(500).json({ detail: "Failed to assign course" });
  }
});

// Remove course assignment from a teacher
app.delete("/api/admin/teachers/:teacherId/courses/:courseId", authenticate, requireRoles(["admin"]), async (req, res) => {
  try {
    const { teacherId, courseId } = req.params;
    const teacher = await db.collection("users").findOne({ id: teacherId });
    if (!teacher) return res.status(404).json({ detail: "Teacher not found" });
    const assigned = (teacher.assigned_courses || []).filter(id => id !== courseId);
    await db.collection("users").updateOne({ id: teacherId }, { $set: { assigned_courses: assigned } });
    res.json({ success: true, assigned_courses: assigned });
  } catch (err) { res.status(500).json({ detail: "Failed to remove course assignment" }); }
});

// Send test emails for all email types
// Alias for test-email (singular)
app.post(["/api/admin/test-emails", "/api/admin/test-email"], authenticate, requireRoles(["admin"]), async (req, res) => {
  const testEmail = req.body.email || "taiwojos2@yahoo.com";
  const results = {};

  results.student_welcome = await sendWelcomeEmail(
    testEmail, "Test", "Student", "Cybersecurity Fundamentals", "TestPass123!", 1200
  );
  results.teacher_welcome = await sendStaffWelcomeEmail(
    testEmail, "Test", "Teacher", "teacher", "TeacherPass456!"
  );
  results.admin_welcome = await sendStaffWelcomeEmail(
    testEmail, "Test", "Admin", "admin", "AdminPass789!"
  );
  const resetHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">${getEmailHeader("Password Reset")}<div style="background:white;padding:30px;border-radius:0 0 10px 10px;"><h2 style="color:#0B3B2C;">Password Reset Request (TEST)</h2><p>This is a test password reset email from GITB.</p><div style="text-align:center;margin:25px 0;"><a href="${FRONTEND_URL}/reset-password?token=test-token-123" style="background:#0B3B2C;color:white;padding:14px 35px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Reset Password</a></div><p style="color:#666;font-size:13px;">This link expires in 1 hour.</p></div></div>`;
  results.password_reset = await sendEmail(testEmail, "Password Reset Request — GITB (TEST)", resetHtml);

  const appHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">${getEmailHeader("Application Received")}<div style="background:white;padding:30px;border-radius:0 0 10px 10px;"><h2 style="color:#0B3B2C;">Application Received (TEST)</h2><p>Dear Test Student,</p><p>Your application for <strong>Cybersecurity Fundamentals</strong> has been received and is under review. You will receive a decision within 3–5 business days.</p><p style="color:#666;margin-bottom:0;">Best regards,<br><strong>GITB Admissions Team</strong></p></div></div>`;
  results.application_received = await sendEmail(testEmail, "Application Received — Cybersecurity Fundamentals | GITB (TEST)", appHtml);

  const mockTeacher = { first_name: "Test", last_name: "Teacher", email: testEmail };
  const mockCourse = { title: "Cybersecurity Fundamentals", description: "Learn ethical hacking and network security.", duration: "6 months" };
  results.course_assignment = await sendCourseAssignmentEmail(mockTeacher, mockCourse);

  res.json({ message: `Test emails sent to ${testEmail}`, results });
});

// Seed the database with the 5 standard GITB courses
app.post("/api/admin/seed-courses", authenticate, requireRoles(["admin", "super_admin"]), async (req, res) => {
  try {
    const { replace = false } = req.body;
    const existing = await db.collection("courses").countDocuments({});

    if (existing > 0 && !replace) {
      return res.status(400).json({
        detail: `Database already has ${existing} courses. Send { replace: true } to overwrite them.`,
        existing
      });
    }

    const GITB_COURSES = [
      {
        id: uuidv4(), slug: "uiux-webflow-design",
        title: "UI/UX & Webflow Design", category: "Design", level: "Beginner",
        duration: "3 Months", image_url: "/images/course-uiux.jpg",
        description: "Master user experience design and build stunning websites with Webflow. Learn to design from wireframe to pixel-perfect prototype, then bring it to life without writing a single line of code.",
        outcomes: ["UI/UX design principles", "Wireframing & prototyping", "Webflow website development", "User research & usability testing"],
        curriculum: [
          { week: "Week 1–2", title: "Foundations of UX", desc: "Design thinking, user research, and empathy mapping." },
          { week: "Week 3–4", title: "UI Fundamentals", desc: "Typography, colour theory, grids, and component systems." },
          { week: "Week 5–6", title: "Figma Prototyping", desc: "High-fidelity wireframes and interactive prototypes." },
          { week: "Week 7–10", title: "Webflow Development", desc: "CMS, animations, responsiveness, and launch." },
          { week: "Week 11–12", title: "Portfolio & Capstone", desc: "Ship a real project and prepare your design portfolio." },
        ],
        certifications: ["GITB Diploma", "Google UX Design Certificate"],
        price: 290, monthly_price: 30, payment_options: ["one_time", "monthly"], is_active: true,
      },
      {
        id: uuidv4(), slug: "identity-access-management",
        title: "Identity & Access Management", category: "Security", level: "Intermediate",
        duration: "3 Months", image_url: "/images/course-iam.jpg",
        description: "Become an IAM specialist. Learn to design and implement identity frameworks, role-based access control, and multi-factor authentication systems used by enterprise organisations globally.",
        outcomes: ["IAM frameworks & policies", "Role-based access control (RBAC)", "Single sign-on (SSO) & MFA", "Compliance & governance (ISO 27001, NIST)"],
        curriculum: [
          { week: "Week 1–2", title: "IAM Foundations", desc: "Core concepts: identity lifecycle, authentication vs authorisation." },
          { week: "Week 3–4", title: "Directory Services", desc: "Active Directory, LDAP, and Azure AD configuration." },
          { week: "Week 5–6", title: "SSO & Federation", desc: "SAML, OAuth 2.0, OpenID Connect in production." },
          { week: "Week 7–9", title: "RBAC & Governance", desc: "Policy design, least-privilege models, compliance auditing." },
          { week: "Week 10–12", title: "Capstone Project", desc: "Design and document an IAM deployment for a mock enterprise." },
        ],
        certifications: ["GITB Diploma", "Certified Identity & Access Manager (CIAM)"],
        price: 290, monthly_price: 30, payment_options: ["one_time", "monthly"], is_active: true,
      },
      {
        id: uuidv4(), slug: "french-spanish-lithuanian",
        title: "French · Spanish · Lithuanian", category: "Language", level: "All Levels",
        duration: "3–6 Months", image_url: "/images/course-languages.jpg",
        description: "Gain professional fluency in French, Spanish, or Lithuanian. From business communication to cultural immersion — our instructors guide you from beginner to certified proficiency.",
        outcomes: ["Beginner to advanced proficiency", "Business & professional communication", "Cultural insights & real-life conversations", "Official language certification prep"],
        curriculum: [
          { week: "Month 1", title: "Core Foundations", desc: "Alphabet, pronunciation, everyday vocabulary and phrases." },
          { week: "Month 2", title: "Grammar & Structure", desc: "Tenses, sentence construction, and reading comprehension." },
          { week: "Month 3", title: "Professional Communication", desc: "Business writing, presentations, and formal conversation." },
          { week: "Month 4–6", title: "Fluency & Certification", desc: "Advanced conversation, exam prep (DELF/DELE/LKI)." },
        ],
        certifications: ["GITB Diploma", "Official Language Certification (DELF, DELE, LKI)"],
        price: 220, monthly_price: 25, payment_options: ["one_time", "monthly"], is_active: true,
      },
      {
        id: uuidv4(), slug: "kyc-compliance",
        title: "KYC & Compliance", category: "Finance", level: "Intermediate",
        duration: "2 Months", image_url: "/images/course-kyc.jpg",
        description: "Master the compliance skills in highest demand across banking and fintech. Learn KYC procedures, AML regulations, and customer due diligence frameworks used by global financial institutions.",
        outcomes: ["KYC & AML regulations", "Customer due diligence", "Risk-based assessment", "Fraud detection & prevention"],
        curriculum: [
          { week: "Week 1–2", title: "Regulatory Landscape", desc: "FATF, EU AMLD, FinCEN — the global compliance framework." },
          { week: "Week 3–4", title: "KYC Procedures", desc: "CDD, EDD, onboarding workflows, and documentation." },
          { week: "Week 5–6", title: "AML & Fraud Detection", desc: "Transaction monitoring, red flags, and SAR filing." },
          { week: "Week 7–8", title: "Capstone & Exam Prep", desc: "Case studies and CKYCA certification preparation." },
        ],
        certifications: ["GITB Diploma", "Certified KYC Analyst (CKYCA)"],
        price: 195, monthly_price: 30, payment_options: ["one_time", "monthly"], is_active: true,
      },
      {
        id: uuidv4(), slug: "cybersecurity-vulnerability-tester",
        title: "Cyber-Security Vulnerability Tester", category: "Security", level: "Intermediate",
        duration: "4 Months", image_url: "/images/course-cybersec.jpg",
        description: "Become a certified penetration tester. Learn ethical hacking, vulnerability assessment, and web & network security testing skills that land jobs at top cybersecurity firms.",
        outcomes: ["Ethical hacking & penetration testing", "Security vulnerability assessment", "Web & network security testing", "Compliance & risk management"],
        curriculum: [
          { week: "Week 1–3", title: "Security Fundamentals", desc: "CIA triad, threat modelling, and attack surfaces." },
          { week: "Week 4–6", title: "Network Penetration", desc: "Reconnaissance, scanning, exploitation with Kali Linux." },
          { week: "Week 7–9", title: "Web App Security", desc: "OWASP Top 10, Burp Suite, and XSS/SQLi labs." },
          { week: "Week 10–12", title: "Reporting & Compliance", desc: "Writing professional pen-test reports, risk frameworks." },
          { week: "Week 13–16", title: "Capstone & Certification", desc: "Full assessment of a live-scope environment. CompTIA PenTest+ prep." },
        ],
        certifications: ["GITB Diploma", "CompTIA PenTest+"],
        price: 340, monthly_price: 35, payment_options: ["one_time", "monthly"], is_active: true,
      },
    ];

    if (replace) await db.collection("courses").deleteMany({});
    const ts = new Date().toISOString();
    for (const c of GITB_COURSES) {
      await db.collection("courses").insertOne({ ...c, created_at: ts, created_by: "seed" });
    }
    res.json({ success: true, inserted: GITB_COURSES.length, courses: GITB_COURSES.map(c => ({ id: c.id, title: c.title })) });
  } catch (error) {
    console.error("Seed courses error:", error);
    res.status(500).json({ detail: error.message });
  }
});

app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ detail: "Not found" });
  } else {
    res.sendFile(path.join(__dirname, "..", "static", "index.html"));
  }
});

// ============ START SERVER ============
async function startServer() {
  try {
    console.log(`Starting server on port ${PORT}...`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

    await connectDB();
    await refreshSystemSettings();

    // Use 0.0.0.0 to bind to all interfaces (required for Render/Docker)
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Database: ${db ? "connected" : "not connected"}`);
      console.log(`✓ Stripe: ${stripe ? "initialized" : "not initialized"}`);
      console.log(`✓ Resend: ${resend ? "initialized" : "disabled"}`);
    });

    // Graceful shutdown handling
    server.on('error', (err) => {
      console.error('Server error:', err);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      }
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
  console.log("SIGTERM received, shutting down gracefully...");
  if (mongoClient) {
    try {
      await mongoClient.close();
      console.log("MongoDB connection closed");
    } catch (err) {
      console.error("Error closing MongoDB:", err);
    }
  }
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  if (mongoClient) {
    try {
      await mongoClient.close();
      console.log("MongoDB connection closed");
    } catch (err) {
      console.error("Error closing MongoDB:", err);
    }
  }
  process.exit(0);
});

startServer();
