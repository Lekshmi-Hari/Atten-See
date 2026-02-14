const mongoose = require('mongoose');
const Lecture = require('../models/Lecture');
const { readDB, writeDB } = require('../utils/localDB');

const isOffline = () => mongoose.connection.readyState !== 1;

const getLectures = async (req, res) => {
    try {
        if (isOffline()) {
            const db = readDB();
            return res.status(200).json(db.lectures.filter(l => l.user === req.user.id).reverse());
        }
        const lectures = await Lecture.find({ user: req.user.id }).sort({ date: -1 });
        res.status(200).json(lectures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createLecture = async (req, res) => {
    try {
        if (isOffline()) {
            const db = readDB();
            const newLecture = {
                _id: Date.now().toString(),
                user: req.user.id,
                ...req.body,
                date: new Date()
            };
            db.lectures.push(newLecture);
            writeDB(db);
            return res.status(201).json(newLecture);
        }
        const lecture = await Lecture.create({ user: req.user.id, ...req.body });
        res.status(201).json(lecture);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getLectureById = async (req, res) => {
    try {
        if (isOffline()) {
            const db = readDB();
            const lecture = db.lectures.find(l => l._id === req.params.id && l.user === req.user.id);
            if (lecture) return res.status(200).json(lecture);
            return res.status(404).json({ message: 'Neural record not found.' });
        }
        const lecture = await Lecture.findById(req.params.id);
        if (lecture && lecture.user.toString() === req.user.id) {
            res.status(200).json(lecture);
        } else {
            res.status(404).json({ message: 'Lecture not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getLectures, createLecture, getLectureById };
