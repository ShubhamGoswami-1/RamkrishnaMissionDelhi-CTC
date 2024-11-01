const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateReceiptPDF = (transaction, student, batch, totalFeesPaid, newPaymentAmount, feesWithGST, dueAmt) => {
    const doc = new PDFDocument({ margin: 30 });
    const pdfPath = path.join(__dirname, '..', 'receipts', `${transaction._id}.pdf`);
    doc.pipe(fs.createWriteStream(pdfPath));

    // Header
    doc.fontSize(14).text('RECEIPT', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text('RAMAKRISHNA MISSION', { align: 'center' });
    doc.text('COMPUTER TRAINING CENTRE', { align: 'center' });
    doc.text('A Branch Centre of Ramakrishna Mission', { align: 'center' });
    doc.text('GSTIN: 07AAATR0777P1Z5', { align: 'center' });
    doc.text('Phone No.: 8800169658', { align: 'center' });
    doc.moveDown();

    // Student and Batch Information
    doc.fontSize(10).text(`Receipt No.: ${transaction._id}`);
    doc.text(`Student Name: ${student.name}`);
    doc.text(`Address: ${student.address}`);
    doc.text(`Registration No.: ${student.registrationNo}`);
    doc.text(`Course: ${batch.courseName}`);
    doc.text(`Batch: ${batch.title}`);
    doc.text(`Batch Timing: ${batch.timing}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Description Table
    doc.fontSize(10).text('Description', { underline: true });
    doc.moveDown();

    const tableTop = doc.y;
    const tableColumnWidth = doc.page.width / 6;

    doc.text('S.No.', 30, tableTop);
    doc.text('Particular', 70, tableTop);
    doc.text('SAC', 200, tableTop);
    doc.text('Fee', 260, tableTop);
    doc.text('9% CGST', 320, tableTop);
    doc.text('9% SGST', 380, tableTop);
    doc.text('Total Fees', 440, tableTop);
    doc.text('Amount', 440, tableTop);
    doc.text('Total Paid', 440, tableTop);

    const items = [
        {
            sno: 1,
            particular: `${batch.courseName} Fees`,
            sac: '9992',
            fee: batch.fees,
            cgst: batch.fees * 0.09,
            sgst: batch.fees * 0.09,
            total: feesWithGST,
            amount: newPaymentAmount,
            totalPaid: transaction.feesPaid
        }
    ];

    let tableY = tableTop + 20;

    items.forEach(item => {
        doc.text(item.sno, 30, tableY);
        doc.text(item.particular, 70, tableY);
        doc.text(item.sac, 200, tableY);
        doc.text(item.fee, 260, tableY);
        doc.text(item.cgst, 320, tableY);
        doc.text(item.sgst, 380, tableY);
        doc.text(item.total, 440, tableY);
        tableY += 20;
    });

    doc.moveDown();

    doc.text(`Received the sum of Rupees (in words): ${numberToWords.toWords(totalFeesPaid)} Only`, 30, tableY + 20);
    doc.moveDown();

    // Footer
    doc.text('Prepared by', 30, doc.page.height - 80);
    doc.text('Secretary', doc.page.width - 100, doc.page.height - 80, { align: 'right' });

    doc.end();

    return pdfPath;
};

// Helper function to convert numbers to words
const numberToWords = require('number-to-words');

module.exports = generateReceiptPDF;