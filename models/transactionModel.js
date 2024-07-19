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
        type: String,
        default: ''
    },
    feesPaid: {
        type: Number,
        default: 0
    },
    dueAmt: {
        type: Number,
        default: 0
    }
}, {
    collection: "transaction",
    versionKey: false,
    timestamps: true
})

const Batch = mongoose.model('Transaction', batchSchema);

module.exports = Batch;