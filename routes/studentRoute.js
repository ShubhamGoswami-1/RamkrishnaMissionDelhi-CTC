const express = require('express');

const studentController = require('./../controllers/studentController');

const router = express.Router();

router.post('/add-new-student', studentController.addNewStudent);
router.get('/get-student/:studentId', studentController.getStudent);
router.get('/get-all-students', studentController.getAllStudents);


module.exports = router;