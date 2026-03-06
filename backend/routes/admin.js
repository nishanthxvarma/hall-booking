const express = require('express');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/pending-faculty
// @desc    Get all pending (unapproved) faculty accounts
router.get('/pending-faculty', protect, adminOnly, async (req, res) => {
    try {
        const pendingFaculty = await User.find({
            role: 'faculty',
            isApproved: false,
        })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(pendingFaculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/approved-faculty
// @desc    Get all approved faculty accounts
router.get('/approved-faculty', protect, adminOnly, async (req, res) => {
    try {
        const approvedFaculty = await User.find({
            role: 'faculty',
            isApproved: true,
        })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(approvedFaculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/stats
// @desc    Get admin dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
    try {
        const pendingCount = await User.countDocuments({ role: 'faculty', isApproved: false });
        const approvedCount = await User.countDocuments({ role: 'faculty', isApproved: true });
        const studentCount = await User.countDocuments({ role: 'student' });

        res.json({
            pendingFaculty: pendingCount,
            approvedFaculty: approvedCount,
            totalStudents: studentCount,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/admin/approve-faculty/:id
// @desc    Approve a pending faculty account
router.put('/approve-faculty/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'faculty') {
            return res.status(400).json({ message: 'User is not a faculty member' });
        }

        if (user.isApproved) {
            return res.status(400).json({ message: 'Faculty account is already approved' });
        }

        user.isApproved = true;
        await user.save();

        res.json({
            message: `Faculty account for ${user.name} has been approved successfully.`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                department: user.department,
                isApproved: user.isApproved,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/admin/reject-faculty/:id
// @desc    Reject and delete a pending faculty account
router.delete('/reject-faculty/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'faculty') {
            return res.status(400).json({ message: 'User is not a faculty member' });
        }

        if (user.isApproved) {
            return res.status(400).json({ message: 'Cannot reject an already approved faculty account' });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({
            message: `Faculty account for ${user.name} has been rejected and removed.`,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
