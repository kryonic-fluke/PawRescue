import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads/reports';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `report-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// In-memory storage for demo purposes
let mockReports = [];
let reportIdCounter = 1;

// Mock NGOs and shelters
const mockNGOs = [
  { id: 1, name: 'Animal Welfare Society', email: 'ngo1@example.com', phone: '+91 98765 43210' },
  { id: 2, name: 'Pet Rescue Foundation', email: 'ngo2@example.com', phone: '+91 98765 43211' }
];

const mockShelters = [
  { id: 1, name: 'City Animal Shelter', email: 'shelter1@example.com', phone: '+91 98765 43212' },
  { id: 2, name: 'Happy Paws Shelter', email: 'shelter2@example.com', phone: '+91 98765 43213' }
];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

// NGOs endpoint
app.get('/api/ngos', (req, res) => {
  res.json(mockNGOs);
});

// Animal shelters endpoint
app.get('/api/animal-shelters', (req, res) => {
  res.json(mockShelters);
});

// Rescue reports endpoints
app.get('/api/rescue-reports-new', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  res.json(mockReports.slice(offset, offset + limit));
});

app.post('/api/rescue-reports-new', upload.array('photos', 5), (req, res) => {
  try {
    console.log('Received report submission:', req.body);
    console.log('Files:', req.files);

    const reportData = req.body;
    
    // Handle photo URLs if files were uploaded
    const photoUrls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        photoUrls.push(`/uploads/reports/${file.filename}`);
      });
    }

    const report = {
      id: reportIdCounter++,
      animalType: reportData.animalType,
      location: reportData.location,
      latitude: reportData.latitude ? parseFloat(reportData.latitude) : null,
      longitude: reportData.longitude ? parseFloat(reportData.longitude) : null,
      description: reportData.description,
      urgency: reportData.urgency || 'medium',
      status: 'pending',
      phone: reportData.phone,
      email: reportData.email,
      userId: reportData.userId ? parseInt(reportData.userId) : null,
      assignedNgoId: reportData.assignedNgoId ? parseInt(reportData.assignedNgoId) : null,
      imageUrl: photoUrls.length > 0 ? photoUrls[0] : null,
      photos: photoUrls,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockReports.push(report);
    console.log('Report created successfully:', report);

    res.status(201).json({
      success: true,
      report: report,
      message: 'Report submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit report',
      details: error.message
    });
  }
});

// PUT endpoint for updating reports
app.put('/api/rescue-reports-new', (req, res) => {
  try {
    const id = parseInt(req.query.id);
    const updateData = req.body;
    
    const reportIndex = mockReports.findIndex(r => r.id === id);
    if (reportIndex === -1) {
      return res.status(404).json({ error: 'Report not found' });
    }

    mockReports[reportIndex] = {
      ...mockReports[reportIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    res.json(mockReports[reportIndex]);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// DELETE endpoint for reports
app.delete('/api/rescue-reports-new', (req, res) => {
  try {
    const id = parseInt(req.query.id);
    const reportIndex = mockReports.findIndex(r => r.id === id);
    
    if (reportIndex === -1) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const deletedReport = mockReports.splice(reportIndex, 1)[0];
    res.json({ 
      message: 'Report deleted successfully',
      deletedReport 
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// Serve static files from public directory
app.use('/uploads', express.static('public/uploads'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📡 API endpoints available at http://localhost:${port}/api/*`);
  console.log(`📁 Serving static files from /uploads`);
});

export default app;
