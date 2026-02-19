const express = require('express');
const { authenticate, requireRoles } = require('../middleware/auth');

const router = express.Router();

// Admin dashboard stats
router.get('/admin', authenticate, requireRoles(['admin']), async (req, res) => {
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
      req.db.collection('users').countDocuments({ role: 'student' }),
      req.db.collection('users').countDocuments({ role: 'lecturer' }),
      req.db.collection('courses').countDocuments({}),
      req.db.collection('courses').countDocuments({ is_active: true }),
      req.db.collection('applications').countDocuments({ status: 'pending' }),
      req.db.collection('users').countDocuments({ account_status: 'locked' }),
      req.db.collection('users').countDocuments({ role: 'student', payment_status: 'unpaid' }),
      req.db.collection('users').countDocuments({}),
      req.db.collection('users')
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
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Student dashboard stats
router.get('/student', authenticate, async (req, res) => {
  try {
    const enrollments = await req.db.collection('enrollments')
      .find({ student_id: req.user.id }, { projection: { _id: 0 } })
      .toArray();

    const courseIds = enrollments.map(e => e.course_id);
    
    // Get course details
    const courses = await req.db.collection('courses')
      .find({ id: { $in: courseIds } }, { projection: { _id: 0 } })
      .toArray();

    // Calculate totals
    let totalLessons = 0;
    let completedLessons = req.user.completed_lessons?.length || 0;
    
    courses.forEach(c => {
      totalLessons += c.total_lessons || 0;
    });

    // Get modules count
    const modules = await req.db.collection('modules')
      .find({ course_id: { $in: courseIds } })
      .toArray();

    // Calculate quizzes
    let totalQuizzes = 0;
    modules.forEach(m => {
      if (m.lessons) {
        m.lessons.forEach(l => {
          if (l.type === 'quiz') totalQuizzes++;
        });
      }
    });

    // Calculate study time (rough estimate)
    const studyMinutes = completedLessons * 15;

    res.json({
      enrolled_courses: courses.length,
      total_lessons: totalLessons,
      completed_lessons: completedLessons,
      total_quizzes: totalQuizzes,
      study_minutes: studyMinutes,
      courses: courses.map(c => ({
        ...c,
        enrollment: enrollments.find(e => e.course_id === c.id)
      })),
      streak_days: 7 // Placeholder
    });
  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Lecturer dashboard stats
router.get('/lecturer', authenticate, requireRoles(['lecturer']), async (req, res) => {
  try {
    // Get courses assigned to lecturer
    const courses = await req.db.collection('courses')
      .find({ lecturer_id: req.user.id }, { projection: { _id: 0 } })
      .toArray();

    const courseIds = courses.map(c => c.id);

    // Get students in those courses
    const enrollments = await req.db.collection('enrollments')
      .find({ course_id: { $in: courseIds } })
      .toArray();

    const studentIds = [...new Set(enrollments.map(e => e.student_id))];
    const students = await req.db.collection('users')
      .find({ id: { $in: studentIds } }, { projection: { password: 0, _id: 0 } })
      .toArray();

    // Get pending grades
    const pendingGrades = await req.db.collection('grades')
      .countDocuments({ course_id: { $in: courseIds }, status: 'pending' });

    res.json({
      my_courses: courses.length,
      total_students: students.length,
      pending_grades: pendingGrades,
      upcoming_classes: 0,
      courses,
      recent_students: students.slice(0, 5)
    });
  } catch (error) {
    console.error('Get lecturer dashboard error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

module.exports = router;
