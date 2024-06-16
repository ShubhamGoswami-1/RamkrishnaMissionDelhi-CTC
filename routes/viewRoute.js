const express = require('express');

const router = express.Router();

router.get('/signup', (req, res, next) => {
    res.render('signup-page');
});

router.get('/login', (req, res, next) => {
    res.render('login-page');
});

router.get('/', (req, res, next) => {
    res.render('welcome-page');
});

module.exports = router;