const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: String,
    icon: String,
    category: {
        type: String,
        enum: ['focus', 'consistency', 'prevention', 'time'],
    },
    unlockedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Achievement', achievementSchema);
