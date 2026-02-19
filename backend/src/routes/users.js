const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireRoles } = require('../middleware/auth');

const router = express.Router();

// Generate student ID
const generateStudentId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `STU${year}${random}`;
};

// Get all users
router.get('/', authenticate, requireRoles(['admin', 'registrar']), async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    
    const users = await req.db.collection('users')
      .find(query, { projection: { password: 0, _id: 0 } })
      .toArray();
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Create user
router.post('/', authenticate, requireRoles(['admin']), async (req, res) => {
  try {
    const { email, password, first_name, last_name, role, department, program, level, phone } = req.body;
    
    // Check if email exists
    const existing = await req.db.collection('users').findOne({ email });
    if (existing) {
      return res.status(400).json({ detail: 'Email already registered' });
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
      account_status: 'active',
      payment_status: 'unpaid',
      enrolled_courses: [],
      completed_lessons: [],
      created_at: new Date().toISOString()
    };

    if (role === 'student') {
      newUser.student_id = generateStudentId();
    }

    await req.db.collection('users').insertOne(newUser);
    
    // Remove password from response
    delete newUser.password;
    delete newUser._id;
    
    res.json(newUser);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check permissions
    if (!['admin', 'registrar'].includes(req.user.role) && req.user.id !== userId) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const user = await req.db.collection('users').findOne(
      { id: userId },
      { projection: { password: 0, _id: 0 } }
    );
    
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Update user
router.put('/:userId', authenticate, requireRoles(['admin', 'registrar']), async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates.password;
    delete updates.id;
    delete updates._id;
    delete updates.email;

    const result = await req.db.collection('users').updateOne(
      { id: userId },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ detail: 'User not found' });
    }

    const user = await req.db.collection('users').findOne(
      { id: userId },
      { projection: { password: 0, _id: 0 } }
    );

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Lock user
router.put('/:userId/lock', authenticate, requireRoles(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await req.db.collection('users').updateOne(
      { id: userId },
      { $set: { account_status: 'locked' } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ detail: 'User not found' });
    }

    res.json({ message: 'User account locked' });
  } catch (error) {
    console.error('Lock user error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Unlock user
router.put('/:userId/unlock', authenticate, requireRoles(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await req.db.collection('users').updateOne(
      { id: userId },
      { $set: { account_status: 'active' } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ detail: 'User not found' });
    }

    res.json({ message: 'User account unlocked' });
  } catch (error) {
    console.error('Unlock user error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Expel student
router.put('/:userId/expel', authenticate, requireRoles(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await req.db.collection('users').findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    if (user.role !== 'student') {
      return res.status(400).json({ detail: 'Only students can be expelled' });
    }

    await req.db.collection('users').updateOne(
      { id: userId },
      { $set: { account_status: 'expelled', is_active: false } }
    );

    res.json({ message: 'Student has been expelled' });
  } catch (error) {
    console.error('Expel user error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Reinstate student
router.put('/:userId/reinstate', authenticate, requireRoles(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await req.db.collection('users').updateOne(
      { id: userId },
      { $set: { account_status: 'active', is_active: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ detail: 'User not found' });
    }

    res.json({ message: 'Student has been reinstated' });
  } catch (error) {
    console.error('Reinstate user error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Delete user
router.delete('/:userId', authenticate, requireRoles(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await req.db.collection('users').deleteOne({ id: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

module.exports = router;
