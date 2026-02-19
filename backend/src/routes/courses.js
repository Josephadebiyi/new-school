const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireRoles } = require('../middleware/auth');

const router = express.Router();

// Get all courses (admin)
router.get('/', authenticate, async (req, res) => {
  try {
    const courses = await req.db.collection('courses')
      .find({}, { projection: { _id: 0 } })
      .toArray();
    
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get public courses
router.get('/public', async (req, res) => {
  try {
    const courses = await req.db.collection('courses')
      .find({ is_active: true }, { projection: { _id: 0 } })
      .toArray();
    
    res.json(courses);
  } catch (error) {
    console.error('Get public courses error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get single public course
router.get('/public/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Try by id first, then by slug
    let course = await req.db.collection('courses').findOne(
      { id: courseId, is_active: true },
      { projection: { _id: 0 } }
    );
    
    if (!course) {
      course = await req.db.collection('courses').findOne(
        { slug: courseId, is_active: true },
        { projection: { _id: 0 } }
      );
    }
    
    if (!course) {
      return res.status(404).json({ detail: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get public course error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Create course
router.post('/', authenticate, requireRoles(['admin']), async (req, res) => {
  try {
    const courseData = req.body;
    
    const newCourse = {
      id: uuidv4(),
      code: courseData.code,
      slug: courseData.slug || courseData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: courseData.title,
      subtitle: courseData.subtitle || '',
      description: courseData.description,
      overview: courseData.overview || '',
      department: courseData.department,
      category: courseData.category || courseData.department,
      level: courseData.level || 100,
      level_text: courseData.level_text || 'Beginner',
      duration_value: courseData.duration_value || 3,
      duration_unit: courseData.duration_unit || 'months',
      price: courseData.price || 0,
      currency: courseData.currency || 'EUR',
      image_url: courseData.image_url || '',
      units: courseData.units || 0,
      semester: courseData.semester || 1,
      course_type: courseData.course_type || 'DIPLOMA',
      curriculum: courseData.curriculum || [],
      outcomes: courseData.outcomes || [],
      certifications: courseData.certifications || [],
      requirements: courseData.requirements || [],
      total_lessons: courseData.total_lessons || 0,
      is_active: true,
      created_at: new Date().toISOString(),
      created_by: req.user.id
    };

    await req.db.collection('courses').insertOne(newCourse);
    delete newCourse._id;
    
    res.json(newCourse);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get course by ID
router.get('/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    let course = await req.db.collection('courses').findOne(
      { id: courseId },
      { projection: { _id: 0 } }
    );
    
    if (!course) {
      course = await req.db.collection('courses').findOne(
        { slug: courseId },
        { projection: { _id: 0 } }
      );
    }
    
    if (!course) {
      return res.status(404).json({ detail: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Update course
router.put('/:courseId', authenticate, requireRoles(['admin']), async (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = req.body;
    
    delete updates._id;
    delete updates.id;
    updates.updated_at = new Date().toISOString();

    const result = await req.db.collection('courses').updateOne(
      { id: courseId },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ detail: 'Course not found' });
    }

    const course = await req.db.collection('courses').findOne(
      { id: courseId },
      { projection: { _id: 0 } }
    );

    res.json(course);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Delete course
router.delete('/:courseId', authenticate, requireRoles(['admin']), async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const result = await req.db.collection('courses').deleteOne({ id: courseId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get course students
router.get('/:courseId/students', authenticate, requireRoles(['admin', 'lecturer']), async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const enrollments = await req.db.collection('enrollments')
      .find({ course_id: courseId })
      .toArray();
    
    const studentIds = enrollments.map(e => e.student_id);
    
    const students = await req.db.collection('users')
      .find({ id: { $in: studentIds }, role: 'student' }, { projection: { password: 0, _id: 0 } })
      .toArray();

    res.json(students);
  } catch (error) {
    console.error('Get course students error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get course modules
router.get('/:courseId/modules', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const modules = await req.db.collection('modules')
      .find({ course_id: courseId }, { projection: { _id: 0 } })
      .sort({ order: 1 })
      .toArray();

    res.json(modules);
  } catch (error) {
    console.error('Get course modules error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

module.exports = router;
