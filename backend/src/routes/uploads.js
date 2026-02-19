const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

// Upload file
router.post('/file', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: 'No file uploaded' });
    }

    const fileUrl = `/api/uploads/${req.file.filename}`;
    
    res.json({
      url: fileUrl,
      filename: req.file.filename,
      original_name: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ detail: 'Upload failed' });
  }
});

// Upload document (for applications)
router.post('/document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: 'No document uploaded' });
    }

    const fileUrl = `/api/uploads/${req.file.filename}`;
    
    res.json({
      url: fileUrl,
      filename: req.file.filename,
      original_name: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ detail: 'Upload failed' });
  }
});

// Upload course image
router.post('/course-image', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: 'No image uploaded' });
    }

    const fileUrl = `/api/uploads/${req.file.filename}`;
    
    res.json({
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Course image upload error:', error);
    res.status(500).json({ detail: 'Upload failed' });
  }
});

module.exports = router;
