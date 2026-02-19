const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const { sendForgotPasswordEmail, sendPasswordChangedEmail } = require('../services/email');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'lumina-lms-secret-key';
const JWT_EXPIRATION = '24h';

// Helper to get system config
const getSystemConfig = async (db) => {
  let config = await db.collection('system_config').findOne({}, { projection: { _id: 0 } });
  if (!config) {
    config = {
      university_name: 'GITB - Student LMS',
      logo_url: '',
      favicon_url: '',
      primary_color: '#0F172A',
      secondary_color: '#D32F2F',
      support_email: '',
      support_phone: ''
    };
    await db.collection('system_config').insertOne(config);
  }
  return config;
};

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(422).json({ detail: 'Email and password are required' });
    }

    const user = await req.db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(401).json({ detail: 'Account is inactive' });
    }

    // Get user ID
    const userId = user.id || user._id.toString();
    
    // Generate token
    const token = jwt.sign(
      { sub: userId, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    // Prepare user response
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
      account_status: user.account_status || 'active',
      payment_status: user.payment_status || 'unpaid'
    };

    const systemConfig = await getSystemConfig(req.db);

    res.json({
      access_token: token,
      token_type: 'bearer',
      user: userResponse,
      system_config: systemConfig
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(422).json({ detail: 'Email is required' });
    }

    const user = await req.db.collection('users').findOne({ email });
    
    // Always return success for security
    if (!user) {
      return res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
    }

    const userId = user.id || user._id.toString();
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await req.db.collection('password_resets').updateOne(
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

    await sendForgotPasswordEmail(email, user.first_name, resetToken);

    res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body;
    
    if (!token || !new_password) {
      return res.status(422).json({ detail: 'Token and new password are required' });
    }

    const resetRecord = await req.db.collection('password_resets').findOne({ token });
    if (!resetRecord) {
      return res.status(400).json({ detail: 'Invalid or expired reset token' });
    }

    const expiry = new Date(resetRecord.expires_at);
    if (new Date() > expiry) {
      await req.db.collection('password_resets').deleteOne({ token });
      return res.status(400).json({ detail: 'Reset token has expired' });
    }

    // Find user
    const user = await req.db.collection('users').findOne({ id: resetRecord.user_id });
    if (!user) {
      return res.status(400).json({ detail: 'User not found' });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(new_password, 12);
    await req.db.collection('users').updateOne(
      { id: user.id },
      { $set: { password: hashedPassword, must_change_password: false } }
    );

    // Delete reset token
    await req.db.collection('password_resets').deleteOne({ token });

    // Send confirmation email
    await sendPasswordChangedEmail(user.email, user.first_name);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Change Password (authenticated)
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    
    if (!current_password || !new_password) {
      return res.status(422).json({ detail: 'Current and new password are required' });
    }

    const user = await req.db.collection('users').findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(current_password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ detail: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 12);
    await req.db.collection('users').updateOne(
      { id: user.id },
      { $set: { password: hashedPassword, must_change_password: false } }
    );

    await sendPasswordChangedEmail(user.email, user.first_name);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const systemConfig = await getSystemConfig(req.db);
    
    // Check access
    let access = { allowed: true, reason: null, message: null };
    if (req.user.account_status === 'expelled') {
      access = { allowed: false, reason: 'expelled', message: 'Your account has been expelled. Please contact the Administrator.' };
    } else if (req.user.account_status === 'locked') {
      access = { allowed: false, reason: 'locked', message: 'Limited Access: Please contact the Administrator.' };
    } else if (req.user.role === 'student' && req.user.payment_status === 'unpaid') {
      access = { allowed: false, reason: 'unpaid', message: 'Please complete your payment to access course content.' };
    }

    res.json({
      ...req.user,
      access,
      system_config: systemConfig
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Check access
router.get('/check-access', authenticate, async (req, res) => {
  let access = { allowed: true, reason: null, message: null };
  
  if (req.user.account_status === 'expelled') {
    access = { allowed: false, reason: 'expelled', message: 'Your account has been expelled. Please contact the Administrator.' };
  } else if (req.user.account_status === 'locked') {
    access = { allowed: false, reason: 'locked', message: 'Limited Access: Please contact the Administrator.' };
  } else if (req.user.role === 'student' && req.user.payment_status === 'unpaid') {
    access = { allowed: false, reason: 'unpaid', message: 'Please complete your payment to access course content.' };
  }

  res.json(access);
});

module.exports = router;
