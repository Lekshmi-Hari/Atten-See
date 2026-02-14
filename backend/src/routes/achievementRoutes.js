const express = require('express');
const router = express.Router();
const { getAchievements, unlockAchievement } = require('../controllers/achievementController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getAchievements)
    .post(unlockAchievement);

module.exports = router;
