const express = require('express');
const router = express.Router();
const {
    getLectures,
    createLecture,
    getLectureById
} = require('../controllers/lectureController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getLectures)
    .post(protect, createLecture);

router.get('/:id', protect, getLectureById);

module.exports = router;
