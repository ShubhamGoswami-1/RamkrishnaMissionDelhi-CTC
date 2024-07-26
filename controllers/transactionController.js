const Batch = require("./../models/batchModel");
const Transaction = require("./../models/transactionModel");
const Student = require('./../models/studentModel');

const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const generateReceiptPDF = require('./../utils/pdfGenerator');

exports.newPayment = catchAsync(async (req, res, next) => {
    const studentId = req.params.studentId;
    const batchId = req.params.batchId;
    const { newPayment, paymentType } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
        return next(new AppError('No student found with this id', 404));
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
        return next(new AppError('No batch found with this id', 404));
    }

    const newPaymentAmount = parseFloat(newPayment);
    const feesWithGST = +batch.fees + (+batch.fees * 0.18);

    const batchIndex = student.batchIds.findIndex(batchEntry => batchEntry.batchId.toString() === batchId);
    let totalFeesPaid = newPaymentAmount;
    let dueAmt;

    if (batchIndex !== -1) {
        const batchEntry = student.batchIds[batchIndex];
        totalFeesPaid += batchEntry.feesPaid;
        batchEntry.feesPaid = totalFeesPaid;
        batchEntry.paidAmtList.push(newPaymentAmount);
        dueAmt = batchEntry.feesWithGST - totalFeesPaid;
        if (dueAmt < 0) dueAmt = 0;
        batchEntry.feesDue = dueAmt;
        student.batchIds[batchIndex] = batchEntry;
    } else {
        dueAmt = feesWithGST - newPaymentAmount;
        if (dueAmt < 0) dueAmt = 0;
        const newBatchEntry = {
            batchId: batchId,
            feesWithGST: feesWithGST,
            feesPaid: newPaymentAmount,
            paidAmtList: [newPaymentAmount],
            feesDue: dueAmt
        };
        student.batchIds.push(newBatchEntry);
    }

    if (dueAmt < 0) {
        return next(new AppError('Payment amount exceeds the fees due.', 400));
    }

    const transaction = await Transaction.create({
        studentId,
        batchId,
        newPayment: newPayment,
        feesPaid: totalFeesPaid,
        dueAmt: dueAmt,
        paymentType: paymentType
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