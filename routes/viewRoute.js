const express = require('express');

const router = express.Router();

router.get('/signup', (req, res, next) => {
    res.render('signup-page');
});

router.get('/login', (req, res, next) => {
    res.render('login-page');
});

router.get('/students', (req, res, next) => {
    res.render('students-page');
})

router.get('/students/details/:studentId', (req, res, next) => {
    const studentId = req.params.studentId; // Access studentId from the route parameters
    res.render('student-detail-page', { studentId: studentId });
});


router.get('/batch', (req, res, next) => {
    const courseId = req.query.courseId;
    const courseName = req.query.courseName;
    res.render('batch-page', { courseId: courseId, courseName: courseName });
});

router.get('/faculty', (req, res, next) => {
    res.render('faculty-page');
})

router.get('/course', (req, res, next) => {
    res.render('course-page');
})

router.get('/admission', (req, res, next) => {
    res.render('admission-page');
})

router.get('/all-admission', (req, res, next) => {
    res.render('all-admissions');
})

router.get('/', (req, res, next) => {
    res.render('welcome-page');
});

module.exports = router;