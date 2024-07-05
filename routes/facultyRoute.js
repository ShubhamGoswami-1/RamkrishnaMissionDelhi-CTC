const express = require('express');

const facultyController = require('./../controllers/facultyController');

const router = express.Router();

router.post('/add-new-faculty', facultyController.addNewFaculty);
router.get('/getFaculty/:facultyId', facultyController.getFaculty);
router.get('/get-all-faculties', facultyController.getAllFaculties);
router.get('/search', facultyController.searchFaulty);
router.patch('/edit-faculty/:facultyId', facultyController.editFacultyDetails);

module.exports = router;