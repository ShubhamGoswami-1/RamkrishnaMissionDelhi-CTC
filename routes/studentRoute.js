const express = require('express');

const studentController = require('./../controllers/studentController');

const router = express.Router();

router.post('/add-new-student', studentController.addNewStudent);

module.exports = router;