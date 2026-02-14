const mongoose = require('mongoose');
const Goal = require('../models/Goal');
const { readDB, writeDB } = require('../utils/localDB');

const isOffline = () => mongoose.connection.readyState !== 1;

const getGoals = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        
        if (isOffline()) {
            const db = readDB();
            return res.status(200).json(db.goals.filter(g => g.user === userId));
        }
        const goals = await Goal.find({ user: userId });
        res.status(200).json(goals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createGoal = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        
        if (isOffline()) {
            const db = readDB();
            const newGoal = {
                _id: Date.now().toString(),
                user: userId,
                subject: req.body.subject,
                target: req.body.target,
                hours: req.body.hours,
                priority: req.body.priority || 'medium',
                completed: false,
                sessionsCompleted: 0,
                totalSessions: req.body.totalSessions || Math.ceil((req.body.hours || 0) / 2)
            };
            db.goals.push(newGoal);
            writeDB(db);
            return res.status(201).json(newGoal);
        }
        const goal = await Goal.create({ user: userId, ...req.body });
        res.status(201).json(goal);
    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateGoal = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        
        if (isOffline()) {
            const db = readDB();
            const index = db.goals.findIndex(g => g._id === req.params.id && g.user === userId);
            if (index !== -1) {
                db.goals[index] = { ...db.goals[index], ...req.body };
                writeDB(db);
                return res.status(200).json(db.goals[index]);
            }
            return res.status(404).json({ message: 'Goal not found' });
        }
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, user: userId },
            req.body,
            { new: true }
        );
        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        res.status(200).json(goal);
    } catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteGoal = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        
        if (isOffline()) {
            const db = readDB();
            const initialLength = db.goals.length;
            db.goals = db.goals.filter(g => !(g._id === req.params.id && g.user === userId));
            if (db.goals.length !== initialLength) {
                writeDB(db);
                return res.status(200).json({ id: req.params.id });
            }
            return res.status(404).json({ message: 'Goal not found' });
        }
        const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: userId });
        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        console.error('Delete goal error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
