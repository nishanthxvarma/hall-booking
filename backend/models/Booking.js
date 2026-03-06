const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    hall: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hall',
        required: [true, 'Please select a hall'],
    },
    date: {
        type: String,
        required: [true, 'Please select a date'],
    },
    timeSlot: {
        type: String,
        required: [true, 'Please select a time slot'],
    },
    eventName: {
        type: String,
        required: [true, 'Please provide an event name'],
        trim: true,
    },
    expectedAttendance: {
        type: Number,
        required: [true, 'Please provide expected attendance'],
        min: 1,
    },
    requirements: {
        type: String,
        default: '',
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'changes_requested'],
        default: 'pending',
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    facultyComments: {
        type: String,
        default: '',
    },
    reviewedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

// Compound index to prevent double bookings
// Only one approved or pending booking per hall+date+timeSlot
bookingSchema.index({ hall: 1, date: 1, timeSlot: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
