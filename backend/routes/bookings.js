const express = require('express');
const Booking = require('../models/Booking');
const Hall = require('../models/Hall');
const { protect, facultyOnly, studentOnly } = require('../middleware/auth');
const { generateApprovalPDF } = require('../utils/pdfGenerator');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking (Student only)
router.post('/', protect, studentOnly, async (req, res) => {
    try {
        const { hall, date, timeSlot, eventName, expectedAttendance, requirements } = req.body;

        // Check if hall exists
        const hallExists = await Hall.findById(hall);
        if (!hallExists) {
            return res.status(404).json({ message: 'Hall not found' });
        }

        if (hallExists.collegeId !== req.user.collegeId) {
            return res.status(403).json({ message: 'You can only book halls within your own college' });
        }

        // Check for conflicting bookings (pending or approved)
        const conflict = await Booking.findOne({
            hall,
            date,
            timeSlot,
            status: { $in: ['pending', 'approved'] },
        });

        if (conflict) {
            return res.status(409).json({
                message: 'This hall is already booked for the selected date and time slot. Please choose a different slot.',
            });
        }

        // Check capacity
        if (expectedAttendance > hallExists.capacity) {
            return res.status(400).json({
                message: `Expected attendance (${expectedAttendance}) exceeds hall capacity (${hallExists.capacity}).`,
            });
        }

        const booking = await Booking.create({
            hall,
            date,
            timeSlot,
            eventName,
            expectedAttendance,
            requirements: requirements || '',
            requestedBy: req.user._id,
        });

        const populatedBooking = await Booking.findById(booking._id)
            .populate('hall', 'name location capacity')
            .populate('requestedBy', 'name email clubName collegeId');

        res.status(201).json(populatedBooking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   GET /api/bookings
// @desc    Get bookings (filtered by role)
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        const { status } = req.query;

        // Students see only their bookings; Faculty see only bookings for their college's halls
        if (req.user.role === 'student') {
            query.requestedBy = req.user._id;
        } else if (req.user.role === 'faculty') {
            const collegeHalls = await Hall.find({ collegeId: req.user.collegeId }).select('_id');
            const hallIds = collegeHalls.map(h => h._id);
            query.hall = { $in: hallIds };
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate('hall', 'name location capacity')
            .populate('requestedBy', 'name email clubName collegeId')
            .populate('reviewedBy', 'name email department')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/bookings/stats
// @desc    Get booking statistics for dashboard
router.get('/stats', protect, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'student') {
            query.requestedBy = req.user._id;
        } else if (req.user.role === 'faculty') {
            const collegeHalls = await Hall.find({ collegeId: req.user.collegeId }).select('_id');
            const hallIds = collegeHalls.map(h => h._id);
            query.hall = { $in: hallIds };
        }

        const pending = await Booking.countDocuments({ ...query, status: 'pending' });
        const approved = await Booking.countDocuments({ ...query, status: 'approved' });
        const rejected = await Booking.countDocuments({ ...query, status: 'rejected' });
        const changesRequested = await Booking.countDocuments({ ...query, status: 'changes_requested' });

        // Upcoming events (approved bookings with future dates)
        const today = new Date().toISOString().split('T')[0];
        const upcoming = await Booking.countDocuments({
            ...query,
            status: 'approved',
            date: { $gte: today },
        });

        res.json({ pending, approved, rejected, changesRequested, upcoming });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/bookings/availability
// @desc    Check hall availability for a specific date
router.get('/availability', protect, async (req, res) => {
    try {
        const { hallId, date } = req.query;

        if (!hallId || !date) {
            return res.status(400).json({ message: 'Hall ID and date are required' });
        }

        const hall = await Hall.findById(hallId);
        if (!hall) {
            return res.status(404).json({ message: 'Hall not found' });
        }

        if (hall.collegeId !== req.user.collegeId) {
            return res.status(403).json({ message: 'Access denied to this hall' });
        }

        // Find all booked slots for this hall and date
        const bookedSlots = await Booking.find({
            hall: hallId,
            date,
            status: { $in: ['pending', 'approved'] },
        }).select('timeSlot status');

        const bookedSlotNames = bookedSlots.map(b => b.timeSlot);
        const availability = hall.timeSlots.map(slot => ({
            slot,
            available: !bookedSlotNames.includes(slot),
            status: bookedSlots.find(b => b.timeSlot === slot)?.status || null,
        }));

        res.json({ hall: hall.name, date, slots: availability });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/bookings/:id
// @desc    Get a single booking
router.get('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('hall', 'name location capacity')
            .populate('requestedBy', 'name email clubName collegeId')
            .populate('reviewedBy', 'name email department');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (Faculty only)
router.put('/:id/status', protect, facultyOnly, async (req, res) => {
    try {
        const { status, facultyComments } = req.body;

        if (!['approved', 'rejected', 'changes_requested'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // If approving, check for conflicts one more time
        if (status === 'approved') {
            const conflict = await Booking.findOne({
                _id: { $ne: booking._id },
                hall: booking.hall,
                date: booking.date,
                timeSlot: booking.timeSlot,
                status: 'approved',
            });

            if (conflict) {
                return res.status(409).json({
                    message: 'Another booking for this slot has already been approved.',
                });
            }
        }

        booking.status = status;
        booking.reviewedBy = req.user._id;
        booking.facultyComments = facultyComments || '';
        booking.reviewedAt = new Date();

        await booking.save();

        const updatedBooking = await Booking.findById(booking._id)
            .populate('hall', 'name location capacity')
            .populate('requestedBy', 'name email clubName collegeId')
            .populate('reviewedBy', 'name email department');

        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/bookings/:id/pdf
// @desc    Download approval PDF
router.get('/:id/pdf', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('hall', 'name location capacity')
            .populate('requestedBy', 'name email clubName collegeId')
            .populate('reviewedBy', 'name email department');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'approved') {
            return res.status(400).json({ message: 'PDF can only be generated for approved bookings' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=approval-${booking._id}.pdf`);

        await generateApprovalPDF(booking, res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
