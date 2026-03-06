const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, collegeId, clubName, department } = req.body;

        // Prevent anyone from registering as admin
        if (role === 'admin') {
            return res.status(403).json({ message: 'Cannot register as admin.' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Faculty accounts require approval — created as unapproved
        const isApproved = role === 'faculty' ? false : true;

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role,
            collegeId,
            isApproved,
            clubName: clubName || '',
            department: department || '',
        });

        // If faculty, do NOT return token — they cannot log in yet
        if (role === 'faculty') {
            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: false,
                pendingApproval: true,
                message: 'Registration successful! Your faculty account is pending review by an administrator. You will be able to log in once approved.',
            });
        }

        // Students get logged in immediately
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            collegeId: user.collegeId,
            clubName: user.clubName,
            department: user.department,
            isApproved: true,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Block unapproved faculty from logging in
        if (user.role === 'faculty' && !user.isApproved) {
            return res.status(403).json({
                message: 'Your faculty account is still pending admin approval. Please wait for an administrator to verify your account.',
                pendingApproval: true,
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            collegeId: user.collegeId,
            clubName: user.clubName,
            department: user.department,
            isApproved: user.isApproved,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', protect, async (req, res) => {
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        collegeId: req.user.collegeId,
        clubName: req.user.clubName,
        department: req.user.department,
        isApproved: req.user.isApproved,
    });
});

module.exports = router;
