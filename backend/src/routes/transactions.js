const express = require('express');
const { authenticate, requireRoles } = require('../middleware/auth');

const router = express.Router();

// Get all transactions
router.get('/', authenticate, requireRoles(['admin']), async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    
    const transactions = await req.db.collection('transactions')
      .find(query, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .toArray();
    
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get user transactions
router.get('/my', authenticate, async (req, res) => {
  try {
    const transactions = await req.db.collection('transactions')
      .find({ user_id: req.user.id }, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .toArray();
    
    res.json(transactions);
  } catch (error) {
    console.error('Get my transactions error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get single transaction
router.get('/:transactionId', authenticate, async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const transaction = await req.db.collection('transactions').findOne(
      { id: transactionId },
      { projection: { _id: 0 } }
    );
    
    if (!transaction) {
      return res.status(404).json({ detail: 'Transaction not found' });
    }

    // Check access
    if (req.user.role !== 'admin' && transaction.user_id !== req.user.id) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

module.exports = router;
