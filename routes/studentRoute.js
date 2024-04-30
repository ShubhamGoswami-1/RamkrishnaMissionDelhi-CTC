const express = require('express');

const studentController = require('./../controllers/studentController');

const router = express.Router();

router.post('/add-new-student', studentController);

module.exports = router;