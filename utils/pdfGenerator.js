const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const numberToWords = require('number-to-words');

const convertNumberToWords = (number) => {
    if (number < 1 && number > 0) {
        // Split the number into integer and fractional parts
        const [integerPart, fractionalPart] = number.toString().split('.');
        
        // Convert the integer part to words
        const integerWords = numberToWords.toWords(parseInt(integerPart));
        
        // Convert fractional part to words digit by digit
        const fractionalWords = fractionalPart
            .split('')
            .map((digit) => numberToWords.toWords(parseInt(digit)))
            .join(' ');
        
        return `${integerWords} point ${fractionalWords}`;
    } else if (number % 1 !== 0) {
        // Handle numbers with both integer and fractional parts (e.g., 123.45)
        const [integerPart, fractionalPart] = number.toString().split('.');
        const integerWords = numberToWords.toWords(parseInt(integerPart));
        const fractionalWords = fractionalPart
            .split('')
            .map((digit) => numberToWords.toWords(parseInt(digit)))
            .join(' ');

        return `${integerWords} point ${fractionalWords}`;
    } else {
        // Handle whole numbers
        return numberToWords.toWords(number);
    }
};

const generateReceiptPDF = (transaction, student, batch, totalFeesPaid, newPaymentAmount, feesWithGST, dueAmt, pdfPath) => {
    const val = convertNumberToWords(newPaymentAmount);
    const doc = new PDFDocument({ size: [595, 420], margin: 20 }); // A5 size
    // doc.pipe(fs.createWriteStream(pdfPath));

    // Border
    doc.rect(10, 10, doc.page.width - 20, doc.page.height - 20).strokeColor('black').lineWidth(1).stroke();

    // Logo
    const logoPath = path.join(__dirname, '../public/images/rkmbw.jpeg');
    doc.image(logoPath, 20, 20, { width: 60 }); // Adjust width if needed

    // Header
    doc.font('Helvetica-Bold').fontSize(12).text('RECEIPT', { align: 'center', underline: true });
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(10).text('RAMAKRISHNA MISSION', { align: 'center' });
    doc.moveDown(0.3);

    doc.font('Helvetica-Bold').text('SWAMI RANGANATHANANDA INSTITUTE OF LANGUAGES AND CULTURE', { align: 'center' });
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(8).text('Ramakrishna Ashram Marg, New Delhi - 110055, Phone: 23587110, 23580091', { align: 'center'});
    doc.font('Helvetica').fontSize(8).text('(A Branch Centre of Ramakrishna Mission, P.O. Belur Math, Dt. Hawrah, West Bengal - 711202)', { align: 'center' });
    doc.font('Helvetica-Bold').fontSize(8).text('GSTIN: 07AAAAR1077P1Z5', { align: 'center' });
    doc.moveDown(2.0);

    // Student and Batch Information
    doc.fontSize(9)
        .text(`Receipt No.: ${transaction.receiptNo}`, 20)
        .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });

    doc.text(`Student Name: ${student.name}`, 20)

    doc.text(`Address: ${student.address}`, 20)
    
    doc.text(`Reg. No.: ${student.registrationNo}`, 20)
        .text(`Phone No.: ${student.phone}`, { align: 'right'});
    doc.text(`Course: ${batch.courseName}`, 20)
        .text(`Batch: ${batch.title}`, { align: 'right' });

    doc.moveDown(2.0); // Adjusted to ensure space before table

    // Table Header
    const tableTop = doc.y + 10;
    let currentY = tableTop;
    const rowHeight = 20;
    const columnWidths = [40, 140, 60, 60, 60, 60, 70, 70]; // total: 560
    const tableLeft = 20;

    // Draw table header
    doc.font('Helvetica-Bold')
        .fontSize(8)
        .rect(tableLeft, tableTop, columnWidths.reduce((a, b) => a + b, 0), rowHeight) // Header boundary
        .strokeColor('black') // Set stroke color
        .lineWidth(1) // Ensure a visible boundary line width
        .stroke(); // Draw the boundary first

    doc.fillColor('#f0f0f0') // Set the fill color for the header background
        .rect(tableLeft, tableTop, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
        .fill(); // Fill the header background

    const headers = ['S.No.', 'Particular', 'SAC', 'Fee', '9% CGST', '9% SGST', 'Total', 'Paid'];
    let x = tableLeft;

    headers.forEach((header, i) => {
        // Draw text centered in the column
        doc
        .fillColor('black')
        .fill()
        .text(header, x, currentY + 8, { 
            width: columnWidths[i], 
            align: 'center' 
        });
    
        // Draw vertical line for column separation (except last column)
        if (i < headers.length - 1) {
            x += columnWidths[i]; // Move to the next column
            doc.font('Helvetica-Bold').moveTo(x, currentY).lineTo(x, currentY + rowHeight).stroke(); // Column boundary line
        }
    });

    // Draw rows with column separation lines
    const items = [
        {
            sno: 1,
            particular: `${batch.courseName} Fees`,
            sac: '9992',
            fee: batch.fees.toFixed(2),
            cgst: (batch.fees * 0.09).toFixed(2),
            sgst: (batch.fees * 0.09).toFixed(2),
            total: feesWithGST.toFixed(2),
            paid: newPaymentAmount.toFixed(2),
        },
    ];

    currentY += rowHeight;

    items.forEach((item) => {
        // Row boundary
        doc.rect(tableLeft, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();

        // Column data
        const values = [
            item.sno,
            item.particular,
            item.sac,
            item.fee,
            item.cgst,
            item.sgst,
            item.total,
            item.paid,
        ];

        x = tableLeft;
        values.forEach((value, i) => {
            doc.font('Helvetica').text(value, x + 5, currentY + 5);
            if (i < values.length - 1) {
                x += columnWidths[i];
                doc.moveTo(x, currentY).lineTo(x, currentY + rowHeight).stroke(); // Column separation lines
            }
        });

        currentY += rowHeight;
    });

    // Footer
    doc.moveDown(1.0);
    doc.font('Helvetica-Bold').fontSize(9).text(`Recieved the sum of Rupees(in words): ${val} only`, 20, currentY + 10);
    doc.text('Prepared by', 20, doc.page.height - 60, { align: 'left' });
    doc.text('Secretary', doc.page.width - 80, doc.page.height - 60, { align: 'right' });
    
    return doc;
}

module.exports = generateReceiptPDF;
