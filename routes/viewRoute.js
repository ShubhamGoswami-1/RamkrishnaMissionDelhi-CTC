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

router.get('/batch', (req, res, next) => {
    res.render('batch-page');
})

router.get('/faculty', (req, res, next) => {
    res.render('faculty-page');
})

router.get('/course', (req, res, next) => {
    res.render('course-page');
})

router.get('/admission', (req, res, next) => {
    res.render('admission-page');
})

router.get('/', (req, res, next) => {
    res.render('welcome-page');
});

module.exports = router;