const express = require('express');
const { authenticate, requireRoles } = require('../middleware/auth');

const router = express.Router();

// Get system config
router.get('/', async (req, res) => {
  try {
    let config = await req.db.collection('system_config').findOne({}, { projection: { _id: 0 } });
    
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
      await req.db.collection('system_config').insertOne(config);
    }

    res.json(config);
  } catch (error) {
    console.error('Get system config error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Update system config
router.put('/', authenticate, requireRoles(['admin']), async (req, res) => {
  try {
    const updates = req.body;
    delete updates._id;

    await req.db.collection('system_config').updateOne(
      {},
      { $set: updates },
      { upsert: true }
    );

    const config = await req.db.collection('system_config').findOne({}, { projection: { _id: 0 } });
    res.json(config);
  } catch (error) {
    console.error('Update system config error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

module.exports = router;
