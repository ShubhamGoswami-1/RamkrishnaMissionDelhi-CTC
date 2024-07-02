const express = require('express');

const batchController = require('./../controllers/batchController');

const router = express.Router();

router.post('/add-new-batch', batchController.addNewBatch);
router.get('/get-all-batches', batchController.getAllBatches);
router.get('/search', batchController);

module.exports = router;