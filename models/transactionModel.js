const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student'
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'batch'
    },
    newPayment: {
        type: Number,
        default: 0
    },
    feesPaid: {
        type: Number,
        default: 0
    },
    dueAmt: {
        type: Number,
        default: 0
    },
    paymentType: {
        type: String,
        enum: ['Online', 'Cash'],
        required: true
    },
    receiptNo: { 
        type: Number,
        required: true
    },
    receiptBase64: { 
        type: String,
        required: false
    },  
}, {
    collection: "transaction",
    versionKey: false,
    timestamps: true
});

// Add a compound index on batchId and studentId (for fetching transactions)
transactionSchema.index({ studentId: 1, batchId: 1 }); // May remove it later

// transactionSchema.index({ studentId: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;