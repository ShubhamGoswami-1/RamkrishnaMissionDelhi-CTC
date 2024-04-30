const express = require('express');

const facultyController = require('./../controllers/facultyController');

const router = express.Router();

router.post('/add-new-faculty', facultyController);

module.exports = router;