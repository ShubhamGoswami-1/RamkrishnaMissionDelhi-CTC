const express = require('express');

const batchController = require('./../controllers/batchController');

const router = express.Router();

router.post('/add-new-batch/courseId/:courseId', batchController.addNewBatch);
router.get('/get-all-batches-Of-Student/:studentId', batchController.getAllBatches);
router.get('/getBatch/:batchId', batchController.getBatch);
router.get('/search', batchController.searchBatch);
router.get('/get-batches-by-course/:courseId', batchController.getBatchesOfCourse);

module.exports = router;