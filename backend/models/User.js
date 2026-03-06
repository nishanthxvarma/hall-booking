const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        enum: ['student', 'faculty', 'admin'],
        required: [true, 'Please specify a role'],
    },
    isApproved: {
        type: Boolean,
        default: true, // Students are auto-approved; faculty set to false during registration
    },
    collegeId: {
        type: String,
        required: [true, 'Please provide your college ID'],
        trim: true,
    },
    clubName: {
        type: String,
        trim: true,
        default: '',
    },
    department: {
        type: String,
        trim: true,
        default: '',
    },
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
