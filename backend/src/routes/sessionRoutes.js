const express = require('express');
const router = express.Router();
const {
    getSessions,
    createSession,
    getStats
} = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getSessions)
    .post(protect, createSession);

router.get('/stats', protect, getStats);

module.exports = router;
