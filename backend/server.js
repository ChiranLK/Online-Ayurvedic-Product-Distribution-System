require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Import routes
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customerRoutes = require('./routes/customerRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const sellerProductRoutes = require('./routes/sellerProductRoutes');
const sellerOrderRoutes = require('./routes/sellerOrderRoutes');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000; // Using the port from .env file (5000)

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    },
    fileFilter: function(req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Serve static files from uploads directory with proper headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, path) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.setHeader('Content-Type', 'image/jpeg'); // Default content type for images
        res.setHeader('Vary', 'Accept-Encoding');
    }
}));

// Log the uploads directory path for debugging
console.log('Serving images from:', path.join(__dirname, 'uploads'));

// Health check route to verify MongoDB connection
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'success', 
        message: 'MongoDB Atlas MERN setup is working 🚀',
        mongodbConnected: mongoose.connection.readyState === 1
    });
});

// Configure CORS with more specific options to allow requests from frontend
app.use(cors({
    origin: '*', // Allow all origins for testing
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Static files route already configured above

// Import profile routes
const profileRoutes = require('./routes/profile');
const sellerStatsRoutes = require('./routes/sellerStats');
const customerStatsRoutes = require('./routes/customerStats');
const adminStatsRoutes = require('./routes/adminStats');
const adminSellersRoutes = require('./routes/adminSellers');
const feedbackRoutes = require('./routes/feedback');
const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const blogRoutes = require('./routes/blog');

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/seller-products', sellerProductRoutes);
app.use('/api/seller-orders', sellerOrderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/seller', sellerStatsRoutes);
app.use('/api/customer', customerStatsRoutes);
app.use('/api/admin/stats', adminStatsRoutes);  // Changed from /api/admin to /api/admin/stats for clarity
app.use('/api/admin/users', usersRoutes);
app.use('/api/admin/sellers', adminSellersRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/blog', blogRoutes);

// MongoDB Connection
console.log('Connecting to MongoDB...');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ayurvedic_distribution';
console.log(`Using MongoDB URI: ${MONGODB_URI.substring(0, 20)}...`); // Only log part of URI for security

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ MongoDB Atlas connected successfully');
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.error('Application may not function correctly without database connection');
});

// Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
