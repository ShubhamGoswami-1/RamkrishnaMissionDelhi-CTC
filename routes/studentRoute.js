const express = require('express');

const studentController = require('./../controllers/studentController');

const router = express.Router();

router.post('/add-new-student', studentController.addNewStudent);
router.get('/get-student/:studentId', studentController.getStudent);
router.get('/get-all-students', studentController.getAllStudents);
router.get('/search', studentController.searchStudent);
router.get('/get-student-batches/:studentId', studentController.getStudentBatches);
router.patch('/edit-student/:studentId', studentController.editStudentDetails);
router.get('/download-students', studentController.downloadStudentsExcel);


module.exports = router;