const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    transcript: String,
    summary: {
        executiveSummary: String,
        keyTopics: [String],
        examLikelyTopics: [String],
        tasksToReview: [String]
    },
    flashcards: [{
        question: String,
        answer: String,
        difficulty: String
    }],
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Lecture', lectureSchema);
