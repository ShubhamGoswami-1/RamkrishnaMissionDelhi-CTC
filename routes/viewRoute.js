const express = require('express');

const router = express.Router();

const userController = require("./../controllers/userController")

router.get('/signup', (req, res, next) => {
    res.render('signup-page');
});

router.get('/login', (req, res, next) => {
    res.render('login-page');
});

router.get('/students', userController.protect, userController.restrictTo('admin'), (req, res, next) => {
    res.render('students-page');
})

router.get('/fees', userController.protect, userController.restrictTo('admin'), (req, res, next) => {
    res.render('fees-page');
})

router.get('/students/details/:studentId', userController.protect, userController.restrictTo('admin'), (req, res, next) => {
    const studentId = req.params.studentId; // Access studentId from the route parameters
    res.render('student-detail-page', { studentId: studentId });
});

router.get('/batch', userController.protect, userController.restrictTo('admin'), (req, res, next) => {
    const courseId = req.query.courseId;
    const courseName = req.query.courseName;
    res.render('batch-page', { courseId: courseId, courseName: courseName });
});

router.get('/batch/details/:batchId', userController.protect, userController.restrictTo('admin'), (req, res, next) => {
    const batchId = req.params.batchId; // Access studentId from the route parameters
    res.render('batch-detail-page', { batchId: batchId });
});

router.get('/faculty', userController.protect, userController.restrictTo('admin'), (req, res, next) => {
    res.render('faculty-page');
})

router.get('/faculty/details/:facultyId', userController.protect, userController.restrictTo('admin'), (req, res, next) => {
    const facultyId = req.params.facultyId; // Access facultyId from the route parameters
    res.render('faculty-detail-page', { facultyId: facultyId });
});

router.get('/course', userController.protect, userController.restrictTo('admin'), (req, res, next) => {
    res.render('course-page');
})

router.get('/new-admission', userController.protect, userController.restrictTo('admin'), (req, res, next) => {
    res.render('admission-page');
})

router.get('/all-admissions', userController.protect, userController.restrictTo('admin'), (req, res, next) => {
    res.render('all-admissions');
})

router.get('/', (req, res, next) => {
    res.render('welcome-page');
});

module.exports = router;