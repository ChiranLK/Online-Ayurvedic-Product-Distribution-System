require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customerRoutes = require('./routes/customerRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000; // Using the port from .env file (5000)

// Middleware
app.use(cors());
app.use(express.json());

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

// Import profile routes
const profileRoutes = require('./routes/profile');
const sellerStatsRoutes = require('./routes/sellerStats');
const customerStatsRoutes = require('./routes/customerStats');
const adminStatsRoutes = require('./routes/adminStats');

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/seller', sellerStatsRoutes);
app.use('/api/customer', customerStatsRoutes);
app.use('/api/admin', adminStatsRoutes);

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
