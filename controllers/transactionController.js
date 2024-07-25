const Batch = require("./../models/batchModel");
const Transaction = require("./../models/transactionModel");
const Student = require('./../models/studentModel');

const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const generateReceiptPDF = require('./../utils/pdfGenerator');

exports.newPayment = catchAsync(async (req, res, next) => {
    const studentId = req.params.studentId;
    const batchId = req.params.batchId;

    // Fetch student and batch details
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

    // Calculate fees with GST
    const feesWithGST = +batch.fees + (+batch.fees * 0.18);

    // Find the batch entry in student's batchIds
    const batchIndex = student.batchIds.findIndex(batchEntry => batchEntry.batchId.toString() === batchId);

    let totalFeesPaid = newPaymentAmount;
    let dueAmt;

    if (batchIndex !== -1) {
        // Existing batch entry found, update it
        const batchEntry = student.batchIds[batchIndex];
        totalFeesPaid += batchEntry.feesPaid;
        batchEntry.feesPaid = totalFeesPaid;
        batchEntry.paidAmtList.push(newPaymentAmount);

        // Calculate the updated due amount
        dueAmt = batchEntry.feesWithGST - totalFeesPaid;
        if (dueAmt < 0) dueAmt = 0; // Ensure due amount doesn't go negative
        batchEntry.feesDue = dueAmt;

        student.batchIds[batchIndex] = batchEntry;
    } else {
        // New batch entry, add it
        dueAmt = feesWithGST - newPaymentAmount;
        if (dueAmt < 0) dueAmt = 0; // Ensure due amount doesn't go negative

        const newBatchEntry = {
            batchId: batchId,
            feesWithGST: feesWithGST,
            feesPaid: newPaymentAmount,
            paidAmtList: [newPaymentAmount],
            feesDue: dueAmt
        };

        student.batchIds.push(newBatchEntry);
    }

    // Check if new payment exceeds the fees due
    if (dueAmt < 0) {
        return next(new AppError('Payment amount exceeds the fees due.', 400));
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

    // Generate receipt PDF (assuming function exists)
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