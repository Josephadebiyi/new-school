require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS === '*' ? '*' : process.env.CORS_ORIGINS?.split(','),
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// MongoDB Connection
let db;
const mongoClient = new MongoClient(process.env.MONGO_URL);

async function connectDB() {
  try {
    await mongoClient.connect();
    db = mongoClient.db(process.env.DB_NAME);
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Make db available to routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const applicationRoutes = require('./routes/applications');
const enrollmentRoutes = require('./routes/enrollments');
const systemRoutes = require('./routes/system');
const dashboardRoutes = require('./routes/dashboard');
const moduleRoutes = require('./routes/modules');
const gradeRoutes = require('./routes/grades');
const transactionRoutes = require('./routes/transactions');
const uploadRoutes = require('./routes/uploads');

// API Routes - all prefixed with /api
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/system-config', systemRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'GITB LMS API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    detail: err.message || 'Internal server error'
  });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;
