const express = require('express');

const admissionController = require('./../controllers/admissionController');

const router = express.Router();

const userController = require("./../controllers/userController")

router.use(userController.protect);
router.use(userController.restrictTo('admin'));

router.post('/add-new-admission', admissionController.newAdmission);
router.get('/get-all-admissions', admissionController.getAllAdmissions);
router.get('/search', admissionController.searchAdmission);

module.exports = router;