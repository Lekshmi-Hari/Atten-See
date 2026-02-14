const Achievement = require('../models/Achievement');

// @desc    Get user achievements
// @route   GET /api/achievements
const getAchievements = async (req, res) => {
    try {
        const achievements = await Achievement.find({ user: req.user.id });
        res.status(200).json(achievements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unlock achievement
// @route   POST /api/achievements
const unlockAchievement = async (req, res) => {
    try {
        const { title, description, icon, category } = req.body;

        // Check if already unlocked
        const existing = await Achievement.findOne({ user: req.user.id, title });
        if (existing) {
            return res.status(200).json(existing);
        }

        const achievement = await Achievement.create({
            user: req.user.id,
            title,
            description,
            icon,
            category
        });

        res.status(201).json(achievement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAchievements,
    unlockAchievement
};
