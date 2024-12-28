const path = require('path');
const fs = require('fs');
const util = require('util');
const access = util.promisify(fs.access);

const Batch = require("./../models/batchModel");
const Transaction = require("./../models/transactionModel");
const Student = require('./../models/studentModel');

const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const generateReceiptPDF = require('./../utils/pdfGenerator');

// exports.newPayment = catchAsync(async (req, res, next) => {
//     const studentId = req.params.studentId;
//     const batchId = req.params.batchId;
//     const { newPayment, paymentType } = req.body;

//     const student = await Student.findById(studentId);
//     if (!student) {
//         return next(new AppError('No student found with this id', 404));
//     }

//     const batch = await Batch.findById(batchId);
//     if (!batch) {
//         return next(new AppError('No batch found with this id', 404));
//     }
//     const newPaymentAmount = parseFloat(newPayment);

//     // Find the batch entry for the student
//     const batchIndex = student.batchIds.findIndex(batchEntry => batchEntry.batchId.toString() === batchId);
//     let discount = 0;
//     if (batchIndex !== -1) {
//         discount = student.batchIds[batchIndex].discount;
//     }
    
//     // Calculate the discounted fees
//     const discountedFees = batch.fees - (batch.fees * (discount / 100));
//     // Calculate fees with GST
//     const feesWithGST = discountedFees + (discountedFees * 0.18);

//     let totalFeesPaid = newPaymentAmount;
//     let dueAmt;

//     if (batchIndex !== -1) {
//         const batchEntry = student.batchIds[batchIndex];
//         totalFeesPaid += batchEntry.feesPaid;
//         batchEntry.feesPaid = totalFeesPaid;
//         batchEntry.paidAmtList.push(newPaymentAmount);
//         batchEntry.feesWithGST = feesWithGST;
//         dueAmt = feesWithGST - totalFeesPaid;
//         batchEntry.feesDue = dueAmt < 0 ? 0 : dueAmt;
//         student.batchIds[batchIndex] = batchEntry;
//     } else {
//         dueAmt = feesWithGST - newPaymentAmount;
//         dueAmt = dueAmt < 0 ? 0 : dueAmt;
//         const newBatchEntry = {
//             batchId: batchId,
//             discount: discount,
//             feesWithGST: feesWithGST,
//             feesPaid: newPaymentAmount,
//             paidAmtList: [newPaymentAmount],
//             feesDue: dueAmt
//         };
//         student.batchIds.push(newBatchEntry);
//     }

//     if (dueAmt < 0) {
//         return next(new AppError('Payment amount exceeds the fees due.', 400));
//     }

//     // Get the latest receipt number
//     const lastTransaction = await Transaction.findOne().sort({ receiptNo: -1 });
//     const receiptNo = lastTransaction ? lastTransaction.receiptNo + 1 : 1;

//     const transaction = await Transaction.create({
//         studentId,
//         batchId,
//         newPayment: newPaymentAmount,
//         feesPaid: totalFeesPaid,
//         dueAmt: dueAmt,
//         paymentType: paymentType,
//         receiptNo
//     });

//     await student.save();
//     // Sanitize student name for file naming
//     const sanitizedStudentName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
//     const pdfFileName = `${sanitizedStudentName}-${receiptNo}.pdf`;
//     const pdfPath = path.join(__dirname, '..', 'receipts', pdfFileName);
//     await generateReceiptPDF(transaction, student, batch, totalFeesPaid, newPaymentAmount, feesWithGST, dueAmt, pdfPath);

//     const fileName = path.basename(pdfPath);

//     console.log("Pdf Path: ", pdfPath);
//     console.log("File Name: ", fileName);

//     // Set headers to prompt download and open in a new tab
//     // res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
//     // res.setHeader('Content-Type', 'application/pdf');

//     // Send the file as a response and automatically download it
//     // res.download(pdfPath, fileName, (err) => {
//     //     if (err) {
//     //         return next(new AppError('Error downloading the PDF', 500));
//     //     }
//     // });

//     res.setHeader('Content-Disposition', `inline; filename="${pdfFileName}"`);
//     res.setHeader('Content-Type', 'application/pdf');

//     res.sendFile(pdfPath, (err) => {
//         if (err) {
//             console.error('Error while sending file:', err);
//             return next(new AppError('Error serving the PDF', 500));
//         }
//     });
// });

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
    const batchIndex = student.batchIds.findIndex(batchEntry => batchEntry.batchId.toString() === batchId);
    let discount = batchIndex !== -1 ? student.batchIds[batchIndex].discount : 0;

    const discountedFees = batch.fees - (batch.fees * (discount / 100));
    const feesWithGST = discountedFees + (discountedFees * 0.18);
    let totalFeesPaid = newPaymentAmount;
    let dueAmt;

    if (batchIndex !== -1) {
        const batchEntry = student.batchIds[batchIndex];
        totalFeesPaid += batchEntry.feesPaid;
        batchEntry.feesPaid = totalFeesPaid;
        batchEntry.paidAmtList.push(newPaymentAmount);
        batchEntry.feesWithGST = feesWithGST;
        dueAmt = feesWithGST - totalFeesPaid;
        batchEntry.feesDue = dueAmt < 0 ? 0 : dueAmt;
        student.batchIds[batchIndex] = batchEntry;
    } else {
        dueAmt = feesWithGST - newPaymentAmount;
        dueAmt = dueAmt < 0 ? 0 : dueAmt;
        const newBatchEntry = {
            batchId: batchId,
            discount: discount,
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

    const lastTransaction = await Transaction.findOne().sort({ receiptNo: -1 });
    const receiptNo = lastTransaction ? lastTransaction.receiptNo + 1 : 1;

    const transaction = await Transaction.create({
        studentId,
        batchId,
        newPayment: newPaymentAmount,
        feesPaid: totalFeesPaid,
        dueAmt: dueAmt,
        paymentType: paymentType,
        receiptNo
    });

    await student.save();

    // Generate the PDF as a buffer
    const pdfBuffer = await new Promise((resolve, reject) => {
        const doc = generateReceiptPDF(transaction, student, batch, totalFeesPaid, newPaymentAmount, feesWithGST, dueAmt);
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', err => reject(err));
        doc.end();
    });

    const receiptBase64 = pdfBuffer.toString('base64');
    transaction.receiptBase64 = receiptBase64;
    await transaction.save();

    
    // Serve the PDF in the response to open it in a new tab
    res.setHeader('Content-Type', 'application/pdf');
    const sanitizeFilename = (name) => name.replace(/[^a-z0-9]/gi, '_');
    const sanitizedFilename = sanitizeFilename(student.name);
    res.setHeader('Content-Disposition', `inline; filename="${sanitizedFilename}-${transaction.receiptNo}.pdf"`);

    // res.setHeader('Content-Disposition', `inline; filename=${student.name}-${receiptNo}.pdf`);
    res.send(pdfBuffer);
});


exports.feesTransactionsStudentInBatch = catchAsync(async (req, res, next) => {
    const { batchId, studentId } = req.params;

    // Fetch batch and student data in parallel
    const [batch, student] = await Promise.all([
        Batch.findById(batchId).select('_id'),
        Student.findById(studentId).select('_id')
    ]);

    if (!batch) {
        return next(new AppError('No batch found with this batchId', 404));
    }

    if (!student) {
        return next(new AppError('No student found with this id', 404));
    }

    // Use lean() for faster read-only queries
    const transactions = await Transaction.find({ studentId, batchId });

    res.status(200).json({ 
        status: 'success', 
        transactions
    });
});
