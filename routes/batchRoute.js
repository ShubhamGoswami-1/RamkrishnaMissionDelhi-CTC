const express = require('express');

const batchController = require('./../controllers/batchController');

const router = express.Router();

router.post('/add-new-batch', batchController.addNewBatch);
router.get('/get-all-batches', batchController.getAllBatches);

module.exports = router;