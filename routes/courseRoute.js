const express = require('express');

const courseController = require('../controllers/courseController');

const router = express.Router();

const userController = require("./../controllers/userController")

router.use(userController.protect);
router.use(userController.restrictTo('admin'));

router.post('/add-new-course', courseController.addNewCourse);
router.get('/get-all-courses', courseController.getAllCourses);
router.get('/search', courseController.searchCourse);
router.get('/get-course-fees/:courseId', courseController.getCourseFees);

module.exports = router;