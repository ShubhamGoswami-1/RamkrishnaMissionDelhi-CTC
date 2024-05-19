const express = require('express');

const courseController = require('../controllers/courseController');

const router = express.Router();

router.post('/add-new-course', courseController.addNewCourse);

module.exports = router;