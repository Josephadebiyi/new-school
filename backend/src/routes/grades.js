const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireRoles } = require('../middleware/auth');

const router = express.Router();

// Get all grades (admin/lecturer)
router.get('/', authenticate, requireRoles(['admin', 'lecturer', 'registrar']), async (req, res) => {
  try {
    const { course_id, student_id } = req.query;
    const query = {};
    
    if (course_id) query.course_id = course_id;
    if (student_id) query.student_id = student_id;
    
    const grades = await req.db.collection('grades')
      .find(query, { projection: { _id: 0 } })
      .toArray();
    
    res.json(grades);
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get student grades
router.get('/my', authenticate, async (req, res) => {
  try {
    const grades = await req.db.collection('grades')
      .find({ student_id: req.user.id }, { projection: { _id: 0 } })
      .toArray();
    
    // Get course details
    const courseIds = [...new Set(grades.map(g => g.course_id))];
    const courses = await req.db.collection('courses')
      .find({ id: { $in: courseIds } }, { projection: { _id: 0 } })
      .toArray();
    
    const courseMap = {};
    courses.forEach(c => courseMap[c.id] = c);
    
    const enrichedGrades = grades.map(g => ({
      ...g,
      course: courseMap[g.course_id] || null
    }));

    res.json(enrichedGrades);
  } catch (error) {
    console.error('Get my grades error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Submit grade
router.post('/', authenticate, requireRoles(['admin', 'lecturer']), async (req, res) => {
  try {
    const { student_id, course_id, grade, grade_type, comments } = req.body;
    
    const gradeRecord = {
      id: uuidv4(),
      student_id,
      course_id,
      grade,
      grade_type: grade_type || 'final',
      comments: comments || '',
      graded_by: req.user.id,
      created_at: new Date().toISOString()
    };

    await req.db.collection('grades').insertOne(gradeRecord);
    delete gradeRecord._id;
    
    res.json(gradeRecord);
  } catch (error) {
    console.error('Submit grade error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Update grade
router.put('/:gradeId', authenticate, requireRoles(['admin', 'lecturer']), async (req, res) => {
  try {
    const { gradeId } = req.params;
    const updates = req.body;
    
    delete updates._id;
    delete updates.id;
    updates.updated_at = new Date().toISOString();
    updates.updated_by = req.user.id;

    const result = await req.db.collection('grades').updateOne(
      { id: gradeId },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ detail: 'Grade not found' });
    }

    const grade = await req.db.collection('grades').findOne(
      { id: gradeId },
      { projection: { _id: 0 } }
    );

    res.json(grade);
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Delete grade
router.delete('/:gradeId', authenticate, requireRoles(['admin']), async (req, res) => {
  try {
    const { gradeId } = req.params;
    
    const result = await req.db.collection('grades').deleteOne({ id: gradeId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: 'Grade not found' });
    }

    res.json({ message: 'Grade deleted' });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

module.exports = router;
