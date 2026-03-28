/**
 * Upload Routes - Handle file uploads for inventory images
 */


const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const itemType = req.body.type || 'products';
    const targetDir = path.join(uploadDir, itemType);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter
});

// POST /api/v1/upload - Upload single image
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        errorCode: 'UPLOAD_001',
        timestamp: new Date().toISOString()
      });
    }

    const imageUrl = `/uploads/${req.body.type || 'products'}/${req.file.filename}`;
    
    console.log('[UPLOAD] File uploaded:', req.file.filename);
    
    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: imageUrl
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[UPLOAD] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Upload failed',
      errorCode: 'UPLOAD_500',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/upload/:filename - Delete uploaded file
router.delete('/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const type = req.query.type || 'products';
    const filePath = path.join(uploadDir, type, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('[UPLOAD] File deleted:', filename);
      
      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found',
        errorCode: 'UPLOAD_404',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('[UPLOAD] Delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Delete failed',
      errorCode: 'UPLOAD_500',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;