const express = require('express');
const Hall = require('../models/Hall');
const { protect, facultyOnly } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/halls
// @desc    Get all active halls
router.get('/', protect, async (req, res) => {
    try {
        const halls = await Hall.find({ isActive: true, collegeId: req.user.collegeId })
            .populate('createdBy', 'name email department')
            .sort({ name: 1 });
        res.json(halls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/halls/:id
// @desc    Get a single hall
router.get('/:id', protect, async (req, res) => {
    try {
        const hall = await Hall.findById(req.params.id)
            .populate('createdBy', 'name email department');
        if (!hall) {
            return res.status(404).json({ message: 'Hall not found' });
        }
        res.json(hall);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/halls
// @desc    Create a new hall (Faculty only)
router.post('/', protect, facultyOnly, async (req, res) => {
    try {
        const { name, location, capacity, timeSlots, amenities } = req.body;

        const hall = await Hall.create({
            name,
            location,
            capacity,
            timeSlots,
            amenities: amenities || '',
            collegeId: req.user.collegeId,
            createdBy: req.user._id,
        });

        const populatedHall = await Hall.findById(hall._id)
            .populate('createdBy', 'name email department');

        res.status(201).json(populatedHall);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   PUT /api/halls/:id
// @desc    Update a hall (Faculty only)
router.put('/:id', protect, facultyOnly, async (req, res) => {
    try {
        const hall = await Hall.findById(req.params.id);
        if (!hall) {
            return res.status(404).json({ message: 'Hall not found' });
        }

        const { name, location, capacity, timeSlots, amenities, isActive } = req.body;

        hall.name = name || hall.name;
        hall.location = location || hall.location;
        hall.capacity = capacity || hall.capacity;
        hall.timeSlots = timeSlots || hall.timeSlots;
        hall.amenities = amenities !== undefined ? amenities : hall.amenities;
        hall.isActive = isActive !== undefined ? isActive : hall.isActive;

        await hall.save();

        const populatedHall = await Hall.findById(hall._id)
            .populate('createdBy', 'name email department');

        res.json(populatedHall);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   DELETE /api/halls/:id
// @desc    Delete a hall (Faculty only)
router.delete('/:id', protect, facultyOnly, async (req, res) => {
    try {
        const hall = await Hall.findById(req.params.id);
        if (!hall) {
            return res.status(404).json({ message: 'Hall not found' });
        }

        await Hall.findByIdAndDelete(req.params.id);
        res.json({ message: 'Hall removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
