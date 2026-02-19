const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireRoles } = require('../middleware/auth');

const router = express.Router();

// Get modules for a course
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const modules = await req.db.collection('modules')
      .find({ course_id: courseId }, { projection: { _id: 0 } })
      .sort({ order: 1 })
      .toArray();

    res.json(modules);
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Create module
router.post('/', authenticate, requireRoles(['admin', 'lecturer']), async (req, res) => {
  try {
    const { course_id, title, description, order } = req.body;
    
    const module = {
      id: uuidv4(),
      course_id,
      title,
      description: description || '',
      order: order || 0,
      lessons: [],
      is_published: false,
      created_at: new Date().toISOString()
    };

    await req.db.collection('modules').insertOne(module);
    delete module._id;
    
    res.json(module);
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get single module
router.get('/:moduleId', authenticate, async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    const module = await req.db.collection('modules').findOne(
      { id: moduleId },
      { projection: { _id: 0 } }
    );
    
    if (!module) {
      return res.status(404).json({ detail: 'Module not found' });
    }

    res.json(module);
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Update module
router.put('/:moduleId', authenticate, requireRoles(['admin', 'lecturer']), async (req, res) => {
  try {
    const { moduleId } = req.params;
    const updates = req.body;
    
    delete updates._id;
    delete updates.id;
    updates.updated_at = new Date().toISOString();

    const result = await req.db.collection('modules').updateOne(
      { id: moduleId },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ detail: 'Module not found' });
    }

    const module = await req.db.collection('modules').findOne(
      { id: moduleId },
      { projection: { _id: 0 } }
    );

    res.json(module);
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Delete module
router.delete('/:moduleId', authenticate, requireRoles(['admin']), async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    const result = await req.db.collection('modules').deleteOne({ id: moduleId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: 'Module not found' });
    }

    res.json({ message: 'Module deleted' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Add lesson to module
router.post('/:moduleId/lessons', authenticate, requireRoles(['admin', 'lecturer']), async (req, res) => {
  try {
    const { moduleId } = req.params;
    const lessonData = req.body;
    
    const lesson = {
      id: uuidv4(),
      title: lessonData.title,
      type: lessonData.type || 'video',
      content: lessonData.content || '',
      video_url: lessonData.video_url || null,
      duration: lessonData.duration || 0,
      order: lessonData.order || 0,
      is_published: false,
      created_at: new Date().toISOString()
    };

    await req.db.collection('modules').updateOne(
      { id: moduleId },
      { $push: { lessons: lesson } }
    );

    // Update course total lessons count
    const module = await req.db.collection('modules').findOne({ id: moduleId });
    if (module) {
      const totalLessons = await req.db.collection('modules')
        .aggregate([
          { $match: { course_id: module.course_id } },
          { $project: { lessonCount: { $size: { $ifNull: ['$lessons', []] } } } },
          { $group: { _id: null, total: { $sum: '$lessonCount' } } }
        ])
        .toArray();
      
      const count = totalLessons[0]?.total || 0;
      await req.db.collection('courses').updateOne(
        { id: module.course_id },
        { $set: { total_lessons: count } }
      );
    }

    res.json(lesson);
  } catch (error) {
    console.error('Add lesson error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Complete lesson
router.post('/:moduleId/lessons/:lessonId/complete', authenticate, async (req, res) => {
  try {
    const { moduleId, lessonId } = req.params;
    
    // Add to user's completed lessons
    await req.db.collection('users').updateOne(
      { id: req.user.id },
      { $addToSet: { completed_lessons: lessonId } }
    );

    // Update enrollment progress
    const module = await req.db.collection('modules').findOne({ id: moduleId });
    if (module) {
      const enrollment = await req.db.collection('enrollments').findOne({
        student_id: req.user.id,
        course_id: module.course_id
      });

      if (enrollment) {
        // Calculate progress
        const course = await req.db.collection('courses').findOne({ id: module.course_id });
        const completedCount = (await req.db.collection('users').findOne({ id: req.user.id })).completed_lessons?.length || 0;
        const progress = course?.total_lessons ? Math.round((completedCount / course.total_lessons) * 100) : 0;

        await req.db.collection('enrollments').updateOne(
          { id: enrollment.id },
          { $set: { progress, last_activity: new Date().toISOString() } }
        );
      }
    }

    res.json({ message: 'Lesson completed' });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

module.exports = router;
