const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL, 'http://localhost:5173'].filter(Boolean)
        : '*',
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/halls', require('./routes/halls'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Seed super-admin account on first startup
const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            await User.create({
                name: 'Super Admin',
                email: 'admin@college.edu',
                password: 'admin123456',
                role: 'admin',
                isApproved: true,
                collegeId: 'ADMIN001',
                department: 'Administration',
            });
            console.log('✅ Super Admin account seeded: admin@college.edu / admin123456');
        }
    } catch (error) {
        console.error('Admin seed error:', error.message);
    }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await seedAdmin();
});
