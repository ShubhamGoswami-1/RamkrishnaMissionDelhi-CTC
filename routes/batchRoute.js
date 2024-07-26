const express = require('express');

const batchController = require('./../controllers/batchController');

const router = express.Router();

router.post('/add-new-batch/courseId/:courseId', batchController.addNewBatch);
router.get('/get-all-batches-Of-Student/:studentId', batchController.getAllBatches);
router.patch('/edit-batch/:batchId', batchController.updateBatch)
router.get('/getBatch/:batchId', batchController.getBatch);
router.get('/search', batchController.searchBatch);
router.get('/get-batches-by-course/:courseId', batchController.getBatchesByCourse); // previously : getBatchesOfCourse
router
  .route('/getBatchDetails')
  .post(batchController.getBatchDetails);

router.get('/get-all-students-Of-Batch/:batchId', batchController.getBatchStudents)

module.exports = router;