const express = require("express");

const transactionCOntroller = require("./../controllers/transactionController");

const router = express.Router();

const userController = require("./../controllers/userController")

router.use(userController.protect);
router.use(userController.restrictTo('admin'));

router.post('/newPayment/studentId/:studentId/batchId/:batchId', transactionCOntroller.newPayment);
router.get('/getAllTransactions/studentId/:studentId/batchId/:batchId', transactionCOntroller.feesTransactionsStudentInBatch);

module.exports = router;