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
    }
}, {
    collection: "transaction",
    versionKey: false,
    timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;