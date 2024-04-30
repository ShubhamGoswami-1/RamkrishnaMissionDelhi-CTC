const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, "Need to enter the studentId"]
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Enter the course id for admission']
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: [true, 'Enter the batch id for admission']
  },
  DateOfAdmission: {
    type: Date,
    default: Date.now()
  },
  formNo: {
    type: String,
    required: [true, 'Need to enter the form number!']
  }
}, {
    collection: "admission",
    versionKey: false,
    timestamps: true
});

const Admission = mongoose.model('Admission', admissionSchema);

module.exports = Admission;