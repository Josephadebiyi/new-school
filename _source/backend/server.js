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

const app = express();

// Configuration with fallbacks
const PORT = process.env.PORT || 8001;
const MONGO_URL = process.env.MONGO_URL || process.env.MONGO_URI || "";
const DB_NAME = process.env.DB_NAME || "gitb_lms";
const JWT_SECRET = process.env.JWT_SECRET || "default-jwt-secret-change-in-production";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://gitb.lt";
const CORS_ORIGINS = process.env.CORS_ORIGINS || "*";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "noreply@gitb.lt";
const APPLICATION_FEE = parseFloat(process.env.APPLICATION_FEE_EUR || "50");

// Initialize services with error handling
let stripe = null;
let resend = null;

try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
} catch (err) {
  console.warn("Stripe initialization failed:", err.message);
}

try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
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

// Health check - root route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// API health check
app.get("/api", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "GITB LMS API is running",
    database: db ? "connected" : "disconnected"
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
      } catch (e) {
        // Invalid ObjectId
      }
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

// ============ EMAIL FUNCTIONS ============
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

    const userResponse = {
      id: userId,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      department: user.department || null,
      program: user.program || null,
      level: user.level || null,
      student_id: user.student_id || null,
      phone: user.phone || null,
      is_active: user.is_active,
      account_status: user.account_status || "active",
      payment_status: user.payment_status || "unpaid"
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
        <h2>Password Reset Request</h2>
        <p>Hello ${user.first_name},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #3d7a4a; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link expires in 1 hour.</p>
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

    const hashedPassword = await bcrypt.hash(new_password, 12);
    
    await db.collection("users").updateOne(
      { $or: [{ id: resetRecord.user_id }, { _id: new ObjectId(resetRecord.user_id) }] },
      { $set: { password: hashedPassword, must_change_password: false } }
    );

    await db.collection("password_resets").deleteOne({ token });

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

app.get("/api/auth/check-access", authenticate, (req, res) => {
  let access = { allowed: true, reason: null, message: null };

  if (req.user.account_status === "expelled") {
    access = { allowed: false, reason: "expelled", message: "Your account has been expelled." };
  } else if (req.user.account_status === "locked") {
    access = { allowed: false, reason: "locked", message: "Limited Access." };
  } else if (req.user.role === "student" && req.user.payment_status === "unpaid") {
    access = { allowed: false, reason: "unpaid", message: "Please complete your payment." };
  }

  res.json(access);
});

// ============ USER ROUTES ============
app.get("/api/users", authenticate, requireRoles(["admin", "registrar"]), async (req, res) => {
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
    const { email, password, first_name, last_name, role, department, program, level, phone } = req.body;

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
      department: department || null,
      program: program || null,
      level: level || null,
      phone: phone || null,
      is_active: true,
      account_status: "active",
      payment_status: "unpaid",
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

    if (!["admin", "registrar"].includes(req.user.role) && req.user.id !== userId) {
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

    delete updates.password;
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
      level: courseData.level || 100,
      level_text: courseData.level_text || "Beginner",
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

    const result = await db.collection("courses").updateOne({ id: courseId }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ detail: "Course not found" });
    }

    const course = await db.collection("courses").findOne({ id: courseId }, { projection: { _id: 0 } });
    res.json(course);
  } catch (error) {
    console.error("Update course error:", error);
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

app.get("/api/courses/:courseId/modules", authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const modules = await db.collection("modules")
      .find({ course_id: courseId }, { projection: { _id: 0 } })
      .sort({ order: 1 })
      .toArray();
    res.json(modules);
  } catch (error) {
    console.error("Get course modules error:", error);
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
      return res.status(422).json({ detail: "Missing required fields" });
    }

    let course = await db.collection("courses").findOne({ id: course_id });
    if (!course) {
      course = await db.collection("courses").findOne({ slug: course_id });
    }
    if (!course) {
      return res.status(404).json({ detail: "Course not found" });
    }

    const existingApp = await db.collection("applications").findOne({
      email,
      course_id: course.id,
      status: { $in: ["pending", "approved"] }
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
            message: "Application submitted successfully!"
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

app.get("/api/applications", authenticate, requireRoles(["admin", "registrar"]), async (req, res) => {
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

app.get("/api/applications/:applicationId", authenticate, requireRoles(["admin", "registrar"]), async (req, res) => {
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

    if (existingUser) {
      await db.collection("users").updateOne(
        { email: application.email },
        {
          $addToSet: { enrolled_courses: application.course_id },
          $set: {
            payment_status: "paid",
            password: hashedPassword,
            must_change_password: true
          }
        }
      );
    } else {
      const newUser = {
        id: uuidv4(),
        email: application.email,
        password: hashedPassword,
        first_name: application.first_name,
        last_name: application.last_name,
        role: "student",
        student_id: generateStudentId(),
        phone: application.phone,
        department: null,
        program: application.course_title,
        level: 100,
        is_active: true,
        account_status: "active",
        payment_status: "paid",
        must_change_password: true,
        enrolled_courses: [application.course_id],
        completed_lessons: [],
        created_at: new Date().toISOString()
      };

      await db.collection("users").insertOne(newUser);
    }

    const studentUser = await db.collection("users").findOne({ email: application.email });

    const enrollment = {
      id: uuidv4(),
      student_id: studentUser.id,
      course_id: application.course_id,
      enrolled_at: new Date().toISOString(),
      status: "active",
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

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3d7a4a;">Congratulations, ${application.first_name}!</h2>
        <p>Your application to <strong>${application.course_title}</strong> has been approved!</p>
        <p><strong>Login Credentials:</strong></p>
        <p>Email: ${application.email}<br>Temporary Password: <strong>${tempPassword}</strong></p>
        <p>Please change your password after first login.</p>
        <a href="${FRONTEND_URL}/login" style="display: inline-block; padding: 12px 24px; background: #3d7a4a; color: white; text-decoration: none; border-radius: 5px;">Login Now</a>
      </div>
    `;

    await sendEmail(application.email, `Welcome to GITB - ${application.course_title}`, html);

    res.json({
      message: "Application approved successfully",
      student_email: application.email,
      temp_password: tempPassword
    });
  } catch (error) {
    console.error("Approve application error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

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
        <h2>Application Update</h2>
        <p>Dear ${application.first_name},</p>
        <p>We regret to inform you that your application to <strong>${application.course_title}</strong> was not successful.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
        <p>We encourage you to apply again in the future.</p>
      </div>
    `;

    await sendEmail(application.email, `Application Update - ${application.course_title}`, html);

    res.json({ message: "Application rejected" });
  } catch (error) {
    console.error("Reject application error:", error);
    res.status(500).json({ detail: "Internal server error" });
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

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    detail: err.message || "Internal server error"
  });
});

// Handle 404
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

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down...");
  if (mongoClient) {
    await mongoClient.close();
  }
  process.exit(0);
});

startServer();
