"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cors_1 = require("cors");
const http_1 = require("http");
const multer_1 = require("multer");
const path_1 = require("path");
const stripe_1 = require("stripe");
const fs_1 = require("fs");
const app = (0, express_1.default)();
const port = 3001;
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'your_stripe_secret_key', {
    apiVersion: '2025-10-29.clover',
    typescript: true,
});
// Enhanced CORS configuration
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Disposition'],
    credentials: true,
    exposedHeaders: ['Content-Disposition']
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static('public'));
// Configure multer for avatar uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads/avatars';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `avatar-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
// Configure multer for report photo uploads
const reportStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads/reports';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `report-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    }
});
const reportUpload = (0, multer_1.default)({
    storage: reportStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
// Mock data
const mockNGOs = [
    {
        id: 1,
        name: "Friendicoes SECA",
        description: "One of Delhi's oldest animal welfare organizations providing shelter, medical care, and adoption services",
        address: "271 & 273, Defence Colony, New Delhi",
        city: "Delhi",
        state: "Delhi",
        phone: "+91-11-24314787",
        email: "info@friendicoes.org",
        website: "https://friendicoes.org",
        verified: true,
        rating: 4.7,
        services: "Shelter, Medical Care, Adoption, Ambulance, Rescue",
        latitude: 28.5695,
        longitude: 77.2341
    },
    {
        id: 2,
        name: "Sanjay Gandhi Animal Care Centre",
        description: "Delhi's largest animal shelter providing care and rehabilitation for injured and abandoned animals",
        address: "Near Raja Garden, New Delhi",
        city: "Delhi",
        state: "Delhi",
        phone: "+91-11-25448062",
        email: "sanjaygandhianimalcare@gmail.com",
        website: "https://sanjaygandhianimalcare.org",
        verified: true,
        rating: 4.6,
        services: "Shelter, Medical Care, Adoption, Ambulance, Rescue, Sterilization",
        latitude: 28.6542,
        longitude: 77.1234
    },
    {
        id: 3,
        name: "Red Paws Rescue",
        description: "Dedicated to rescuing and rehabilitating street animals in Delhi NCR",
        address: "Saket, New Delhi",
        city: "Delhi",
        state: "Delhi",
        phone: "+91-9876543210",
        email: "contact@redpawsrescue.org",
        website: "https://redpawsrescue.org",
        verified: true,
        rating: 4.8,
        services: "Rescue, Rehabilitation, Adoption, Community Feeding",
        latitude: 28.5244,
        longitude: 77.1855
    }
];
const mockPets = [
    {
        id: 1,
        name: "Leo",
        type: "Dog",
        breed: "Indian Pariah",
        age: "1.5 years",
        description: "Friendly and energetic, loves to play fetch",
        available: true,
        image: "https://images.unsplash.com/photo-1583511655826-05700d52f4a9?w=600&q=80",
        ngoId: 1,
        location: "Delhi",
        addedDate: "2023-01-15"
    },
    {
        id: 2,
        name: "Milo",
        type: "Dog",
        breed: "Labrador Mix",
        age: "2 years",
        description: "Gentle giant, great with kids and other pets",
        available: true,
        image: "https://images.unsplash.com/photo-1544568100-847a948585b9?w=600&q=80",
        ngoId: 1,
        location: "Delhi",
        addedDate: "2023-02-20"
    },
    {
        id: 3,
        name: "Luna",
        type: "Cat",
        breed: "Persian Mix",
        age: "8 months",
        description: "Playful and affectionate, loves to cuddle",
        available: true,
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80",
        ngoId: 2,
        location: "Delhi",
        addedDate: "2023-03-10"
    }
];
// Initialize mock reports array
const mockReports = [];
let ngoIdCounter = mockNGOs.length + 1;
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend server is running' });
});
// NGO Routes
app.get('/api/ngos', (req, res) => {
    res.json(mockNGOs.map(ngo => ({
        ...ngo,
        id: ngo.id.toString()
    })));
});
app.post('/api/ngos', (req, res) => {
    const newNGO = {
        id: ngoIdCounter++,
        ...req.body
    };
    mockNGOs.push(newNGO);
    res.json(newNGO);
});
app.put('/api/ngos', (req, res) => {
    const { id } = req.query;
    const index = mockNGOs.findIndex(ngo => ngo.id === parseInt(id));
    if (index !== -1) {
        mockNGOs[index] = { ...mockNGOs[index], ...req.body };
        res.json(mockNGOs[index]);
    }
    else {
        res.status(404).json({ error: 'NGO not found' });
    }
});
app.delete('/api/ngos', (req, res) => {
    const { id } = req.query;
    const index = mockNGOs.findIndex(ngo => ngo.id === parseInt(id));
    if (index !== -1) {
        mockNGOs.splice(index, 1);
        res.json({ success: true });
    }
    else {
        res.status(404).json({ error: 'NGO not found' });
    }
});
// Pet Routes
app.get('/api/pets', (req, res) => {
    res.json(mockPets.map(pet => {
        // Create a new object with the properties we want to return
        const petResponse = {
            ...pet,
            id: pet.id.toString(),
            ngoId: pet.ngoId.toString(),
            location: pet.location || "Unknown",
            // Use the image property and provide a fallback
            imageUrl: pet.image || '/placeholder.svg'
        };
        return petResponse;
    }));
});
app.get('/api/animal-shelters', (req, res) => {
    res.json(mockNGOs.map(ngo => ({
        ...ngo,
        id: ngo.id.toString()
    })));
});
// Report Animal Routes
app.get('/api/rescue-reports', (req, res) => {
    res.json(mockReports);
});
app.get('/api/rescue-reports-new', (req, res) => {
    res.json(mockReports);
});
app.post('/api/rescue-reports-new', reportUpload.array('photos', 5), async (req, res) => {
    try {
        const reportData = typeof req.body.report === 'string' ? JSON.parse(req.body.report) : req.body;
        const photos = req.files?.map(file => ({
            url: `/uploads/reports/${file.filename}`,
            filename: file.filename,
            path: file.path
        })) || [];
        const report = {
            id: Date.now().toString(),
            ...reportData,
            photos,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        mockReports.push(report);
        if (reportData.selectedOrgId && reportData.selectedOrgType) {
            const orgs = reportData.selectedOrgType === 'ngo' ? mockNGOs : mockNGOs;
            const org = orgs.find((o) => o.id.toString() === reportData.selectedOrgId);
            if (org) {
                console.log(`Notification sent to ${org.name} about new report`);
            }
        }
        res.json({
            success: true,
            report,
            message: 'Report submitted successfully'
        });
    }
    catch (error) {
        console.error('Error submitting report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit report'
        });
    }
});
// Email notification route
app.post('/api/email-notifications-new', (req, res) => {
    res.json({ success: true, message: 'Email sent successfully' });
});
// Profile update route with file upload support
app.put('/api/user/profile', upload.single('avatar'), (req, res) => {
    try {
        const { name, email, phone, location, bio } = req.body;
        let avatarUrl = null;
        if (req.file) {
            avatarUrl = `/uploads/avatars/${req.file.filename}`;
        }
        const updatedProfile = {
            name,
            email,
            phone,
            location,
            bio,
            avatar: avatarUrl || req.body.avatar
        };
        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile: updatedProfile
        });
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
// Stripe Donation Endpoints
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { amount, targetId, targetName } = req.body;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Donation to ${targetName}`,
                            description: 'Thank you for your generous donation',
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${frontendUrl}/donation/success?session_id={CHECKOUT_SESSION_ID}&target_id=${targetId}`,
            cancel_url: `${frontendUrl}/donation/cancelled`,
            metadata: {
                targetId,
                targetName,
            },
        });
        res.json({ url: session.url });
    }
    catch (err) {
        console.error('Error creating checkout session:', err);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});
app.post('/api/verify-donation', async (req, res) => {
    try {
        const { sessionId, targetId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent'],
        });
        if (session.payment_status === 'paid') {
            const amount = session.amount_total ? session.amount_total / 100 : 0;
            const currency = session.currency || 'inr';
            res.json({
                verified: true,
                amount,
                currency,
                email: session.customer_details?.email || null
            });
        }
        else {
            res.status(400).json({ error: 'Payment not completed' });
        }
    }
    catch (err) {
        console.error('Error verifying donation:', err);
        res.status(500).json({ error: 'Failed to verify donation' });
    }
});
// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});
const server = (0, http_1.createServer)(app);
// Make sure uploads directories exist
const uploadDirs = ['public/uploads/avatars', 'public/uploads/reports'];
uploadDirs.forEach(dir => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
server.listen(port, () => {
    console.log(`✅ Backend server running on http://localhost:${port}`);
    console.log(`📡 API endpoints available at http://localhost:${port}/api/*`);
    console.log(`🌐 CORS enabled for: http://localhost:5173, http://127.0.0.1:5173, http://localhost:3000`);
});
exports.default = app;
