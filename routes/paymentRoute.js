const express = require("express");

const transactionCOntroller = require("./../controllers/transactionController");

const router = express.Router();

router.post('/newPayment/studentId/:studentId/batchId/:batchId', transactionCOntroller.newPayment);
router.get('/getAllTransactions/studentId/:studentId/batchId/:batchId', transactionCOntroller.feesTransactionsStudentInBatch);

module.exports = router;