const express = require('express');

const courseController = require('../controllers/courseController');

const router = express.Router();

router.post('/add-new-course', courseController.addNewCourse);
router.get('/get-all-courses', courseController.getAllCourses);
router.get('/search', courseController.searchCourse);

module.exports = router;