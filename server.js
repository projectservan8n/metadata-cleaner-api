const express = require('express');
const multer = require('multer');
const { ExifTool } = require('exiftool-vendored');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({ 
  dest: '/tmp/',
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'metadata-cleaner-api',
    version: '1.0.0',
    endpoints: {
      health: 'GET /',
      clearMetadata: 'POST /clear-metadata'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Main endpoint to clear metadata
app.post('/clear-metadata', upload.single('file'), async (req, res) => {
  const exiftool = new ExifTool();
  let filePath = null;
  
  try {
    console.log('Processing metadata clearing request...');
    
    if (req.file) {
      // Handle file upload
      filePath = req.file.path;
      console.log('Processing uploaded file:', req.file.originalname);
    } else if (req.body.file && req.body.filename) {
      // Handle base64 file
      const buffer = Buffer.from(req.body.file, 'base64');
      filePath = `/tmp/${Date.now()}_${req.body.filename}`;
      fs.writeFileSync(filePath, buffer);
      console.log('Processing base64 file:', req.body.filename);
    } else {
      return res.status(400).json({ 
        success: false,
        error: 'No file provided. Send either multipart file or base64 file with filename.' 
      });
    }
    
    // Get original file info
    const originalStats = fs.statSync(filePath);
    const originalSize = originalStats.size;
    
    // Clear all metadata using ExifTool
    console.log('Clearing metadata...');
    await exiftool.write(filePath, { all: null });
    
    // Read the cleaned file
    const cleanedFile = fs.readFileSync(filePath);
    const cleanedSize = cleanedFile.length;
    
    // Prepare response
    const response = {
      success: true,
      message: 'Metadata cleared successfully',
      originalSize: originalSize,
      cleanedSize: cleanedSize,
      savedBytes: originalSize - cleanedSize,
      file: cleanedFile.toString('base64'),
      timestamp: new Date().toISOString()
    };
    
    console.log(`Metadata cleared. Original: ${originalSize} bytes, Cleaned: ${cleanedSize} bytes`);
    
    res.json(response);
    
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    // Clean up
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await exiftool.end();
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Metadata Cleaner API running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🧹 Clear metadata: POST http://localhost:${PORT}/clear-metadata`);
});
