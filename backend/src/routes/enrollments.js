const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireRoles } = require('../middleware/auth');

const router = express.Router();

// Get all enrollments
router.get('/', authenticate, requireRoles(['admin', 'registrar']), async (req, res) => {
  try {
    const enrollments = await req.db.collection('enrollments')
      .find({}, { projection: { _id: 0 } })
      .toArray();
    
    res.json(enrollments);
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get student enrollments
router.get('/my', authenticate, async (req, res) => {
  try {
    const enrollments = await req.db.collection('enrollments')
      .find({ student_id: req.user.id }, { projection: { _id: 0 } })
      .toArray();
    
    // Get course details for each enrollment
    const courseIds = enrollments.map(e => e.course_id);
    const courses = await req.db.collection('courses')
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
    console.error('Get my enrollments error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Create enrollment (admin)
router.post('/', authenticate, requireRoles(['admin', 'registrar']), async (req, res) => {
  try {
    const { student_id, course_id } = req.body;
    
    // Check if student exists
    const student = await req.db.collection('users').findOne({ id: student_id, role: 'student' });
    if (!student) {
      return res.status(404).json({ detail: 'Student not found' });
    }

    // Check if course exists
    const course = await req.db.collection('courses').findOne({ id: course_id });
    if (!course) {
      return res.status(404).json({ detail: 'Course not found' });
    }

    // Check for existing enrollment
    const existing = await req.db.collection('enrollments').findOne({ student_id, course_id });
    if (existing) {
      return res.status(400).json({ detail: 'Student is already enrolled in this course' });
    }

    const enrollment = {
      id: uuidv4(),
      student_id,
      course_id,
      enrolled_at: new Date().toISOString(),
      status: 'active',
      progress: 0
    };

    await req.db.collection('enrollments').insertOne(enrollment);
    
    // Update user's enrolled courses
    await req.db.collection('users').updateOne(
      { id: student_id },
      { $addToSet: { enrolled_courses: course_id } }
    );

    delete enrollment._id;
    res.json(enrollment);
  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Update enrollment progress
router.put('/:enrollmentId/progress', authenticate, async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { progress, completed_lessons } = req.body;
    
    const enrollment = await req.db.collection('enrollments').findOne({ id: enrollmentId });
    if (!enrollment) {
      return res.status(404).json({ detail: 'Enrollment not found' });
    }

    // Verify ownership or admin
    if (enrollment.student_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ detail: 'Access denied' });
    }

    const updates = {};
    if (progress !== undefined) updates.progress = progress;
    if (completed_lessons) updates.completed_lessons = completed_lessons;
    updates.updated_at = new Date().toISOString();

    await req.db.collection('enrollments').updateOne(
      { id: enrollmentId },
      { $set: updates }
    );

    res.json({ message: 'Progress updated' });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Delete enrollment
router.delete('/:enrollmentId', authenticate, requireRoles(['admin']), async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    
    const enrollment = await req.db.collection('enrollments').findOne({ id: enrollmentId });
    if (!enrollment) {
      return res.status(404).json({ detail: 'Enrollment not found' });
    }

    await req.db.collection('enrollments').deleteOne({ id: enrollmentId });
    
    // Remove from user's enrolled courses
    await req.db.collection('users').updateOne(
      { id: enrollment.student_id },
      { $pull: { enrolled_courses: enrollment.course_id } }
    );

    res.json({ message: 'Enrollment deleted' });
  } catch (error) {
    console.error('Delete enrollment error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

module.exports = router;
