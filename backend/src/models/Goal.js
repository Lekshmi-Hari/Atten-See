const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    target: {
        type: String,
        required: true,
    },
    hours: {
        type: Number,
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    completed: {
        type: Boolean,
        default: false,
    },
    sessionsCompleted: {
        type: Number,
        default: 0
    },
    totalSessions: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Goal', goalSchema);
