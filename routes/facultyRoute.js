const express = require('express');

const facultyController = require('./../controllers/facultyController');

const router = express.Router();

router.post('/add-new-faculty', facultyController.addNewFaculty);
router.get('/get-all-faculties', facultyController.getAllFaculties);
router.get('/search', facultyController.searchFaulty);


module.exports = router;