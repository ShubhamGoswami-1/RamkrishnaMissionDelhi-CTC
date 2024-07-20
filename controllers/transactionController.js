const Batch = require("./../models/batchModel");
const Transaction = require("./../models/transactionModel");
const Student = require('./../models/studentModel');

const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const generateReceiptPDF = require('./../utils/pdfGenerator');

exports.newPayment = catchAsync(async (req, res, next) => {
    const studentId = req.params.studentId;
    const batchId = req.params.batchId;

    const student = await Student.findById(studentId);

    if (!student) {
        return next(new AppError('No student found with this id', 404));
    }

    const batch = await Batch.findById(batchId);

    if (!batch) {
        return next(new AppError('No batch found with this id', 404));
    }

    const { newPayment } = req.body;
    const newPaymentAmount = parseFloat(newPayment);

    let totalFeesPaid = newPaymentAmount;
    let feesWithGST = +batch.fees + (batch.fees * 0.18);
    let dueAmt = feesWithGST - newPaymentAmount;

    // Check if the student already has this batch in batchIds
    const batchIndex = student.batchIds.findIndex(batch => batch.batchId.toString() === batchId);

    if (batchIndex !== -1) {
        // Batch found in student's batchIds, update the existing entry
        const batchEntry = student.batchIds[batchIndex];
        totalFeesPaid += batchEntry.feesPaid;
        batchEntry.feesPaid = totalFeesPaid;
        batchEntry.paidAmtList.push(newPaymentAmount);

        // Calculate the updated due amount
        dueAmt = batchEntry.feesWithGST - totalFeesPaid;
        batchEntry.feesDue = dueAmt;

        student.batchIds[batchIndex] = batchEntry;
    } else {
        // Batch not found in student's batchIds, create a new entry
        const newBatchEntry = {
            batchId: batchId,
            feesWithGST: feesWithGST,
            feesPaid: newPaymentAmount,
            paidAmtList: [newPaymentAmount],
            feesDue: dueAmt
        };

        student.batchIds.push(newBatchEntry);
    }

    // Create a new transaction
    const transaction = await Transaction.create({
        studentId,
        batchId,
        newPayment: newPayment,
        feesPaid: totalFeesPaid,
        dueAmt: dueAmt
    });

    await student.save();

    const pdfPath = generateReceiptPDF(transaction, student, batch, totalFeesPaid, newPaymentAmount, feesWithGST, dueAmt);

    res.status(201).json({
        status: 'success',
        transaction,
        pdfUrl: `/receipts/${transaction._id}.pdf`
    });
});

exports.feesTransactionsStudentInBatch = catchAsync(async(req, res, next) => {
    const batchId = req.params.batchId;
    const studentId = req.params.studentId;

    const batch = await Batch.findById(batchId);

    if(!batch){
        return next(new AppError('No batch found with this batchId', 404));
    }

    const student = await Student.findById(studentId);

    if(!student){
        return next(new AppError('No student found with this id', 404));
    }

    const transactions = await Transaction.find({
        batchId,
        studentId
    });

    res.status(200).json({
        status: "success",
        transactions
    });
})