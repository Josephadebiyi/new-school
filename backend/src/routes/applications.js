const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const Stripe = require('stripe');
const { authenticate, requireRoles } = require('../middleware/auth');
const { sendApplicationReceivedEmail, sendApplicationApprovedEmail, sendApplicationRejectedEmail } = require('../services/email');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const APPLICATION_FEE = parseFloat(process.env.APPLICATION_FEE_EUR || '50');
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://gitb.lt';

// Generate student ID
const generateStudentId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `STU${year}${random}`;
};

// Generate random password
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Create application and Stripe checkout
router.post('/create', async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, course_id,
      country, city, address, date_of_birth,
      identification_url, high_school_certificate_url,
      origin_url
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !course_id) {
      return res.status(422).json({ detail: 'Missing required fields' });
    }

    // Check if course exists
    let course = await req.db.collection('courses').findOne({ id: course_id });
    if (!course) {
      course = await req.db.collection('courses').findOne({ slug: course_id });
    }
    if (!course) {
      return res.status(404).json({ detail: 'Course not found' });
    }

    // Check for existing application
    const existingApp = await req.db.collection('applications').findOne({
      email,
      course_id: course.id,
      status: { $in: ['pending', 'approved'] }
    });
    
    if (existingApp) {
      return res.status(400).json({ detail: 'You already have an application for this course' });
    }

    const applicationId = uuidv4();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Application Fee - ${course.title}`,
            description: `Application fee for ${course.title} at GITB`
          },
          unit_amount: Math.round(APPLICATION_FEE * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
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

    // Create application record
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
      status: 'pending_payment',
      stripe_session_id: session.id,
      payment_status: 'pending',
      payment_amount: APPLICATION_FEE,
      created_at: new Date().toISOString()
    };

    await req.db.collection('applications').insertOne(application);

    res.json({
      checkout_url: session.url,
      session_id: session.id,
      application_id: applicationId
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ detail: error.message || 'Internal server error' });
  }
});

// Stripe webhook
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    // For now, parse the body directly (in production, use webhook secret verification)
    event = JSON.parse(req.body.toString());

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const applicationId = session.metadata?.application_id;

      if (applicationId) {
        await req.db.collection('applications').updateOne(
          { id: applicationId },
          {
            $set: {
              status: 'pending',
              payment_status: 'paid',
              paid_at: new Date().toISOString(),
              stripe_payment_intent: session.payment_intent
            }
          }
        );

        // Send confirmation email
        const app = await req.db.collection('applications').findOne({ id: applicationId });
        if (app) {
          await sendApplicationReceivedEmail(
            app.email,
            app.first_name,
            app.last_name,
            app.course_title,
            applicationId
          );
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ detail: error.message });
  }
});

// Check application status by session ID
router.get('/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const application = await req.db.collection('applications').findOne(
      { stripe_session_id: sessionId },
      { projection: { _id: 0 } }
    );
    
    if (!application) {
      // Check Stripe session directly
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === 'paid' && session.metadata?.application_id) {
          // Update application
          await req.db.collection('applications').updateOne(
            { id: session.metadata.application_id },
            {
              $set: {
                status: 'pending',
                payment_status: 'paid',
                paid_at: new Date().toISOString()
              }
            }
          );
          
          const app = await req.db.collection('applications').findOne(
            { id: session.metadata.application_id },
            { projection: { _id: 0 } }
          );
          
          if (app) {
            await sendApplicationReceivedEmail(
              app.email,
              app.first_name,
              app.last_name,
              app.course_title,
              app.id
            );
          }
          
          return res.json({ 
            status: 'pending', 
            payment_status: 'paid',
            message: 'Application submitted successfully!'
          });
        }
        
        return res.json({ status: 'pending_payment', payment_status: session.payment_status });
      } catch (e) {
        return res.status(404).json({ detail: 'Application not found' });
      }
    }

    res.json({
      status: application.status,
      payment_status: application.payment_status,
      course_title: application.course_title
    });
  } catch (error) {
    console.error('Check status error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get all applications (admin)
router.get('/', authenticate, requireRoles(['admin', 'registrar']), async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    
    const applications = await req.db.collection('applications')
      .find(query, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .toArray();
    
    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get single application
router.get('/:applicationId', authenticate, requireRoles(['admin', 'registrar']), async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await req.db.collection('applications').findOne(
      { id: applicationId },
      { projection: { _id: 0 } }
    );
    
    if (!application) {
      return res.status(404).json({ detail: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Approve application
router.post('/:applicationId/approve', authenticate, requireRoles(['admin', 'registrar']), async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await req.db.collection('applications').findOne({ id: applicationId });
    if (!application) {
      return res.status(404).json({ detail: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ detail: 'Application is not pending' });
    }

    // Check if user already exists
    let existingUser = await req.db.collection('users').findOne({ email: application.email });
    
    const tempPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    
    if (existingUser) {
      // Add course to existing user
      await req.db.collection('users').updateOne(
        { email: application.email },
        { 
          $addToSet: { enrolled_courses: application.course_id },
          $set: { 
            payment_status: 'paid',
            password: hashedPassword,
            must_change_password: true
          }
        }
      );
    } else {
      // Create new student account
      const newUser = {
        id: uuidv4(),
        email: application.email,
        password: hashedPassword,
        first_name: application.first_name,
        last_name: application.last_name,
        role: 'student',
        student_id: generateStudentId(),
        phone: application.phone,
        department: null,
        program: application.course_title,
        level: 100,
        is_active: true,
        account_status: 'active',
        payment_status: 'paid',
        must_change_password: true,
        enrolled_courses: [application.course_id],
        completed_lessons: [],
        created_at: new Date().toISOString()
      };

      await req.db.collection('users').insertOne(newUser);
    }

    // Create enrollment
    const enrollment = {
      id: uuidv4(),
      student_id: existingUser?.id || (await req.db.collection('users').findOne({ email: application.email })).id,
      course_id: application.course_id,
      enrolled_at: new Date().toISOString(),
      status: 'active',
      progress: 0
    };
    
    await req.db.collection('enrollments').insertOne(enrollment);

    // Update application status
    await req.db.collection('applications').updateOne(
      { id: applicationId },
      { 
        $set: { 
          status: 'approved', 
          approved_by: req.user.id,
          approved_at: new Date().toISOString()
        }
      }
    );

    // Send approval email
    await sendApplicationApprovedEmail(
      application.email,
      application.first_name,
      application.last_name,
      application.course_title,
      tempPassword
    );

    res.json({ 
      message: 'Application approved successfully',
      student_email: application.email,
      temp_password: tempPassword
    });
  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Reject application
router.post('/:applicationId/reject', authenticate, requireRoles(['admin', 'registrar']), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;
    
    const application = await req.db.collection('applications').findOne({ id: applicationId });
    if (!application) {
      return res.status(404).json({ detail: 'Application not found' });
    }

    await req.db.collection('applications').updateOne(
      { id: applicationId },
      { 
        $set: { 
          status: 'rejected', 
          rejection_reason: reason || null,
          rejected_by: req.user.id,
          rejected_at: new Date().toISOString()
        }
      }
    );

    // Send rejection email
    await sendApplicationRejectedEmail(
      application.email,
      application.first_name,
      application.last_name,
      application.course_title,
      reason
    );

    res.json({ message: 'Application rejected' });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

module.exports = router;
