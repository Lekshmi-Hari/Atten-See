const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { readDB, writeDB, updateById } = require('../utils/localDB');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

const isOffline = () => mongoose.connection.readyState !== 1;

// @desc    Register new user
// @route   POST /api/users
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Neural ID registration requires full credentials.' });
    }

    try {
        if (isOffline()) {
            const db = readDB();
            if (db.users.find(u => u.email === email)) {
                return res.status(400).json({ message: 'Neural ID already synchronized in local sector.' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = {
                _id: Date.now().toString(),
                name,
                email,
                password: hashedPassword,
                stats: { totalStudyTime: 0, averageFocusScore: 0, sessionsCompleted: 0 },
                settings: { notifications: true, cloudSync: true },
                createdAt: new Date()
            };

            db.users.push(newUser);
            writeDB(db);

            return res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                token: generateToken(newUser._id),
                mode: 'offline'
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });
        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (isOffline()) {
            const db = readDB();
            const user = db.users.find(u => u.email === email);

            if (user && (await bcrypt.compare(password, user.password))) {
                return res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user._id),
                    mode: 'offline'
                });
            } else {
                return res.status(401).json({ message: 'Authentication mismatch in local sector.' });
            }
        }

        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateUserProfile = async (req, res) => {
    try {
        if (isOffline()) {
            const updated = updateById('users', req.user.id, req.body);
            if (updated) return res.json(updated);
            return res.status(404).json({ message: 'Neural ID not found.' });
        }

        const user = await User.findById(req.user.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.avatar = req.body.avatar || user.avatar;
            user.bio = req.body.bio || user.bio;

            if (req.body.settings) user.settings = { ...user.settings, ...req.body.settings };
            if (req.body.password) user.password = req.body.password;

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user data
// @route   GET /api/users/me
const getMe = async (req, res) => {
    try {
        if (isOffline()) {
            const db = readDB();
            const user = db.users.find(u => u._id === req.user.id);
            return res.status(200).json(user);
        }
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
const getLeaderboard = async (req, res) => {
    try {
        if (isOffline()) {
            const db = readDB();
            const sorted = db.users
                .sort((a, b) => (b.stats?.totalStudyTime || 0) - (a.stats?.totalStudyTime || 0))
                .slice(0, 10);
            return res.json(sorted);
        }
        const users = await User.find({})
            .select('name avatar stats')
            .sort({ 'stats.totalStudyTime': -1 })
            .limit(10);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateUserProfile,
    getLeaderboard
};
