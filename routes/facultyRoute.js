const express = require('express');

const facultyController = require('./../controllers/facultyController');

const router = express.Router();

const userController = require("./../controllers/userController")

router.use(userController.protect);
router.use(userController.restrictTo('admin'));

router.post('/add-new-faculty', facultyController.addNewFaculty);
router.get('/getFaculty/:facultyId', facultyController.getFaculty);
router.get('/get-all-faculties', facultyController.getAllFaculties);
router.get('/search', facultyController.searchFaulty);
router.patch('/edit-faculty/:facultyId', facultyController.editFacultyDetails);
router.get('/download-faculty', facultyController.downloadFacultyExcel);

module.exports = router;