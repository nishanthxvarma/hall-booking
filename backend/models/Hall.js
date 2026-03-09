const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a hall name'],
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'Please provide the hall location'],
        trim: true,
    },
    capacity: {
        type: Number,
        required: [true, 'Please provide the hall capacity'],
        min: 1,
    },
    timeSlots: [{
        type: String,
        required: true,
    }],
    amenities: {
        type: String,
        default: '',
    },
    collegeId: {
        type: String,
        required: [true, 'Please provide the college ID for this hall'],
        trim: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Hall', hallSchema);
