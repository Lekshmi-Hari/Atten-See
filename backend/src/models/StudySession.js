const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    duration: {
        type: Number, // in minutes
        required: true,
    },
    focusScore: {
        type: Number,
        required: true,
    },
    detections: {
        phone: { type: Number, default: 0 },
        distracted: { type: Number, default: 0 },
        focused: { type: Number, default: 0 },
        away: { type: Number, default: 0 }
    },
    analytics: {
        hourlyFocus: [Number], // 24 numbers representing focus at each hour
        recoveryRate: Number,
        distractionResistance: Number
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('StudySession', studySessionSchema);
